import { describe, expect, it, vi } from 'vitest'
import type { GraphData } from '../content/model.ts'
import { initialCamera, rotateBy, zoomAt, ZOOM_MAX, ZOOM_MIN, type Camera } from './canvas-renderer/camera.ts'
import { distance, pinchFactor } from './canvas-renderer/gestures.ts'
import { FrameLoop } from './canvas-renderer/loop.ts'
import { pick } from './canvas-renderer/pick.ts'
import { project, type WorldNode } from './canvas-renderer/project.ts'
import { computeHighlight } from './highlight.ts'
import { indexGraph, relatedOf } from './relations.ts'
import contractSource from './types.ts?raw'

const cam: Camera = { x: 400, y: 300, k: 1, rotX: 0, rotY: 0 }
const node = (x: number, y: number, z: number, r = 7): WorldNode => ({ x, y, z, r, ph: 0 })

describe('4.0 contrato', () => {
  it('no menciona canvas, cámara ni coordenadas', () => {
    const src = contractSource.toLowerCase()
    for (const w of ['canvas', 'camera', 'cámara', 'camara', 'coordenada', 'coordinate']) expect(src).not.toContain(w)
  })
})

describe('4.1 cámara y proyección', () => {
  it('un nodo más lejano se proyecta más pequeño (y más tenue)', () => {
    const [near, far] = project([node(50, 0, -200), node(50, 0, 400)], cam)
    expect(far.sr).toBeLessThan(near.sr)
    expect(far.fade).toBeLessThan(near.fade)
    expect(far.depth).toBeGreaterThan(near.depth)
  })

  it('rotar 360° devuelve las posiciones iniciales', () => {
    const nodes = [node(120, -40, 60), node(-80, 30, -150), node(10, 200, 5)]
    const start = { ...cam, rotX: -0.2, rotY: 0.5 }
    const a = project(nodes, start)
    const b = project(nodes, { ...start, rotY: start.rotY + 2 * Math.PI })
    a.forEach((p, i) => {
      expect(b[i].sx).toBeCloseTo(p.sx, 6)
      expect(b[i].sy).toBeCloseTo(p.sy, 6)
      expect(b[i].sr).toBeCloseTo(p.sr, 6)
    })
  })

  it('el zoom respeta mínimo y máximo y se centra en el punto', () => {
    expect(zoomAt(cam, 100, 100, 100).k).toBe(ZOOM_MAX)
    expect(zoomAt(cam, 100, 100, 0.001).k).toBe(ZOOM_MIN)
    const z = zoomAt(cam, 100, 100, 2)
    // El punto bajo el cursor queda fijo: (100 - x)/k se conserva.
    expect((100 - z.x) / z.k).toBeCloseTo((100 - cam.x) / cam.k)
  })

  it('arrastrar gira y limita la inclinación', () => {
    const r = rotateBy(cam, 100, 10_000)
    expect(r.rotY).toBeGreaterThan(cam.rotY)
    expect(r.rotX).toBeLessThanOrEqual(1.3)
  })

  it('la cámara inicial deja el zoom entre 0.6 y 1.3', () => {
    expect(initialCamera(1280, 800, 268).k).toBeGreaterThanOrEqual(0.6)
    expect(initialCamera(375, 812, 0).k).toBeGreaterThanOrEqual(0.6)
    expect(initialCamera(3000, 2000, 268).k).toBeLessThanOrEqual(1.3)
  })
})

describe('4.2 selección bajo el cursor', () => {
  it('entre dos nodos superpuestos elige el más cercano a la cámara', () => {
    const proj = project([node(0, 0, 300), node(0, 0, -300)], cam)
    // Mismo punto en pantalla (x=y=0 en el mundo → centro de la cámara).
    expect(proj[0].sx).toBeCloseTo(proj[1].sx)
    expect(pick(proj, cam.x, cam.y)).toBe(1)
    expect(pick([...proj].reverse(), cam.x, cam.y)).toBe(0)
  })

  it('devuelve -1 lejos de cualquier nodo', () => {
    expect(pick(project([node(0, 0, 0)], cam), 0, 0)).toBe(-1)
  })
})

const g: GraphData = {
  tracks: [
    { id: 'rest', abbr: 'RE', color: '#22d3ee', order: 1, name: { es: 'REST', en: 'REST' }, empty: false },
    { id: 'sql', abbr: 'SQ', color: '#fbbf24', order: 2, name: { es: 'SQL', en: 'SQL' }, empty: true },
  ],
  nodes: [
    { id: 'rest', type: 'track', track: 'rest', x: 0, y: 0, z: 0 },
    { id: 'sql', type: 'track', track: 'sql', empty: true, x: 0, y: 0, z: 0 },
    { id: 'a', type: 'topic', track: 'rest', parent: 'rest', order: 1, x: 0, y: 0, z: 0 },
    { id: 'b', type: 'topic', track: 'rest', parent: 'rest', order: 2, x: 0, y: 0, z: 0 },
    { id: 'c', type: 'topic', track: 'rest', parent: 'rest', order: 3, x: 0, y: 0, z: 0 },
    { id: 'ca', type: 'concept', track: 'rest', parent: 'a', x: 0, y: 0, z: 0 },
    { id: 'cb', type: 'concept', track: 'rest', parent: 'b', x: 0, y: 0, z: 0 },
  ],
  links: [
    { source: 'rest', target: 'a', kind: 'hierarchy' },
    { source: 'rest', target: 'b', kind: 'hierarchy' },
    { source: 'rest', target: 'c', kind: 'hierarchy' },
    { source: 'a', target: 'ca', kind: 'hierarchy' },
    { source: 'b', target: 'cb', kind: 'hierarchy' },
    { source: 'a', target: 'b', kind: 'related' },
    { source: 'c', target: 'ca', kind: 'related' },
  ],
}

describe('4.6 conjunto resaltado (fuera del renderizador)', () => {
  const idx = indexGraph(g)
  it('el de un tema incluye sus conceptos y sus relacionados', () => {
    const s = computeHighlight(idx, { hovered: 'a', selected: null, matches: null })!
    expect([...s].sort()).toEqual(['a', 'b', 'c', 'ca'])
    expect(s.has('cb')).toBe(false)
    expect(s.has('rest')).toBe(false)
  })
  it('un concepto relacionado desde otro tema conecta ambos temas', () => {
    expect(relatedOf(idx, 'a').map((n) => n.id).sort()).toEqual(['b', 'c'])
    expect(relatedOf(idx, 'c').map((n) => n.id)).toEqual(['ca'])
  })
  it('el de una pista incluye sus temas y conceptos', () => {
    expect([...computeHighlight(idx, { hovered: null, selected: 'rest', matches: null })!].sort()).toEqual(['a', 'b', 'c', 'ca', 'cb', 'rest'])
  })
  it('las coincidencias de búsqueda prevalecen; sin foco no hay resaltado', () => {
    const m = new Set(['cb'])
    expect(computeHighlight(idx, { hovered: 'a', selected: 'b', matches: m })).toBe(m)
    expect(computeHighlight(idx, { hovered: null, selected: null, matches: null })).toBeNull()
  })
})

describe('4.7 bucle de dibujo', () => {
  const scheduler = () => {
    const queue: Array<(t: number) => void> = []
    return {
      queue,
      request: vi.fn((cb: (t: number) => void) => queue.push(cb)),
      cancel: vi.fn(),
      run(t = 16) {
        const cb = queue.shift()
        cb?.(t)
      },
    }
  }

  it('con animaciones detenidas no programa un nuevo cuadro sin interacción', () => {
    const s = scheduler()
    const draw = vi.fn(() => false)
    const loop = new FrameLoop(draw, s)
    loop.setContinuous(false)
    expect(s.request).toHaveBeenCalledTimes(1)
    s.run()
    expect(draw).toHaveBeenCalledTimes(1)
    expect(loop.scheduled).toBe(false)
    expect(s.queue).toHaveLength(0)
    loop.invalidate()
    expect(loop.scheduled).toBe(true)
  })

  it('con animaciones detenidas sigue dibujando mientras una transición no se asienta', () => {
    const s = scheduler()
    let frames = 0
    const loop = new FrameLoop(() => ++frames < 3, s)
    loop.setContinuous(false)
    s.run()
    s.run()
    s.run()
    expect(frames).toBe(3)
    expect(loop.scheduled).toBe(false)
  })

  it('con animaciones activas es continuo y se pausa con la pestaña oculta', () => {
    const s = scheduler()
    const loop = new FrameLoop(() => false, s)
    loop.setContinuous(true)
    s.run()
    expect(loop.scheduled).toBe(true)
    loop.setHidden(true)
    expect(loop.scheduled).toBe(false)
    loop.invalidate()
    expect(loop.scheduled).toBe(false)
    loop.setHidden(false)
    expect(loop.scheduled).toBe(true)
  })
})

describe('4.9 gestos táctiles', () => {
  it('el zoom de dos punteros es la razón de separaciones', () => {
    const start: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
    ]
    expect(pinchFactor(start, [{ x: 50, y: 100 }, { x: 250, y: 100 }])).toBeCloseTo(2)
    expect(pinchFactor(start, [{ x: 125, y: 100 }, { x: 175, y: 100 }])).toBeCloseTo(0.5)
    expect(distance(start[0], start[1])).toBe(100)
  })
  it('separar los dedos acerca dentro de los límites', () => {
    const c = zoomAt(cam, 150, 100, pinchFactor([{ x: 0, y: 0 }, { x: 10, y: 0 }], [{ x: 0, y: 0 }, { x: 1000, y: 0 }]))
    expect(c.k).toBe(ZOOM_MAX)
  })
})
