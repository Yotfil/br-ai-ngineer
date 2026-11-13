/** Densidad máxima del lienzo del cerebro (rendimiento-movil, decisión 10). */
export const MAX_DPR = 2

/** Densidad con la que se dimensiona el lienzo: la del dispositivo, como máximo 2x. */
export function canvasDpr(deviceRatio: number | undefined): number {
  return Math.min(deviceRatio || 1, MAX_DPR)
}
