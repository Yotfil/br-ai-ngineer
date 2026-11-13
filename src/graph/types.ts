/**
 * Contrato del cerebro (design.md decisión 4). Es lo único que el resto de la aplicación conoce:
 * datos del grafo, foco actual, estado de animaciones y eventos de alto nivel.
 * Cualquier implementación (la propia o una librería) recibe estas props y emite estos eventos.
 */
import type { GraphData } from '../content/model.ts'

export type { GraphData }

export type MotionState = 'on' | 'off'

export interface BrainFocus {
  /** Nodo señalado (cursor sobre el cerebro, el sidebar o un relacionado). */
  hovered: string | null
  /** Nodo seleccionado (tema o concepto abierto, o pista desplegada). */
  selected: string | null
  /** Coincidencias de búsqueda visibles; `null` si no hay búsqueda activa. */
  matches: ReadonlySet<string> | null
}

export interface BrainProps {
  graph: GraphData
  /** Nombre accesible del cerebro en el idioma activo. */
  ariaLabel: string
  /**
   * Nombre visible de cada nodo en el idioma activo, el que se dibuja junto al nodo. Para un tema es su
   * título corto cuando lo tiene y, si no, su título completo; pistas y conceptos usan su nombre.
   */
  labels: Readonly<Record<string, string>>
  focus: BrainFocus
  motion: MotionState
  /** Hay un tema abierto en el lector: no hay rotación automática. */
  readerOpen: boolean
  /**
   * Cerebro en pausa total (rendimiento-movil, decisión 6): no se programa ningún cuadro, el arrastre y el pellizco
   * no lo mueven y el toque sigue funcionando. Solo se redibuja una vez si cambia el tamaño de la pantalla.
   * Al volver a `false` se reanuda con el estado vigente.
   */
  paused: boolean
  /** Pantalla de teléfono (decisión 8): menos pulsos en reposo. La implementación no consulta el ancho por su cuenta. */
  compact: boolean
  onNodeHover: (id: string | null) => void
  onNodeOpen: (id: string) => void
  onBackgroundClick: () => void
}

/** Props que recibe una implementación: el contrato más el conjunto resaltado ya calculado fuera de ella. */
export interface BrainRendererProps extends BrainProps {
  /** Nodos destacados; `null` = nada destacado (ningún nodo se atenúa). */
  highlighted: ReadonlySet<string> | null
}
