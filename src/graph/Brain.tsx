import { createContext, useContext, useMemo, type ComponentType } from 'react'
import CanvasRenderer from './canvas-renderer/CanvasRenderer.tsx'
import { computeHighlight } from './highlight.ts'
import { indexGraph } from './relations.ts'
import type { BrainProps, BrainRendererProps } from './types.ts'

/**
 * Único punto de montaje del cerebro: elige la implementación. Sustituirla es escribir otro
 * componente que cumpla `BrainRendererProps` y cambiar este valor por defecto.
 */
export const BrainImplementation = createContext<ComponentType<BrainRendererProps>>(CanvasRenderer)

export default function Brain(props: BrainProps) {
  const Impl = useContext(BrainImplementation)
  const idx = useMemo(() => indexGraph(props.graph), [props.graph])
  const highlighted = useMemo(() => computeHighlight(idx, props.focus), [idx, props.focus])
  return <Impl {...props} highlighted={highlighted} />
}
