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
  /** Teléfono: en reposo lleva pulso una de cada seis conexiones en lugar de una de cada tres (decisión 8). */
  compact: boolean
  dpr: number
  width: number
  height: number
}

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

/** Superficie auxiliar donde se pinta una imagen de resplandor (inyectable en las pruebas). */
export type GlowSurfaceFactory = (size: number) => { image: CanvasImageSource; ctx: CanvasRenderingContext2D | null }

const defaultSurface: GlowSurfaceFactory = (size) => {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return { image: c, ctx: c.getContext('2d') }
}

/** Lado en píxeles de cada imagen de resplandor (de implementación). */
const GLOW_SIZE = 64
/**
 * Perfiles de resplandor (decisión 11; de implementación). `node` imita la sombra difuminada que tenían pistas,
 * temas y nodo enfocado; `pulse` reproduce el degradado radial de la cabeza del pulso (0.55 → 0.18 → 0).
 */
const GLOW_STOPS = {
  node: [
    [0, 0.9],
    [0.3, 0.55],
    [0.55, 0.22],
    [0.8, 0.06],
    [1, 0],
  ],
  pulse: [
    [0, 0.55],
    [0.4, 0.18],
    [1, 0],
  ],
} as const
type GlowKind = keyof typeof GLOW_STOPS

/**
 * Imágenes de resplandor generadas una sola vez por color y tipo, y reutilizadas en cada cuadro con `drawImage`
 * en lugar de `shadowBlur` o de un degradado radial nuevo por cuadro.
 */
export class GlowCache {
  private readonly cache = new Map<string, CanvasImageSource | null>()
  private readonly surface: GlowSurfaceFactory
  constructor(surface: GlowSurfaceFactory = defaultSurface) {
    this.surface = surface
  }
  get(kind: GlowKind, color: string): CanvasImageSource | null {
    const key = `${kind}:${color}`
    if (this.cache.has(key)) return this.cache.get(key)!
    const { image, ctx } = this.surface(GLOW_SIZE)
    let out: CanvasImageSource | null = null
    if (ctx) {
      const h = GLOW_SIZE / 2
      const g = ctx.createRadialGradient(h, h, 0, h, h, h)
      for (const [at, a] of GLOW_STOPS[kind]) g.addColorStop(at, rgba(color, a))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE)
      out = image
    }
    this.cache.set(key, out)
    return out
  }
  get size(): number {
    return this.cache.size
  }
}

/** Alcance del resplandor de cada nodo (equivale al antiguo `shadowBlur`, en píxeles CSS a perspectiva 1). */
const GLOW_REACH = { focus: 32, track: 28, trackEmpty: 10, topic: 11 } as const
/** Radio del halo de la cabeza del pulso. */
const PULSE_HALO = 9
const LABEL_OUTLINE = 'rgba(4, 5, 10, 0.85)'

export class Scene {
  readonly nodes: SceneNode[]
  readonly links: SceneLink[]
  projected: Projected[] = []
  readonly glows: GlowCache

  constructor(graph: GraphData, surface?: GlowSurfaceFactory) {
    this.glows = new GlowCache(surface)
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

      if (s.pulses && (i % (s.compact ? 6 : 3) === 0 || l.on > 0.5)) {
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
        // Halo de la cabeza: imagen de resplandor del color, modulada con globalAlpha.
        const halo = this.glows.get('pulse', c)
        if (halo && k > 0) {
          ctx.globalAlpha = Math.min(1, k)
          ctx.drawImage(halo, hx - PULSE_HALO, hy - PULSE_HALO, PULSE_HALO * 2, PULSE_HALO * 2)
          ctx.globalAlpha = 1
        }
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
      const sr = p.sr + (focus ? 2 : 0)
      if (n.type !== 'concept' || focus) {
        const glow = this.glows.get('node', n.color)
        const reach = (focus ? GLOW_REACH.focus : n.type === 'track' ? (n.empty ? GLOW_REACH.trackEmpty : GLOW_REACH.track) : GLOW_REACH.topic) * p.p
        const R = sr + reach
        if (glow) ctx.drawImage(glow, p.sx - R, p.sy - R, R * 2, R * 2)
      }
      ctx.fillStyle = n.type === 'concept' ? rgba(n.color, 0.8) : n.color
      ctx.beginPath()
      ctx.arc(p.sx, p.sy, sr, 0, 6.283)
      ctx.fill()
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
    // Contorno oscuro en lugar de sombra (decisión 11).
    ctx.strokeStyle = LABEL_OUTLINE
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
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
      const ly = p.sy + p.sr + (n.type === 'track' ? 10 : 5)
      ctx.strokeText(label, p.sx, ly)
      ctx.fillText(label, p.sx, ly)
    }
    ctx.globalAlpha = 1
    ctx.lineJoin = 'miter'
    return settling
  }
}
