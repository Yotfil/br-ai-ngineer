import type { GraphData, LinkKind, NodeType } from '../../content/model.ts'
import type { Camera } from './camera.ts'
import { project, type Projected, type WorldNode } from './project.ts'

/** Generador con semilla para fases de deriva y pulsos (resultado estable entre cargas). */
function seeded(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SceneNode extends WorldNode {
  id: string
  type: NodeType
  color: string
  empty: boolean
  /** Opacidad animada hacia su objetivo (transición gradual del resaltado). */
  al: number
}

export interface SceneLink {
  a: number
  b: number
  kind: LinkKind
  /** Intensidad animada del resaltado de la conexión. */
  on: number
  ph: number
  sp: number
}

const FREQ_RADIUS = { always: 7, often: 5.8, sometimes: 4.6 } as const

export interface DrawState {
  cam: Camera
  /** Zoom inicial: los nombres de temas y conceptos aparecen al acercarse respecto de él. */
  k0: number
  highlighted: ReadonlySet<string> | null
  hovered: string | null
  selected: string | null
  labels: Readonly<Record<string, string>>
  /** Deriva de nodos y respiración del anillo de pistas. */
  drift: boolean
  /** Pulsos de energía en las conexiones. */
  pulses: boolean
  dpr: number
  width: number
  height: number
}

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

export class Scene {
  readonly nodes: SceneNode[]
  readonly links: SceneLink[]
  projected: Projected[] = []

  constructor(graph: GraphData) {
    const rnd = seeded(7)
    const color = new Map(graph.tracks.map((t) => [t.id, t.color]))
    this.nodes = graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      color: color.get(n.track) ?? '#ffffff',
      empty: !!n.empty,
      x: n.x,
      y: n.y,
      z: n.z,
      r: n.type === 'track' ? 13 : n.type === 'topic' ? FREQ_RADIUS[n.freq ?? 'sometimes'] : 3.2,
      ph: rnd() * 6.28,
      al: 1,
    }))
    const index = new Map(this.nodes.map((n, i) => [n.id, i]))
    this.links = graph.links
      .filter((l) => index.has(l.source) && index.has(l.target))
      .map((l) => ({ a: index.get(l.source)!, b: index.get(l.target)!, kind: l.kind, on: 0, ph: rnd(), sp: 0.6 + rnd() * 0.9 }))
  }

  indexOf(id: string): number {
    return this.nodes.findIndex((n) => n.id === id)
  }

  /**
   * Dibuja un cuadro. Devuelve `true` si alguna transición de resaltado sigue en curso
   * (el bucle bajo demanda necesita seguir dibujando hasta asentarla).
   */
  draw(ctx: CanvasRenderingContext2D, t: number, s: DrawState): boolean {
    const { highlighted: act, dpr } = s
    this.projected = project(this.nodes, s.cam, t, s.drift)
    const P = this.projected
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, s.width, s.height)

    let settling = false
    for (const n of this.nodes) {
      const target = !act || act.has(n.id) ? 1 : 0.12
      n.al += (target - n.al) * 0.13
      if (Math.abs(target - n.al) > 0.004) settling = true
      else n.al = target
    }

    // Conexiones y pulsos.
    this.links.forEach((l, i) => {
      const a = this.nodes[l.a]
      const b = this.nodes[l.b]
      const pa = P[l.a]
      const pb = P[l.b]
      const target = act && act.has(a.id) && act.has(b.id) ? 1 : 0
      l.on += (target - l.on) * 0.13
      if (Math.abs(target - l.on) > 0.004) settling = true
      else l.on = target
      const cross = l.kind !== 'hierarchy'
      const al = Math.min(a.al, b.al) * Math.min(pa.fade, pb.fade)
      const base = cross ? 0.2 : 0.12
      ctx.strokeStyle =
        l.on > 0.03 ? rgba(a.color, (base + l.on * 0.55) * al) : cross ? `rgba(190,170,255,${base * al})` : `rgba(255,255,255,${base * al})`
      ctx.lineWidth = 0.8 + l.on * 0.7
      ctx.beginPath()
      ctx.moveTo(pa.sx, pa.sy)
      ctx.lineTo(pb.sx, pb.sy)
      ctx.stroke()

      if (s.pulses && (i % 3 === 0 || l.on > 0.5)) {
        const u = (t * 0.00013 * l.sp + l.ph) % 1
        const u0 = Math.max(0, u - 0.22)
        const e = Math.sin(u * Math.PI)
        const c = b.color
        const hx = pa.sx + (pb.sx - pa.sx) * u
        const hy = pa.sy + (pb.sy - pa.sy) * u
        const tx = pa.sx + (pb.sx - pa.sx) * u0
        const ty = pa.sy + (pb.sy - pa.sy) * u0
        const k = al * e * (0.75 + l.on * 0.25)
        // Cola del meteorito: degradado de transparente a color.
        const g = ctx.createLinearGradient(tx, ty, hx, hy)
        g.addColorStop(0, rgba(c, 0))
        g.addColorStop(0.7, rgba(c, 0.45 * k))
        g.addColorStop(1, `rgba(255,255,255,${0.9 * k})`)
        ctx.strokeStyle = g
        ctx.lineWidth = 1.7
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(hx, hy)
        ctx.stroke()
        ctx.lineCap = 'butt'
        // Halo de la cabeza.
        const h = ctx.createRadialGradient(hx, hy, 0, hx, hy, 9)
        h.addColorStop(0, rgba(c, 0.55 * k))
        h.addColorStop(0.4, rgba(c, 0.18 * k))
        h.addColorStop(1, rgba(c, 0))
        ctx.fillStyle = h
        ctx.beginPath()
        ctx.arc(hx, hy, 9, 0, 6.283)
        ctx.fill()
        ctx.fillStyle = `rgba(255,255,255,${0.95 * k})`
        ctx.beginPath()
        ctx.arc(hx, hy, 1.2, 0, 6.283)
        ctx.fill()
      }
    })

    // Nodos, de lejos a cerca.
    const order = this.nodes.map((_, i) => i).sort((p, q) => P[q].depth - P[p].depth)
    for (const i of order) {
      const n = this.nodes[i]
      const p = P[i]
      const focus = n.id === s.hovered || n.id === s.selected
      const dim = n.empty ? 0.38 : 1
      ctx.globalAlpha = n.al * p.fade * dim
      if (n.type !== 'concept' || focus) {
        ctx.shadowColor = n.color
        ctx.shadowBlur = (focus ? 32 : n.type === 'track' ? (n.empty ? 10 : 28) : 11) * dpr * p.p
      }
      ctx.fillStyle = n.type === 'concept' ? rgba(n.color, 0.8) : n.color
      ctx.beginPath()
      ctx.arc(p.sx, p.sy, p.sr + (focus ? 2 : 0), 0, 6.283)
      ctx.fill()
      ctx.shadowBlur = 0
      if (n.type === 'track') {
        ctx.strokeStyle = rgba(n.color, 0.35)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, p.sr + 6 + (s.drift ? Math.sin(t * 0.0015 + n.ph) * 1.5 : 0), 0, 6.283)
        ctx.stroke()
      }
    }

    // Nombres: pistas siempre; temas y conceptos al acercarse o resaltados.
    const rel = s.cam.k / s.k0
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (const i of order) {
      const n = this.nodes[i]
      const p = P[i]
      const on = !!act && act.has(n.id)
      const show = n.type === 'track' || on || (!act && n.type === 'topic' && rel > 1.35) || (!act && rel > 2.1)
      const label = s.labels[n.id]
      if (!show || !label) continue
      ctx.globalAlpha = n.al * p.fade * (n.empty ? 0.55 : 1)
      const fs = (n.type === 'track' ? 13 : n.type === 'topic' ? 11.5 : 10.5) * Math.max(0.82, Math.min(1.25, p.p))
      ctx.font = `${n.type === 'track' ? 800 : n.type === 'topic' ? 600 : 500} ${fs}px Inter, sans-serif`
      ctx.fillStyle = n.type === 'track' ? '#fff' : n.type === 'topic' ? 'rgba(230,231,242,.92)' : 'rgba(190,193,220,.85)'
      ctx.shadowColor = '#04050a'
      ctx.shadowBlur = 6 * dpr
      ctx.fillText(label, p.sx, p.sy + p.sr + (n.type === 'track' ? 10 : 5))
      ctx.shadowBlur = 0
    }
    ctx.globalAlpha = 1
    return settling
  }
}
