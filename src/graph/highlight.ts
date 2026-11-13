import type { BrainFocus } from './types.ts'
import { relatedOf, type GraphIndex } from './relations.ts'

/**
 * Conjunto resaltado a partir del foco (fuera del renderizador, design.md decisión 4).
 * Prioridad: coincidencias de búsqueda > nodo señalado > nodo seleccionado.
 */
export function computeHighlight(idx: GraphIndex, focus: BrainFocus): ReadonlySet<string> | null {
  if (focus.matches && focus.matches.size > 0) return focus.matches
  const id = focus.hovered ?? focus.selected
  const n = id ? idx.byId.get(id) : undefined
  if (!n) return null
  const out = new Set<string>([n.id])
  if (n.type === 'track') {
    for (const t of idx.topicsOfTrack.get(n.id) ?? []) {
      out.add(t.id)
      for (const c of idx.conceptsOfTopic.get(t.id) ?? []) out.add(c.id)
    }
  } else if (n.type === 'topic') {
    for (const c of idx.conceptsOfTopic.get(n.id) ?? []) out.add(c.id)
    for (const r of relatedOf(idx, n.id)) out.add(r.id)
  } else {
    for (const m of idx.neighbors.get(n.id) ?? []) out.add(m)
  }
  return out
}
