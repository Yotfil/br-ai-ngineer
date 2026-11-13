/**
 * Script de UN SOLO USO (tareas 3.2 a 3.6 de pista-python): migra los temas del arreglo `TOPICS` de
 * `legacy/Python y FastAPI para entrevistas.html` a `content/python/<id>/{meta.yaml,es.md,en.md}`.
 * El tema 11 de la guía no se migra. Ejecución: `npx tsx scripts/migrate/migrate-python.ts`.
 * No forma parte de la compilación.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { BRIDGES, EXERCISE_19, PHRASES, SUMMARIES } from './python-es.ts'
import { EXTRA_ALIASES, FREQ_MAP, PROMPTS, PYTHON_MAP, RENAMED, SKIPPED_GUIDE_TOPIC, TEXT_BLOCKS, type TopicMap } from './python-map.ts'

interface GuideMcq {
  kind: 'output' | 'status' | 'concept'
  q: string
  code?: string
  opts: string[]
  a: number
  exp: string
}
interface GuideClassify {
  kind: 'classify'
  q: string
  cats: string[]
  items: Array<{ t: string; c: string; why: string }>
}
type GuideEx = GuideMcq | GuideClassify

export interface GuideTopic {
  id: number
  block: 'A' | 'B'
  title: string
  short: string
  freq: string
  def: string
  analogy: string
  code: string
  code2?: string
  problem: string
  bad: { code: string; note: string }
  good: { code: string; note: string }
  bridge: string
  pitfalls: string[]
  answer: string
  ex: GuideEx[]
}

/** Prosa de un tema en un idioma, ya en Markdown. El código no se traduce: sale de la guía. */
export interface TopicText {
  title: string
  short: string
  summary: string
  def: string
  analogy: string
  problem: string
  badNote: string
  goodNote: string
  bridge: string
  pitfalls: string[]
  answer: string
  /** Un elemento por ejercicio de la guía, en su orden. `opts` solo si las opciones son texto que se traduce. */
  ex: Array<{ q: string; opts?: string[]; exp: string } | { q: string; cats: string[]; items: Array<{ t: string; why: string }> }>
}

const here = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(here, '../..')
const guidePath = path.join(appRoot, 'legacy', 'Python y FastAPI para entrevistas.html')
const outRoot = path.join(appRoot, 'content', 'python')

export function loadGuide(): GuideTopic[] {
  const html = fs.readFileSync(guidePath, 'utf8')
  const src = html.slice(html.indexOf('const TOPICS = ['), html.indexOf('const OPEN_QS'))
  return new Function(`${src};return TOPICS;`)() as GuideTopic[]
}

/**
 * HTML incrustado de la guía (`<b>`, `<i>`, `<code>`) a Markdown, como en la migración de REST.
 * Un `<` que no abre ni cierra esas etiquetas es texto literal (p. ej. `<coroutine object f at 0x...>`).
 */
export function htmlToMd(s: string): string {
  return s
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<code>(.*?)<\/code>/g, (_, code: string) => (code.includes('`') ? `\`\` ${code} \`\`` : `\`${code}\``))
    .replace(/<(?!\/?(?:b|i|code)>)/g, '&lt;')
}

const fence = (code: string, lang: string) => `\`\`\`${lang}\n${code.replace(/\s+$/, '')}\n\`\`\``

function replaceOnce(text: string, from: string, to: string, where: string): string {
  const n = text.split(from).length - 1
  if (n !== 1) throw new Error(`${where}: la frase a sustituir aparece ${n} veces`)
  return text.replace(from, to)
}

/** Texto en español: el de la guía, con los textos de rewrites.md aplicados. */
export function spanishText(t: GuideTopic, map: TopicMap): TopicText {
  let problem = htmlToMd(t.problem)
  let answer = htmlToMd(t.answer)
  for (const p of PHRASES.filter((x) => x.guide === t.id)) {
    if (p.field === 'problem') problem = replaceOnce(problem, p.from, p.to, `tema ${t.id} problem`)
    else answer = replaceOnce(answer, p.from, p.to, `tema ${t.id} answer`)
  }
  const ex: TopicText['ex'] = t.ex.map((e, i) => {
    if (e.kind === 'classify') return { q: htmlToMd(e.q), cats: e.cats.map(htmlToMd), items: e.items.map((it) => ({ t: htmlToMd(it.t), why: htmlToMd(it.why) })) }
    if (t.id === 19 && i === EXERCISE_19.index) return { q: EXERCISE_19.q, opts: EXERCISE_19.opts, exp: EXERCISE_19.exp }
    return { q: htmlToMd(e.q), opts: e.opts.map(htmlToMd), exp: htmlToMd(e.exp) }
  })
  return {
    title: RENAMED[map.id]?.es ?? t.title,
    short: map.short,
    summary: SUMMARIES[t.id],
    def: htmlToMd(t.def),
    analogy: htmlToMd(t.analogy),
    problem,
    badNote: htmlToMd(t.bad.note),
    goodNote: htmlToMd(t.good.note),
    bridge: BRIDGES[t.id] ?? htmlToMd(t.bridge),
    pitfalls: t.pitfalls.map(htmlToMd),
    answer,
    ex,
  }
}

/** Ejercicios de la guía a grupos (decisión 6): consecutivos de la misma clase juntos; `classify`, siempre solo. */
function exercisesFor(t: GuideTopic, text: TopicText, locale: 'es' | 'en') {
  const groups: Array<Record<string, unknown> & { kind: string }> = []
  t.ex.forEach((e, i) => {
    const tx = text.ex[i]
    if (e.kind === 'classify') {
      if (!('cats' in tx)) throw new Error(`tema ${t.id}: el ejercicio ${i + 1} debería ser de clasificación`)
      if (tx.cats.length !== e.cats.length || tx.items.length !== e.items.length) throw new Error(`tema ${t.id}: la traducción del ejercicio ${i + 1} no cuadra`)
      groups.push({
        kind: 'classify',
        type: 'classify',
        prompt: tx.q,
        categories: tx.cats,
        items: e.items.map((it, j) => ({ text: tx.items[j].t, category: tx.cats[e.cats.indexOf(it.c)], why: tx.items[j].why })),
      })
      return
    }
    if (!('exp' in tx)) throw new Error(`tema ${t.id}: el ejercicio ${i + 1} debería ser de opción múltiple`)
    // Sin `opts` en la traducción se reutilizan las de la guía (código, números), como en REST.
    const opts = tx.opts ?? e.opts.map(htmlToMd)
    if (opts.length !== e.opts.length) throw new Error(`tema ${t.id}: faltan las opciones del ejercicio ${i + 1} (${locale})`)
    const item = { q: tx.q, ...(e.code ? { code: e.code.replace(/\s+$/, '') } : {}), options: opts, answer: t.id === 19 && i === EXERCISE_19.index ? EXERCISE_19.a : e.a, why: tx.exp }
    const last = groups[groups.length - 1]
    if (last && last.kind === e.kind) (last.items as unknown[]).push(item)
    else groups.push({ kind: e.kind, type: 'choice', prompt: PROMPTS[locale][e.kind], items: [item] })
  })
  return groups.map(({ kind: _k, ...g }) => (void _k, g))
}

function body(t: GuideTopic, x: TopicText): string {
  const textBlocks = TEXT_BLOCKS[t.id] ?? {}
  const example = [fence(t.code, textBlocks.code ? 'text' : 'python')]
  if (t.code2) example.push(fence(t.code2, textBlocks.code2 ? 'text' : 'python'))
  const parts: Array<[string, string]> = [
    ['definition', x.def],
    ['analogy', x.analogy],
    ['problem', x.problem],
    ['code:example', example.join('\n\n')],
    ['bad', `${fence(t.bad.code, 'python')}\n\n${x.badNote}`],
    ['good', `${fence(t.good.code, 'python')}\n\n${x.goodNote}`],
    ['bridge:typescript', x.bridge],
    ['interview', x.answer],
    ['myths', x.pitfalls.map((m) => `- ${m}`).join('\n')],
  ]
  return parts.map(([k, v]) => `## ${k}\n\n${v}\n`).join('\n')
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
function aliasesFor(id: string, other: string, own: string): string[] {
  const out = sameName(other, own) ? [] : [other]
  for (const a of EXTRA_ALIASES[id] ?? []) if (!out.some((x) => sameName(x, a)) && !sameName(a, own)) out.push(a)
  return out
}

const frontmatter = (data: Record<string, unknown>) => `---\n${YAML.stringify(data, { lineWidth: 0 })}---\n\n`

async function main() {
  const guide = loadGuide().filter((t) => t.id !== SKIPPED_GUIDE_TOPIC)
  if (guide.length !== PYTHON_MAP.length) throw new Error(`se esperaban ${PYTHON_MAP.length} temas y la guía tiene ${guide.length}`)
  let en: Record<string, TopicText> | null = null
  const enFile = path.join(here, 'python-en.ts')
  if (fs.existsSync(enFile)) en = (await import(enFile)).PYTHON_EN as Record<string, TopicText>

  // Conceptos con nombre pendiente en content-map.md: no se escriben, ni los relacionados que apuntan a ellos.
  const pending = new Set(PYTHON_MAP.flatMap((m) => m.concepts.filter((c) => c.es === null || c.en === null).map((c) => c.id)))

  fs.rmSync(outRoot, { recursive: true, force: true })
  PYTHON_MAP.forEach((map, i) => {
    const t = guide[i]
    if (t.id !== map.guide) throw new Error(`orden: se esperaba el tema ${map.guide} de la guía y llegó el ${t.id}`)
    const concepts = map.concepts.filter((c) => !pending.has(c.id))
    const dir = path.join(outRoot, map.id)
    fs.mkdirSync(dir, { recursive: true })
    const meta = {
      id: map.id,
      track: 'python',
      order: i + 1,
      freq: FREQ_MAP[t.freq],
      group: map.group,
      concepts: concepts.map((c) => c.id),
      related: map.related.filter((r) => !pending.has(r)),
    }
    fs.writeFileSync(path.join(dir, 'meta.yaml'), YAML.stringify(meta))

    const write = (locale: 'es' | 'en', x: TopicText) => {
      const ex = exercisesFor(t, x, locale)
      const front = {
        title: x.title,
        short: x.short,
        summary: x.summary,
        concepts: Object.fromEntries(
          concepts.map((c) => [c.id, { name: locale === 'es' ? c.es! : c.en!, aliases: locale === 'es' ? aliasesFor(c.id, c.en!, c.es!) : aliasesFor(c.id, c.es!, c.en!) }]),
        ),
        ...(ex.length ? { exercises: ex } : {}),
      }
      fs.writeFileSync(path.join(dir, `${locale}.md`), frontmatter(front) + body(t, x))
    }
    write('es', spanishText(t, map))
    const e = en?.[map.id]
    if (e) write('en', e)
  })
  if (pending.size) console.warn(`[migrate] conceptos pendientes de nombre en content-map.md, no escritos: ${[...pending].join(', ')}`)
  console.log(`[migrate] ${guide.length} temas escritos en content/python/${en ? ' (es + en)' : ' (solo es)'}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main()
