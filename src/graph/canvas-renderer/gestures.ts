/** Cálculos de gestos táctiles (dos dedos: pellizcar y desplazar). */

export interface Point {
  x: number
  y: number
}

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
export const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/** Factor de zoom de un pellizco: razón entre la separación actual y la inicial de los dos dedos. */
export function pinchFactor(start: [Point, Point], now: [Point, Point]): number {
  const d0 = distance(start[0], start[1])
  const d1 = distance(now[0], now[1])
  return d0 > 0 ? d1 / d0 : 1
}

/** Movimiento acumulado (en px) por encima del cual un toque o clic se considera arrastre. */
export const DRAG_THRESHOLD = 4
