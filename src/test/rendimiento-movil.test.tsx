/// <reference types="node" />
/**
 * Pruebas del cambio rendimiento-movil (design.md decisiones 1 a 14). Lo que jsdom no puede comprobar
 * (desplazamiento táctil, desenfoques, rendimiento) se verifica en el navegador y en el guion del iPhone.
 * Las pruebas del renderizador del cerebro (5.2 a 5.5) están en src/graph/rendimiento-movil.test.ts.
 */
import { act, fireEvent, screen, within } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n/index.ts'
import { DEFAULT_PREFS, loadPrefs, PREFS_KEY, savePrefs } from '../prefs/store.ts'
import { brain, mockMedia, renderApp, setMedia } from './renderApp.tsx'

const root = process.cwd()
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8')
/** Cuerpo de la primera regla cuyo selector es exactamente `selector` (fuera o dentro de un @media). */
const rule = (css: string, selector: string, from = 0) => {
  const i = css.indexOf(`${selector} {`, from)
  if (i < 0) return null
  return css.slice(i, css.indexOf('}', i))
}
/** Bloque completo de un `@media` (hasta su llave de cierre). */
const mediaBlock = (css: string, start: number) => {
  let depth = 0
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1)
  }
  return css.slice(start)
}
const cssFiles = () => {
  const out: string[] = []
  const walk = (d: string) => {
    for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
      const p = `${d}/${e.name}`
      if (e.isDirectory()) walk(p)
      else if (p.endsWith('.css')) out.push(p)
    }
  }
  walk('src')
  return out
}

const readerCss = read('src/shell/Reader.module.css')
const shellCss = read('src/shell/Shell.module.css')
const globalCss = read('src/styles/global.css')
const tokensCss = read('src/styles/tokens.css')

// ---------- scrollTop y offsetTop simulados (jsdom no maqueta) ----------
const scrollTops = new WeakMap<Element, number>()
let restore: Array<() => void> = []
const ANCHOR_TOP = 300
beforeAll(() => {
  const st = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop')
  const ot = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop')
  Object.defineProperty(Element.prototype, 'scrollTop', {
    configurable: true,
    get() {
      return scrollTops.get(this) ?? 0
    },
    set(v: number) {
      scrollTops.set(this, v)
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true,
    get() {
      return (this as HTMLElement).classList.contains('tabsAnchor') ? ANCHOR_TOP : 0
    },
  })
  restore = [
    () => st && Object.defineProperty(Element.prototype, 'scrollTop', st),
    () => ot && Object.defineProperty(HTMLElement.prototype, 'offsetTop', ot),
  ]
})
afterAll(() => restore.forEach((f) => f()))

beforeEach(() => {
  localStorage.clear()
  mockMedia()
  void i18n.changeLanguage('es')
})

const modeBtn = () => screen.queryByRole('button', { name: /Modo de fondo del lector/ })
const openTopic = async (p = '/es/rest/cors') => {
  const r = renderApp(p)
  await screen.findByRole('heading', { level: 1, name: /\S/ })
  return r
}
const scroller = () => screen.getByTestId('reader-scroll')

describe('2.1 dos modos del lector', () => {
  it('Cambiar de modo: Cristal → Sólido en escritorio', async () => {
    await openTopic()
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'glass')
    fireEvent.click(screen.getByRole('button', { name: 'Modo de fondo del lector: ◻ Cristal' }))
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'solid')
    expect(modeBtn()).toHaveTextContent('◼ Sólido')
  })
  it('Volver a Cristal y Solo dos modos', async () => {
    await openTopic()
    const seen = new Set<string>()
    for (let i = 0; i < 4; i++) {
      seen.add(modeBtn()!.textContent!)
      fireEvent.click(modeBtn()!)
    }
    expect([...seen].sort()).toEqual(['◻ Cristal', '◼ Sólido'])
    expect(modeBtn()).toHaveTextContent('◻ Cristal')
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'glass')
  })
  it('estilos: fondos, desenfoques y velo de la decisión 1; sin sombra de texto en el lector', () => {
    expect(tokensCss).toContain('--glass-reader: rgba(9, 10, 20, 0.85);')
    expect(tokensCss).toContain('--glass-blur-reader: blur(14px);')
    expect(tokensCss).not.toContain('--glass-reader-none')
    expect(tokensCss).toContain('--glass-strong: rgba(9, 10, 20, 0.9);')
    const solid = rule(readerCss, ":root[data-reader-mode='solid'] .reader")!
    expect(solid).toContain('background: rgb(9, 10, 20) !important;')
    expect(solid).toMatch(/(^|\s)backdrop-filter: none !important;/)
    expect(solid).toContain('-webkit-backdrop-filter: none !important;')
    const reader = rule(readerCss, '.reader')!
    expect(reader).toContain('background: var(--glass-reader) !important;')
    expect(reader).toContain('backdrop-filter: var(--glass-blur-reader) !important;')
    expect(readerCss).not.toContain('var(--glass-strong)')
    expect(readerCss).not.toMatch(/\.rhead[^{]*\{[^}]*text-shadow/)
    expect(readerCss).not.toMatch(/\.rbody[^{]*\{[^}]*text-shadow/)
    expect(rule(globalCss, ':root[data-reading] .scrim')).toContain('opacity: 0.55;')
    expect(globalCss).not.toMatch(/data-reader-mode[^{]*\.scrim/)
  })
})

describe('2.2 sin el modo "Sin fondo"', () => {
  it('ninguna referencia a `pure` en src/ ni claves reader.mode.pure', () => {
    const offenders: string[] = []
    const walk = (d: string) => {
      for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
        const p = `${d}/${e.name}`
        if (e.isDirectory()) {
          if (p !== 'src/generated') walk(p)
        } else if (p !== 'src/test/rendimiento-movil.test.tsx' && /\bpure\b/.test(read(p))) offenders.push(p)
      }
    }
    walk('src')
    expect(offenders).toEqual([])
    for (const l of ['es', 'en']) expect(JSON.parse(read(`src/locales/${l}.json`)).reader.mode).not.toHaveProperty('pure')
  })
})

describe('2.3 preferencias guardadas con el formato anterior', () => {
  for (const old of ['pure', 'solid', 'glass']) {
    it(`modo antiguo "${old}" sin v: 2 → Cristal; idioma y animaciones se conservan`, () => {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ locale: 'en', readerMode: old, sidebarCollapsed: true, motion: 'off' }))
      expect(loadPrefs()).toEqual({ locale: 'en', readerMode: 'glass', sidebarCollapsed: true, motion: 'off' })
    })
  }
  it('con v: 2, "solid" se conserva; un valor desconocido da Cristal', () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 2, readerMode: 'solid', sidebarCollapsed: false }))
    expect(loadPrefs().readerMode).toBe('solid')
    localStorage.setItem(PREFS_KEY, JSON.stringify({ v: 2, readerMode: 'pure', sidebarCollapsed: false }))
    expect(loadPrefs().readerMode).toBe('glass')
  })
  it('al guardar siempre se escribe v: 2, que no forma parte de Prefs', () => {
    savePrefs({ ...DEFAULT_PREFS, readerMode: 'solid' })
    expect(JSON.parse(localStorage.getItem(PREFS_KEY)!)).toMatchObject({ v: 2, readerMode: 'solid' })
    expect(loadPrefs()).not.toHaveProperty('v')
  })
  it('la aplicación abre en Cristal con una preferencia del formato anterior', async () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ locale: 'en', readerMode: 'solid', sidebarCollapsed: false, motion: 'off' }))
    renderApp('/en/rest/cors')
    await screen.findByRole('heading', { level: 1, name: /\S/ })
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'glass')
    expect(document.documentElement).toHaveAttribute('data-motion', 'off')
  })
})

describe('2.4 teléfono siempre en Sólido', () => {
  it('Teléfono: lector opaco y sin control de modo; lo guardado no cambia', async () => {
    mockMedia({ phone: true })
    savePrefs({ ...DEFAULT_PREFS, readerMode: 'glass' })
    await openTopic()
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'solid')
    expect(modeBtn()).toBeNull()
    expect(loadPrefs().readerMode).toBe('glass')
  })
  it('Volver a un ancho mayor: reaparece el control y el modo guardado', async () => {
    savePrefs({ ...DEFAULT_PREFS, readerMode: 'glass' })
    await openTopic()
    expect(modeBtn()).toHaveTextContent('◻ Cristal')
    act(() => setMedia({ phone: true }))
    expect(modeBtn()).toBeNull()
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'solid')
    act(() => setMedia({}))
    expect(modeBtn()).toHaveTextContent('◻ Cristal')
    expect(document.documentElement).toHaveAttribute('data-reader-mode', 'glass')
    expect(loadPrefs().readerMode).toBe('glass')
  })
})

describe('3.1 el escenario no se desplaza; lo hace el lector por dentro', () => {
  it('.stage no declara desplazamiento en ningún ancho; la zona desplazable acepta toques y contiene el gesto', () => {
    let from = 0
    for (;;) {
      const r = rule(shellCss, '.stage', from)
      if (!r) break
      expect(r).not.toMatch(/overflow(-y)?:\s*(auto|scroll)/)
      expect(r).not.toContain('overscroll-behavior')
      from = shellCss.indexOf('.stage {', from) + 1
    }
    const scroll = rule(readerCss, '.scroll')!
    expect(scroll).toMatch(/overflow: hidden auto;/)
    expect(scroll).toContain('overscroll-behavior: contain;')
    expect(readerCss).not.toMatch(/\.scroll[^{]*\{[^}]*pointer-events:\s*none/)
    expect(readerCss).not.toMatch(/\.scroll[^{]*\{[^}]*overflow:\s*visible/)
    expect(readerCss).not.toMatch(/\.reader[^{]*\{[^}]*overflow:\s*visible/)
  })
})

/** Orden en el documento de una lista de elementos. */
const inOrder = (els: Element[]) => els.every((e, i) => i === 0 || els[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING)

describe('3.2 tableta: cabecera y botones fijos, contenido y relacionados desplazables', () => {
  it('orden y contenedores', async () => {
    mockMedia({ tablet: true })
    await openTopic()
    const sc = scroller()
    const reader = screen.getByRole('article')
    expect(reader).toHaveAttribute('data-layout', 'tablet')
    const heading = screen.getByRole('heading', { level: 1 })
    const tabs = screen.getByRole('tablist')
    const panel = screen.getByRole('tabpanel')
    const related = screen.getByRole('complementary', { name: 'Relacionados' })
    const next = screen.getByRole('button', { name: 'Siguiente tema →' })
    expect(sc).not.toContainElement(heading)
    expect(sc).not.toContainElement(tabs)
    expect(sc).toContainElement(panel)
    expect(sc).toContainElement(related)
    expect(sc).not.toContainElement(next)
    expect(inOrder([heading, tabs, sc, next])).toBe(true)
    expect(inOrder([panel, related])).toBe(true)
    expect(screen.getByRole('button', { name: /Modo de fondo/ })).toBeInTheDocument()
    // Relacionados dentro del lector: sin cristal. Solo hay uno (no el panel lateral).
    expect(screen.getAllByRole('complementary', { name: 'Relacionados' })).toHaveLength(1)
    expect(related).not.toHaveClass('glass')
    expect(read('src/shell/Related.module.css')).toMatch(/\.rel\.inline \{[^}]*border-top: 1px solid var\(--edge-soft\);/)
  })
  it('escritorio: relacionados en panel lateral de cristal, fuera del lector', async () => {
    await openTopic()
    const related = screen.getByRole('complementary', { name: 'Relacionados' })
    expect(related).toHaveClass('glass')
    expect(screen.getByRole('article')).not.toContainElement(related)
    expect(scroller()).toContainElement(screen.getByRole('tabpanel'))
    expect(scroller()).not.toContainElement(screen.getByRole('tablist'))
  })
})

describe('3.3 teléfono: un único desplazamiento', () => {
  it('orden dentro de la zona desplazable; cerrar fuera de ella', async () => {
    mockMedia({ phone: true })
    await openTopic()
    const sc = scroller()
    expect(screen.getByRole('article')).toHaveAttribute('data-layout', 'phone')
    const track = within(sc).getByText('HTTP y REST')
    const freq = within(sc).getByText('casi siempre')
    const heading = screen.getByRole('heading', { level: 1 })
    const lead = heading.nextElementSibling!
    const tabs = screen.getByRole('tablist')
    const panel = screen.getByRole('tabpanel')
    const prev = screen.getByRole('button', { name: '← Anterior' })
    const next = screen.getByRole('button', { name: 'Siguiente tema →' })
    const related = screen.getByRole('complementary', { name: 'Relacionados' })
    for (const el of [track, freq, heading, lead, tabs, panel, prev, next, related]) expect(sc).toContainElement(el as HTMLElement)
    expect(inOrder([track, freq, heading, lead, tabs, panel, prev, next, related])).toBe(true)
    const close = screen.getByRole('button', { name: 'Cerrar' })
    expect(sc).not.toContainElement(close)
    expect(related).not.toHaveClass('glass')
  })
  it('estilos: pestañas adhesivas con fondo opaco; cerrar anclado; sitio reservado de 48 px', () => {
    const tabs = rule(readerCss, '.phone .tabs')!
    expect(tabs).toContain('position: sticky;')
    expect(tabs).toContain('top: 0;')
    expect(tabs).toContain('background: rgb(9, 10, 20);')
    expect(tabs).toMatch(/margin: 0 48px/)
    expect(rule(readerCss, '.phone .close')).toContain('position: absolute;')
    expect(rule(readerCss, '.phone .crumbs')).toContain('padding-right: 48px;')
  })
})

describe('3.4 posición de desplazamiento', () => {
  it('Abrir otro tema: el nuevo se muestra desde el inicio', async () => {
    for (const media of [{}, { tablet: true }, { phone: true }]) {
      mockMedia(media)
      const { unmount } = await openTopic('/es/rest/metodos-http')
      scroller().scrollTop = 900
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente tema →' }))
      await screen.findByRole('heading', { level: 1, name: 'Métodos seguros e idempotentes' })
      expect(scroller().scrollTop).toBe(0)
      unmount()
    }
  })
  it('escritorio y tableta: cambiar de pestaña vuelve al inicio', async () => {
    for (const media of [{}, { tablet: true }]) {
      mockMedia(media)
      const { unmount } = await openTopic()
      scroller().scrollTop = 400
      fireEvent.click(screen.getByRole('tab', { name: 'En código' }))
      expect(scroller().scrollTop).toBe(0)
      unmount()
    }
  })
  it('teléfono — Cambiar de pestaña a mitad de lectura: el contenido nuevo empieza justo debajo de las pestañas', async () => {
    mockMedia({ phone: true })
    await openTopic()
    scroller().scrollTop = ANCHOR_TOP + 500
    fireEvent.click(screen.getByRole('tab', { name: 'En código' }))
    expect(screen.getByRole('tab', { name: 'En código' })).toHaveAttribute('aria-selected', 'true')
    expect(scroller().scrollTop).toBe(ANCHOR_TOP)
  })
  it('teléfono — Cambiar de pestaña sin haber desplazado: la posición no cambia', async () => {
    mockMedia({ phone: true })
    await openTopic()
    scroller().scrollTop = 120
    fireEvent.click(screen.getByRole('tab', { name: 'En código' }))
    expect(scroller().scrollTop).toBe(120)
  })
})

/** Selector de la regla que contiene la posición `i` de la hoja (sin comentarios). */
const selectorAt = (css: string, i: number) => {
  const open = css.lastIndexOf('{', i)
  const prevClose = Math.max(css.lastIndexOf('}', open), css.lastIndexOf('{', open - 1))
  return css.slice(prevClose + 1, open).trim()
}
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
/** Bloques `@media (max-width: 760px)` de una hoja. */
const phoneBlocks = (css: string) => {
  const out: string[] = []
  let i = css.indexOf('@media (max-width: 760px)')
  while (i >= 0) {
    out.push(mediaBlock(css, i))
    i = css.indexOf('@media (max-width: 760px)', i + 1)
  }
  return out.join('\n')
}

describe('4.1 teléfono sin desenfoques', () => {
  it('en el tramo de teléfono los paneles de cristal usan --glass-phone sin backdrop-filter y las auroras quedan estáticas', () => {
    expect(tokensCss).toContain('--glass-phone: rgba(9, 10, 20, 0.92);')
    const phone = phoneBlocks(globalCss)
    const glass = rule(phone, ':root .glass')!
    expect(glass).toContain('background: var(--glass-phone) !important;')
    expect(glass).toMatch(/(^|\s)backdrop-filter: none !important;/)
    expect(glass).toContain('-webkit-backdrop-filter: none !important;')
    const aurora = rule(phone, ':root .aurora')!
    expect(aurora).toContain('animation: none;')
    expect(aurora).toContain('filter: none;')
  })
  it('todo desenfoque declarado es de .glass o del lector (que en teléfono es Sólido, sin desenfoque)', () => {
    const owners = new Set<string>()
    for (const f of cssFiles()) {
      const css = stripComments(read(f))
      for (const m of css.matchAll(/(?<![-\w])backdrop-filter:\s*([^;]+);/g)) {
        if (m[1].trim().startsWith('none')) continue
        owners.add(`${f}:${selectorAt(css, m.index!)}`)
      }
    }
    expect([...owners].sort()).toEqual(['src/shell/Reader.module.css:.reader', 'src/styles/global.css:.glass'])
  })
  it('Teléfono sin desenfoques: la barra superior y la inferior son de cristal (y por tanto casi opacas en teléfono)', () => {
    mockMedia({ phone: true })
    renderApp('/es')
    expect(screen.getByRole('banner')).toHaveClass('glass')
    expect(screen.getByRole('navigation', { name: 'Pistas' })).toHaveClass('glass')
  })
})

describe('4.2 sin animaciones perpetuas fuera de las auroras', () => {
  it('ninguna animación infinite salvo en .aurora; el botón Siguiente conserva su degradado quieto', () => {
    for (const f of cssFiles()) {
      const css = stripComments(read(f))
      for (const m of css.matchAll(/infinite/g)) expect(`${f}: ${selectorAt(css, m.index!)}`).toMatch(/: \.aurora\.a\d$/)
    }
    expect(readerCss).not.toContain('shimmer')
    const go = rule(readerCss, '.go')!
    expect(go).toContain('background: linear-gradient(')
    expect(go).toContain('background-size: 100% 100%;')
    expect(go).not.toContain('animation')
  })
})

describe('4.3 altura visible y zonas seguras', () => {
  it('viewport-fit=cover, dvh con respaldo y tokens de zona segura', () => {
    expect(read('index.html')).toMatch(/<meta name="viewport" content="[^"]*viewport-fit=cover/)
    expect(globalCss).toMatch(/#root \{[^}]*height: 100%;\s*height: 100dvh;/)
    expect(read('src/shell/BottomBar.module.css')).toMatch(/max-height: 52vh;\s*max-height: 52dvh;/)
    for (const side of ['top', 'right', 'bottom', 'left']) expect(tokensCss).toContain(`--safe-${side}: env(safe-area-inset-${side}, 0px);`)
  })
  it('cada elemento fijo suma la zona segura de los bordes a los que se ancla', () => {
    const checks: Array<[string, string, string[]]> = [
      ['src/shell/TopBar.module.css', '.top', ['top', 'left', 'right']],
      ['src/shell/Sidebar.module.css', '.side', ['top', 'left', 'bottom']],
      ['src/shell/Shell.module.css', '.stage', ['top', 'bottom', 'left', 'right']],
      ['src/shell/BottomBar.module.css', '.wrap', ['left', 'right', 'bottom']],
      ['src/shell/Shell.module.css', '.gestureHint', ['left', 'right', 'bottom']],
      ['src/shell/Shell.module.css', '.toast', ['top']],
    ]
    for (const [file, sel, sides] of checks) {
      const r = rule(read(file), sel)!
      for (const side of sides) expect(r, `${sel} ${side}`).toMatch(new RegExp(`\\n\\s*${side}: calc\\([^;]*var\\(--safe-${side}\\)`))
    }
    // Tramo de teléfono del escenario: sigue sumando las zonas seguras.
    const stagePhone = rule(phoneBlocks(shellCss), '.stage')!
    expect(stagePhone).toContain('var(--safe-left)')
    expect(stagePhone).toContain('var(--safe-bottom)')
  })
})

describe('5.1 contrato: paused y compact los decide Shell', () => {
  it('paused solo en teléfono con un tema abierto; compact solo en teléfono', async () => {
    const cases: Array<[Parameters<typeof mockMedia>[0], string, boolean, boolean]> = [
      [{}, '/es', false, false],
      [{}, '/es/rest/cors', false, false],
      [{ tablet: true }, '/es/rest/cors', false, false],
      [{ phone: true }, '/es', false, true],
      [{ phone: true }, '/es/rest/cors', true, true],
    ]
    for (const [media, p, paused, compact] of cases) {
      mockMedia(media)
      const { unmount } = renderApp(p)
      expect(brain.props?.paused, `${JSON.stringify(media)} ${p}`).toBe(paused)
      expect(brain.props?.compact, `${JSON.stringify(media)} ${p}`).toBe(compact)
      unmount()
    }
  })
  it('al cerrar el tema en teléfono deja de estar en pausa', () => {
    mockMedia({ phone: true })
    renderApp('/es/rest/cors')
    expect(brain.props?.paused).toBe(true)
    fireEvent.click(screen.getByTestId('brain-background'))
    expect(screen.getByTestId('location').textContent).toBe('/es')
    expect(brain.props?.paused).toBe(false)
  })
})

