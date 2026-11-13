/**
 * Script de UN SOLO USO (tareas 7.2–7.6): migra los 20 temas del arreglo `T` de
 * `API Rest/Guía HTTP y REST.html` a `content/rest/<id>/{meta.yaml,es.md,en.md}`.
 * Ejecución: `npx tsx scripts/migrate/migrate-rest.ts`. No forma parte de la compilación.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'
import { EXTRA_ALIASES, FREQ_MAP, PROMPTS, REST_MAP } from './rest-map.ts'
import { REST_ES } from './rest-es.ts'

interface GuideEx {
  q: string
  o: string[]
  a: number
  w: string
}
interface GuideTopic {
  t: string
  f: string
  def: string
  ana: string
  raw: string
  py: string
  prob: string
  bad?: string
  good?: string
  bridge: string
  myths: string[]
  ans: string
  demo: string
  ex?: GuideEx[]
  review?: Array<{ e: string; ok: boolean; w: string }>
}

/** Traducción al inglés de la prosa de un tema (el código se reutiliza tal cual). */
export interface EnTopic {
  title: string
  summary: string
  def: string
  ana: string
  prob: string
  bridge: string
  myths: string[]
  ans: string
  ex?: Array<{ q: string; o?: string[]; w: string }>
  review?: string[]
}

const here = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(here, '../..')
const guidePath = path.resolve(appRoot, '../API Rest/Guía HTTP y REST.html')
const outRoot = path.join(appRoot, 'content', 'rest')

export function loadGuide(): GuideTopic[] {
  const html = fs.readFileSync(guidePath, 'utf8')
  const src = html.slice(html.indexOf('const T = [];'), html.indexOf('function hl(raw)'))
  return new Function(`${src};return T;`)() as GuideTopic[]
}

/** HTML incrustado de la guía (solo `<b>` y `<code>`) a Markdown. */
export function htmlToMd(s: string): string {
  return s
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<code>(.*?)<\/code>/g, (_, code: string) => (code.includes('`') ? `\`\` ${code} \`\`` : `\`${code}\``))
}

const langOf = (code: string) => (/def |@app\.|import /.test(code) ? 'python' : 'http')
const fence = (code: string, lang: string) => `\`\`\`${lang}\n${code.replace(/\s+$/, '')}\n\`\`\``

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

function aliasesFor(id: string, other: string, own: string): string[] {
  const out = sameName(other, own) ? [] : [other]
  for (const a of EXTRA_ALIASES[id] ?? []) if (!out.some((x) => sameName(x, a)) && !sameName(a, own)) out.push(a)
  return out
}

function exercisesFor(t: GuideTopic, locale: 'es' | 'en', en?: EnTopic) {
  const groups: unknown[] = []
  const p = PROMPTS[locale]
  if (t.ex?.length) {
    const status = t.ex.every((q) => /^\d{3}$/.test(q.o[0]))
    groups.push({
      type: 'choice',
      prompt: status ? p.status : p.method,
      items: t.ex.map((q, i) => ({
        q: locale === 'es' ? htmlToMd(q.q) : en!.ex![i].q,
        options: locale === 'es' ? q.o.map(htmlToMd) : (en!.ex![i].o ?? q.o),
        answer: q.a,
        why: locale === 'es' ? htmlToMd(q.w) : en!.ex![i].w,
      })),
    })
  }
  if (t.review?.length) {
    groups.push({
      type: 'verdict',
      prompt: p.verdict,
      items: t.review.map((r, i) => ({ statement: r.e, ok: r.ok, why: locale === 'es' ? htmlToMd(r.w) : en!.review![i] })),
    })
  }
  return groups
}

function body(t: GuideTopic, text: { def: string; ana: string; prob: string; bridge: string; ans: string; myths: string[] }): string {
  const parts: Array<[string, string]> = [
    ['definition', text.def],
    ['analogy', text.ana],
    ['problem', text.prob],
    ['code:wire', fence(t.raw, langOf(t.raw))],
  ]
  if (t.py) parts.push(['code:server', fence(t.py, 'python')])
  if (t.bad && t.good) {
    parts.push(['bad', fence(t.bad, langOf(t.bad))])
    parts.push(['good', fence(t.good, langOf(t.good))])
  }
  parts.push(['bridge:typescript', text.bridge])
  parts.push(['interview', text.ans])
  parts.push(['myths', text.myths.map((m) => `- ${m}`).join('\n')])
  return parts.map(([k, v]) => `## ${k}\n\n${v}\n`).join('\n')
}

function frontmatter(data: Record<string, unknown>): string {
  return `---\n${YAML.stringify(data, { lineWidth: 0 })}---\n\n`
}

async function main() {
  const guide = loadGuide()
  if (guide.length !== REST_MAP.length || guide.length !== REST_ES.length) throw new Error(`se esperaban ${REST_MAP.length} temas y la guía tiene ${guide.length}`)
  let en: EnTopic[] | null = null
  const enFile = path.join(here, 'rest-en.ts')
  if (fs.existsSync(enFile)) en = (await import(enFile)).REST_EN as EnTopic[]

  fs.rmSync(outRoot, { recursive: true, force: true })
  guide.forEach((t, i) => {
    const map = REST_MAP[i]
    const es = REST_ES[i]
    const dir = path.join(outRoot, map.id)
    fs.mkdirSync(dir, { recursive: true })
    const meta = {
      id: map.id,
      track: 'rest',
      order: i + 1,
      freq: FREQ_MAP[t.f],
      concepts: map.concepts.map((c) => c.id),
      related: map.related,
      ...(map.demo ? { demo: map.demo } : {}),
    }
    fs.writeFileSync(path.join(dir, 'meta.yaml'), YAML.stringify(meta))

    const esEx = exercisesFor(t, 'es')
    const esFront = {
      title: t.t,
      summary: es.summary,
      concepts: Object.fromEntries(map.concepts.map((c) => [c.id, { name: c.es, aliases: aliasesFor(c.id, c.en, c.es) }])),
      ...(esEx.length ? { exercises: esEx } : {}),
    }
    const esText = {
      def: htmlToMd(t.def),
      ana: htmlToMd(t.ana),
      prob: es.prob ?? htmlToMd(t.prob),
      bridge: es.bridge ?? htmlToMd(t.bridge),
      ans: htmlToMd(t.ans),
      myths: t.myths.map(htmlToMd),
    }
    fs.writeFileSync(path.join(dir, 'es.md'), frontmatter(esFront) + body(t, esText))

    const e = en?.[i]
    if (e) {
      const enEx = exercisesFor(t, 'en', e)
      const enFront = {
        title: e.title,
        summary: e.summary,
        concepts: Object.fromEntries(map.concepts.map((c) => [c.id, { name: c.en, aliases: aliasesFor(c.id, c.es, c.en) }])),
        ...(enEx.length ? { exercises: enEx } : {}),
      }
      fs.writeFileSync(path.join(dir, 'en.md'), frontmatter(enFront) + body(t, e))
    }
  })
  console.log(`[migrate] ${guide.length} temas escritos en content/rest/${en ? ' (es + en)' : ' (solo es)'}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main()
