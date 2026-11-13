import { useEffect, useLayoutEffect, useRef } from 'react'
import type { BrainRendererProps } from '../types.ts'
import { AUTO_ROTATE_PER_MS, initialCamera, panBy, rotateBy, wheelFactor, zoomAt, type Camera } from './camera.ts'
import { DRAG_THRESHOLD, midpoint, pinchFactor, type Point } from './gestures.ts'
import { FrameLoop } from './loop.ts'
import { pick } from './pick.ts'
import { Scene } from './scene.ts'
import styles from './CanvasRenderer.module.css'

const IDLE_AFTER_INTERACTION_MS = 2500

interface Drag {
  start: Camera
  x: number
  y: number
  pan: boolean
  moved: boolean
}

interface Pinch {
  start: [Point, Point]
  cam: Camera
  mid: Point
}

function insetLeft(): number {
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--brain-inset-left'))
  return Number.isFinite(v) ? v : 0
}

/** Implementación propia del cerebro: canvas 2D con proyección 3D portada de mockups/ui-v2.html. */
export default function CanvasRenderer(props: BrainRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef(props)
  useLayoutEffect(() => {
    propsRef.current = props
  })
  const loopRef = useRef<FrameLoop | null>(null)
  const sceneRef = useRef<Scene | null>(null)

  // Escena: se rehace solo si cambian los datos del grafo.
  useEffect(() => {
    sceneRef.current = new Scene(props.graph)
    loopRef.current?.invalidate()
  }, [props.graph])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d') ?? null
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let cam: Camera = { x: 0, y: 0, k: 1, rotX: -0.2, rotY: 0.5 }
    let k0 = 1
    let last = 0
    let idleUntil = 0
    let hovered: string | null = null
    let drag: Drag | null = null
    let pinch: Pinch | null = null
    const pointers = new Map<number, Point>()

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      const init = initialCamera(width, height, insetLeft())
      cam = { ...init, rotX: cam.rotX, rotY: cam.rotY }
      k0 = init.k
      loop.invalidate()
    }

    const draw = (t: number): boolean => {
      const p = propsRef.current
      const scene = sceneRef.current
      if (!scene) return false
      const dt = last ? Math.min(64, t - last) : 16
      last = t
      const animate = p.motion === 'on'
      const searching = !!p.focus.matches
      if (animate && !p.readerOpen && !drag && !pinch && !hovered && !searching && performance.now() > idleUntil) {
        cam = { ...cam, rotY: cam.rotY + AUTO_ROTATE_PER_MS * dt }
      }
      return scene.draw(ctx, t, {
        cam,
        k0,
        highlighted: p.highlighted,
        hovered: p.focus.hovered ?? hovered,
        selected: p.focus.selected,
        labels: p.labels,
        drift: animate && !p.readerOpen,
        pulses: animate,
        dpr,
        width,
        height,
      })
    }

    const loop = new FrameLoop(draw, {
      request: (cb) => requestAnimationFrame(cb),
      cancel: (id) => cancelAnimationFrame(id),
    })
    loopRef.current = loop
    loop.continuous = propsRef.current.motion === 'on'
    resize()

    const local = (e: PointerEvent | WheelEvent): Point => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const nodeAt = (pt: Point): string | null => {
      const scene = sceneRef.current
      if (!scene || !scene.projected.length) return null
      const i = pick(scene.projected, pt.x, pt.y)
      return i >= 0 ? scene.nodes[i].id : null
    }
    const setHovered = (id: string | null) => {
      if (id === hovered) return
      hovered = id
      canvas.style.cursor = id ? 'pointer' : ''
      propsRef.current.onNodeHover(id)
      loop.invalidate()
    }

    const onDown = (e: PointerEvent) => {
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        /* puntero no activo (p. ej. eventos sintéticos): se sigue sin captura */
      }
      const pt = local(e)
      pointers.set(e.pointerId, pt)
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = { start: [a, b], cam, mid: midpoint(a, b) }
        if (drag) drag.moved = true
        return
      }
      drag = { start: cam, x: pt.x, y: pt.y, pan: e.shiftKey || e.button === 2, moved: false }
      canvas.classList.add(styles.grabbing)
    }
    const onMove = (e: PointerEvent) => {
      const pt = local(e)
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, pt)
      if (pinch && pointers.size >= 2) {
        const [a, b] = [...pointers.values()]
        const mid = midpoint(a, b)
        const moved = panBy(pinch.cam, mid.x - pinch.mid.x, mid.y - pinch.mid.y)
        cam = zoomAt(moved, mid.x, mid.y, pinchFactor(pinch.start, [a, b]))
        loop.invalidate()
        return
      }
      if (drag) {
        const dx = pt.x - drag.x
        const dy = pt.y - drag.y
        if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) drag.moved = true
        if (drag.moved) {
          cam = drag.pan ? panBy(drag.start, dx, dy) : rotateBy(drag.start, dx, dy)
          loop.invalidate()
        }
        return
      }
      if (e.pointerType === 'mouse') setHovered(nodeAt(pt))
    }
    const onUp = (e: PointerEvent) => {
      const pt = local(e)
      pointers.delete(e.pointerId)
      idleUntil = performance.now() + IDLE_AFTER_INTERACTION_MS
      if (pinch) {
        if (pointers.size < 2) pinch = null
        if (pointers.size === 0) {
          drag = null
          canvas.classList.remove(styles.grabbing)
        } else {
          // Queda un dedo: continúa como giro desde aquí, sin contar como toque.
          const [rest] = [...pointers.values()]
          drag = { start: cam, x: rest.x, y: rest.y, pan: false, moved: true }
        }
        return
      }
      const d = drag
      drag = null
      canvas.classList.remove(styles.grabbing)
      loop.invalidate()
      if (!d || d.moved) return
      const id = nodeAt(pt)
      if (id) propsRef.current.onNodeOpen(id)
      else propsRef.current.onBackgroundClick()
    }
    const onCancel = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      pinch = null
      drag = null
      canvas.classList.remove(styles.grabbing)
    }
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !drag) setHovered(null)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const pt = local(e)
      cam = zoomAt(cam, pt.x, pt.y, wheelFactor(e.deltaY))
      idleUntil = performance.now() + IDLE_AFTER_INTERACTION_MS
      loop.invalidate()
    }
    const onContext = (e: Event) => e.preventDefault()
    const onVisibility = () => loop.setHidden(document.hidden)

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onCancel)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('contextmenu', onContext)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    loop.setHidden(document.hidden)

    return () => {
      loop.stop()
      loopRef.current = null
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onCancel)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('contextmenu', onContext)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Animaciones: continuo con "on", bajo demanda con "off".
  useEffect(() => {
    loopRef.current?.setContinuous(props.motion === 'on')
  }, [props.motion])

  // Cualquier cambio de foco, resaltado, nombres o lector abierto pide un redibujo.
  useEffect(() => {
    loopRef.current?.invalidate()
  }, [props.highlighted, props.focus, props.labels, props.readerOpen])

  return <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={props.ariaLabel} />
}
