/**
 * Cálculos puros del carrusel circular de la barra inferior (design.md decisión 9).
 * La lista de pistas se renderiza tres veces; las posiciones se derivan del índice, no del DOM.
 */
export const COPIES = 3
export const ITEM = 48
export const GAP = 14
export const STEP = ITEM + GAP

/** Centro (en coordenadas de desplazamiento) del ítem `i`, dado el relleno lateral. */
export const itemCenter = (i: number, pad: number) => pad + i * STEP + ITEM / 2

/** `scrollLeft` que deja centrado el ítem `i` en un contenedor de ancho `width`. */
export const scrollFor = (i: number, pad: number, width: number) => itemCenter(i, pad) - width / 2

/** Índice del ítem más cercano al centro del contenedor. */
export function centeredIndex(scrollLeft: number, width: number, pad: number, total: number): number {
  const center = scrollLeft + width / 2
  const i = Math.round((center - pad - ITEM / 2) / STEP)
  return Math.max(0, Math.min(total - 1, i))
}

/** Si el carrusel se asentó en una copia lateral, índice equivalente en la copia central; si no, el mismo. */
export function relocate(index: number, count: number): number {
  return count + (((index % count) + count) % count)
}

export const trackIndex = (index: number, count: number) => ((index % count) + count) % count

/** Escala de un icono según su distancia al centro: crece de forma continua al acercarse. */
export function scaleFor(distance: number): number {
  const t = Math.max(0, 1 - Math.abs(distance) / (STEP * 1.4))
  return 1 + 0.42 * t
}
