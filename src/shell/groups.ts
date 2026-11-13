import type { GraphNode, Locale, TrackInfo } from '../content/model.ts'

export interface TopicSection {
  /** Nombre del grupo en el idioma activo; `null` en pistas sin grupos. */
  heading: { id: string; name: string } | null
  topics: GraphNode[]
}

/**
 * Reparte los temas de una pista (ya ordenados por `order`) en tramos con el subtítulo de su grupo.
 * Una pista sin grupos da un único tramo sin subtítulo (decisión 5 de pista-python).
 */
export function sectionsOf(track: TrackInfo, topics: readonly GraphNode[], locale: Locale): TopicSection[] {
  if (!track.groups?.length) return [{ heading: null, topics: [...topics] }]
  const names = new Map(track.groups.map((g) => [g.id, g.name[locale]]))
  const out: TopicSection[] = []
  for (const t of topics) {
    const last = out[out.length - 1]
    if (last && last.heading?.id === t.group) last.topics.push(t)
    else out.push({ heading: t.group ? { id: t.group, name: names.get(t.group) ?? t.group } : null, topics: [t] })
  }
  return out
}
