import {
  BRIDGE_TECHS,
  CODE_KINDS,
  PROJECT_SECTION_KEYS,
  REQUIRED_SECTIONS,
  SECTION_KEYS,
  sectionKeysOf,
  type BodySectionKey,
  type Kind,
} from '../../src/content/model.ts'

import { FENCE_ALIASES } from './markdown.ts'

const HEADING = /^##\s+(\S.*?)\s*$/
const FENCE = /^\s*(```|~~~)\s*(\S*)/
/** Título de paso: encabezado ATX de nivel 3, como lo reconoce marked (hasta tres espacios delante). */
const STEP = /^ {0,3}###(?:[ \t]+(.*?))?[ \t]*$/

/**
 * Secciones que admiten títulos de paso (`### …`), design.md de contenido-claro: las tres de código de un tema
 * (decisión 2) y las dos de una entrada de proyecto (decisión 6).
 */
export const STEP_SECTIONS: readonly BodySectionKey[] = ['code:example', 'code:wire', 'code:server', 'context', 'walkthrough']

export interface CodeBlock {
  /** Lenguaje tal como lo declara la valla (vacío si no declara ninguno). */
  fence: string
  code: string
}

/** Bloques de código y títulos de paso de una sección, en orden. Lo que va dentro de una valla no cuenta como título. */
export function scanSection(md: string): { blocks: CodeBlock[]; steps: string[] } {
  const blocks: CodeBlock[] = []
  const steps: string[] = []
  let open: { fence: string; lines: string[] } | null = null
  for (const line of md.split(/\r?\n/)) {
    const fence = FENCE.exec(line)
    if (fence) {
      if (open) {
        blocks.push({ fence: open.fence, code: open.lines.join('\n') })
        open = null
      } else open = { fence: fence[2], lines: [] }
      continue
    }
    if (open) {
      open.lines.push(line)
      continue
    }
    const step = STEP.exec(line)
    if (step) steps.push((step[1] ?? '').replace(/[ \t]+#+$/, ''))
  }
  if (open) blocks.push({ fence: open.fence, code: open.lines.join('\n') })
  return { blocks, steps }
}

/**
 * Separa el cuerpo Markdown en secciones por los encabezados de nivel 2 (`## clave`).
 * Añade a `problems` un mensaje que nombra `file` por cada infracción de las reglas de design.md decisión 2
 * o, en una entrada de proyecto (`kind: project`), de la decisión 6 de contenido-claro.
 */
export function splitSections(body: string, file: string, problems: string[], kind?: Kind): Partial<Record<BodySectionKey, string>> {
  const isProject = kind === 'project'
  const allowed: readonly string[] = sectionKeysOf(kind)
  const out: Partial<Record<BodySectionKey, string>> = {}
  let current: BodySectionKey | null = null
  let skipping = false
  let buf: string[] = []
  let inFence = false

  const flush = () => {
    if (current) out[current] = buf.join('\n').trim()
    buf = []
  }

  for (const line of body.split(/\r?\n/)) {
    const fence = FENCE.exec(line)
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
      if (allowed.includes(key)) {
        if (out[key as BodySectionKey] !== undefined) problems.push(`${file}: sección "${key}" repetida`)
        current = key as BodySectionKey
        skipping = false
      } else if (isProject && (SECTION_KEYS as readonly string[]).includes(key)) {
        problems.push(`${file}: la sección "${key}" es de un tema y no se admite en una entrada de proyecto`)
      } else if (!isProject && (PROJECT_SECTION_KEYS as readonly string[]).includes(key)) {
        problems.push(`${file}: la sección "${key}" solo se admite en una entrada de proyecto (kind: project)`)
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

  for (const key of Object.keys(out) as BodySectionKey[]) {
    if (!out[key]) problems.push(`${file}: la sección "${key}" está vacía`)
  }
  for (const key of isProject ? PROJECT_SECTION_KEYS : REQUIRED_SECTIONS) {
    if (out[key] === undefined) problems.push(`${file}: falta la sección obligatoria "${key}"`)
  }
  for (const key of Object.keys(out) as BodySectionKey[]) {
    if (STEP_SECTIONS.includes(key) || !out[key]) continue
    if (scanSection(out[key]).steps.length) problems.push(`${file}: la sección "${key}" no admite títulos de paso (###)`)
  }
  if (isProject) {
    if (out.walkthrough) checkFences(out.walkthrough, 'walkthrough', file, problems)
    return out
  }
  if (out['code:example']) checkExample(out['code:example'], file, problems)
  if ((out.bad === undefined) !== (out.good === undefined)) {
    const missing = out.bad === undefined ? 'bad' : 'good'
    problems.push(`${file}: falta la sección "${missing}" ("bad" y "good" van juntas)`)
  }
  return out
}

/**
 * `code:example` (decisión 2 de pista-python, ampliada por la decisión 2 de contenido-claro): uno o más bloques
 * de código, cada uno con su lenguaje declarado en la valla, con texto y títulos de paso entre ellos.
 */
function checkExample(md: string, file: string, problems: string[]): void {
  const blocks = checkFences(md, 'code:example', file, problems)
  if (!blocks.length) problems.push(`${file}: la sección "code:example" no tiene bloques de código`)
}

/** Cada bloque de la sección declara su lenguaje en la valla (`code:example`; `walkthrough`, decisión 6 de contenido-claro). */
function checkFences(md: string, key: BodySectionKey, file: string, problems: string[]): CodeBlock[] {
  const { blocks } = scanSection(md)
  blocks.forEach((b, i) => {
    if (!b.fence) problems.push(`${file}: el bloque ${i + 1} de "${key}" no declara lenguaje`)
  })
  return blocks
}
