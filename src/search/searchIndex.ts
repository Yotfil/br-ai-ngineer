import MiniSearch from 'minisearch'
import type { SearchDoc } from '../content/model.ts'

/** Minúsculas y sin tildes (specs/concept-search, "Búsqueda tolerante"). */
export const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export interface SearchHit extends SearchDoc {
  score: number
}

export interface ConceptSearch {
  search: (query: string, limit?: number) => SearchHit[]
}

/**
 * Índice MiniSearch de un idioma: campos nombre, alias y resumen, con más peso en nombre y alias;
 * prefijo y tolerancia a errores activados. Los alias traen el término del otro idioma.
 */
export function buildSearchIndex(docs: readonly SearchDoc[]): ConceptSearch {
  const ms = new MiniSearch<SearchDoc & { aliasText: string }>({
    idField: 'id',
    fields: ['name', 'aliasText', 'summary'],
    storeFields: ['id'],
    processTerm: (term) => normalize(term),
    searchOptions: {
      boost: { name: 3, aliasText: 3, summary: 1 },
      prefix: true,
      fuzzy: (term) => (term.length >= 5 ? 0.2 : term.length >= 4 ? 1 : false),
      combineWith: 'AND',
    },
  })
  const byId = new Map(docs.map((d) => [d.id, d]))
  ms.addAll(docs.map((d) => ({ ...d, aliasText: d.aliases.join(' ') })))
  return {
    search(query, limit = 8) {
      const q = query.trim()
      if (!q) return []
      return ms
        .search(q)
        .slice(0, limit)
        .map((r) => ({ ...byId.get(r.id as string)!, score: r.score }))
    },
  }
}
