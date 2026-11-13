/** Estado de cámara del renderizador en canvas (portado de mockups/ui-v2.html). */
export interface Camera {
  /** Desplazamiento en pantalla del origen del mundo. */
  x: number
  y: number
  /** Zoom. */
  k: number
  /** Rotación alrededor de los ejes X e Y (radianes). */
  rotX: number
  rotY: number
}

export const FOCAL = 900
export const ZOOM_MIN = 0.4
export const ZOOM_MAX = 3.2
export const ROT_X_LIMIT = 1.3
export const ROTATE_SPEED = 0.006
/** Rotación automática por milisegundo (la maqueta usa 0.00022 por cuadro a ~60 fps). */
export const AUTO_ROTATE_PER_MS = 0.00022 / 16.67

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** Cámara inicial centrada en el área libre a la derecha del sidebar. */
export function initialCamera(width: number, height: number, insetLeft: number): Camera {
  const k = clamp(Math.min((width - insetLeft - 80) / 780, (height - 140) / 620), 0.6, 1.3)
  return { x: (width + insetLeft) / 2, y: height / 2 + 30, k: Number.isFinite(k) ? k : 1, rotX: -0.2, rotY: 0.5 }
}

export function rotateBy(start: Camera, dx: number, dy: number): Camera {
  return { ...start, rotY: start.rotY + dx * ROTATE_SPEED, rotX: clamp(start.rotX + dy * ROTATE_SPEED, -ROT_X_LIMIT, ROT_X_LIMIT) }
}

export function panBy(start: Camera, dx: number, dy: number): Camera {
  return { ...start, x: start.x + dx, y: start.y + dy }
}

/** Zoom con límites en torno a un punto de pantalla (el cursor o el centro del pellizco). */
export function zoomAt(cam: Camera, px: number, py: number, factor: number): Camera {
  const k = clamp(cam.k * factor, ZOOM_MIN, ZOOM_MAX)
  const f = k / cam.k
  return { ...cam, k, x: px - (px - cam.x) * f, y: py - (py - cam.y) * f }
}

/** Factor de zoom de la rueda (maqueta: exp(-deltaY * 0.0016)). */
export const wheelFactor = (deltaY: number) => Math.exp(-deltaY * 0.0016)
