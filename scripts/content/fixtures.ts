import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import YAML from 'yaml'

/** Utilidades de prueba: crea un `content/` temporal a partir de objetos. */

export const TRACKS_YAML = YAML.stringify([
  { id: 'rest', abbr: 'RE', color: '#22d3ee', order: 1, name: { es: 'HTTP y REST', en: 'HTTP & REST' } },
  { id: 'sql', abbr: 'SQ', color: '#fbbf24', order: 2, name: { es: 'SQL', en: 'SQL' } },
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
  }
  const front = (locale: 'es' | 'en') => ({
    title: `${id} ${locale}`,
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
