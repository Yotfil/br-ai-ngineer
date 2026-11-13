import { BRIDGE_TECHS, CODE_KINDS, REQUIRED_SECTIONS, SECTION_KEYS, type SectionKey } from '../../src/content/model.ts'

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
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
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
  if ((out.bad === undefined) !== (out.good === undefined)) {
    const missing = out.bad === undefined ? 'bad' : 'good'
    problems.push(`${file}: falta la sección "${missing}" ("bad" y "good" van juntas)`)
  }
  return out
}
