/// <reference types="node" />
import { act, fireEvent, screen, within } from '@testing-library/react'
import fs from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n/index.ts'
import { DEFAULT_PREFS, loadPrefs, savePrefs, type ReaderMode } from '../prefs/store.ts'
import { brain, mockMedia, renderApp } from '../test/renderApp.tsx'
import { centeredIndex, ITEM, relocate, scaleFor, scrollFor, STEP, trackIndex } from './carousel.ts'

const bottomBarCss = fs.readFileSync(`${process.cwd()}/src/shell/BottomBar.module.css`, 'utf8')

const WIDTH = 360
const PAD = WIDTH / 2 - ITEM / 2
const N = 5 // pistas declaradas en content/tracks.yaml

describe('5.10 cálculos del carrusel', () => {
  it('la pista centrada es la del ítem más cercano al centro', () => {
    expect(centeredIndex(scrollFor(7, PAD, WIDTH), WIDTH, PAD, 15)).toBe(7)
    expect(centeredIndex(scrollFor(7, PAD, WIDTH) + STEP * 0.4, WIDTH, PAD, 15)).toBe(7)
    expect(centeredIndex(scrollFor(7, PAD, WIDTH) + STEP * 0.6, WIDTH, PAD, 15)).toBe(8)
    expect(centeredIndex(-500, WIDTH, PAD, 15)).toBe(0)
    expect(centeredIndex(1e6, WIDTH, PAD, 15)).toBe(14)
  })
  it('al asentarse en una copia lateral se reubica en la central', () => {
    expect(relocate(0, N)).toBe(5)
    expect(relocate(4, N)).toBe(9)
    expect(relocate(7, N)).toBe(7)
    expect(relocate(10, N)).toBe(5)
    expect(relocate(14, N)).toBe(9)
    expect(trackIndex(13, N)).toBe(3)
  })
  it('la escala crece de forma continua hacia el centro', () => {
    expect(scaleFor(0)).toBeGreaterThan(scaleFor(STEP / 2))
    expect(scaleFor(STEP / 2)).toBeGreaterThan(scaleFor(STEP))
    expect(scaleFor(STEP * 3)).toBe(1)
  })
})

// ---------- Componente en teléfono ----------
const scroll = new WeakMap<Element, number>()
let restore: Array<() => void> = []

beforeAll(() => {
  const cw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
  const sl = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft')
  const st = (Element.prototype as unknown as { scrollTo?: unknown }).scrollTo
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return (this as HTMLElement).dataset?.testid === 'carousel' ? WIDTH : 0
    },
  })
  Object.defineProperty(Element.prototype, 'scrollLeft', {
    configurable: true,
    get() {
      return scroll.get(this) ?? 0
    },
    set(v: number) {
      scroll.set(this, v)
    },
  })
  Object.defineProperty(Element.prototype, 'scrollTo', {
    configurable: true,
    writable: true,
    value(this: Element, opts: ScrollToOptions) {
      this.scrollLeft = opts.left ?? 0
      this.dispatchEvent(new Event('scroll'))
    },
  })
  restore = [
    () => cw && Object.defineProperty(HTMLElement.prototype, 'clientWidth', cw),
    () => sl && Object.defineProperty(Element.prototype, 'scrollLeft', sl),
    () => Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, writable: true, value: st }),
  ]
})
afterAll(() => restore.forEach((f) => f()))

beforeEach(() => {
  localStorage.clear()
  mockMedia({ phone: true })
  void i18n.changeLanguage('es')
  vi.useFakeTimers()
  return () => vi.useRealTimers()
})

/** Renderiza en teléfono y deja terminar el posicionamiento inicial del carrusel. */
const renderPhone = (path: string) => {
  const r = renderApp(path)
  act(() => {
    vi.advanceTimersByTime(500)
  })
  return r
}
const carousel = () => screen.getByTestId('carousel')
const centered = () => screen.getByRole('navigation', { name: 'Pistas' }).querySelector('[aria-current="true"]')
const slideTo = (left: number) => {
  act(() => {
    carousel().scrollLeft = left
    fireEvent.scroll(carousel())
    vi.advanceTimersByTime(300)
  })
}

describe('5.11 barra inferior de pistas en teléfono', () => {
  it('el sidebar lateral queda inactivo y la barra inferior activa; la carga no selecciona nada', () => {
    renderApp('/es')
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(centered()).toHaveAccessibleName('HTTP y REST')
    // El navegador emite "scroll" tras el posicionamiento inicial: no es una elección del usuario.
    act(() => {
      fireEvent.scroll(carousel())
      vi.advanceTimersByTime(300)
    })
    expect(brain.props?.focus.selected).toBeNull()
  })

  it('deslizar y soltar: se asienta la más cercana, crece y queda seleccionada en el cerebro', () => {
    renderPhone('/es')
    slideTo(scrollFor(N + 1, PAD, WIDTH) + 12)
    expect(carousel().scrollLeft).toBe(scrollFor(N + 1, PAD, WIDTH) + 12)
    expect(centered()).toHaveAccessibleName('Python y FastAPI')
    expect(brain.props?.focus.selected).toBe('python')
    const items = carousel().querySelectorAll('button')
    const s = (i: number) => Number((items[i] as HTMLElement).style.getPropertyValue('--s'))
    expect(s(N + 1)).toBeGreaterThan(s(N))
    expect(s(N + 1)).toBeGreaterThan(s(N + 2))
  })

  it('vuelta completa en ambos sentidos sin tope: se reubica en la copia central', () => {
    renderPhone('/es')
    // Más allá de la última pista hacia la derecha: copia 3, primera pista.
    slideTo(scrollFor(2 * N, PAD, WIDTH))
    expect(carousel().scrollLeft).toBe(scrollFor(N, PAD, WIDTH))
    expect(centered()).toHaveAccessibleName('HTTP y REST')
    // Hacia la izquierda: copia 1, última pista.
    slideTo(scrollFor(N - 1, PAD, WIDTH))
    expect(carousel().scrollLeft).toBe(scrollFor(2 * N - 1, PAD, WIDTH))
    expect(centered()).toHaveAccessibleName('POO · Próximamente')
    expect(brain.props?.focus.selected).toBe('oop')
  })

  it('tocar una pista lateral la centra y la selecciona', () => {
    renderPhone('/es')
    act(() => {
      fireEvent.click(carousel().querySelector(`[data-index="${N + 2}"]`)!)
      vi.advanceTimersByTime(300)
    })
    expect(carousel().scrollLeft).toBe(scrollFor(N + 2, PAD, WIDTH))
    expect(centered()).toHaveAccessibleName('SQL · Próximamente')
    expect(brain.props?.focus.selected).toBe('sql')
  })

  it('tocar la pista centrada abre la hoja con sus temas; tocar un tema lo abre', () => {
    renderPhone('/es')
    fireEvent.click(centered()!)
    const sheet = screen.getByRole('dialog', { name: 'Temas de HTTP y REST' })
    expect(within(sheet).getAllByRole('button')).toHaveLength(20)
    fireEvent.click(within(sheet).getByRole('button', { name: 'Anatomía de una URL' }))
    expect(screen.getByTestId('location').textContent).toBe('/es/rest/anatomia-url')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('9.5 hoja de temas legible: fondo totalmente opaco y sin cristal con cualquiera de los dos modos guardado', () => {
    const start = bottomBarCss.indexOf('.sheet {')
    const rule = bottomBarCss.slice(start, bottomBarCss.indexOf('}', start))
    // Decisión 12 de pista-python: 100 % opaca, con el color base de --glass-strong, que no cambia.
    expect(rule).toContain('background: rgb(9, 10, 20);')
    expect(rule).not.toContain('var(--glass-strong)')
    expect(rule).not.toContain('backdrop-filter')
    expect(fs.readFileSync(`${process.cwd()}/src/styles/tokens.css`, 'utf8')).toContain('--glass-strong: rgba(9, 10, 20, 0.9);')
    for (const mode of ['glass', 'solid']) {
      savePrefs({ ...DEFAULT_PREFS, readerMode: mode as ReaderMode })
      expect(loadPrefs().readerMode).toBe(mode)
      const { unmount } = renderPhone('/es')
      fireEvent.click(centered()!)
      const sheet = screen.getByRole('dialog', { name: 'Temas de HTTP y REST' })
      expect(sheet).toHaveClass('sheet')
      expect(sheet).not.toHaveClass('glass')
      expect(screen.getByRole('navigation', { name: 'Pistas' })).toHaveClass('glass')
      unmount()
    }
  })

  it('hoja sobre un tema abierto: es opaca, sin cristal, y queda encima del lector con cualquiera de los dos modos guardado', () => {
    const start = bottomBarCss.indexOf('.sheet {')
    const rule = bottomBarCss.slice(start, bottomBarCss.indexOf('}', start))
    expect(rule).toMatch(/background: rgb\(9, 10, 20\);/)
    expect(rule).not.toMatch(/rgba|opacity|backdrop-filter/)
    for (const mode of ['glass', 'solid']) {
      savePrefs({ ...DEFAULT_PREFS, readerMode: mode as ReaderMode })
      const { unmount } = renderPhone('/es/rest/cors')
      expect(document.documentElement).toHaveAttribute('data-reading')
      fireEvent.click(centered()!)
      const sheet = screen.getByRole('dialog', { name: 'Temas de HTTP y REST' })
      expect(sheet).toHaveClass('sheet')
      expect(sheet).not.toHaveClass('glass')
      // En teléfono el modo efectivo es Sólido (rendimiento-movil, decisión 2); lo guardado no cambia.
      expect(document.documentElement).toHaveAttribute('data-reader-mode', 'solid')
      expect(loadPrefs().readerMode).toBe(mode)
      unmount()
    }
  })

  it('una pista Próximamente centrada abre la hoja con "Próximamente"', () => {
    renderPhone('/es')
    slideTo(scrollFor(N + 3, PAD, WIDTH))
    fireEvent.click(centered()!)
    const sheet = screen.getByRole('dialog', { name: 'Temas de Git' })
    expect(sheet).toHaveTextContent('Próximamente')
    expect(within(sheet).queryAllByRole('button')).toHaveLength(0)
  })

  it('con un tema abierto el carrusel centra su pista y el cerebro mantiene el tema', () => {
    renderPhone('/es')
    slideTo(scrollFor(N + 2, PAD, WIDTH))
    expect(centered()).toHaveAccessibleName('SQL · Próximamente')
    fireEvent.click(screen.getByTestId('node-cors'))
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(centered()).toHaveAccessibleName('HTTP y REST')
    expect(brain.props?.focus.selected).toBe('cors')
  })
})
