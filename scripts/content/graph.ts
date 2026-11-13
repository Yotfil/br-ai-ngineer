import { forceLink, forceManyBody, forceSimulation, forceX, forceY, forceZ, type SimNode } from 'd3-force-3d'
import type { GraphData, GraphLink, GraphNode, LinkKind, TrackInfo } from '../../src/content/model.ts'
import type { RawContent } from './reader.ts'
import type { IdIndex } from './validate.ts'
import { mentionsIn } from './validate.ts'

/** Generador pseudoaleatorio con semilla (mulberry32), el mismo de la maqueta. */
export function seeded(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const LAYOUT_SEED = 7
const TICKS = 420

type LayoutNode = GraphNode & SimNode
type LayoutLink = { source: string | LayoutNode; target: string | LayoutNode; kind: LinkKind }

const round = (n: number) => Math.round(n * 100) / 100

/**
 * Construye el grafo: nodos de pista, tema y concepto; enlaces de jerarquía, de `related` y de `[[id]]`;
 * y posiciones asentadas con d3-force-3d y semilla fija (mismo resultado en cada compilación).
 */
export function buildGraph(content: RawContent, index: IdIndex): GraphData {
  const rnd = seeded(LAYOUT_SEED)
  const sortedTracks = [...content.tracks].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
  const topicsByTrack = new Map<string, RawContent['topics']>()
  for (const t of content.topics) {
    const list = topicsByTrack.get(t.meta.track) ?? []
    list.push(t)
    topicsByTrack.set(t.meta.track, list)
  }
  for (const list of topicsByTrack.values()) list.sort((a, b) => a.meta.order - b.meta.order || a.meta.id.localeCompare(b.meta.id))

  const tracks: TrackInfo[] = sortedTracks.map((t) => ({
    id: t.id,
    abbr: t.abbr,
    color: t.color,
    order: t.order,
    name: t.name,
    ...(t.groups ? { groups: t.groups.map((g) => ({ id: g.id, name: g.name })) } : {}),
    empty: !(topicsByTrack.get(t.id)?.length),
  }))

  const nodes: LayoutNode[] = []
  const byId = new Map<string, LayoutNode>()
  const add = (n: LayoutNode) => {
    nodes.push(n)
    byId.set(n.id, n)
    return n
  }
  const links: LayoutLink[] = []
  const seen = new Set<string>()
  const link = (a: string, b: string, kind: LinkKind) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    if (a === b || seen.has(key)) return
    seen.add(key)
    links.push({ source: a, target: b, kind })
  }

  // Posiciones iniciales como en la maqueta: pistas en anillo, temas alrededor de su pista, conceptos alrededor de su tema.
  sortedTracks.forEach((tr, ti) => {
    const ang = (ti / sortedTracks.length) * 6.283 - 1.2
    const hub = add({
      id: tr.id,
      type: 'track',
      track: tr.id,
      ...(tracks[ti].empty ? { empty: true } : {}),
      x: Math.cos(ang) * 250,
      y: Math.sin(ang) * 210,
      z: (ti % 2 ? 1 : -1) * 120,
    })
    for (const t of topicsByTrack.get(tr.id) ?? []) {
      const a = rnd() * 6.28
      const topic = add({
        id: t.meta.id,
        type: 'topic',
        track: tr.id,
        parent: tr.id,
        freq: t.meta.freq,
        order: t.meta.order,
        ...(t.meta.group !== undefined ? { group: t.meta.group } : {}),
        x: hub.x + Math.cos(a) * 110,
        y: hub.y + Math.sin(a) * 110,
        z: hub.z + (rnd() - 0.5) * 180,
      })
      link(hub.id, topic.id, 'hierarchy')
      for (const c of t.meta.concepts) {
        const b = rnd() * 6.28
        add({
          id: c,
          type: 'concept',
          track: tr.id,
          parent: t.meta.id,
          x: topic.x + Math.cos(b) * 36,
          y: topic.y + Math.sin(b) * 36,
          z: topic.z + (rnd() - 0.5) * 60,
        })
        link(topic.id, c, 'hierarchy')
      }
    }
  })

  for (const t of content.topics) {
    for (const r of t.meta.related) link(t.meta.id, r, 'related')
    for (const loc of Object.values(t.locales)) {
      for (const text of Object.values(loc?.sections ?? {})) {
        for (const m of mentionsIn(text ?? '')) if (index.topics.has(m) || index.conceptHome.has(m)) link(t.meta.id, m, 'mention')
      }
    }
  }

  const sim = forceSimulation(nodes, 3)
    .randomSource(seeded(LAYOUT_SEED + 1))
    .velocityDecay(0.2)
    .force(
      'charge',
      forceManyBody<LayoutNode>()
        .strength((n) => (n.type === 'track' ? -260 : n.type === 'concept' ? -30 : -90))
        .distanceMax(400),
    )
    .force(
      'link',
      forceLink<LayoutNode, LayoutLink>(links)
        .id((n) => n.id)
        .distance((l) => {
          if (l.kind !== 'hierarchy') return 190
          const s = l.source as LayoutNode
          return s.type === 'track' ? 112 : 40
        })
        .strength((l) => (l.kind === 'hierarchy' ? 0.6 : 0.05)),
    )
    .force('x', forceX<LayoutNode>(0).strength(0.02))
    .force('y', forceY<LayoutNode>(0).strength(0.025))
    .force('z', forceZ<LayoutNode>(0).strength(0.025))
    .stop()
  sim.tick(TICKS)

  const outNodes: GraphNode[] = nodes.map((n) => {
    const { id, type, track, parent, freq, order, group, empty } = n
    return {
      id,
      type,
      track,
      ...(parent !== undefined ? { parent } : {}),
      ...(freq !== undefined ? { freq } : {}),
      ...(order !== undefined ? { order } : {}),
      ...(group !== undefined ? { group } : {}),
      ...(empty ? { empty } : {}),
      x: round(n.x ?? 0),
      y: round(n.y ?? 0),
      z: round(n.z ?? 0),
    }
  })
  const outLinks: GraphLink[] = links.map((l) => ({
    source: typeof l.source === 'string' ? l.source : l.source.id,
    target: typeof l.target === 'string' ? l.target : l.target.id,
    kind: l.kind,
  }))
  return { tracks, nodes: outNodes, links: outLinks }
}
