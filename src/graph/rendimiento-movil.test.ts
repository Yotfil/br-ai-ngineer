/// <reference types="node" />
/** Pruebas del renderizador del cerebro del cambio rendimiento-movil (design.md decisiones 6, 8, 10 y 11). */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { graph } from '../data/content.ts'
import { canvasDpr } from './canvas-renderer/density.ts'
import { FrameLoop } from './canvas-renderer/loop.ts'
import { Scene, type DrawState } from './canvas-renderer/scene.ts'

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')

describe('5.2 bucle en pausa', () => {
  const scheduler = () => {
    const queue: Array<(t: number) => void> = []
    return {
      queue,
      request: vi.fn((cb: (t: number) => void) => queue.push(cb)),
      cancel: vi.fn(() => queue.splice(0)),
      run(t = 16) {
        queue.shift()?.(t)
      },
    }
  }
  it('Tema abierto en teléfono: con animaciones activas deja de programar cuadros', () => {
    const s = scheduler()
    const draw = vi.fn(() => false)
    const loop = new FrameLoop(draw, s)
    loop.setContinuous(true)
    s.run()
    expect(loop.scheduled).toBe(true)
    loop.setPaused(true)
    expect(loop.scheduled).toBe(false)
    expect(s.queue).toHaveLength(0)
  })
  it('Cambiar de tema en teléfono: ni cambios de foco ni transiciones programan cuadros', () => {
    const s = scheduler()
    const loop = new FrameLoop(() => true, s)
    loop.setContinuous(true)
    loop.setPaused(true)
    const before = s.request.mock.calls.length
    loop.invalidate()
    loop.setContinuous(false)
    loop.setHidden(true)
    loop.setHidden(false)
    expect(s.request.mock.calls.length).toBe(before)
    expect(loop.scheduled).toBe(false)
  })
  it('Girar el teléfono: un solo cuadro con el tamaño nuevo y vuelve a quedar quieto', () => {
    const s = scheduler()
    const draw = vi.fn(() => true) // aunque haya transiciones, no sigue
    const loop = new FrameLoop(draw, s)
    loop.setContinuous(true)
    loop.setPaused(true)
    loop.redrawOnce()
    expect(loop.scheduled).toBe(true)
    s.run()
    expect(draw).toHaveBeenCalledTimes(1)
    expect(loop.scheduled).toBe(false)
    expect(s.queue).toHaveLength(0)
  })
  it('Cerrar el tema en teléfono: se reanuda continuo con animaciones activas, y bajo demanda si están detenidas', () => {
    const s = scheduler()
    const loop = new FrameLoop(() => false, s)
    loop.setContinuous(true)
    loop.setPaused(true)
    loop.setPaused(false)
    expect(loop.scheduled).toBe(true)
    s.run()
    expect(loop.scheduled).toBe(true)
    const s2 = scheduler()
    const loop2 = new FrameLoop(() => false, s2)
    loop2.setContinuous(false)
    s2.run()
    loop2.setPaused(true)
    loop2.setPaused(false)
    s2.run()
    expect(loop2.scheduled).toBe(false)
  })
  it('el renderizador: en pausa ignora arrastre, pellizco y rueda, y conserva el toque', () => {
    const src = read('src/graph/canvas-renderer/CanvasRenderer.tsx')
    expect(src).toContain('loop.paused = propsRef.current.paused')
    expect(src).toContain('loop.redrawOnce()')
    expect(src).toMatch(/if \(pinch && pointers\.size >= 2\) \{\s*if \(frozen\) return/)
    expect(src).toContain('if (drag.moved && !frozen)')
    expect(src).toMatch(/e\.preventDefault\(\)\s*if \(propsRef\.current\.paused\) return/)
    expect(src).toContain('loopRef.current?.setPaused(props.paused)')
  })
})

describe('5.3 densidad máxima 2x', () => {
  it('Pantalla de densidad 3x → 2x; 1x → 1x', () => {
    expect(canvasDpr(3)).toBe(2)
    expect(canvasDpr(1)).toBe(1)
    expect(canvasDpr(1.5)).toBe(1.5)
    expect(canvasDpr(undefined)).toBe(1)
    expect(read('src/graph/canvas-renderer/CanvasRenderer.tsx')).toContain('dpr = canvasDpr(window.devicePixelRatio)')
  })
})

/** Contexto 2D falso que registra asignaciones y llamadas. */
function recorder() {
  const sets: Record<string, number> = {}
  const calls: Record<string, number> = {}
  const gradient = { addColorStop: () => {} }
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(target, prop: string) {
      if (prop in target) return target[prop]
      return (..._args: unknown[]) => {
        calls[prop] = (calls[prop] ?? 0) + 1
        return prop.startsWith('create') ? gradient : undefined
      }
    },
    set(target, prop: string, v) {
      sets[prop] = (sets[prop] ?? 0) + 1
      target[prop] = v
      return true
    },
  }) as unknown as CanvasRenderingContext2D
  return { ctx, sets, calls }
}

const state = (over: Partial<DrawState> = {}): DrawState => ({
  cam: { x: 600, y: 400, k: 1, rotX: -0.2, rotY: 0.5 },
  k0: 1,
  highlighted: null,
  hovered: null,
  selected: null,
  labels: Object.fromEntries(graph.nodes.map((n) => [n.id, n.id])),
  drift: true,
  pulses: true,
  compact: false,
  dpr: 2,
  width: 1200,
  height: 800,
  ...over,
})

describe('5.4 menos pulsos en teléfono', () => {
  it('en reposo: una de cada tres conexiones; con compact, una de cada seis', () => {
    const count = (compact: boolean) => {
      const r = recorder()
      new Scene(graph, () => ({ image: {} as CanvasImageSource, ctx: recorder().ctx })).draw(r.ctx, 1000, state({ compact }))
      return r.calls.createLinearGradient ?? 0
    }
    const n = graph.links.length
    expect(count(false)).toBe(Math.ceil(n / 3))
    expect(count(true)).toBe(Math.ceil(n / 6))
  })
  it('las conexiones resaltadas llevan pulso siempre, también con compact', () => {
    const scene = new Scene(graph, () => ({ image: {} as CanvasImageSource, ctx: recorder().ctx }))
    const ids = new Set(graph.nodes.filter((n) => n.track === 'rest').map((n) => n.id))
    const on = scene.links.filter((l) => ids.has(scene.nodes[l.a].id) && ids.has(scene.nodes[l.b].id)).map((l) => scene.links.indexOf(l))
    let r = recorder()
    for (let f = 0; f < 60; f++) {
      r = recorder()
      scene.draw(r.ctx, 1000 + f * 16, state({ compact: true, highlighted: ids }))
    }
    const expected = scene.links.filter((_, i) => i % 6 === 0 || on.includes(i)).length
    expect(on.length).toBeGreaterThan(0)
    expect(r.calls.createLinearGradient).toBe(expected)
  })
})

describe('5.5 sin shadowBlur', () => {
  it('un cuadro no asigna shadowBlur ni crea degradados radiales; las imágenes se generan una vez por color', () => {
    const surface = vi.fn(() => ({ image: {} as CanvasImageSource, ctx: recorder().ctx }))
    const scene = new Scene(graph, surface)
    const r1 = recorder()
    scene.draw(r1.ctx, 1000, state({ hovered: 'cors', selected: 'rest' }))
    expect(r1.sets.shadowBlur ?? 0).toBe(0)
    expect(r1.sets.shadowColor ?? 0).toBe(0)
    expect(r1.calls.createRadialGradient ?? 0).toBe(0)
    expect(r1.calls.drawImage).toBeGreaterThan(0)
    expect(r1.calls.strokeText).toBe(r1.calls.fillText)
    const colors = new Set(graph.tracks.map((t) => t.color))
    expect(surface.mock.calls.length).toBeLessThanOrEqual(colors.size * 2)
    const created = surface.mock.calls.length
    for (let f = 1; f < 10; f++) {
      const r = recorder()
      scene.draw(r.ctx, 1000 + f * 16, state())
      expect(r.calls.createRadialGradient ?? 0).toBe(0)
      expect(r.sets.shadowBlur ?? 0).toBe(0)
    }
    expect(surface.mock.calls.length).toBe(created)
    expect(read('src/graph/canvas-renderer/scene.ts')).not.toMatch(/\.shadow(Blur|Color)\s*=/)
  })
  it('nombres con contorno oscuro de grosor 3 y uniones redondeadas', () => {
    const src = read('src/graph/canvas-renderer/scene.ts')
    expect(src).toContain("const LABEL_OUTLINE = 'rgba(4, 5, 10, 0.85)'")
    expect(src).toMatch(/ctx\.strokeStyle = LABEL_OUTLINE\s*ctx\.lineWidth = 3\s*ctx\.lineJoin = 'round'/)
  })
})
