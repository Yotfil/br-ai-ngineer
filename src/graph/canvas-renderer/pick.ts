import type { Projected } from './project.ts'

const HIT_SLOP = 8

/**
 * Índice del nodo bajo el punto de pantalla, o -1. Entre nodos superpuestos prefiere el más cercano
 * a la cámara (menor profundidad), como en la maqueta.
 */
export function pick(projected: readonly Projected[], x: number, y: number): number {
  let best = -1
  let bestScore = Infinity
  projected.forEach((n, i) => {
    const d = Math.hypot(n.sx - x, n.sy - y) - n.sr
    const score = d + n.depth * 0.01
    if (d < HIT_SLOP && score < bestScore) {
      bestScore = score
      best = i
    }
  })
  return best
}
