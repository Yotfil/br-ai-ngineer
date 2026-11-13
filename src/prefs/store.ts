import { isLocale } from '../i18n/index.ts'
import type { Locale } from '../content/model.ts'

export type ReaderMode = 'glass' | 'solid'
export type Motion = 'on' | 'off'

export interface Prefs {
  locale?: Locale
  readerMode: ReaderMode
  sidebarCollapsed: boolean
  /** Ausente = el usuario no ha elegido; se usa la preferencia del sistema. */
  motion?: Motion
}

export const DEFAULT_PREFS: Prefs = { readerMode: 'glass', sidebarCollapsed: false }
export const PREFS_KEY = 'ai-engineer-path:prefs'

const MODES: readonly ReaderMode[] = ['glass', 'solid']

/**
 * Versión del formato guardado (rendimiento-movil, decisión 3). Lo guardado sin `v: 2` es del formato de
 * tres modos, cuyo `solid` tenía el aspecto del `glass` actual: su modo del lector no se interpreta y pasa a `glass`.
 * El campo es del formato guardado, no de `Prefs`.
 */
const FORMAT_VERSION = 2

/** Acceso protegido: si el almacenamiento no existe o lanza, se trabaja con los valores por defecto. */
function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function loadPrefs(): Prefs {
  try {
    const raw = storage()?.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const data = JSON.parse(raw) as Record<string, unknown>
    return {
      ...(isLocale(data.locale) ? { locale: data.locale } : {}),
      readerMode:
        data.v === FORMAT_VERSION && MODES.includes(data.readerMode as ReaderMode) ? (data.readerMode as ReaderMode) : DEFAULT_PREFS.readerMode,
      sidebarCollapsed: typeof data.sidebarCollapsed === 'boolean' ? data.sidebarCollapsed : DEFAULT_PREFS.sidebarCollapsed,
      ...(data.motion === 'on' || data.motion === 'off' ? { motion: data.motion } : {}),
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    storage()?.setItem(PREFS_KEY, JSON.stringify({ ...prefs, v: FORMAT_VERSION }))
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

/** Valor efectivo de animaciones: la elección explícita prevalece; si no, `off` con movimiento reducido. */
export function effectiveMotion(prefs: Prefs, systemReduced: boolean): Motion {
  return prefs.motion ?? (systemReduced ? 'off' : 'on')
}
