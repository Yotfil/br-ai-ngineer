import { LOCALES, sectionKeysOf, type BodySectionKey, type Locale } from '../../src/content/model.ts'
import { DEMO_IDS } from '../../src/demos/ids.ts'
import { codeLanguage } from './markdown.ts'
import type { RawContent, RawTopic } from './reader.ts'
import { ContentError } from './schema.ts'
import { scanSection } from './sections.ts'

/** Enlaces `[[id]]` dentro del texto. */
export const MENTION = /\[\[([a-z0-9]+(?:-[a-z0-9]+)*)\]\]/g

export function mentionsIn(text: string): string[] {
  return [...text.matchAll(MENTION)].map((m) => m[1])
}

/** Índice de identificadores: qué es cada id y, para conceptos, su tema hogar. */
export interface IdIndex {
  tracks: Set<string>
  topics: Map<string, RawTopic>
  /** concepto → tema hogar */
  conceptHome: Map<string, string>
}

/**
 * Validaciones cruzadas de content-model y localization: concepto único, relaciones existentes
 * (metadatos y `[[id]]`), demos registradas, temas reunidos por las entradas de proyecto y paridad de secciones,
 * conceptos y ejercicios entre idiomas. Lanza `ContentError` nombrando tema e identificador.
 */
export function validateContent(content: RawContent): IdIndex {
  const problems: string[] = []
  const tracks = new Set<string>()
  for (const t of content.tracks) {
    if (tracks.has(t.id)) problems.push(`tracks.yaml: pista "${t.id}" repetida`)
    tracks.add(t.id)
  }

  const topics = new Map<string, RawTopic>()
  for (const t of content.topics) {
    const id = t.meta.id
    if (topics.has(id)) problems.push(`tema "${id}": id repetido (${topics.get(id)!.dir} y ${t.dir})`)
    if (tracks.has(id)) problems.push(`tema "${id}": el id coincide con el de una pista`)
    topics.set(id, t)
    if (!tracks.has(t.meta.track)) problems.push(`tema "${id}": la pista "${t.meta.track}" no está declarada en tracks.yaml`)
    if (t.meta.demo !== undefined && !(DEMO_IDS as readonly string[]).includes(t.meta.demo)) {
      problems.push(`tema "${id}": la demo "${t.meta.demo}" no tiene componente registrado`)
    }
  }

  // Concepto único.
  const conceptHome = new Map<string, string>()
  for (const t of content.topics) {
    for (const c of t.meta.concepts) {
      const prev = conceptHome.get(c)
      if (prev !== undefined) {
        problems.push(
          prev === t.meta.id
            ? `tema "${t.meta.id}": el concepto "${c}" está repetido en sus conceptos`
            : `concepto "${c}": aparece como propio de dos temas ("${prev}" y "${t.meta.id}")`,
        )
        continue
      }
      if (topics.has(c) || tracks.has(c)) problems.push(`tema "${t.meta.id}": el concepto "${c}" usa un id que ya es de un tema o pista`)
      conceptHome.set(c, t.meta.id)
    }
  }

  const exists = (id: string) => topics.has(id) || conceptHome.has(id)

  validateGroups(content, problems)

  for (const t of content.topics) {
    const id = t.meta.id
    if (t.meta.kind === 'project') checkProject(t, topics, conceptHome, problems)
    // Relaciones explícitas.
    for (const r of t.meta.related) {
      if (r === id) problems.push(`tema "${id}": se declara relacionado consigo mismo`)
      else if (!exists(r)) problems.push(`tema "${id}": el relacionado "${r}" no existe`)
      else if (t.meta.concepts.includes(r)) problems.push(`tema "${id}": el relacionado "${r}" es un concepto propio`)
    }

    const locs = LOCALES.map((l) => [l, t.locales[l]] as const).filter(([, v]) => v !== undefined)
    for (const [locale, loc] of locs) {
      // Enlaces dentro del texto.
      for (const [key, text] of Object.entries(loc!.sections)) {
        for (const m of mentionsIn(text ?? '')) {
          if (!exists(m)) problems.push(`tema "${id}" (${locale}): el enlace [[${m}]] en "${key}" no existe`)
        }
      }
      // Conceptos del idioma = conceptos de meta.yaml.
      const declared = Object.keys(loc!.front.concepts)
      for (const c of t.meta.concepts) {
        if (!declared.includes(c)) problems.push(`tema "${id}" (${locale}): falta el nombre del concepto "${c}"`)
      }
      for (const c of declared) {
        if (!t.meta.concepts.includes(c)) problems.push(`tema "${id}" (${locale}): el concepto "${c}" no está en meta.yaml`)
      }
    }

    // Paridad entre idiomas.
    const [first, ...rest] = locs
    if (!first) continue
    for (const [locale, loc] of rest) {
      const a = first[1]!
      const b = loc!
      // Título corto: si un idioma lo tiene, el otro también.
      if ((a.front.short === undefined) !== (b.front.short === undefined)) {
        const missing = a.front.short === undefined ? first[0] : locale
        problems.push(`tema "${id}": falta el título corto (short) en "${missing}"`)
      }
      for (const key of sectionKeysOf(t.meta.kind)) {
        const inA = a.sections[key] !== undefined
        const inB = b.sections[key] !== undefined
        if (inA && !inB) problems.push(`tema "${id}": la sección "${key}" está en "${first[0]}" y falta en "${locale}"`)
        if (!inA && inB) problems.push(`tema "${id}": la sección "${key}" está en "${locale}" y falta en "${first[0]}"`)
        if (inA && inB) checkCodeParity(id, key, [first[0], a.sections[key]!], [locale, b.sections[key]!], problems)
      }
      const ea = a.front.exercises
      const eb = b.front.exercises
      if (ea.length !== eb.length) {
        problems.push(`tema "${id}": "${first[0]}" tiene ${ea.length} grupos de ejercicios y "${locale}" ${eb.length}`)
      } else {
        ea.forEach((ga, gi) => {
          const gb = eb[gi]
          if (ga.type !== gb.type || ga.items.length !== gb.items.length) {
            problems.push(`tema "${id}": el grupo de ejercicios ${gi + 1} difiere entre "${first[0]}" y "${locale}"`)
            return
          }
          if (ga.type === 'classify' && gb.type === 'classify') {
            if (ga.categories.length !== gb.categories.length) {
              problems.push(`tema "${id}": el grupo de ejercicios ${gi + 1} tiene distinto número de categorías entre "${first[0]}" y "${locale}"`)
              return
            }
            ga.items.forEach((ia, ii) => {
              const ib = gb.items[ii]
              if (ga.categories.indexOf(ia.category) !== gb.categories.indexOf(ib.category)) {
                problems.push(`tema "${id}": el ejercicio ${ii + 1} del grupo ${gi + 1} difiere entre "${first[0]}" y "${locale}"`)
              }
            })
            return
          }
          ga.items.forEach((ia, ii) => {
            const ib = gb.items[ii]
            const same =
              'answer' in ia && 'answer' in ib
                ? ia.answer === ib.answer && ia.options.length === ib.options.length
                : 'ok' in ia && 'ok' in ib && ia.ok === ib.ok
            if (!same) problems.push(`tema "${id}": el ejercicio ${ii + 1} del grupo ${gi + 1} difiere entre "${first[0]}" y "${locale}"`)
          })
        })
      }
    }
  }

  if (problems.length) throw new ContentError(problems)
  return { tracks, topics, conceptHome }
}

/**
 * Paridad de código entre idiomas (design.md de contenido-claro, decisión 4): en una sección, los dos idiomas tienen
 * el mismo número de bloques de código, en el mismo orden y con el mismo lenguaje resuelto, y el mismo número de
 * títulos de paso. El texto del código (comentarios, mensajes) puede ser distinto.
 */
function checkCodeParity(id: string, key: BodySectionKey, [la, mdA]: [Locale, string], [lb, mdB]: [Locale, string], problems: string[]): void {
  const a = scanSection(mdA)
  const b = scanSection(mdB)
  if (a.blocks.length !== b.blocks.length) {
    problems.push(`tema "${id}": la sección "${key}" tiene ${a.blocks.length} bloques de código en "${la}" y ${b.blocks.length} en "${lb}"`)
  } else {
    a.blocks.forEach((ba, i) => {
      const bb = b.blocks[i]
      const langA = codeLanguage(key, ba.code, ba.fence)
      const langB = codeLanguage(key, bb.code, bb.fence)
      if (langA !== langB) {
        problems.push(`tema "${id}": en la sección "${key}", el bloque ${i + 1} es ${langA} en "${la}" y ${langB} en "${lb}"`)
      }
    })
  }
  if (a.steps.length !== b.steps.length) {
    problems.push(`tema "${id}": la sección "${key}" tiene ${a.steps.length} títulos de paso en "${la}" y ${b.steps.length} en "${lb}"`)
  }
}

/**
 * Entrada de proyecto (design.md de contenido-claro, decisión 6): cada tema reunido existe, no es un concepto ni
 * otra entrada de proyecto, y el recorrido (`walkthrough`) lo enlaza con `[[id]]` en cada idioma.
 */
function checkProject(t: RawTopic, topics: ReadonlyMap<string, RawTopic>, conceptHome: ReadonlyMap<string, string>, problems: string[]): void {
  const id = t.meta.id
  const covers = t.meta.covers ?? []
  for (const c of covers) {
    const target = topics.get(c)
    if (c === id) problems.push(`entrada de proyecto "${id}": se reúne a sí misma en covers`)
    else if (conceptHome.has(c)) problems.push(`entrada de proyecto "${id}": "${c}" es un concepto y covers solo admite temas`)
    else if (!target) problems.push(`entrada de proyecto "${id}": el tema reunido "${c}" no existe`)
    else if (target.meta.kind === 'project') problems.push(`entrada de proyecto "${id}": el tema reunido "${c}" es otra entrada de proyecto`)
  }
  for (const locale of LOCALES) {
    const loc = t.locales[locale]
    if (!loc) continue
    const linked = new Set(mentionsIn(loc.sections.walkthrough ?? ''))
    for (const c of covers) {
      if (!linked.has(c)) problems.push(`entrada de proyecto "${id}" (${locale}): el recorrido (walkthrough) no enlaza el tema reunido "${c}"`)
    }
  }
}

/**
 * Grupos de temas (design.md de pista-python, decisión 5): grupo declarado por su pista, obligatorio en pistas
 * con grupos y prohibido en las que no; temas de un grupo consecutivos según `order`, y grupos en el orden de `tracks.yaml`.
 */
function validateGroups(content: RawContent, problems: string[]): void {
  const trackById = new Map(content.tracks.map((t) => [t.id, t]))
  const byTrack = new Map<string, RawTopic[]>()
  for (const t of content.topics) {
    const list = byTrack.get(t.meta.track) ?? []
    list.push(t)
    byTrack.set(t.meta.track, list)
  }
  for (const [trackId, list] of byTrack) {
    const track = trackById.get(trackId)
    if (!track) continue
    const groups = track.groups?.map((g) => g.id) ?? []
    let ok = true
    for (const t of list) {
      const g = t.meta.group
      if (!groups.length) {
        if (g !== undefined) {
          problems.push(`tema "${t.meta.id}": indica el grupo "${g}" pero la pista "${trackId}" no declara grupos`)
          ok = false
        }
      } else if (g === undefined) {
        problems.push(`tema "${t.meta.id}": no indica su grupo y la pista "${trackId}" declara grupos`)
        ok = false
      } else if (!groups.includes(g)) {
        problems.push(`tema "${t.meta.id}": el grupo "${g}" no está declarado en la pista "${trackId}"`)
        ok = false
      }
    }
    if (!groups.length || !ok) continue
    const sorted = [...list].sort((a, b) => a.meta.order - b.meta.order || a.meta.id.localeCompare(b.meta.id))
    // Secuencia de grupos en el orden de la pista, sin repeticiones consecutivas.
    const runs: string[] = []
    for (const t of sorted) if (runs[runs.length - 1] !== t.meta.group) runs.push(t.meta.group!)
    const split = new Set(runs.filter((g, i) => runs.indexOf(g) !== i))
    for (const g of split) problems.push(`grupo "${g}" de la pista "${trackId}": sus temas no son consecutivos en el orden de la pista`)
    if (split.size) continue
    const declared = groups.filter((g) => runs.includes(g))
    if (runs.join('|') !== declared.join('|')) {
      problems.push(`pista "${trackId}": los grupos no siguen el orden declarado en tracks.yaml (${declared.join(', ')}); el orden de los temas da ${runs.join(', ')}`)
    }
  }
}
