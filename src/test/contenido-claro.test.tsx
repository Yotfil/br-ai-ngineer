/**
 * Pruebas de interfaz del cambio contenido-claro (grupo 1: pasos en la pestaña En código), con temas de prueba
 * servidos por un `loadTopic` simulado. El HTML de las secciones imita la salida de `npm run content`.
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App, { type AppData } from '../App.tsx'
import type { GraphData, GraphNode, SearchDoc, TopicContent } from '../content/model.ts'
import { BrainImplementation } from '../graph/Brain.tsx'
import i18n from '../i18n/index.ts'
import { PrefsProvider } from '../prefs/PrefsContext.tsx'
import { FakeBrain, mockMedia } from './renderApp.tsx'

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
