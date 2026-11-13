import type { Camera } from './camera.ts'
import { FOCAL } from './camera.ts'

export interface WorldNode {
  x: number
  y: number
  z: number
  /** Radio base del nodo. */
  r: number
  /** Fase propia para la deriva. */
  ph: number
}

export interface Projected {
  sx: number
  sy: number
  /** Radio en pantalla. */
  sr: number
  /** Profundidad tras la rotación (mayor = más lejos de la cámara). */
  depth: number
  /** Factor de perspectiva. */
  p: number
  /** Atenuación por distancia (1 = cerca). */
  fade: number
}

/**
 * Proyección en perspectiva de la maqueta. `t` (ms) y `drift` animan una deriva pequeña de cada nodo.
 * Función pura: no depende del canvas.
 */
export function project(nodes: readonly WorldNode[], cam: Camera, t = 0, drift = false): Projected[] {
  const cy = Math.cos(cam.rotY)
  const sy = Math.sin(cam.rotY)
  const cx = Math.cos(cam.rotX)
  const sx = Math.sin(cam.rotX)
  const zk = 0.55 + 0.45 * cam.k
  return nodes.map((n) => {
    const x = n.x + (drift ? Math.sin(t * 0.00045 + n.ph) * 3 : 0)
    const y = n.y + (drift ? Math.cos(t * 0.00038 + n.ph * 1.7) * 3 : 0)
    const z = n.z
    const x1 = x * cy + z * sy
    const z1 = -x * sy + z * cy
    const y1 = y * cx - z1 * sx
    const z2 = y * sx + z1 * cx
    const p = FOCAL / (FOCAL + z2)
    return {
      sx: cam.x + x1 * p * cam.k,
      sy: cam.y + y1 * p * cam.k,
      sr: Math.max(1.1, n.r * p * zk),
      depth: z2,
      p,
      fade: Math.max(0.28, Math.min(1, 1 - z2 / 620)),
    }
  })
}
