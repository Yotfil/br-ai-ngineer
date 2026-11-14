import fs from 'node:fs'
import path from 'node:path'
import {
  LOCALES,
  sectionKeysOf,
  type ExerciseGroup,
  type GraphData,
  type Locale,
  type SearchDoc,
  type TopicContent,
} from '../../src/content/model.ts'
import { buildGraph } from './graph.ts'
import { highlightCode, renderInline, renderMarkdown, type MentionResolver } from './markdown.ts'
import { readContent } from './reader.ts'
import { validateContent, type IdIndex } from './validate.ts'

export interface BuildOutput {
  graph: GraphData
  search: Record<Locale, SearchDoc[]>
  topics: Record<Locale, TopicContent[]>
}

function resolverFor(index: IdIndex, locale: Locale): MentionResolver {
  return (id) => {
    const topic = index.topics.get(id)
    if (topic) return { href: `/${locale}/${topic.meta.track}/${id}`, name: topic.locales[locale]?.front.title ?? id }
    const home = index.conceptHome.get(id)
    if (home) {
      const t = index.topics.get(home)!
      return { href: `/${locale}/${t.meta.track}/${home}#${id}`, name: t.locales[locale]?.front.concepts[id]?.name ?? id }
    }
    return null
  }
}

/** Lee, valida y transforma todo el contenido. No escribe en disco. */
export async function buildContent(contentDir: string): Promise<BuildOutput> {
  const content = readContent(contentDir)
  const index = validateContent(content)
  const graph = buildGraph(content, index)

  const search = {} as Record<Locale, SearchDoc[]>
  const topics = {} as Record<Locale, TopicContent[]>
  const ordered = [...content.topics].sort(
    (a, b) => a.meta.track.localeCompare(b.meta.track) || a.meta.order - b.meta.order || a.meta.id.localeCompare(b.meta.id),
  )

  for (const locale of LOCALES) {
    const resolve = resolverFor(index, locale)
    search[locale] = []
    topics[locale] = []
    for (const t of ordered) {
      const loc = t.locales[locale]!
      const { meta } = t
      search[locale].push({
        id: meta.id,
        type: 'topic',
        track: meta.track,
        name: loc.front.title,
        // Decisión 17: el título del tema en el otro idioma se añade solo al índice, como alias.
        aliases: LOCALES.filter((o) => o !== locale)
          .map((o) => t.locales[o]?.front.title)
          .filter((x): x is string => !!x && x.trim().toLowerCase() !== loc.front.title.trim().toLowerCase()),
        summary: loc.front.summary,
        ...(loc.front.short !== undefined ? { short: loc.front.short } : {}),
        topic: meta.id,
      })
      for (const c of meta.concepts) {
        const def = loc.front.concepts[c]
        search[locale].push({
          id: c,
          type: 'concept',
          track: meta.track,
          name: def.name,
          aliases: def.aliases,
          topic: meta.id,
          topicName: loc.front.title,
        })
      }

      const sections: TopicContent['sections'] = {}
      for (const key of sectionKeysOf(meta.kind)) {
        const md = loc.sections[key]
        if (md !== undefined) sections[key] = await renderMarkdown(md, key, resolve)
      }
      const exercises: ExerciseGroup[] = []
      for (const g of loc.front.exercises) {
        const prompt = await renderInline(g.prompt, resolve)
        if (g.type === 'choice') {
          const items = []
          for (const it of g.items) {
            items.push({
              q: await renderInline(it.q, resolve),
              ...(it.code !== undefined ? { code: await highlightCode(it.code, 'python') } : {}),
              options: await Promise.all(it.options.map((o) => renderInline(o, resolve))),
              answer: it.answer,
              why: await renderInline(it.why, resolve),
            })
          }
          exercises.push({ type: 'choice', prompt, items })
        } else if (g.type === 'classify') {
          const items = []
          for (const it of g.items) {
            items.push({ text: await renderInline(it.text, resolve), answer: g.categories.indexOf(it.category), why: await renderInline(it.why, resolve) })
          }
          exercises.push({ type: 'classify', prompt, categories: await Promise.all(g.categories.map((c) => renderInline(c, resolve))), items })
        } else {
          const items = []
          for (const it of g.items) {
            items.push({ statement: await renderInline(it.statement, resolve), ok: it.ok, why: await renderInline(it.why, resolve) })
          }
          exercises.push({ type: 'verdict', prompt, items })
        }
      }
      topics[locale].push({
        id: meta.id,
        track: meta.track,
        order: meta.order,
        // Una entrada de proyecto (decisión 6 de contenido-claro) no lleva freq; lleva kind y covers.
        ...(meta.freq !== undefined ? { freq: meta.freq } : {}),
        ...(meta.kind !== undefined ? { kind: meta.kind, covers: meta.covers ?? [] } : {}),
        ...(meta.demo ? { demo: meta.demo } : {}),
        title: loc.front.title,
        ...(loc.front.short !== undefined ? { short: loc.front.short } : {}),
        summary: loc.front.summary,
        sections,
        exercises,
      })
    }
  }
  return { graph, search, topics }
}

const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n'

/** Escribe la salida en `outDir` (borra antes lo generado para no dejar temas eliminados). */
export function writeOutput(out: BuildOutput, outDir: string): string[] {
  fs.rmSync(outDir, { recursive: true, force: true })
  const written: string[] = []
  const write = (rel: string, data: unknown) => {
    const file = path.join(outDir, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, json(data))
    written.push(rel)
  }
  write('graph.json', out.graph)
  for (const locale of LOCALES) {
    write(`search.${locale}.json`, out.search[locale])
    for (const t of out.topics[locale]) write(`topics/${locale}/${t.id}.json`, t)
  }
  return written
}
