/// <reference types="node" />
/**
 * Pruebas de interfaz del cambio pista-python (tareas 2.1 a 2.5), con una pista de prueba con grupos
 * (`py`) y otra sin ellos (`re`). El contenido de los temas de prueba se sirve con un `loadTopic` simulado.
 */
import fs from 'node:fs'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { type AppData } from '../App.tsx'
import type { GraphData, GraphNode, SearchDoc, TopicContent } from '../content/model.ts'
import { BrainImplementation } from '../graph/Brain.tsx'
import i18n from '../i18n/index.ts'
import { PrefsProvider } from '../prefs/PrefsContext.tsx'
import { brain, FakeBrain, mockMedia } from './renderApp.tsx'

const CONC = 'Concurrencia: async/await, event loop, hilos, procesos y GIL'
const PY_CODE = '<pre class="shiki cerebro"><code><span style="color:#7DD3FC">def</span> f(): ...</code></pre>'

const node = (id: string, track: string, order: number, group?: string): GraphNode => ({ id, type: 'topic', track, parent: track, freq: 'always', order, ...(group ? { group } : {}), x: 0, y: 0, z: 0 })

const graph: GraphData = {
  tracks: [
    { id: 're', abbr: 'RE', color: '#22d3ee', order: 1, name: { es: 'HTTP y REST', en: 'HTTP & REST' }, empty: false },
    {
      id: 'py',
      abbr: 'PY',
      color: '#4ade80',
      order: 2,
      name: { es: 'Python y FastAPI', en: 'Python & FastAPI' },
      groups: [
        { id: 'lenguaje', name: { es: 'Python', en: 'Python' } },
        { id: 'fastapi', name: { es: 'FastAPI', en: 'FastAPI' } },
      ],
      empty: false,
    },
  ],
  nodes: [
    { id: 're', type: 'track', track: 're', x: 0, y: 0, z: 0 },
    { id: 'py', type: 'track', track: 'py', x: 0, y: 0, z: 0 },
    node('t-metodos', 're', 1),
    node('t-codigos', 're', 2),
    node('t-conc', 'py', 1, 'lenguaje'),
    node('t-deco', 'py', 2, 'lenguaje'),
    node('t-rutas', 'py', 3, 'fastapi'),
    node('t-auth', 'py', 4, 'fastapi'),
  ],
  links: [
    { source: 're', target: 't-metodos', kind: 'hierarchy' },
    { source: 're', target: 't-codigos', kind: 'hierarchy' },
    { source: 'py', target: 't-conc', kind: 'hierarchy' },
    { source: 'py', target: 't-deco', kind: 'hierarchy' },
    { source: 'py', target: 't-rutas', kind: 'hierarchy' },
    { source: 'py', target: 't-auth', kind: 'hierarchy' },
    { source: 't-deco', target: 't-metodos', kind: 'related' },
  ],
}

const doc = (id: string, track: string, name: string, short?: string): SearchDoc => ({ id, type: 'topic', track, name, aliases: [], summary: `Resumen de ${name}.`, ...(short ? { short } : {}), topic: id })
const docs: AppData['docs'] = {
  es: [
    doc('t-metodos', 're', 'Métodos HTTP: GET, POST, PUT, PATCH y DELETE'),
    doc('t-codigos', 're', 'Códigos de estado'),
    doc('t-conc', 'py', CONC, 'async, hilos y GIL'),
    doc('t-deco', 'py', 'Decoradores', 'Decoradores'),
    doc('t-rutas', 'py', 'Rutas, parámetros de ruta, query params y cuerpo', 'Rutas y parámetros'),
    doc('t-auth', 'py', 'Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas', 'Auth: OAuth2 y hashing'),
  ],
  en: [
    doc('t-metodos', 're', 'HTTP methods'),
    doc('t-codigos', 're', 'Status codes'),
    doc('t-conc', 'py', 'Concurrency: async/await, event loop, threads, processes and GIL', 'async, threads and GIL'),
    doc('t-deco', 'py', 'Decorators', 'Decorators'),
    doc('t-rutas', 'py', 'Routes, path parameters, query params and body', 'Routes and parameters'),
    doc('t-auth', 'py', 'Authentication in FastAPI: OAuth2, JWT and password hashing', 'Auth: OAuth2 and hashing'),
  ],
}

const topicContent = (id: string): TopicContent => {
  const d = docs.es.find((x) => x.id === id)!
  const base: TopicContent = {
    id,
    track: d.track,
    order: 1,
    freq: 'always',
    title: d.name,
    ...(d.short ? { short: d.short } : {}),
    summary: d.summary!,
    sections: { definition: '<p>Def.</p>', analogy: '<p>Ana.</p>', problem: '<p>Pro.</p>', interview: '<p>Int.</p>', myths: '<ul><li>M.</li></ul>' },
    exercises: [],
  }
  if (id === 't-deco') {
    base.sections = {
      ...base.sections,
      'code:example': '<pre class="shiki cerebro"><code>app/</code></pre><pre class="shiki cerebro"><code>@app.get("/")</code></pre>',
      bad: `${PY_CODE}<p>Nota del riesgoso.</p>`,
      good: `${PY_CODE}<p>Nota del correcto.</p>`,
      'bridge:typescript': '<p>Puente.</p>',
    }
    base.exercises = [
      { type: 'choice', prompt: '¿Qué imprime este código?', items: [{ q: '¿Qué imprime?', code: PY_CODE, options: ['1', '2'], answer: 1, why: 'Porque sí.' }] },
      {
        type: 'classify',
        prompt: '¿Qué estructura usarías?',
        categories: ['list', 'tuple', 'dict', 'set'],
        items: [
          { text: 'Emails únicos que ya recibieron la promo', answer: 3, why: 'set: unicidad y búsqueda O(1).' },
          { text: 'Coordenadas (lat, lon) fijas', answer: 1, why: 'tuple: inmutable.' },
        ],
      },
    ]
  }
  if (id === 't-metodos') base.sections = { ...base.sections, 'code:wire': '<pre class="shiki cerebro"><code>GET / HTTP/1.1</code></pre>' }
  return base
}

vi.mock('../data/content.ts', async (importActual) => {
  const actual = await importActual<typeof import('../data/content.ts')>()
  return { ...actual, loadTopic: (_l: string, id: string) => Promise.resolve(topicContent(id)) }
})

function renderAt(path: string) {
  return render(
    <PrefsProvider>
      <MemoryRouter initialEntries={[path]}>
        <BrainImplementation.Provider value={FakeBrain}>
          <App data={{ graph, docs }} />
        </BrainImplementation.Provider>
      </MemoryRouter>
    </PrefsProvider>,
  )
}

const sideNav = () => document.querySelector('nav[aria-label="Pistas"]:not([class*="bar"])') as HTMLElement
/** Textos visibles de la lista desplegada de una pista, en orden (subtítulos y temas). */
const rowsOf = (container: HTMLElement) => [...container.querySelectorAll('[data-group], button')].map((el) => (el.hasAttribute('data-group') ? `# ${el.textContent}` : el.textContent))

beforeEach(() => {
  localStorage.clear()
  mockMedia()
  void i18n.changeLanguage('es')
})

describe('2.1 subtítulos de grupo', () => {
  it('sidebar: la pista con grupos muestra cada subtítulo encima de sus temas', () => {
    renderAt('/es')
    const nav = sideNav()
    fireEvent.click(within(nav).getByRole('button', { name: /Python y FastAPI/ }))
    const subs = within(nav).getByRole('button', { name: /Python y FastAPI/ }).nextElementSibling as HTMLElement
    expect(rowsOf(subs)).toEqual(['# Python', 'async, hilos y GIL', 'Decoradores', '# FastAPI', 'Rutas y parámetros', 'Auth: OAuth2 y hashing'])
  })

  it('el subtítulo no es interactivo ni recibe foco', () => {
    renderAt('/es')
    const nav = sideNav()
    fireEvent.click(within(nav).getByRole('button', { name: /Python y FastAPI/ }))
    const before = window.location.href
    const fastapi = nav.querySelector('[data-group="fastapi"]') as HTMLElement
    expect(fastapi.tagName).toBe('P')
    expect(fastapi).not.toHaveAttribute('tabindex')
    expect(within(nav).queryByRole('button', { name: 'FastAPI' })).toBeNull()
    fireEvent.click(fastapi)
    expect(window.location.href).toBe(before)
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it('una pista sin grupos se muestra sin subtítulos', () => {
    renderAt('/es')
    const nav = sideNav()
    const subs = within(nav).getByRole('button', { name: /HTTP y REST/ }).nextElementSibling as HTMLElement
    expect(rowsOf(subs)).toEqual(['Métodos HTTP: GET, POST, PUT, PATCH y DELETE', 'Códigos de estado'])
  })

  it('con el sidebar contraído no se muestra ningún subtítulo', () => {
    renderAt('/es')
    const nav = sideNav()
    fireEvent.click(within(nav).getByRole('button', { name: /Python y FastAPI/ }))
    expect(nav.querySelectorAll('[data-group]')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Contraer menú' }))
    expect(nav).toHaveClass('collapsed')
    expect(nav.querySelectorAll('[data-group]')).toHaveLength(0)
  })

  it('teléfono: la hoja de temas muestra los mismos subtítulos encima de sus temas', async () => {
    mockMedia({ phone: true })
    renderAt('/es/py/t-rutas')
    await screen.findByRole('heading', { level: 1, name: /\S/ })
    const bar = screen.getAllByRole('navigation', { name: 'Pistas' }).find((n) => n.querySelector('[data-testid="carousel"]'))!
    fireEvent.click(within(bar).getByRole('button', { name: 'Python y FastAPI' }))
    const sheet = screen.getByRole('dialog', { name: 'Temas de Python y FastAPI' })
    expect(rowsOf(sheet)).toEqual(['# Python', 'async, hilos y GIL', 'Decoradores', '# FastAPI', 'Rutas y parámetros', 'Auth: OAuth2 y hashing'])
    expect(within(sheet).getAllByRole('button')).toHaveLength(4)
  })

  it('en inglés los subtítulos salen del nombre del grupo en inglés', () => {
    renderAt('/en')
    const nav = document.querySelector('nav[aria-label="Tracks"]:not([class*="bar"])') as HTMLElement
    fireEvent.click(within(nav).getByRole('button', { name: /Python & FastAPI/ }))
    expect([...nav.querySelectorAll('[data-group]')].map((e) => e.textContent)).toEqual(['Python', 'FastAPI'])
  })
})

describe('2.2 título corto en las listas', () => {
  it('la fila del sidebar usa el título corto y el título completo como ayuda', () => {
    renderAt('/es')
    const nav = sideNav()
    fireEvent.click(within(nav).getByRole('button', { name: /Python y FastAPI/ }))
    const row = within(nav).getByRole('button', { name: 'async, hilos y GIL' })
    expect(row).toHaveAttribute('title', CONC)
  })

  it('al abrir el tema, el lector muestra el título completo', async () => {
    renderAt('/es')
    const nav = sideNav()
    fireEvent.click(within(nav).getByRole('button', { name: /Python y FastAPI/ }))
    fireEvent.click(within(nav).getByRole('button', { name: 'async, hilos y GIL' }))
    expect(await screen.findByRole('heading', { level: 1, name: CONC })).toBeInTheDocument()
  })

  it('un tema sin título corto aparece con su título completo, como antes', () => {
    renderAt('/es')
    const row = within(sideNav()).getByRole('button', { name: 'Métodos HTTP: GET, POST, PUT, PATCH y DELETE' })
    expect(row).not.toHaveAttribute('title')
  })

  it('el buscador muestra el título completo', async () => {
    renderAt('/es')
    const box = screen.getByRole('combobox', { name: 'Buscar concepto' })
    fireEvent.focus(box)
    fireEvent.change(box, { target: { value: 'GIL' } })
    const option = await screen.findByRole('option')
    const list = option.parentElement!
    expect(within(option).getByText(CONC)).toBeInTheDocument()
    expect(within(list).queryByText('async, hilos y GIL')).toBeNull()
  })

  it('anterior, siguiente y relacionados usan el título completo', async () => {
    renderAt('/es/py/t-deco')
    await screen.findByRole('heading', { level: 1, name: 'Decoradores' })
    expect(screen.getByRole('button', { name: '← Anterior' })).toHaveAttribute('title', CONC)
    expect(screen.getByRole('button', { name: 'Siguiente tema →' })).toHaveAttribute('title', 'Rutas, parámetros de ruta, query params y cuerpo')
    expect(screen.getAllByText('Métodos HTTP: GET, POST, PUT, PATCH y DELETE').length).toBeGreaterThan(0)
  })
})

describe('2.3 título corto en el cerebro', () => {
  it('el nombre de un tema con título corto es el corto; sin título corto, el completo', () => {
    renderAt('/es')
    expect(brain.props!.labels['t-conc']).toBe('async, hilos y GIL')
    expect(brain.props!.labels['t-metodos']).toBe('Métodos HTTP: GET, POST, PUT, PATCH y DELETE')
    expect(brain.props!.labels.py).toBe('Python y FastAPI')
    expect(screen.getByTestId('node-t-conc')).toHaveTextContent('async, hilos y GIL')
  })

  it('en inglés usa el título corto en inglés', () => {
    renderAt('/en')
    expect(brain.props!.labels['t-conc']).toBe('async, threads and GIL')
  })
})

describe('2.4 ejemplo principal y notas en En código', () => {
  it('muestra primero el ejemplo principal, después riesgoso junto a correcto y después el puente', async () => {
    renderAt('/es/py/t-deco')
    await screen.findByRole('heading', { level: 1, name: 'Decoradores' })
    fireEvent.click(screen.getByRole('tab', { name: 'En código' }))
    const panel = screen.getByRole('tabpanel')
    const order = [...panel.querySelectorAll('[data-section]')].map((e) => e.getAttribute('data-section'))
    expect(order).toEqual(['code:example', 'bad', 'good', 'bridge:typescript'])
    expect(within(panel).getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Paso a paso')
    expect(panel.querySelector('[data-section="code:example"]')!.querySelectorAll('pre')).toHaveLength(2)
  })

  it('la nota aparece bajo el código, dentro del bloque Riesgoso o Correcto', async () => {
    renderAt('/es/py/t-deco')
    await screen.findByRole('heading', { level: 1, name: 'Decoradores' })
    fireEvent.click(screen.getByRole('tab', { name: 'En código' }))
    const bad = screen.getByText('Riesgoso').parentElement!
    const good = screen.getByText('Correcto').parentElement!
    const badBlock = bad.querySelector('[data-section="bad"]')!
    expect(badBlock.firstElementChild!.tagName).toBe('PRE')
    expect(badBlock.lastElementChild).toHaveTextContent('Nota del riesgoso.')
    expect(good.querySelector('[data-section="good"]')!.lastElementChild).toHaveTextContent('Nota del correcto.')
  })

  it('un tema sin ejemplo principal no muestra un bloque vacío', async () => {
    renderAt('/es/re/t-metodos')
    await screen.findByRole('heading', { level: 1, name: /\S/ })
    fireEvent.click(screen.getByRole('tab', { name: 'En código' }))
    const panel = screen.getByRole('tabpanel')
    expect(within(panel).queryByText('Paso a paso')).toBeNull()
    expect(panel.querySelector('[data-section="code:example"]')).toBeNull()
  })
})

describe('2.5 código en opción múltiple y clasificación', () => {
  const openPractice = async () => {
    renderAt('/es/py/t-deco')
    await screen.findByRole('heading', { level: 1, name: 'Decoradores' })
    fireEvent.click(screen.getByRole('tab', { name: 'Practicar' }))
    return screen.getByRole('tabpanel')
  }

  it('opción múltiple con código: enunciado, bloque resaltado y debajo las opciones', async () => {
    const panel = await openPractice()
    const q = within(panel).getByText('¿Qué imprime?').parentElement!
    const kids = [...q.children]
    const stem = kids.findIndex((k) => k.textContent === '¿Qué imprime?')
    const code = kids.findIndex((k) => k.getAttribute('data-testid') === 'choice-code')
    const opts = kids.findIndex((k) => k.querySelector('button'))
    expect(stem).toBeLessThan(code)
    expect(code).toBeLessThan(opts)
    expect(kids[code].querySelector('pre.shiki')).not.toBeNull()
  })

  it('clasificar mal un caso: se marca incorrecto y aparece la explicación', async () => {
    const panel = await openPractice()
    expect(within(panel).getByRole('heading', { name: '¿Qué estructura usarías?' })).toBeInTheDocument()
    const caso = within(panel).getByText('Emails únicos que ya recibieron la promo').parentElement!
    expect(within(caso).getAllByRole('button').map((b) => b.textContent)).toEqual(['list', 'tuple', 'dict', 'set'])
    fireEvent.click(within(caso).getByRole('button', { name: 'list' }))
    expect(within(caso).getByRole('button', { name: 'list' })).toHaveClass('no')
    expect(within(caso).getByRole('button', { name: 'set' })).toHaveClass('ok')
    expect(within(caso).getByRole('status')).toHaveTextContent('set: unicidad y búsqueda O(1).')
  })

  it('clasificar bien un caso: el botón se marca correcto y aparece la explicación', async () => {
    const panel = await openPractice()
    const caso = within(panel).getByText('Coordenadas (lat, lon) fijas').parentElement!
    fireEvent.click(within(caso).getByRole('button', { name: 'tuple' }))
    expect(within(caso).getByRole('button', { name: 'tuple' })).toHaveClass('ok')
    expect(within(caso).getByRole('status')).toHaveTextContent('✓ Correcto. tuple: inmutable.')
  })

  it('categorías en fila: botones compactos que pasan de línea; la opción múltiple sigue en columna', async () => {
    const css = fs.readFileSync(`${process.cwd()}/src/shell/Exercises.module.css`, 'utf8')
    expect(css).toMatch(/\.opts:has\(\.inline\)\s*\{[^}]*flex-direction:\s*row;[^}]*flex-wrap:\s*wrap;/)
    expect(css).toMatch(/\.inline\s*\{[^}]*width:\s*auto;/)
    const panel = await openPractice()
    const caso = within(panel).getByText('Emails únicos que ya recibieron la promo').parentElement!
    const cats = within(caso).getAllByRole('button')
    expect(cats.every((b) => b.classList.contains('inline'))).toBe(true)
    const choice = within(panel).getByText('¿Qué imprime?').parentElement!
    expect(within(choice).getAllByRole('button').some((b) => b.classList.contains('inline'))).toBe(false)
  })

  it('los casos son independientes', async () => {
    const panel = await openPractice()
    const a = within(panel).getByText('Emails únicos que ya recibieron la promo').parentElement!
    const b = within(panel).getByText('Coordenadas (lat, lon) fijas').parentElement!
    fireEvent.click(within(a).getByRole('button', { name: 'set' }))
    await waitFor(() => expect(within(a).getByRole('status')).toBeInTheDocument())
    expect(within(b).queryByRole('status')).toBeNull()
    expect(within(b).getAllByRole('button').some((x) => x.classList.contains('ok') || x.classList.contains('no'))).toBe(false)
  })
})
