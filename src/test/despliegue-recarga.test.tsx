/**
 * Recuperación ante una versión nueva y aviso de error de carga en el lector y en la demo
 * (despliegue-automatico, specs/app-shell; design.md decisiones 2 y 3).
 */
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { browserDeps, RELOADED_FOR_KEY } from '../data/newVersion.ts'
import i18n from '../i18n/index.ts'
import { mockMedia, renderApp } from './renderApp.tsx'

/** Qué falla: el JSON del tema, el código de la demo, o nada. */
const fail = vi.hoisted(() => ({ topic: false, demo: false }))

vi.mock('../data/content.ts', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../data/content.ts')>()
  return {
    ...orig,
    loadTopic: (...args: Parameters<typeof orig.loadTopic>) => {
      const real = orig.loadTopic(...args)
      if (!real) return real
      return fail.topic ? Promise.reject(new TypeError('Failed to fetch dynamically imported module')) : real
    },
  }
})

vi.mock('../demos/registry.ts', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../demos/registry.ts')>()
  const wrap =
    (load: () => Promise<{ default: React.ComponentType }>) =>
    (): Promise<{ default: React.ComponentType }> =>
      fail.demo ? Promise.reject(new TypeError('Failed to fetch dynamically imported module')) : load()
  return {
    ...orig,
    DEMO_LOADERS: Object.fromEntries(Object.entries(orig.DEMO_LOADERS).map(([k, v]) => [k, wrap(v)])),
  }
})

const CURRENT = '/assets/index-OLD.js'
const NEW = '/assets/index-NEW.js'
const indexWith = (src: string) => `<!doctype html><html><head><script type="module" crossorigin src="${src}"></script></head><body><div id="root"></div></body></html>`

const realDeps = { ...browserDeps }
let reload: Mock<() => void>
let fetchIndex: Mock<() => Promise<string>>
/** Simula lo que sirve el hosting: `/index.html` con el script de `served`, o la red caída. */
function serve(served: string | 'offline') {
  fetchIndex.mockImplementation(async () => (served === 'offline' ? Promise.reject(new TypeError('Failed to fetch')) : indexWith(served)))
}

const ES_MSG = 'No se pudo cargar el contenido. Comprueba tu conexión.'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  mockMedia()
  void i18n.changeLanguage('es')
  fail.topic = false
  fail.demo = false
  // La página en ejecución: su script de entrada.
  const s = document.createElement('script')
  s.type = 'module'
  s.setAttribute('src', CURRENT)
  s.dataset.testEntry = ''
  document.head.append(s)
  reload = vi.fn<() => void>()
  fetchIndex = vi.fn<() => Promise<string>>()
  browserDeps.reload = reload
  browserDeps.fetchIndex = fetchIndex
})

afterEach(() => {
  Object.assign(browserDeps, realDeps)
  document.head.querySelectorAll('[data-test-entry]').forEach((n) => n.remove())
})

describe('3.3 fallo de carga de un tema', () => {
  it('Abrir un tema tras una publicación: se recarga sola y sigue el estado de carga', async () => {
    fail.topic = true
    serve(NEW)
    renderApp('/es/rest/cors')
    await waitFor(() => expect(reload).toHaveBeenCalledOnce())
    expect(sessionStorage.getItem(RELOADED_FOR_KEY)).toBe(NEW)
    expect(fetchIndex).toHaveBeenCalledOnce()
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Sin bucle de recargas: ya recargada por esta versión, muestra el aviso', async () => {
    fail.topic = true
    serve(NEW)
    sessionStorage.setItem(RELOADED_FOR_KEY, NEW)
    renderApp('/es/rest/cors')
    expect(await screen.findByRole('alert')).toHaveTextContent(ES_MSG)
    expect(reload).not.toHaveBeenCalled()
  })

  it('Sin versión nueva: no se recarga', async () => {
    fail.topic = true
    serve(CURRENT)
    renderApp('/es/rest/cors')
    expect(await screen.findByRole('alert')).toHaveTextContent(ES_MSG)
    expect(reload).not.toHaveBeenCalled()
  })

  it('Sin conexión: mensaje, botón Reintentar, y el lector se puede cerrar', async () => {
    fail.topic = true
    serve('offline')
    renderApp('/es/rest/cors')
    expect(await screen.findByRole('alert')).toHaveTextContent(ES_MSG)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(reload).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/es'))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Reintentar con éxito: al volver la conexión muestra el tema', async () => {
    fail.topic = true
    serve('offline')
    renderApp('/es/rest/cors')
    await screen.findByRole('alert')
    fail.topic = false
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'CORS y el preflight con OPTIONS' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Reintentar repite la comprobación de versión nueva', async () => {
    fail.topic = true
    serve('offline')
    renderApp('/es/rest/cors')
    await screen.findByRole('alert')
    serve(NEW)
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(reload).toHaveBeenCalledOnce())
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Idioma inglés: mensaje y botón en inglés', async () => {
    fail.topic = true
    serve('offline')
    renderApp('/en/rest/cors')
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load the content. Check your connection.")
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})

describe('3.4 fallo de carga de una demo', () => {
  const openPractice = async (path: string) => {
    renderApp(path)
    await screen.findByRole('heading', { level: 1, name: /\S/ })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
  }

  it('Abrir una demo tras una publicación: se recarga sola', async () => {
    fail.demo = true
    serve(NEW)
    await openPractice('/es/rest/metodos-seguros-idempotentes')
    await waitFor(() => expect(reload).toHaveBeenCalledOnce())
    const demo = screen.getByRole('region', { name: 'Demo interactiva' })
    expect(within(demo).getByText('Cargando…')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Demo que no carga: aviso en su bloque y los ejercicios siguen funcionando', async () => {
    fail.demo = true
    serve(CURRENT)
    await openPractice('/es/rest/metodos-seguros-idempotentes')
    const demo = screen.getByRole('region', { name: 'Demo interactiva' })
    expect(await within(demo).findByRole('alert')).toHaveTextContent(ES_MSG)
    expect(within(demo).getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(reload).not.toHaveBeenCalled()
    // Los ejercicios del tema siguen ahí y responden.
    expect(screen.getByRole('heading', { name: '¿Qué método o respuesta corresponde?' })).toBeInTheDocument()
    // Reintentar con la carga ya disponible muestra la demo.
    fail.demo = false
    fireEvent.click(within(demo).getByRole('button', { name: 'Reintentar' }))
    expect(await within(demo).findByText('Envía la misma petición tres veces')).toBeInTheDocument()
  })
})
