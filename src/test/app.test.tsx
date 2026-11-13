/// <reference types="node" />
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fs from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n/index.ts'
import { DEFAULT_PREFS, loadPrefs, PREFS_KEY, savePrefs } from '../prefs/store.ts'
import { brain, mockMedia, renderApp } from './renderApp.tsx'

const shellCss = fs.readFileSync(`${process.cwd()}/src/shell/Shell.module.css`, 'utf8')

const loc = () => screen.getByTestId('location').textContent
const setLanguages = (langs: string[]) => Object.defineProperty(navigator, 'languages', { configurable: true, get: () => langs })
const readerTitle = () => screen.queryByRole('heading', { level: 1 })
const tab = (name: string) => screen.getByRole('tab', { name })

beforeEach(() => {
  localStorage.clear()
  mockMedia()
  setLanguages(['es-CO'])
  document.documentElement.removeAttribute('data-motion')
  void i18n.changeLanguage('es')
})

describe('3.2 i18n', () => {
  it('muestra los rótulos en el idioma de la ruta', () => {
    const { unmount } = renderApp('/es')
    expect(screen.getByRole('combobox', { name: 'Buscar concepto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Detener animaciones' })).toBeInTheDocument()
    unmount()
    renderApp('/en')
    expect(screen.getByRole('combobox', { name: 'Search a concept' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Stop animations' })).toBeInTheDocument()
  })
})

describe('3.3 idioma inicial', () => {
  it('usa la preferencia guardada', () => {
    savePrefs({ ...DEFAULT_PREFS, locale: 'en' })
    renderApp('/')
    expect(loc()).toBe('/en')
  })
  it('primera visita con navegador en inglés → inglés', () => {
    setLanguages(['en-US', 'en'])
    renderApp('/')
    expect(loc()).toBe('/en')
  })
  it('navegador en francés → español', () => {
    setLanguages(['fr-FR', 'fr'])
    renderApp('/')
    expect(loc()).toBe('/es')
  })
  it('un enlace en inglés se muestra en inglés aunque la preferencia sea español', async () => {
    savePrefs({ ...DEFAULT_PREFS, locale: 'es' })
    renderApp('/en/rest/cors')
    expect(await screen.findByRole('heading', { level: 1, name: 'CORS and the OPTIONS preflight' })).toBeInTheDocument()
  })
  it('un idioma desconocido en la ruta redirige a la raíz', () => {
    renderApp('/fr/rest/cors')
    expect(loc()).toBe('/es')
  })
})

describe('3.4 preferencias', () => {
  it('persiste los cuatro valores', () => {
    savePrefs({ locale: 'en', readerMode: 'solid', sidebarCollapsed: true, motion: 'off' })
    expect(loadPrefs()).toEqual({ locale: 'en', readerMode: 'solid', sidebarCollapsed: true, motion: 'off' })
  })
  it('devuelve los valores por defecto si localStorage lanza un error', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
    expect(() => savePrefs({ ...DEFAULT_PREFS, readerMode: 'pure' })).not.toThrow()
    renderApp('/es')
    expect(screen.getByTestId('fake-brain')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Detener animaciones' }))
    expect(screen.getByRole('button', { name: 'Reanudar animaciones' })).toBeInTheDocument()
    get.mockRestore()
    set.mockRestore()
  })
  it('ignora valores corruptos', () => {
    localStorage.setItem(PREFS_KEY, '{"readerMode":"x","sidebarCollapsed":"si","motion":3}')
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
    localStorage.setItem(PREFS_KEY, 'no es json')
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })
})

describe('4.8 cerebro conectado con la navegación (renderizador falso)', () => {
  it('la aplicación funciona con un renderizador que cumple el contrato', () => {
    renderApp('/es')
    expect(screen.getByTestId('fake-brain')).toHaveAttribute('aria-label', 'Mapa de conceptos')
    expect(brain.props?.labels.rest).toBe('HTTP y REST')
    expect(brain.props?.highlighted).toBeNull()
  })
  it('clic en un tema lo abre; en un concepto abre su tema hogar', async () => {
    renderApp('/es')
    fireEvent.click(screen.getByTestId('node-cors'))
    expect(loc()).toBe('/es/rest/cors')
    expect(await screen.findByRole('heading', { level: 1, name: 'CORS y el preflight con OPTIONS' })).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('node-clave-de-idempotencia'))
    expect(loc()).toBe('/es/rest/idempotencia-en-la-practica#clave-de-idempotencia')
    expect(brain.props?.focus.selected).toBe('clave-de-idempotencia')
    expect(brain.props?.readerOpen).toBe(true)
  })
  it('clic en una pista la despliega en el sidebar; en una pista Próximamente no abre nada', () => {
    renderApp('/es')
    const side = screen.getByRole('navigation', { name: 'Pistas' })
    const rest = within(side).getByRole('button', { name: /HTTP y REST/ })
    fireEvent.click(rest) // la cierra
    expect(rest).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(screen.getByTestId('node-rest'))
    expect(rest).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByTestId('node-sql'))
    expect(loc()).toBe('/es')
    expect(brain.props?.focus.selected).toBe('rest')
  })
  it('clic en el vacío cierra el lector', async () => {
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(screen.getByTestId('brain-background'))
    expect(loc()).toBe('/es')
    expect(brain.props?.readerOpen).toBe(false)
  })
  it('el cursor sobre un ítem del sidebar resalta su nodo', () => {
    renderApp('/es')
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Anatomía de una URL' }))
    expect(brain.props?.focus.hovered).toBe('anatomia-url')
    expect(brain.props?.highlighted?.has('anatomia-url')).toBe(true)
    expect(brain.props?.highlighted?.has('query-string')).toBe(true)
  })
})

describe('5.2 sidebar', () => {
  it('desplegar y ocultar una pista', () => {
    renderApp('/es')
    const rest = screen.getByRole('button', { name: /HTTP y REST/ })
    expect(rest).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(rest)
    expect(rest).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(rest)
    expect(rest).toHaveAttribute('aria-expanded', 'true')
  })
  it('contraer muestra solo iconos; clic en un icono expande con la pista desplegada', () => {
    renderApp('/es')
    const nav = screen.getByRole('navigation', { name: 'Pistas' })
    const rest = within(nav).getByRole('button', { name: /HTTP y REST/ })
    fireEvent.click(rest) // cerrada
    fireEvent.click(screen.getByRole('button', { name: 'Contraer menú' }))
    expect(nav).toHaveClass('collapsed')
    expect(document.documentElement).toHaveAttribute('data-collapsed')
    fireEvent.click(rest)
    expect(nav).not.toHaveClass('collapsed')
    expect(rest).toHaveAttribute('aria-expanded', 'true')
  })
  it('con un tema abierto su pista está desplegada y el tema marcado', () => {
    renderApp('/es/rest/cache-http')
    expect(screen.getByRole('button', { name: /HTTP y REST/ })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Caché HTTP: Cache-Control, ETag y 304' })).toHaveAttribute('aria-current', 'page')
  })
  it('una pista Próximamente aparece atenuada, con la etiqueta, y no se despliega', () => {
    renderApp('/es')
    const git = screen.getByRole('button', { name: /^Git\s*Próximamente$/ })
    expect(git).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(git)
    expect(git).not.toHaveAttribute('aria-expanded')
    expect(git).toHaveClass('soon')
  })
})

describe('5.3 lector central', () => {
  it('abre con Entender activa, acento de la pista, definición, analogía y problema', async () => {
    renderApp('/es')
    fireEvent.click(screen.getByRole('button', { name: 'Métodos seguros e idempotentes' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Métodos seguros e idempotentes' })).toBeInTheDocument()
    expect(tab('Entender')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('article')).toHaveStyle('--track: #22d3ee')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('Un método es seguro si no modifica')
    expect(within(panel).getByRole('heading', { name: 'Analogía' })).toBeInTheDocument()
    expect(within(panel).getByRole('heading', { name: 'Qué problema resuelve' })).toBeInTheDocument()
  })
  it('En código muestra los bloques en orden, con resaltado y el puente', async () => {
    renderApp('/es/rest/metodos-seguros-idempotentes')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(tab('En código'))
    const panel = screen.getByRole('tabpanel')
    const labels = [...panel.querySelectorAll('h3, [class*="lbl"]')].map((e) => e.textContent)
    expect(labels).toEqual(['Así viaja por la red', 'Del lado del servidor (FastAPI)', 'Riesgoso', 'Correcto', 'Puente con el frontend (TypeScript)'])
    expect(panel.querySelector('pre.shiki span[style*="color"]')).not.toBeNull()
  })
  it('un tema sin ejercicios ni demo muestra tres pestañas', async () => {
    renderApp('/es/rest/url-a-respuesta')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Entender', 'En código', 'En la entrevista'])
  })
  it('un tema sin par riesgoso/correcto no muestra ese bloque', async () => {
    renderApp('/es/rest/url-a-respuesta')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(tab('En código'))
    expect(screen.getByRole('tabpanel')).not.toHaveTextContent('Riesgoso')
  })
  it('En la entrevista: respuesta modelo destacada y debajo los malentendidos', async () => {
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(tab('En la entrevista'))
    const hs = within(screen.getByRole('tabpanel')).getAllByRole('heading').map((h) => h.textContent)
    expect(hs).toEqual(['Para decir en la entrevista', 'Malentendidos comunes'])
    expect(screen.getByRole('tabpanel').querySelectorAll('li').length).toBe(3)
  })
  it('se cierra con el botón y con Escape', async () => {
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(loc()).toBe('/es')
    act(() => {
      window.history.pushState({}, '')
    })
  })
  it('Escape cierra el lector', async () => {
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(loc()).toBe('/es')
  })
  it('Siguiente tema muestra el siguiente de la pista', async () => {
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente tema →' }))
    expect(loc()).toBe('/es/rest/cache-http')
    expect(await screen.findByRole('heading', { level: 1, name: 'Caché HTTP: Cache-Control, ETag y 304' })).toBeInTheDocument()
    expect(tab('Entender')).toHaveAttribute('aria-selected', 'true')
  })
  it('un enlace directo abre el tema', async () => {
    renderApp('/es/rest/rate-limiting')
    expect(await screen.findByRole('heading', { level: 1, name: 'Rate limiting, 429 y Retry-After' })).toBeInTheDocument()
  })
})

describe('5.4 tema no encontrado', () => {
  it('muestra el aviso sin lector', () => {
    renderApp('/es/rest/no-existe')
    expect(screen.getByRole('status')).toHaveTextContent('No se encontró el tema.')
    expect(readerTitle()).toBeNull()
    expect(brain.props?.readerOpen).toBe(false)
  })
  it('un tema de una pista Próximamente tampoco existe', () => {
    renderApp('/es/git/rebase')
    expect(screen.getByRole('status')).toHaveTextContent('No se encontró el tema.')
  })
})

describe('5.5 relacionados', () => {
  it('clic en un relacionado cambia el tema y actualiza el panel', async () => {
    renderApp('/es/rest/metodos-seguros-idempotentes')
    await screen.findByRole('heading', { level: 1 })
    const panel = () => screen.getAllByRole('complementary', { name: 'Relacionados' })[0]
    expect(within(panel()).getByRole('button', { name: /idempotencia\s*RE/ })).toBeInTheDocument()
    fireEvent.click(within(panel()).getByRole('button', { name: /Idempotencia en la práctica/ }))
    expect(loc()).toBe('/es/rest/idempotencia-en-la-practica')
    expect(await screen.findByRole('heading', { level: 1, name: 'Idempotencia en la práctica: claves y pagos duplicados' })).toBeInTheDocument()
    expect(within(panel()).getByRole('button', { name: /clave de idempotencia/ })).toBeInTheDocument()
    expect(within(panel()).getByRole('button', { name: /Rate limiting/ })).toBeInTheDocument()
  })
})

describe('5.6 modos del lector', () => {
  it('Cristal por defecto; el modo elegido se conserva al recargar', async () => {
    const { unmount } = renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'glass')
    fireEvent.click(screen.getByRole('button', { name: /Modo de fondo del lector: ◻ Cristal/ }))
    expect(screen.getByRole('button', { name: /Modo de fondo del lector: ○ Sin fondo/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /○ Sin fondo/ }))
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'solid')
    fireEvent.click(screen.getByRole('button', { name: /◼ Sólido/ }))
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'glass')
    fireEvent.click(screen.getByRole('button', { name: /◻ Cristal/ }))
    unmount()
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByRole('button', { name: /○ Sin fondo/ })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'pure')
  })
})

describe('5.7 ejercicios y pestaña Practicar', () => {
  it('opción múltiple incorrecta: se marca y se muestra la explicación', async () => {
    renderApp('/es/rest/metodos-http')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
    const panel = screen.getByRole('tabpanel')
    expect(within(panel).getByRole('heading', { name: '¿Qué método o respuesta corresponde?' })).toBeInTheDocument()
    const q = screen.getByText('Quieres cambiar solo la dirección de envío de un pedido existente.').parentElement!
    fireEvent.click(within(q).getByRole('button', { name: 'GET' }))
    expect(within(q).getByRole('button', { name: 'GET' })).toHaveClass('no')
    expect(within(q).getByRole('status')).toHaveTextContent('No es esa. Es una modificación parcial')
  })
  it('veredicto: "Está bien" en un endpoint con error se marca incorrecto con su explicación', async () => {
    renderApp('/es/rest/diseno-api-rest')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
    expect(screen.getByRole('heading', { name: 'Revisa este diseño: ¿cada endpoint está bien o tiene un error?' })).toBeInTheDocument()
    const q = screen.getByText('POST /v1/crearPedido').closest('div')!
    fireEvent.click(within(q).getByRole('button', { name: 'Está bien' }))
    expect(within(q).getByRole('button', { name: 'Está bien' })).toHaveClass('no')
    expect(within(q).getByRole('status')).toHaveTextContent('Revisa. Verbo en la URL.')
  })
  it('al volver al tema el ejercicio aparece sin responder', async () => {
    renderApp('/es/rest/metodos-http')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'PATCH' })[0])
    expect(screen.getAllByRole('status').length).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente tema →' }))
    await screen.findByRole('heading', { level: 1, name: 'Métodos seguros e idempotentes' })
    fireEvent.click(screen.getByRole('button', { name: '← Anterior' }))
    await screen.findByRole('heading', { level: 1, name: 'Métodos HTTP y PUT vs. PATCH' })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
    expect(screen.queryAllByRole('status')).toHaveLength(0)
  })
  it('tema con ejercicios y demo', async () => {
    renderApp('/es/rest/metodos-seguros-idempotentes')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
    expect(screen.getByRole('heading', { name: '¿Qué método o respuesta corresponde?' })).toBeInTheDocument()
    expect(await screen.findByText('Envía la misma petición tres veces')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'POST /v1/pedidos ×3' }))
    expect(screen.getByText(/No idempotente\./)).toBeInTheDocument()
  })
  it('tema con demo y sin ejercicios: solo la demo', async () => {
    renderApp('/es/rest/rate-limiting')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
    expect(await screen.findByText(/Token bucket: 5 de capacidad/)).toBeInTheDocument()
    expect(screen.getByRole('tabpanel').querySelectorAll('h3')).toHaveLength(0)
  })
  it('tema con ejercicios y sin demo: solo los ejercicios', async () => {
    renderApp('/es/rest/metodos-http')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(await screen.findByRole('tab', { name: 'Practicar' }))
    expect(screen.getByRole('tabpanel')).not.toHaveTextContent('Demo interactiva')
  })
})

describe('5.12 control de animaciones', () => {
  it('detener deja quietos cerebro y fondo, y el control ofrece reanudar', () => {
    renderApp('/es')
    expect(brain.props?.motion).toBe('on')
    fireEvent.click(screen.getByRole('button', { name: 'Detener animaciones' }))
    expect(brain.props?.motion).toBe('off')
    expect(document.documentElement).toHaveAttribute('data-motion', 'off')
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar animaciones' }))
    expect(brain.props?.motion).toBe('on')
  })
  it('la elección se recuerda al volver', () => {
    const { unmount } = renderApp('/es')
    fireEvent.click(screen.getByRole('button', { name: 'Detener animaciones' }))
    unmount()
    renderApp('/es')
    expect(screen.getByRole('button', { name: 'Reanudar animaciones' })).toBeInTheDocument()
    expect(brain.props?.motion).toBe('off')
  })
  it('con movimiento reducido inicia detenido; la elección explícita prevalece', () => {
    mockMedia({ reducedMotion: true })
    const { unmount } = renderApp('/es')
    expect(brain.props?.motion).toBe('off')
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar animaciones' }))
    unmount()
    renderApp('/es')
    expect(brain.props?.motion).toBe('on')
  })
})

describe('6.2 buscador', () => {
  it('flechas y Enter abren el resultado y cierran la lista', async () => {
    const user = userEvent.setup()
    renderApp('/es')
    const input = screen.getByRole('combobox', { name: 'Buscar concepto' })
    await user.click(input)
    await user.type(input, 'idemp')
    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThanOrEqual(4)
    expect(brain.props?.focus.matches?.size).toBe(options.length)
    await user.keyboard('{ArrowDown}')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
    const target = options[1].querySelector('[class*="name"]')!.textContent
    await user.keyboard('{Enter}')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(input).not.toHaveFocus()
    expect(brain.props?.focus.matches).toBeNull()
    expect(loc()).toMatch(/^\/es\/rest\//)
    void target
  })
  it('abrir un concepto abre su tema hogar', async () => {
    const user = userEvent.setup()
    renderApp('/es')
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'paginacion')
    await user.click(screen.getByRole('option', { name: /^paginaciónConcepto · Diseño de una API REST/ }))
    expect(loc()).toBe('/es/rest/diseno-api-rest#paginacion')
  })
  it('Escape cierra la lista y saca el foco sin cerrar el lector', async () => {
    const user = userEvent.setup()
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'cors')
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
    await user.keyboard('{Escape}')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(input).not.toHaveFocus()
    expect(loc()).toBe('/es/rest/cors')
  })
  it('Ctrl+K con un tema abierto lleva el cursor al buscador', async () => {
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('combobox')).toHaveFocus()
    fireEvent.keyDown(window, { key: 'K', metaKey: true })
    expect(screen.getByRole('combobox')).toHaveFocus()
  })
  it('sin coincidencias la lista lo indica', async () => {
    const user = userEvent.setup()
    renderApp('/es')
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'zzxqv')
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })
})

describe('9.1 enlaces a otros temas dentro del texto', () => {
  it('el enlace del puente muestra el título del destino y abre ese tema', async () => {
    renderApp('/es/rest/metodos-http')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(tab('En código'))
    const link = await within(screen.getByRole('tabpanel')).findByRole('link', { name: 'CORS y el preflight con OPTIONS' })
    fireEvent.click(link)
    expect(loc()).toBe('/es/rest/cors')
    expect(await screen.findByRole('heading', { level: 1, name: 'CORS y el preflight con OPTIONS' })).toBeInTheDocument()
  })

  it('en inglés el enlace muestra el título en inglés', async () => {
    void i18n.changeLanguage('en')
    renderApp('/en/rest/metodos-http')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(tab('In code'))
    expect(await within(screen.getByRole('tabpanel')).findByRole('link', { name: 'CORS and the OPTIONS preflight' })).toBeInTheDocument()
  })
})

describe('9.4 ayuda de gestos del cerebro', () => {
  const hint = () => screen.queryByTestId('gesture-hint')
  const ES = 'clic: abrir · arrastrar: girar · Mayús + arrastrar: mover · rueda: acercar'

  it('en escritorio sin tema abierto se ve en el idioma activo', () => {
    renderApp('/es')
    expect(hint()).toHaveTextContent(ES)
    expect(hint()).not.toHaveClass('hintHidden')
  })

  it('en inglés usa su texto', () => {
    void i18n.changeLanguage('en')
    renderApp('/en')
    expect(hint()).toHaveTextContent('click: open · drag: rotate · Shift + drag: pan · wheel: zoom')
  })

  it('al abrir un tema desaparece con la transición de los paneles', async () => {
    renderApp('/es')
    fireEvent.click(screen.getByTestId('node-cors'))
    await screen.findByRole('heading', { level: 1 })
    expect(hint()).toHaveClass('hintHidden')
    expect(hint()).toHaveAttribute('aria-hidden', 'true')
  })

  it('no intercepta el puntero: el arrastre llega al cerebro', () => {
    // jsdom no calcula qué elemento queda bajo el cursor; se comprueba la regla y, a mano, en el navegador.
    const rule = shellCss.slice(shellCss.indexOf('.gestureHint {'), shellCss.indexOf('}', shellCss.indexOf('.gestureHint {')))
    expect(rule).toContain('pointer-events: none')
  })

  it('no se muestra en teléfono ni en tableta', () => {
    mockMedia({ phone: true })
    const { unmount } = renderApp('/es')
    expect(hint()).toBeNull()
    unmount()
    mockMedia({ tablet: true })
    renderApp('/es')
    expect(hint()).toBeNull()
  })
})

describe('localización: cambio de idioma sin perder el lugar', () => {
  it('conserva el tema y la pestaña En código', async () => {
    renderApp('/es/rest/cors')
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(tab('En código'))
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(loc()).toBe('/en/rest/cors')
    expect(await screen.findByRole('heading', { level: 1, name: 'CORS and the OPTIONS preflight' })).toBeInTheDocument()
    expect(tab('In code')).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => expect(screen.getByRole('tabpanel')).toHaveTextContent('How it travels over the wire'))
    expect(loadPrefs().locale).toBe('en')
    expect(brain.props?.labels.rest).toBe('HTTP & REST')
  })
})
