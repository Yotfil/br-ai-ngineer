import type { GraphData, GraphNode } from '../content/model.ts'

export interface GraphIndex {
  byId: Map<string, GraphNode>
  neighbors: Map<string, Set<string>>
  /** Temas de cada pista, en orden. */
  topicsOfTrack: Map<string, GraphNode[]>
  /** Conceptos propios de cada tema. */
  conceptsOfTopic: Map<string, GraphNode[]>
}

export function indexGraph(g: GraphData): GraphIndex {
  const byId = new Map(g.nodes.map((n) => [n.id, n]))
  const neighbors = new Map<string, Set<string>>(g.nodes.map((n) => [n.id, new Set<string>()]))
  for (const l of g.links) {
    neighbors.get(l.source)?.add(l.target)
    neighbors.get(l.target)?.add(l.source)
  }
  const topicsOfTrack = new Map<string, GraphNode[]>()
  const conceptsOfTopic = new Map<string, GraphNode[]>()
  for (const n of g.nodes) {
    if (n.type === 'topic') topicsOfTrack.set(n.track, [...(topicsOfTrack.get(n.track) ?? []), n])
    if (n.type === 'concept' && n.parent) conceptsOfTopic.set(n.parent, [...(conceptsOfTopic.get(n.parent) ?? []), n])
  }
  for (const list of topicsOfTrack.values()) list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return { byId, neighbors, topicsOfTrack, conceptsOfTopic }
}

/** Tema que se abre al elegir un nodo: el propio tema, o el tema hogar de un concepto. */
export function homeTopic(idx: GraphIndex, id: string): GraphNode | null {
  const n = idx.byId.get(id)
  if (!n) return null
  if (n.type === 'topic') return n
  if (n.type === 'concept' && n.parent) return idx.byId.get(n.parent) ?? null
  return null
}

/**
 * Relacionados de un tema: temas y conceptos ajenos conectados con el tema o con alguno de sus conceptos
 * (así, un tema que declara relacionado un concepto de otro tema conecta ambos temas).
 * De una entrada de proyecto, solo los temas que reúne, en su orden y sin conceptos (decisión 6 de contenido-claro).
 */
export function relatedOf(idx: GraphIndex, topicId: string): GraphNode[] {
  const topic = idx.byId.get(topicId)
  if (!topic) return []
  if (topic.kind === 'project') return (topic.covers ?? []).flatMap((id) => idx.byId.get(id) ?? [])
  const own = new Set((idx.conceptsOfTopic.get(topicId) ?? []).map((c) => c.id))
  const out = new Map<string, GraphNode>()
  const consider = (id: string) => {
    const n = idx.byId.get(id)
    if (!n || n.id === topicId || own.has(n.id) || n.type === 'track') return
    out.set(n.id, n)
  }
  for (const id of idx.neighbors.get(topicId) ?? []) consider(id)
  for (const c of own) {
    for (const id of idx.neighbors.get(c) ?? []) {
      const n = idx.byId.get(id)
      if (n?.type === 'topic') consider(id)
    }
  }
  return [...out.values()]
}
