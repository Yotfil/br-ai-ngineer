/**
 * Pruebas de interfaz del cambio contenido-claro, con temas de prueba servidos por un `loadTopic` simulado:
 * grupo 1 (pasos en la pestaña En código) y grupo 2 (entradas de proyecto en el lector y en las listas).
 * El HTML de las secciones imita la salida de `npm run content`.
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { type AppData } from '../App.tsx'
import type { GraphData, GraphLink, GraphNode, Locale, SearchDoc, TopicContent } from '../content/model.ts'
import { BrainImplementation } from '../graph/Brain.tsx'
import i18n from '../i18n/index.ts'
import { PrefsProvider } from '../prefs/PrefsContext.tsx'
import { brain, FakeBrain, mockMedia } from './renderApp.tsx'

const pre = (code: string) => `<pre class="shiki cerebro" style="background-color:#00000000;color:#cfd3ea" tabindex="0"><code>${code}</code></pre>`

const node = (id: string, track: string, order: number): GraphNode => ({ id, type: 'topic', track, parent: track, freq: 'always', order, x: 0, y: 0, z: 0 })

const graph: GraphData = {
  tracks: [
    { id: 're', abbr: 'RE', color: '#22d3ee', order: 1, name: { es: 'HTTP y REST', en: 'HTTP & REST' }, empty: false },
    { id: 'py', abbr: 'PY', color: '#4ade80', order: 2, name: { es: 'Python y FastAPI', en: 'Python & FastAPI' }, empty: false },
  ],
  nodes: [
    { id: 're', type: 'track', track: 're', x: 0, y: 0, z: 0 },
    { id: 'py', type: 'track', track: 'py', x: 0, y: 0, z: 0 },
    node('t-cache', 're', 1),
    node('t-deco', 'py', 1),
  ],
  links: [
    { source: 're', target: 't-cache', kind: 'hierarchy' },
    { source: 'py', target: 't-deco', kind: 'hierarchy' },
  ],
}

const doc = (id: string, track: string, name: string): SearchDoc => ({ id, type: 'topic', track, name, aliases: [], summary: `Resumen de ${name}.`, topic: id })
const docs: AppData['docs'] = {
  es: [doc('t-cache', 're', 'Caché HTTP'), doc('t-deco', 'py', 'Decoradores')],
  en: [doc('t-cache', 're', 'HTTP caching'), doc('t-deco', 'py', 'Decorators')],
}

const STEPS = [
  'Paso 1. Una función se puede pasar a otra función',
  'Paso 2. Un decorador hecho a mano',
  'Paso 3. La sintaxis con @',
  'Paso 4. En el proyecto: registrar cada cálculo',
  'Avanzado. Conservar el nombre con functools.wraps',
]

const topicContent = (id: string): TopicContent => {
  const d = docs.es.find((x) => x.id === id)!
  const base: TopicContent = {
    id,
    track: d.track,
    order: 1,
    freq: 'always',
    title: d.name,
    summary: d.summary!,
    sections: { definition: '<p>Def.</p>', analogy: '<p>Ana.</p>', problem: '<p>Pro.</p>', interview: '<p>Int.</p>', myths: '<ul><li>M.</li></ul>' },
    exercises: [],
  }
  if (id === 't-deco') {
    base.sections['code:example'] = STEPS.map((title, i) =>
      i === 1
        ? `<h4>${title}</h4>\n<p>Primero, la función original.</p>\n${pre('def saludar(): ...')}\n<p>Y ahora, la que la envuelve.</p>\n${pre('def registrar(f): ...')}`
        : `<h4>${title}</h4>\n<p>Explicación del paso ${i + 1}.</p>\n${pre(`paso_${i + 1}()`)}`,
    ).join('\n')
    base.sections['code:server'] = `<h4>Paso 1. La ruta</h4>\n${pre('@app.get("/")')}`
  }
  if (id === 't-cache') {
    base.sections['code:wire'] = [
      `<h4>Momento 1. El navegador pide el recurso</h4>\n${pre('GET /productos/7 HTTP/1.1')}`,
      '<h4>Momento 2. El navegador guarda la respuesta</h4>\n<p>No viaja nada por la red.</p>',
      `<h4>Momento 3. La copia caduca y se revalida</h4>\n${pre('If-None-Match: "v1"')}`,
    ].join('\n')
  }
  return base
}

// ---------- Datos del grupo 2: pista Python y FastAPI con sus cinco entradas de proyecto ----------

type Entry = { id: string; track: 're' | 'py'; order: number; group?: string; es: string; en: string; short?: [string, string]; covers?: string[] }
const CREAR_PEDIDO_COVERS = [
  'rutas-y-parametros',
  'modelos-y-response-model',
  'inyeccion-con-depends',
  'errores-y-httpexception',
  'endpoints-async-vs-sync',
  'metodos-http',
  'codigos-de-estado',
  'errores-problem-details',
]
const ENTRIES: Entry[] = [
  { id: 'metodos-http', track: 're', order: 1, es: 'Métodos HTTP', en: 'HTTP methods' },
  { id: 'codigos-de-estado', track: 're', order: 2, es: 'Códigos de estado y sus confusiones clásicas', en: 'Status codes and their classic mix-ups' },
  { id: 'errores-problem-details', track: 're', order: 3, es: 'Errores con Problem Details', en: 'Errors with Problem Details' },
  { id: 'tipado-y-type-hints', track: 'py', order: 1, group: 'lenguaje', es: 'Tipado y type hints', en: 'Typing and type hints' },
  { id: 'decoradores', track: 'py', order: 8, group: 'lenguaje', es: 'Decoradores', en: 'Decorators' },
  { id: 'proyecto-total-del-pedido', track: 'py', order: 9, group: 'lenguaje', es: 'Proyecto: calcular el total de un pedido', en: 'Project: calculating an order total', short: ['Proyecto: total del pedido', 'Project: order total'], covers: ['tipado-y-type-hints', 'decoradores'] },
  { id: 'excepciones', track: 'py', order: 10, group: 'lenguaje', es: 'Excepciones', en: 'Exceptions' },
  { id: 'proyecto-importar-catalogo', track: 'py', order: 11, group: 'lenguaje', es: 'Proyecto: importar el catálogo de productos', en: 'Project: importing the product catalog', short: ['Proyecto: importar catálogo', 'Project: catalog import'], covers: ['excepciones', 'tipado-y-type-hints'] },
  { id: 'rutas-y-parametros', track: 'py', order: 20, group: 'fastapi', es: 'Rutas y parámetros', en: 'Routes and parameters' },
  { id: 'modelos-y-response-model', track: 'py', order: 21, group: 'fastapi', es: 'Modelos y response_model', en: 'Models and response_model' },
  { id: 'inyeccion-con-depends', track: 'py', order: 22, group: 'fastapi', es: 'Inyección de dependencias con Depends', en: 'Dependency injection with Depends' },
  { id: 'errores-y-httpexception', track: 'py', order: 23, group: 'fastapi', es: 'Errores y HTTPException', en: 'Errors and HTTPException' },
  { id: 'endpoints-async-vs-sync', track: 'py', order: 24, group: 'fastapi', es: 'Endpoints async frente a sync', en: 'Async vs sync endpoints' },
  { id: 'proyecto-crear-pedido', track: 'py', order: 25, group: 'fastapi', es: 'Proyecto: el endpoint de crear un pedido', en: 'Project: the create-order endpoint', short: ['Proyecto: crear un pedido', 'Project: create an order'], covers: CREAR_PEDIDO_COVERS },
  { id: 'orm-y-sesiones', track: 'py', order: 26, group: 'fastapi', es: 'Base de datos: ORM, SQLModel y sesiones', en: 'Databases: ORM, SQLModel and sessions' },
  { id: 'proyecto-pedidos-con-login', track: 'py', order: 27, group: 'fastapi', es: 'Proyecto: pedidos con base de datos y login', en: 'Project: orders with a database and login', short: ['Proyecto: BD y login', 'Project: DB and login'], covers: ['orm-y-sesiones', 'codigos-de-estado'] },
  { id: 'proyecto-api-completa', track: 'py', order: 28, group: 'fastapi', es: 'Proyecto: la API completa, de las carpetas al contenedor', en: 'Project: the full API, from folders to container', short: ['Proyecto: la API completa', 'Project: the full API'], covers: ['rutas-y-parametros', 'metodos-http'] },
]
const PROJECTS = ENTRIES.filter((e) => e.covers).map((e) => e.id)
const entry = (id: string) => ENTRIES.find((e) => e.id === id)!

const graph2: GraphData = {
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
    ...ENTRIES.map(
      (e): GraphNode => ({
        id: e.id,
        type: 'topic',
        track: e.track,
        parent: e.track,
        ...(e.covers ? { kind: 'project', covers: e.covers } : { freq: 'always' }),
        order: e.order,
        ...(e.group ? { group: e.group } : {}),
        x: 0,
        y: 0,
        z: 0,
      }),
    ),
  ],
  links: [
    ...ENTRIES.map((e): GraphLink => ({ source: e.track, target: e.id, kind: 'hierarchy' })),
    ...ENTRIES.flatMap((e) => (e.covers ?? []).map((c): GraphLink => ({ source: e.id, target: c, kind: 'related' }))),
  ],
}
const docs2: AppData['docs'] = {
  es: ENTRIES.map((e) => ({ ...doc(e.id, e.track, e.es), ...(e.short ? { short: e.short[0] } : {}) })),
  en: ENTRIES.map((e) => ({ ...doc(e.id, e.track, e.en), ...(e.short ? { short: e.short[1] } : {}) })),
}

const PARTS = {
  es: ['Parte 1. La ruta y su cuerpo', 'Parte 2. Las dependencias', 'Parte 3. Los errores'],
  en: ['Part 1. The route and its body', 'Part 2. The dependencies', 'Part 3. The errors'],
}
const link = (locale: Locale, id: string) => `<a href="/${locale}/${entry(id).track}/${id}" data-node="${id}">${entry(id)[locale]}</a>`

/** Contenido de una entrada del grupo 2 (o `null` si el id es de los temas del grupo 1). */
function entryContent(locale: Locale, id: string): TopicContent | null {
  const e = ENTRIES.find((x) => x.id === id)
  if (!e) return null
  const base = { id, track: e.track, order: e.order, title: e[locale], summary: `Resumen de ${e[locale]}.`, exercises: [] }
  if (!e.covers) {
    return { ...base, freq: 'always', sections: { definition: '<p>Def.</p>', analogy: '<p>Ana.</p>', problem: '<p>Pro.</p>', interview: '<p>Int.</p>', myths: '<ul><li>M.</li></ul>' } }
  }
  const [p1, p2, p3] = PARTS[locale]
  const note = locale === 'es' ? 'Se estudia en' : 'Covered in'
  const covers = e.covers
  const walkthrough = [
    `<h4>${p1}</h4>\n${pre('# app/pedidos/router.py')}\n<p>${note} ${covers.slice(0, 2).map((c) => link(locale, c)).join(', ')}.</p>`,
    `<h4>${p2}</h4>\n${pre('# app/deps.py')}\n<p>${note} ${covers.slice(2, 3).map((c) => link(locale, c)).join(', ')}.</p>`,
    `<h4>${p3}</h4>\n${pre('# app/pedidos/schemas.py')}\n<p>${note} ${covers.slice(3).map((c) => link(locale, c)).join(', ')}.</p>`,
  ].join('\n')
  return {
    ...base,
    kind: 'project',
    covers,
    ...(e.short ? { short: e.short[locale === 'es' ? 0 : 1] } : {}),
    sections: { context: `<p>${locale === 'es' ? 'Vamos a construir el endpoint que crea un pedido.' : "We're building the endpoint that creates an order."}</p>`, walkthrough },
  }
}

vi.mock('../data/content.ts', async (importActual) => {
  const actual = await importActual<typeof import('../data/content.ts')>()
  return { ...actual, loadTopic: (l: Locale, id: string) => Promise.resolve(entryContent(l, id) ?? topicContent(id)) }
})

function LocationProbe() {
  const l = useLocation()
  return <span data-testid="location">{l.pathname + l.hash}</span>
}

function renderAt(path: string, data: AppData = { graph, docs }) {
  return render(
    <PrefsProvider>
      <MemoryRouter initialEntries={[path]}>
        <BrainImplementation.Provider value={FakeBrain}>
          <App data={data} />
          <LocationProbe />
        </BrainImplementation.Provider>
      </MemoryRouter>
    </PrefsProvider>,
  )
}
const renderProjects = (path: string) => renderAt(path, { graph: graph2, docs: docs2 })

async function openCode(path: string, title: string) {
  renderAt(path)
  await screen.findByRole('heading', { level: 1, name: title })
  fireEvent.click(screen.getByRole('tab', { name: 'En código' }))
  return screen.getByRole('tabpanel')
}

beforeEach(() => {
  localStorage.clear()
  mockMedia()
  void i18n.changeLanguage('es')
})

describe('1.3 pasos visibles en la pestaña En código', () => {
  it('Tema con pasos: bajo el rótulo "Paso a paso", cada título de paso encima de su explicación y su código', async () => {
    const panel = await openCode('/es/py/t-deco', 'Decoradores')
    const example = panel.querySelector('[data-section="code:example"]') as HTMLElement
    expect(example.previousElementSibling).toEqual(within(panel).getAllByRole('heading', { level: 3 })[0])
    expect(example.previousElementSibling).toHaveTextContent(/^Paso a paso$/)

    const steps = within(example).getAllByRole('heading', { level: 4 })
    expect(steps.map((h) => h.textContent)).toEqual(STEPS)
    expect(steps[4].textContent).toMatch(/^Avanzado/)
    for (const h of steps) {
      expect(h.nextElementSibling!.tagName).toBe('P')
      expect(h.nextElementSibling!.nextElementSibling!.tagName).toBe('PRE')
    }
  })

  it('Texto entre bloques: la frase va entre ambos bloques, como texto normal', async () => {
    const panel = await openCode('/es/py/t-deco', 'Decoradores')
    const phrase = within(panel).getByText('Y ahora, la que la envuelve.')
    expect(phrase.tagName).toBe('P')
    expect(phrase.closest('pre')).toBeNull()
    expect(phrase.previousElementSibling!.tagName).toBe('PRE')
    expect(phrase.nextElementSibling!.tagName).toBe('PRE')
  })

  it('los títulos de paso tienen el mismo estilo en el ejemplo principal, la red y el servidor', async () => {
    const deco = await openCode('/es/py/t-deco', 'Decoradores')
    const example = deco.querySelector('[data-section="code:example"]')!
    const server = deco.querySelector('[data-section="code:server"]')!
    expect(server.className).toBe(example.className)
    expect(within(server as HTMLElement).getByRole('heading', { level: 4 })).toHaveTextContent('Paso 1. La ruta')
    const exampleClass = example.className

    cleanup()
    const cache = await openCode('/es/re/t-cache', 'Caché HTTP')
    const wire = cache.querySelector('[data-section="code:wire"]') as HTMLElement
    expect(wire.className).toBe(exampleClass)
    const moments = within(wire).getAllByRole('heading', { level: 4 })
    expect(moments.map((h) => h.textContent)).toEqual([
      'Momento 1. El navegador pide el recurso',
      'Momento 2. El navegador guarda la respuesta',
      'Momento 3. La copia caduca y se revalida',
    ])
    // El segundo momento solo lleva texto.
    expect(moments[1].nextElementSibling!.tagName).toBe('P')
    expect(moments[1].nextElementSibling!.nextElementSibling).toBe(moments[2])
  })
})

// ---------- Grupo 2 ----------

const CREAR = 'Proyecto: el endpoint de crear un pedido'
const reader = () => screen.getByRole('article')
/** Rótulos `h3` del cuerpo del lector, en orden. */
const labelsIn = (el: HTMLElement) => within(el).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
const coversList = () => reader().querySelector('[data-section="covers"]') as HTMLElement

describe('2.3 lectura de una entrada de proyecto', () => {
  it('Abrir una entrada de proyecto: sin pestañas ni frecuencia; contexto, partes tituladas y los ocho temas que reúne', async () => {
    renderProjects('/es/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: CREAR })
    const r = reader()
    expect(within(r).queryByRole('tablist')).toBeNull()
    expect(within(r).queryAllByRole('tab')).toEqual([])
    expect(within(r).queryByText('casi siempre')).toBeNull()
    expect(within(r).getByText('Python y FastAPI')).toBeInTheDocument()
    expect(within(r).getByText(`Resumen de ${CREAR}.`)).toBeInTheDocument()

    expect(labelsIn(r)).toEqual(['Qué vamos a construir', 'El código, parte por parte', 'Temas que reúne este proyecto'])
    const context = r.querySelector('[data-section="context"]') as HTMLElement
    const walk = r.querySelector('[data-section="walkthrough"]') as HTMLElement
    expect(context.previousElementSibling).toHaveTextContent('Qué vamos a construir')
    expect(walk.previousElementSibling).toHaveTextContent('El código, parte por parte')
    expect(within(walk).getAllByRole('heading', { level: 4 }).map((h) => h.textContent)).toEqual(PARTS.es)
    // Las partes llevan el mismo aspecto que los pasos de un tema.
    expect(walk.className).toMatch(/steps/)

    const list = coversList()
    expect(list.previousElementSibling).toHaveTextContent('Temas que reúne este proyecto')
    expect(within(list).getAllByRole('link').map((a) => a.textContent)).toEqual(CREAR_PEDIDO_COVERS.map((c) => entry(c).es))
    expect(within(list).getByRole('link', { name: 'Códigos de estado y sus confusiones clásicas' })).toHaveAttribute('href', '/es/re/codigos-de-estado')
    // Orden de la columna: contexto, recorrido y lista.
    expect(context.compareDocumentPosition(walk) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(walk.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('Ir de una parte a su tema: el enlace de la nota abre "Inyección de dependencias con Depends"', async () => {
    renderProjects('/es/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: CREAR })
    const walk = reader().querySelector('[data-section="walkthrough"]') as HTMLElement
    fireEvent.click(within(walk).getByRole('link', { name: 'Inyección de dependencias con Depends' }))
    await screen.findByRole('heading', { level: 1, name: 'Inyección de dependencias con Depends' })
    expect(screen.getByTestId('location')).toHaveTextContent('/es/py/inyeccion-con-depends')
    expect(within(reader()).getAllByRole('tab').length).toBeGreaterThan(0)
    expect(within(reader()).getByText('casi siempre')).toBeInTheDocument()
  })

  it('Tema de otra pista: la lista abre "Códigos de estado y sus confusiones clásicas" con el acento de HTTP y REST', async () => {
    renderProjects('/es/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: CREAR })
    expect(reader().style.getPropertyValue('--track')).toBe('#4ade80')
    fireEvent.click(within(coversList()).getByRole('link', { name: 'Códigos de estado y sus confusiones clásicas' }))
    await screen.findByRole('heading', { level: 1, name: 'Códigos de estado y sus confusiones clásicas' })
    expect(screen.getByTestId('location')).toHaveTextContent('/es/re/codigos-de-estado')
    expect(reader().style.getPropertyValue('--track')).toBe('#22d3ee')
    expect(within(reader()).getByText('HTTP y REST')).toBeInTheDocument()
  })

  it('Siguiente desde una entrada de proyecto: abre "Base de datos: ORM, SQLModel y sesiones"; anterior, el tema previo', async () => {
    renderProjects('/es/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: CREAR })
    expect(screen.getByRole('button', { name: '← Anterior' })).toHaveAttribute('title', 'Endpoints async frente a sync')
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente tema →' }))
    await screen.findByRole('heading', { level: 1, name: 'Base de datos: ORM, SQLModel y sesiones' })
    fireEvent.click(screen.getByRole('button', { name: '← Anterior' }))
    await screen.findByRole('heading', { level: 1, name: CREAR })
  })

  it('Dirección compartible: la dirección de la entrada carga la aplicación con ella abierta', async () => {
    renderProjects('/es/py/proyecto-total-del-pedido')
    await screen.findByRole('heading', { level: 1, name: 'Proyecto: calcular el total de un pedido' })
    expect(document.documentElement).toHaveAttribute('data-reading')
    const nav = document.querySelector('nav[aria-label="Pistas"]:not([class*="bar"])') as HTMLElement
    expect(within(nav).getByRole('button', { name: 'Proyecto: total del pedido' })).toHaveAttribute('aria-current', 'page')
  })

  it('cerrar funciona como en un tema', async () => {
    renderProjects('/es/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: CREAR })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/es$/)
  })

  it('Idioma inglés: rótulos "What we\'re building", "The code, part by part" y "Topics this project brings together"', async () => {
    renderProjects('/en/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: 'Project: the create-order endpoint' })
    expect(labelsIn(reader())).toEqual(["What we're building", 'The code, part by part', 'Topics this project brings together'])
    const walk = reader().querySelector('[data-section="walkthrough"]') as HTMLElement
    expect(within(walk).getAllByRole('heading', { level: 4 }).map((h) => h.textContent)).toEqual(PARTS.en)
    expect(within(coversList()).getAllByRole('link').map((a) => a.textContent)).toEqual(CREAR_PEDIDO_COVERS.map((c) => entry(c).en))
  })

  it('teléfono: una sola columna sin pestañas, con los relacionados al final', async () => {
    mockMedia({ phone: true })
    renderProjects('/es/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: CREAR })
    const sc = screen.getByTestId('reader-scroll')
    expect(within(sc).queryByRole('tablist')).toBeNull()
    expect(labelsIn(sc)).toEqual(['Qué vamos a construir', 'El código, parte por parte', 'Temas que reúne este proyecto'])
    const related = within(sc).getByRole('complementary', { name: 'Relacionados' })
    expect(coversList().compareDocumentPosition(related) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('un tema existente se sigue leyendo con sus pestañas y su frecuencia', async () => {
    renderProjects('/es/py/decoradores')
    await screen.findByRole('heading', { level: 1, name: 'Decoradores' })
    expect(within(reader()).getAllByRole('tab').map((t) => t.textContent)).toEqual(['Entender', 'En código', 'En la entrevista'])
    expect(within(reader()).getByText('casi siempre')).toBeInTheDocument()
  })
})

const sideNav = () => document.querySelector('nav[aria-label="Pistas"]:not([class*="bar"])') as HTMLElement
/** Textos de la lista de una pista, en orden: `# subtítulo` y nombre de cada fila. */
const rowsOf = (el: HTMLElement) => [...el.querySelectorAll('[data-group], button')].map((x) => (x.hasAttribute('data-group') ? `# ${x.textContent}` : x.textContent))
const PY_ROWS = [
  '# Python',
  'Tipado y type hints',
  'Decoradores',
  'Proyecto: total del pedido',
  'Excepciones',
  'Proyecto: importar catálogo',
  '# FastAPI',
  'Rutas y parámetros',
  'Modelos y response_model',
  'Inyección de dependencias con Depends',
  'Errores y HTTPException',
  'Endpoints async frente a sync',
  'Proyecto: crear un pedido',
  'Base de datos: ORM, SQLModel y sesiones',
  'Proyecto: BD y login',
  'Proyecto: la API completa',
]

describe('2.4 entradas de proyecto en las listas de temas', () => {
  it('Sidebar: bajo el subtítulo "Python", "Proyecto: total del pedido" va justo después de "Decoradores"', () => {
    renderProjects('/es')
    const nav = sideNav()
    const trackBtn = within(nav).getByRole('button', { name: /Python y FastAPI/ })
    fireEvent.click(trackBtn)
    const subs = trackBtn.nextElementSibling as HTMLElement
    expect(rowsOf(subs)).toEqual(PY_ROWS)
    const row = within(subs).getByRole('button', { name: 'Proyecto: total del pedido' })
    expect(row.previousElementSibling).toHaveTextContent('Decoradores')
    // Título corto en la fila, completo como ayuda; sin marca de frecuencia.
    expect(row).toHaveAttribute('title', 'Proyecto: calcular el total de un pedido')
    expect(row.textContent).toBe('Proyecto: total del pedido')
    expect(trackBtn).toHaveTextContent(String(ENTRIES.filter((e) => e.track === 'py').length))
  })

  it('Hoja de temas del teléfono: las cinco entradas de proyecto aparecen en sus posiciones, entre los temas', async () => {
    mockMedia({ phone: true })
    renderProjects('/es/py/decoradores')
    await screen.findByRole('heading', { level: 1, name: 'Decoradores' })
    const bar = screen.getAllByRole('navigation', { name: 'Pistas' }).find((n) => n.querySelector('[data-testid="carousel"]'))!
    fireEvent.click(within(bar).getByRole('button', { name: 'Python y FastAPI' }))
    const sheet = screen.getByRole('dialog', { name: 'Temas de Python y FastAPI' })
    expect(rowsOf(sheet)).toEqual(PY_ROWS)
    const shown = PROJECTS.map((id) => entry(id).short![0])
    expect(within(sheet).getAllByRole('button').filter((b) => shown.includes(b.textContent!))).toHaveLength(5)
  })

  it('Abrir desde la lista: en el sidebar y en la hoja del teléfono, la entrada se abre en el lector', async () => {
    renderProjects('/es')
    const nav = sideNav()
    fireEvent.click(within(nav).getByRole('button', { name: /Python y FastAPI/ }))
    fireEvent.click(within(nav).getByRole('button', { name: 'Proyecto: crear un pedido' }))
    await screen.findByRole('heading', { level: 1, name: CREAR })
    expect(screen.getByTestId('location')).toHaveTextContent('/es/py/proyecto-crear-pedido')

    cleanup()
    mockMedia({ phone: true })
    renderProjects('/es/py/decoradores')
    await screen.findByRole('heading', { level: 1, name: 'Decoradores' })
    const bar = screen.getAllByRole('navigation', { name: 'Pistas' }).find((n) => n.querySelector('[data-testid="carousel"]'))!
    fireEvent.click(within(bar).getByRole('button', { name: 'Python y FastAPI' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Proyecto: BD y login' }))
    await screen.findByRole('heading', { level: 1, name: 'Proyecto: pedidos con base de datos y login' })
  })

  it('panel de relacionados: los temas que reúne, en su orden, con su pista; ningún concepto', async () => {
    renderProjects('/es/py/proyecto-crear-pedido')
    await screen.findByRole('heading', { level: 1, name: CREAR })
    const panel = screen.getByRole('complementary', { name: 'Relacionados' })
    expect(within(panel).queryByText('Conceptos del tema')).toBeNull()
    const rows = within(panel).getAllByRole('button')
    expect(rows.map((b) => b.getAttribute('data-node'))).toEqual(CREAR_PEDIDO_COVERS)
    expect(rows.map((b) => b.querySelector('small')!.textContent)).toEqual(CREAR_PEDIDO_COVERS.map((c) => (entry(c).track === 're' ? 'RE' : 'PY')))
    fireEvent.click(within(panel).getByRole('button', { name: /Métodos HTTP/ }))
    await screen.findByRole('heading', { level: 1, name: 'Métodos HTTP' })
  })

  it('cerebro: el nodo se llama por su título corto y abre la entrada en el lector', async () => {
    renderProjects('/es')
    expect(brain.props!.labels['proyecto-crear-pedido']).toBe('Proyecto: crear un pedido')
    fireEvent.click(screen.getByTestId('node-proyecto-crear-pedido'))
    await screen.findByRole('heading', { level: 1, name: CREAR })
  })
})
