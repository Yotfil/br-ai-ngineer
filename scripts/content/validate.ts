import { LOCALES, SECTION_KEYS } from '../../src/content/model.ts'
import { DEMO_IDS } from '../../src/demos/ids.ts'
import type { RawContent, RawTopic } from './reader.ts'
import { ContentError } from './schema.ts'

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
 * (metadatos y `[[id]]`), demos registradas y paridad de secciones, conceptos y ejercicios entre idiomas.
 * Lanza `ContentError` nombrando tema e identificador.
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

  for (const t of content.topics) {
    const id = t.meta.id
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
      for (const key of SECTION_KEYS) {
        const inA = a.sections[key] !== undefined
        const inB = b.sections[key] !== undefined
        if (inA && !inB) problems.push(`tema "${id}": la sección "${key}" está en "${first[0]}" y falta en "${locale}"`)
        if (!inA && inB) problems.push(`tema "${id}": la sección "${key}" está en "${locale}" y falta en "${first[0]}"`)
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
