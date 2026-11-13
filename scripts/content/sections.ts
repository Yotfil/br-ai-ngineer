import { BRIDGE_TECHS, CODE_KINDS, REQUIRED_SECTIONS, SECTION_KEYS, type SectionKey } from '../../src/content/model.ts'

import { FENCE_ALIASES } from './markdown.ts'

const HEADING = /^##\s+(\S.*?)\s*$/

/**
 * Separa el cuerpo Markdown en secciones por los encabezados de nivel 2 (`## clave`).
 * Añade a `problems` un mensaje que nombra `file` por cada infracción de las reglas de design.md decisión 2.
 */
export function splitSections(body: string, file: string, problems: string[]): Partial<Record<SectionKey, string>> {
  const out: Partial<Record<SectionKey, string>> = {}
  let current: SectionKey | null = null
  let skipping = false
  let buf: string[] = []
  let inFence = false

  const flush = () => {
    if (current) out[current] = buf.join('\n').trim()
    buf = []
  }

  for (const line of body.split(/\r?\n/)) {
    const fence = /^\s*(```|~~~)\s*(\S*)/.exec(line)
    if (fence) {
      // Decisión 11 de pista-python: una valla con un lenguaje no admitido es un error, en cualquier sección.
      if (!inFence && fence[2] && !Object.hasOwn(FENCE_ALIASES, fence[2].toLowerCase())) {
        problems.push(`${file}: el bloque de código declara el lenguaje "${fence[2]}", que no está admitido (${Object.keys(FENCE_ALIASES).join(', ')})`)
      }
      inFence = !inFence
    }
    const m = !inFence && HEADING.exec(line)
    if (m) {
      flush()
      const key = m[1]
      current = null
      skipping = true
      if ((SECTION_KEYS as readonly string[]).includes(key)) {
        if (out[key as SectionKey] !== undefined) problems.push(`${file}: sección "${key}" repetida`)
        current = key as SectionKey
        skipping = false
      } else if (key.startsWith('code:')) {
        problems.push(`${file}: tipo de código "${key}" no registrado (admitidos: ${CODE_KINDS.map((k) => `code:${k}`).join(', ')})`)
      } else if (key.startsWith('bridge:')) {
        problems.push(`${file}: puente "${key}" no admitido (admitidos: ${BRIDGE_TECHS.map((k) => `bridge:${k}`).join(', ')})`)
      } else {
        problems.push(`${file}: sección desconocida "${key}"`)
      }
      continue
    }
    if (current) buf.push(line)
    else if (!skipping && line.trim()) {
      problems.push(`${file}: hay texto antes de la primera sección`)
      skipping = true
    }
  }
  flush()

  for (const key of Object.keys(out) as SectionKey[]) {
    if (!out[key]) problems.push(`${file}: la sección "${key}" está vacía`)
  }
  for (const key of REQUIRED_SECTIONS) {
    if (out[key] === undefined) problems.push(`${file}: falta la sección obligatoria "${key}"`)
  }
  if (out['code:example']) checkExample(out['code:example'], file, problems)
  if ((out.bad === undefined) !== (out.good === undefined)) {
    const missing = out.bad === undefined ? 'bad' : 'good'
    problems.push(`${file}: falta la sección "${missing}" ("bad" y "good" van juntas)`)
  }
  return out
}

/**
 * `code:example` (decisión 2 de pista-python): uno o más bloques de código consecutivos, cada uno con su
 * lenguaje declarado en la valla.
 */
function checkExample(md: string, file: string, problems: string[]): void {
  let inFence = false
  let blocks = 0
  let stray = false
  for (const line of md.split(/\r?\n/)) {
    const fence = /^\s*(```|~~~)\s*(\S*)/.exec(line)
    if (fence) {
      if (!inFence) {
        blocks++
        if (!fence[2]) problems.push(`${file}: el bloque ${blocks} de "code:example" no declara lenguaje`)
      }
      inFence = !inFence
      continue
    }
    if (!inFence && line.trim()) stray = true
  }
  if (!blocks) problems.push(`${file}: la sección "code:example" no tiene bloques de código`)
  if (stray) problems.push(`${file}: la sección "code:example" solo admite bloques de código`)
}
