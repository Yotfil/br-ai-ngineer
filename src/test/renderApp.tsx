import { render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import App from '../App.tsx'
import { BrainImplementation } from '../graph/Brain.tsx'
import type { BrainRendererProps } from '../graph/types.ts'
import { PrefsProvider } from '../prefs/PrefsContext.tsx'

/** Último juego de props que recibió el renderizador falso. */
export const brain: { props: BrainRendererProps | null } = { props: null }

/** Renderizador falso que cumple el contrato: un botón por nodo y uno para el fondo. */
export function FakeBrain(p: BrainRendererProps) {
  brain.props = p
  return (
    <div data-testid="fake-brain" aria-label={p.ariaLabel}>
      {p.graph.nodes.map((n) => (
        <button key={n.id} data-testid={`node-${n.id}`} aria-label={`nodo ${n.id}`} onClick={() => p.onNodeOpen(n.id)} onMouseEnter={() => p.onNodeHover(n.id)} onMouseLeave={() => p.onNodeHover(null)}>
          {p.labels[n.id]}
        </button>
      ))}
      <button data-testid="brain-background" aria-label="fondo del cerebro" onClick={p.onBackgroundClick} />
    </div>
  )
}

function LocationProbe() {
  const l = useLocation()
  return <span data-testid="location">{l.pathname + l.hash}</span>
}

/** Simula el ancho de pantalla (`max-width: 760px` teléfono, `max-width: 1080px` tableta o teléfono) y el movimiento reducido. */
export function mockMedia({ phone = false, tablet = false, reducedMotion = false } = {}) {
  window.matchMedia = ((query: string) => ({
    matches:
      (query.includes('max-width: 760px') && phone) ||
      (query.includes('max-width: 1080px') && (phone || tablet)) ||
      (query.includes('prefers-reduced-motion') && reducedMotion),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

export function renderApp(path: string) {
  return render(
    <PrefsProvider>
      <MemoryRouter initialEntries={[path]}>
        <BrainImplementation.Provider value={FakeBrain}>
          <App />
          <LocationProbe />
        </BrainImplementation.Provider>
      </MemoryRouter>
    </PrefsProvider>,
  )
}
