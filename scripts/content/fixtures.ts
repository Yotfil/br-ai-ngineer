import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import YAML from 'yaml'

/** Utilidades de prueba: crea un `content/` temporal a partir de objetos. */

export const TRACKS_YAML = YAML.stringify([
  { id: 'rest', abbr: 'RE', color: '#22d3ee', order: 1, name: { es: 'HTTP y REST', en: 'HTTP & REST' } },
  { id: 'sql', abbr: 'SQ', color: '#fbbf24', order: 2, name: { es: 'SQL', en: 'SQL' } },
])

/** Pista con grupos para las pruebas de pista-python. */
export const GROUPED_TRACKS_YAML = YAML.stringify([
  { id: 'rest', abbr: 'RE', color: '#22d3ee', order: 1, name: { es: 'HTTP y REST', en: 'HTTP & REST' } },
  {
    id: 'python',
    abbr: 'PY',
    color: '#4ade80',
    order: 2,
    name: { es: 'Python y FastAPI', en: 'Python & FastAPI' },
    groups: [
      { id: 'lenguaje', name: { es: 'Python', en: 'Python' } },
      { id: 'fastapi', name: { es: 'FastAPI', en: 'FastAPI' } },
    ],
  },
])

export interface TopicFixture {
  meta: Record<string, unknown>
  es?: string
  en?: string
}

export function md(front: Record<string, unknown>, sections: Record<string, string>): string {
  const body = Object.entries(sections)
    .map(([k, v]) => `## ${k}\n\n${v}\n`)
    .join('\n')
  return `---\n${YAML.stringify(front)}---\n\n${body}`
}

export const BASE_SECTIONS = {
  definition: 'Una operación es **idempotente** si repetirla deja el mismo estado.',
  analogy: 'El botón del ascensor.',
  problem: 'Reintentos sin duplicar cobros.',
  interview: 'Idempotente significa que repetir no cambia el resultado.',
  myths: '- Idempotente no es lo mismo que seguro.',
}

export function topic(
  id: string,
  opts: {
    track?: string
    order?: number
    concepts?: Record<string, string>
    related?: string[]
    demo?: string
    sections?: Record<string, string>
    enSections?: Record<string, string>
    exercises?: unknown[]
    enExercises?: unknown[]
    noEn?: boolean
    group?: string
    short?: string
    /** Título corto en inglés; por defecto, el mismo `short`. `null` = sin título corto en inglés. */
    enShort?: string | null
  } = {},
): [string, TopicFixture] {
  const concepts = opts.concepts ?? {}
  const meta: Record<string, unknown> = {
    id,
    track: opts.track ?? 'rest',
    order: opts.order ?? 1,
    freq: 'always',
    concepts: Object.keys(concepts),
    related: opts.related ?? [],
    ...(opts.demo ? { demo: opts.demo } : {}),
    ...(opts.group ? { group: opts.group } : {}),
  }
  const shortOf = (locale: 'es' | 'en') => (locale === 'es' ? opts.short : opts.enShort === undefined ? opts.short : (opts.enShort ?? undefined))
  const front = (locale: 'es' | 'en') => ({
    title: `${id} ${locale}`,
    ...(shortOf(locale) !== undefined ? { short: shortOf(locale) } : {}),
    summary: `Resumen de ${id}.`,
    concepts: Object.fromEntries(Object.entries(concepts).map(([cid, name]) => [cid, { name: `${name} ${locale}`, aliases: [] }])),
    ...((locale === 'en' ? (opts.enExercises ?? opts.exercises) : opts.exercises) ? { exercises: locale === 'en' ? (opts.enExercises ?? opts.exercises) : opts.exercises } : {}),
  })
  const sections = opts.sections ?? BASE_SECTIONS
  return [
    `${meta.track as string}/${id}`,
    {
      meta,
      es: md(front('es'), sections),
      en: opts.noEn ? undefined : md(front('en'), opts.enSections ?? sections),
    },
  ]
}

/** Recorrido de prueba: una parte con título, código y nota por tema reunido; cada nota enlaza su tema. */
export function walkthrough(covers: readonly string[], locale: 'es' | 'en' = 'es'): string {
  const [part, note, comment] = locale === 'es' ? ['Parte', 'Se estudia en', 'paso'] : ['Part', 'Covered in', 'step']
  return covers
    .map((c, i) => `### ${part} ${i + 1}. ${c}\n\n\`\`\`python\n# app/pedidos/router.py\nx = ${i}  # ${comment} ${i + 1}\n\`\`\`\n\n${note} [[${c}]].`)
    .join('\n\n')
}

/** Entrada de proyecto de prueba (design.md de contenido-claro, decisión 6). `meta` y `front` añaden o sustituyen campos. */
export function project(
  id: string,
  opts: {
    covers: string[]
    track?: string
    order?: number
    group?: string
    short?: string
    meta?: Record<string, unknown>
    front?: Record<string, unknown>
    sections?: Record<string, string>
    enSections?: Record<string, string>
  },
): [string, TopicFixture] {
  const meta: Record<string, unknown> = {
    id,
    track: opts.track ?? 'python',
    order: opts.order ?? 1,
    ...(opts.group ? { group: opts.group } : {}),
    kind: 'project',
    covers: opts.covers,
    ...opts.meta,
  }
  const front = (locale: 'es' | 'en') => ({
    title: locale === 'es' ? `Proyecto: ${id}` : `Project: ${id}`,
    ...(opts.short !== undefined ? { short: opts.short } : {}),
    summary: `Resumen de ${id}.`,
    ...opts.front,
  })
  const sections = (locale: 'es' | 'en') => ({
    context: locale === 'es' ? 'Vamos a construir el endpoint que crea un pedido.' : "We're building the endpoint that creates an order.",
    walkthrough: walkthrough(opts.covers, locale),
  })
  return [
    `${meta.track as string}/${id}`,
    { meta, es: md(front('es'), opts.sections ?? sections('es')), en: md(front('en'), opts.enSections ?? sections('en')) },
  ]
}

export function makeContent(topics: Array<[string, TopicFixture]>, tracksYaml = TRACKS_YAML): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-'))
  fs.writeFileSync(path.join(root, 'tracks.yaml'), tracksYaml)
  for (const [dir, t] of topics) {
    const abs = path.join(root, dir)
    fs.mkdirSync(abs, { recursive: true })
    fs.writeFileSync(path.join(abs, 'meta.yaml'), YAML.stringify(t.meta))
    if (t.es !== undefined) fs.writeFileSync(path.join(abs, 'es.md'), t.es)
    if (t.en !== undefined) fs.writeFileSync(path.join(abs, 'en.md'), t.en)
  }
  return root
}
