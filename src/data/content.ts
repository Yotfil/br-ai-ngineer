import { LOCALES, type GraphData, type Locale, type SearchDoc, type TopicContent } from '../content/model.ts'

/** Datos generados por `npm run content` en src/generated/ (ignorado por Git). */
const graphMods = import.meta.glob<GraphData>('../generated/graph.json', { eager: true, import: 'default' })
const searchMods = import.meta.glob<SearchDoc[]>('../generated/search.*.json', { eager: true, import: 'default' })
const topicMods = import.meta.glob<TopicContent>('../generated/topics/*/*.json', { import: 'default' })

export const graph: GraphData = Object.values(graphMods)[0] ?? { tracks: [], nodes: [], links: [] }

export const searchDocs: Record<Locale, SearchDoc[]> = Object.fromEntries(
  LOCALES.map((l) => [l, searchMods[`../generated/search.${l}.json`] ?? []]),
) as Record<Locale, SearchDoc[]>

/** Carga bajo demanda el contenido de un tema. `null` si no existe. */
export function loadTopic(locale: Locale, id: string): Promise<TopicContent> | null {
  const load = topicMods[`../generated/topics/${locale}/${id}.json`]
  return load ? load() : null
}

/** Nombre visible de cada nodo (pista, tema, concepto) en un idioma. */
export function labelsFor(data: GraphData, docs: SearchDoc[], locale: Locale): Record<string, string> {
  const out: Record<string, string> = {}
  for (const t of data.tracks) out[t.id] = t.name[locale]
  for (const d of docs) out[d.id] = d.name
  return out
}

/**
 * Nombre de cada nodo en las listas de temas (sidebar, hoja de temas) y en el cerebro: el título corto
 * del tema cuando existe y, si no, el mismo nombre de `labelsFor` (decisión 4 de pista-python).
 */
export function listLabelsFor(labels: Readonly<Record<string, string>>, docs: SearchDoc[]): Record<string, string> {
  const out: Record<string, string> = { ...labels }
  for (const d of docs) if (d.type === 'topic' && d.short) out[d.id] = d.short
  return out
}
