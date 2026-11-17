/**
 * Ejercicios y conceptos de los temas indicados (design.md de contenido-claro, decisiones 11 y 17; content-map.md, sección 7).
 *
 * 1. "¿Qué imprime?": ejecuta con python3 el código de cada ejercicio que lo lleva y lo compara con la opción marcada.
 * 2. Frente a una versión anterior (por defecto `HEAD`): qué campos cambió cada ejercicio, cuáles se quitaron y cuáles son
 *    nuevos. `answer`, `code`, `prompt` y el número de opciones no pueden cambiar: si cambian, es un PROBLEMA.
 * 3. Pregunta 14: los nombres que usan el enunciado y las opciones (lo que va entre comillas invertidas, las opciones
 *    cortas y las categorías), y en qué secciones del tema aparecen en prosa, fuera de los bloques de código y de la
 *    respuesta de entrevista. Es una ayuda para quien revisa: si la frase dice qué es cada nombre lo decide esa persona.
 * 4. Conceptos de todo el contenido: mismos ids, nombres y alias que en la versión anterior, y cuáles cambian de hogar.
 *
 * Uso: npx tsx scripts/check/exercises.ts <id>[=<id-de-origen>] ... [--ref <commit>]
 *   <id>=<id-de-origen>: para un tema partido, el tema antiguo de donde salen sus ejercicios.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { LOCALES, type Locale } from '../../src/content/model.ts'
import { readContent, type RawContent, type RawTopic } from '../content/reader.ts'
import type { Frontmatter } from '../content/schema.ts'
import { CONTENT, ROOT, reportError } from './shared.ts'

type Group = Frontmatter['exercises'][number]

/** Un ejercicio con los datos de su grupo; `text` es el enunciado, sea cual sea el tipo. */
interface Item {
  type: Group['type']
  prompt: string
  categories?: string[]
  text: string
  code?: string
  options?: string[]
  answer: unknown
  why: string
}

const FIXED = ['type', 'prompt', 'categories', 'code', 'answer'] as const
const COMPARED = ['text', 'options', ...FIXED] as const

function items(topic: RawTopic | undefined, lang: Locale): Item[] {
  return (topic?.locales[lang]?.front.exercises ?? []).flatMap((g): Item[] => {
    const base = { type: g.type, prompt: g.prompt }
    if (g.type === 'choice') return g.items.map((it) => ({ ...base, text: it.q, code: it.code, options: it.options, answer: it.answer, why: it.why }))
    if (g.type === 'verdict') return g.items.map((it) => ({ ...base, text: it.statement, answer: it.ok, why: it.why }))
    return g.items.map((it) => ({ ...base, categories: g.categories, text: it.text, answer: it.category, why: it.why }))
  })
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const changed = (a: Item, b: Item) => COMPARED.filter((k) => !same(a[k], b[k]))
const stripTicks = (s: string) => s.replace(/`/g, '')
const short = (s: string) => (s.length > 70 ? `${s.slice(0, 67)}...` : s)

let problems = 0
const problem = (message: string) => {
  problems++
  console.log(`   PROBLEMA: ${message}`)
}

/** 1. Ejecuta el código de un "¿Qué imprime?" y lo compara con la opción marcada. */
function checkPrints(it: Item, label: string) {
  if (!it.code || !it.options || typeof it.answer !== 'number') return
  const real = execFileSync('python3', ['-I', '-c', it.code], { encoding: 'utf8' }).trim().split('\n').join(' ')
  const marked = stripTicks(it.options[it.answer] ?? '')
  console.log(`   ${label} ¿Qué imprime?: real "${real}" | marcada "${marked}" | ${real === marked ? 'COINCIDE' : 'DISTINTA'}`)
  if (real !== marked) problem(`la opción marcada no es lo que imprime el código (${label})`)
}

/** 2. Empareja cada ejercicio con el más parecido de la versión anterior y dice qué cambió. */
function compare(now: Item[], before: Item[]) {
  const used = new Set<number>()
  now.forEach((it, i) => {
    let best = -1
    let bestDiff = Infinity
    before.forEach((old, j) => {
      if (used.has(j) || old.type !== it.type) return
      const d = changed(it, old).length
      if (d < bestDiff) [best, bestDiff] = [j, d]
    })
    const label = `#${i + 1}`
    if (best < 0) {
      problem(`${label} es nuevo: "${short(it.text)}"`)
      return
    }
    used.add(best)
    const old = before[best]
    const diff = changed(it, old)
    const why = it.why === old.why ? 'why igual' : 'why reescrito'
    console.log(`   ${label} frente al #${best + 1} anterior: ${diff.length ? `cambia ${diff.join(', ')}` : 'igual'} (${why})`)
    for (const k of FIXED) if (diff.includes(k)) problem(`${label} cambia "${k}", que no puede cambiar`)
    if ((it.options?.length ?? 0) !== (old.options?.length ?? 0)) problem(`${label} cambia el número de opciones`)
  })
  before.forEach((old, j) => {
    if (!used.has(j)) console.log(`   quitado: el #${j + 1} anterior, "${short(old.text)}"`)
  })
}

/** Palabras de Python que aparecen en las expresiones de un enunciado y no son nombres que el tema deba presentar. */
const KEYWORDS = new Set(['def', 'return', 'lambda', 'None', 'True', 'False', 'and', 'or', 'not', 'in', 'is', 'for', 'if', 'else', 'class', 'import', 'from', 'with', 'as', 'yield', 'async', 'await'])

/** 3. Nombres que usan el enunciado y las opciones: cada expresión entre comillas invertidas y, si es compuesta, sus identificadores. */
function names(it: Item): string[] {
  const found = new Set<string>()
  const ticks = (s: string) => {
    for (const m of s.matchAll(/`([^`]+)`/g)) {
      found.add(m[1])
      const ids = m[1].match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []
      if (ids.length === 1 && ids[0] === m[1]) continue
      for (const id of ids) if (!KEYWORDS.has(id)) found.add(id)
    }
  }
  ticks(it.text)
  for (const o of it.options ?? []) {
    ticks(o)
    // Una opción sin comillas es un nombre si es una sola palabra con cifras, mayúsculas o signos de código ("401", "GET");
    // "Una" o "Nada" no lo son. Las opciones de un "¿Qué imprime?" son salidas, no nombres.
    if (!it.code && !o.includes('`') && /^\S+$/.test(o) && /[0-9_./]|^[A-Z]{2,}$/.test(o)) found.add(o)
  }
  for (const c of it.categories ?? []) found.add(c)
  return [...found]
}

const FENCE = /^```[^\n]*\n[\s\S]*?^```/gm
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function whereIs(name: string, topic: RawTopic, lang: Locale): string {
  const re = new RegExp(`(?<![\\w-])${escape(name)}(?![\\w-])`)
  const prose: string[] = []
  let interview = false
  let code = false
  for (const [key, md] of Object.entries(topic.locales[lang]?.sections ?? {})) {
    const fences = md.match(FENCE) ?? []
    if (fences.some((f) => re.test(f))) code = true
    if (!re.test(md.replace(FENCE, ''))) continue
    if (key === 'interview') interview = true
    else prose.push(key)
  }
  if (prose.length) return `en prosa: ${prose.join(', ')}`
  if (interview) return 'NO PRESENTADO: solo en interview'
  if (code) return 'NO PRESENTADO: solo dentro del código'
  return 'NO PRESENTADO: no aparece'
}

/** 4. Conceptos de todo el contenido: id, nombre y alias por idioma, y el tema hogar. */
function concepts(c: RawContent) {
  const list: string[] = []
  const home: Record<string, string> = {}
  for (const t of c.topics) {
    for (const lang of LOCALES) {
      for (const [id, k] of Object.entries(t.locales[lang]?.front.concepts ?? {})) {
        list.push(JSON.stringify([lang, id, k.name, k.aliases]))
        home[id] = t.meta.id
      }
    }
  }
  return { list: list.sort(), home }
}

/** El contenido de `content/` en un commit, extraído a una carpeta temporal del sistema. */
function contentAt(ref: string, dir: string): RawContent {
  const tar = execFileSync('git', ['archive', ref, 'content'], { cwd: ROOT, maxBuffer: 1 << 28 })
  execFileSync('tar', ['-x', '-C', dir], { input: tar })
  return readContent(path.join(dir, 'content'))
}

const args = process.argv.slice(2)
let ref = 'HEAD'
const pieces: { id: string; origin: string }[] = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--ref') ref = args[++i]
  else {
    const [id, origin] = args[i].split('=')
    pieces.push({ id, origin: origin ?? id })
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'content-ref-'))
try {
  const now = readContent(CONTENT)
  const before = contentAt(ref, tmp)
  const find = (c: RawContent, id: string) => c.topics.find((t) => t.meta.id === id)
  for (const { id, origin } of pieces) {
    const topic = find(now, id)
    console.log(`\n${id}${origin !== id ? ` (origen: ${origin})` : ''}`)
    if (!topic) {
      problem('no existe en content/')
      continue
    }
    for (const lang of LOCALES) {
      const list = items(topic, lang)
      const old = items(find(before, origin), lang)
      console.log(` ${lang}: ${list.length} ejercicios (${old.length} en ${ref})`)
      list.forEach((it, i) => checkPrints(it, `#${i + 1}`))
      compare(list, old)
      list.forEach((it, i) => {
        const found = names(it)
        console.log(`   #${i + 1} "${short(it.text)}"`)
        for (const n of found) console.log(`      ${n}: ${whereIs(n, topic, lang)}`)
      })
    }
  }
  const a = concepts(now)
  const b = concepts(before)
  const equal = same(a.list, b.list)
  console.log(`\nconceptos (id, nombre y alias en los dos idiomas) iguales a ${ref}: ${equal}`)
  if (!equal) problem('los conceptos cambian')
  const moved = Object.keys(b.home).filter((k) => a.home[k] !== b.home[k])
  console.log(`conceptos con otro hogar: ${moved.map((k) => `${k}: ${b.home[k]} -> ${a.home[k] ?? '—'}`).join(', ') || 'ninguno'}`)
  console.log(problems ? `\n${problems} PROBLEMAS` : '\nTODO OK')
  if (problems) process.exitCode = 1
} catch (e) {
  reportError('check-exercises', e)
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}
