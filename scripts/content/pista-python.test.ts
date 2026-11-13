// @vitest-environment node
/** Pruebas del modelo de contenido ampliado en el cambio pista-python (tareas 1.1 a 1.5). */
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { describe, expect, it } from 'vitest'
import { buildContent } from './build.ts'
import { BASE_SECTIONS, GROUPED_TRACKS_YAML, makeContent, md, topic } from './fixtures.ts'
import { codeLanguage, renderMarkdown } from './markdown.ts'
import { readContent } from './reader.ts'
import { ContentError } from './schema.ts'
import { validateContent } from './validate.ts'

const problemsOf = (fn: () => unknown): string[] => {
  try {
    fn()
  } catch (e) {
    if (e instanceof ContentError) return e.problems
    throw e
  }
  throw new Error('se esperaba ContentError')
}

const check = (topics: ReturnType<typeof topic>[], tracks = GROUPED_TRACKS_YAML) => () => validateContent(readContent(makeContent(topics, tracks)))
const py = (id: string, order: number, group?: string, extra: Parameters<typeof topic>[1] = {}) => topic(id, { track: 'python', order, ...(group ? { group } : {}), ...extra })

describe('1.1 grupos de temas', () => {
  it('una pista con grupos compila y cada tema queda asociado a su grupo', async () => {
    const root = makeContent([py('a', 1, 'lenguaje'), py('b', 2, 'lenguaje'), py('c', 3, 'fastapi'), topic('r', { track: 'rest' })], GROUPED_TRACKS_YAML)
    const { graph } = await buildContent(root)
    expect(graph.tracks.find((t) => t.id === 'python')!.groups).toEqual([
      { id: 'lenguaje', name: { es: 'Python', en: 'Python' } },
      { id: 'fastapi', name: { es: 'FastAPI', en: 'FastAPI' } },
    ])
    const groupOf = (id: string) => graph.nodes.find((n) => n.id === id)!.group
    expect([groupOf('a'), groupOf('b'), groupOf('c')]).toEqual(['lenguaje', 'lenguaje', 'fastapi'])
  })

  it('una pista sin grupos compila y sus temas no tienen grupo', async () => {
    const { graph } = await buildContent(makeContent([topic('r', { track: 'rest' })], GROUPED_TRACKS_YAML))
    expect(graph.tracks.find((t) => t.id === 'rest')!.groups).toBeUndefined()
    expect(graph.nodes.find((n) => n.id === 'r')!.group).toBeUndefined()
  })

  it('tema sin grupo en una pista con grupos: nombra el tema', () => {
    expect(problemsOf(check([py('a', 1, 'lenguaje'), py('b', 2)]))).toEqual(['tema "b": no indica su grupo y la pista "python" declara grupos'])
  })

  it('grupo inexistente: nombra el tema y el grupo', () => {
    expect(problemsOf(check([py('a', 1, 'lenguaje'), py('b', 2, 'frontend')]))).toEqual(['tema "b": el grupo "frontend" no está declarado en la pista "python"'])
  })

  it('tema con grupo en una pista sin grupos: nombra el tema', () => {
    expect(problemsOf(check([topic('r', { track: 'rest', group: 'lenguaje' })]))).toEqual(['tema "r": indica el grupo "lenguaje" pero la pista "rest" no declara grupos'])
  })

  it('grupo partido: nombra el grupo', () => {
    const p = problemsOf(check([py('a', 1, 'lenguaje'), py('b', 2, 'fastapi'), py('c', 3, 'lenguaje')]))
    expect(p).toEqual(['grupo "lenguaje" de la pista "python": sus temas no son consecutivos en el orden de la pista'])
  })

  it('grupos fuera del orden declarado: nombra la pista y los grupos', () => {
    const p = problemsOf(check([py('a', 1, 'fastapi'), py('b', 2, 'lenguaje')]))
    expect(p).toHaveLength(1)
    expect(p[0]).toMatch(/pista "python": los grupos no siguen el orden declarado en tracks\.yaml \(lenguaje, fastapi\)/)
  })

  it('el contenido real de REST sigue validando sin grupos', async () => {
    const appRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
    const { graph } = await buildContent(path.join(appRoot, 'content'))
    expect(graph.tracks.find((t) => t.id === 'rest')!.groups).toBeUndefined()
    expect(graph.nodes.filter((n) => n.track === 'rest' && n.type === 'topic').every((n) => n.group === undefined)).toBe(true)
  })
})

describe('1.2 título corto opcional', () => {
  const concurrency = 'Concurrencia: async/await, event loop, hilos, procesos y GIL'

  it('un tema con título corto queda disponible con ambos títulos', async () => {
    const [dir, t] = topic('concurrencia', { short: 'async, hilos y GIL', enShort: 'async, threads and GIL' })
    t.es = t.es!.replace('title: concurrencia es', `title: "${concurrency}"`)
    const out = await buildContent(makeContent([[dir, t]]))
    const es = out.topics.es[0]
    expect(es.title).toBe(concurrency)
    expect(es.short).toBe('async, hilos y GIL')
    expect(out.topics.en[0].short).toBe('async, threads and GIL')
    expect(out.search.es.find((d) => d.id === 'concurrencia')!.short).toBe('async, hilos y GIL')
  })

  it('un tema sin título corto compila y no lo lleva', async () => {
    const out = await buildContent(makeContent([topic('a')]))
    expect(out.topics.es[0].short).toBeUndefined()
    expect('short' in out.search.es[0]).toBe(false)
  })

  it('título corto en un solo idioma: nombra el tema y el idioma ausente', () => {
    expect(problemsOf(check([topic('a', { short: 'corto', enShort: null })]))).toEqual(['tema "a": falta el título corto (short) en "en"'])
  })

  it('título corto de más de 32 caracteres: nombra el tema', () => {
    const p = problemsOf(() => readContent(makeContent([topic('a', { short: 'x'.repeat(33) })])))
    expect(p).toContain('rest/a/es.md: short: short no puede superar 32 caracteres')
    expect(p).toContain('rest/a/en.md: short: short no puede superar 32 caracteres')
  })

  it('título corto con HTML: falla', () => {
    const p = problemsOf(() => readContent(makeContent([topic('a', { short: '<b>x</b>' })])))
    expect(p.join('\n')).toMatch(/rest\/a\/es\.md: short: short no puede contener HTML/)
  })
})

describe('1.3 ejemplo principal opcional', () => {
  const example = '```text\napp/\n  main.py\n```\n\n```python\nfrom fastapi import FastAPI\n```'

  it('un ejemplo con un bloque de texto seguido de uno de Python conserva ambos, en orden y con su lenguaje', async () => {
    const out = await buildContent(makeContent([topic('a', { sections: { ...BASE_SECTIONS, 'code:example': example } })]))
    const html = out.topics.es[0].sections['code:example']!
    const blocks = [...html.matchAll(/<pre class="shiki cerebro"[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)].map((m) => m[1])
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toContain('app/')
    expect(blocks[0]).not.toMatch(/color:#(7DD3FC|FCD34D|5F6388)/i)
    expect(blocks[1]).toMatch(/<span style="color:#7DD3FC">from<\/span>/i)
  })

  it('el ejemplo es la primera sección de la pestaña En código', async () => {
    const sections = { ...BASE_SECTIONS, 'code:wire': '```http\nGET / HTTP/1.1\n```', 'code:example': example }
    const out = await buildContent(makeContent([topic('a', { sections })]))
    const codeKeys = Object.keys(out.topics.es[0].sections).filter((k) => k.startsWith('code:'))
    expect(codeKeys).toEqual(['code:example', 'code:wire'])
  })

  it('un bloque sin lenguaje en el ejemplo principal: nombra el tema', () => {
    const p = problemsOf(() => readContent(makeContent([topic('a', { sections: { ...BASE_SECTIONS, 'code:example': '```python\nx = 1\n```\n\n```\ny = 2\n```' } })])))
    expect(p).toEqual(['rest/a/es.md: el bloque 2 de "code:example" no declara lenguaje', 'rest/a/en.md: el bloque 2 de "code:example" no declara lenguaje'])
  })

  it('el ejemplo principal solo admite bloques de código', () => {
    const p = problemsOf(() => readContent(makeContent([topic('a', { sections: { ...BASE_SECTIONS, 'code:example': 'Texto\n\n```python\nx = 1\n```' } })])))
    expect(p[0]).toBe('rest/a/es.md: la sección "code:example" solo admite bloques de código')
  })

  it('un tema sin ejemplo principal compila', async () => {
    const out = await buildContent(makeContent([topic('a')]))
    expect(out.topics.es[0].sections['code:example']).toBeUndefined()
  })

  it('el rótulo está en ambos idiomas', () => {
    const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../src/locales')
    const es = JSON.parse(fs.readFileSync(path.join(root, 'es.json'), 'utf8'))
    const en = JSON.parse(fs.readFileSync(path.join(root, 'en.json'), 'utf8'))
    expect(es.section['code:example']).toBe('Ejemplo: la API de la tienda')
    expect(en.section['code:example']).toBe('Example: the store API')
  })
})

describe('1.4 lenguaje declarado por bloque', () => {
  it('Python de una línea en un ejemplo riesgoso declarado como python se resalta como python', async () => {
    expect(codeLanguage('bad', 'x = [1, 2]', 'python')).toBe('python')
    const html = await renderMarkdown('```python\nfor x in lista: print(x)\n```', 'bad')
    expect(html).toMatch(/<span style="color:#7DD3FC">for<\/span>/i)
  })

  it('un bloque declarado como texto se muestra sin colores de resaltado', async () => {
    expect(codeLanguage('code:example', 'x', 'txt')).toBe('text')
    expect(codeLanguage('bad', 'def f(): pass', 'text')).toBe('text')
    const html = await renderMarkdown('```txt\ndef f(): "hola" # nada\n```', 'good')
    expect(html).toContain('<pre class="shiki cerebro"')
    expect(html).not.toMatch(/color:#(7DD3FC|FCD34D|5F6388)/i)
  })

  it('un lenguaje no admitido: la compilación falla y nombra el archivo y el lenguaje', () => {
    const sections = { ...BASE_SECTIONS, 'bridge:typescript': 'Texto.\n\n```rust\nfn main() {}\n```', bad: '```pyhton\nx = 1\n```', good: '```python\nx = 2\n```' }
    const p = problemsOf(() => readContent(makeContent([topic('a', { sections })])))
    expect(p.filter((m) => m.startsWith('rest/a/es.md'))).toEqual([
      'rest/a/es.md: el bloque de código declara el lenguaje "rust", que no está admitido (py, python, http, json, bash, sh, ts, typescript, text, txt)',
      'rest/a/es.md: el bloque de código declara el lenguaje "pyhton", que no está admitido (py, python, http, json, bash, sh, ts, typescript, text, txt)',
    ])
  })

  it('los bloques sin lenguaje conservan la regla anterior', () => {
    expect(codeLanguage('code:server', 'GET /', undefined)).toBe('python')
    expect(codeLanguage('bad', 'import os', undefined)).toBe('python')
    expect(codeLanguage('good', 'DELETE /v1/x', undefined)).toBe('http')
    expect(codeLanguage('bridge:typescript', 'x', undefined)).toBe('http')
  })
})

describe('1.5 ejercicios', () => {
  const OUTPUT = { type: 'choice', prompt: '¿Qué imprime este código?', items: [{ q: '¿Qué imprime?', code: 'print(type(1 + 1.0))', options: ['int', 'float'], answer: 1, why: 'Promoción a float.' }] }
  const CLASSIFY = {
    type: 'classify',
    prompt: '¿Qué estructura usarías?',
    categories: ['list', 'tuple', 'dict', 'set'],
    items: [{ text: 'Emails únicos que ya recibieron la promo', category: 'set', why: 'Unicidad y búsqueda O(1).' }],
  }

  it('una pregunta de opción múltiple con código lleva el bloque resaltado en python', async () => {
    const out = await buildContent(makeContent([topic('a', { exercises: [OUTPUT] })]))
    const g = out.topics.es[0].exercises[0]
    expect(g.type).toBe('choice')
    const item = g.type === 'choice' ? g.items[0] : null
    expect(item!.code).toContain('<pre class="shiki cerebro"')
    expect(item!.code).toMatch(/color:#7DD3FC/i)
  })

  it('un grupo de clasificación compila con sus categorías y la respuesta de cada caso', async () => {
    const out = await buildContent(makeContent([topic('a', { exercises: [CLASSIFY] })]))
    expect(out.topics.es[0].exercises[0]).toEqual({
      type: 'classify',
      prompt: '¿Qué estructura usarías?',
      categories: ['list', 'tuple', 'dict', 'set'],
      items: [{ text: 'Emails únicos que ya recibieron la promo', answer: 3, why: 'Unicidad y búsqueda O(1).' }],
    })
  })

  it('categoría inexistente: nombra el tema', () => {
    const bad = { ...CLASSIFY, items: [{ ...CLASSIFY.items[0], category: 'frozenset' }] }
    const p = problemsOf(() => readContent(makeContent([topic('a', { exercises: [bad] })])))
    expect(p[0]).toBe('rest/a/es.md: exercises.0.items.0.category: la categoría "frozenset" no está en categories')
  })

  it('menos de dos categorías o categorías repetidas: falla', () => {
    const p = problemsOf(() =>
      readContent(makeContent([topic('a', { exercises: [{ ...CLASSIFY, categories: ['set'], items: [{ ...CLASSIFY.items[0] }] }, { ...CLASSIFY, categories: ['set', 'set'] }] })])),
    )
    expect(p.join('\n')).toMatch(/exercises\.0\.categories: categories necesita al menos 2 categorías/)
    expect(p.join('\n')).toMatch(/exercises\.1\.categories: las categorías deben ser distintas/)
  })

  it('paridad: distinto número de categorías o distinta posición de la correcta', () => {
    const enFewer = { ...CLASSIFY, categories: ['list', 'tuple', 'set'] }
    expect(problemsOf(check([topic('a', { exercises: [CLASSIFY], enExercises: [enFewer] })]))).toEqual([
      'tema "a": el grupo de ejercicios 1 tiene distinto número de categorías entre "es" y "en"',
    ])
    const enMoved = { ...CLASSIFY, categories: ['list', 'tuple', 'set', 'dict'] }
    expect(problemsOf(check([topic('a', { exercises: [CLASSIFY], enExercises: [enMoved] })]))).toEqual([
      'tema "a": el ejercicio 1 del grupo 1 difiere entre "es" y "en"',
    ])
    const enTranslated = { ...CLASSIFY, prompt: 'Which structure?', items: [{ text: 'Unique emails', category: 'set', why: 'O(1).' }] }
    expect(() => check([topic('a', { exercises: [CLASSIFY], enExercises: [enTranslated] })])()).not.toThrow()
  })

  it('el frontmatter acepta los tres tipos', () => {
    const [dir, t] = topic('a')
    t.es = md({ title: 'a', summary: 's', exercises: [OUTPUT, CLASSIFY, { type: 'verdict', prompt: 'p', items: [{ statement: 's', ok: true, why: 'w' }] }] }, BASE_SECTIONS)
    t.en = t.es
    const c = readContent(makeContent([[dir, t]]))
    expect(c.topics[0].locales.es!.front.exercises.map((g) => g.type)).toEqual(['choice', 'classify', 'verdict'])
  })
})

describe('3.x pista Python y FastAPI en el contenido real', () => {
  const appRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
  const contentDir = path.join(appRoot, 'content')
  const pyDir = path.join(contentDir, 'python')
  const build = () => buildContent(contentDir)

  it('21 temas en el orden de la guía: 10 en "Python" y 11 en "FastAPI"', async () => {
    const { graph } = await build()
    const topics = graph.nodes.filter((n) => n.track === 'python' && n.type === 'topic').sort((a, b) => a.order! - b.order!)
    expect(topics).toHaveLength(21)
    expect(topics.map((t) => t.order)).toEqual(Array.from({ length: 21 }, (_, i) => i + 1))
    expect(topics.slice(0, 10).every((t) => t.group === 'lenguaje')).toBe(true)
    expect(topics.slice(10).every((t) => t.group === 'fastapi')).toBe(true)
    expect(topics[7].id).toBe('concurrencia')
    expect(graph.tracks.find((t) => t.id === 'python')!.empty).toBe(false)
    expect(graph.tracks.filter((t) => t.empty).map((t) => t.id).sort()).toEqual(['git', 'oop', 'sql'])
  })

  it('el tema "HTTP por dentro y principios REST" no existe', async () => {
    const { topics } = await build()
    expect(topics.es.some((t) => /HTTP por dentro/.test(t.title))).toBe(false)
  })

  it('autenticación: conceptos propios y relación con JWT de REST', async () => {
    const { graph, topics } = await build()
    expect(topics.es.find((t) => t.id === 'autenticacion-en-fastapi')!.title).toBe('Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas')
    const own = graph.nodes.filter((n) => n.parent === 'autenticacion-en-fastapi').map((n) => n.id).sort()
    expect(own).toEqual(['hashing-de-contrasenas', 'oauth2-password-flow'])
    expect(graph.nodes.find((n) => n.id === 'jwt')!.track).toBe('rest')
    expect(graph.links.some((l) => [l.source, l.target].includes('autenticacion-en-fastapi') && [l.source, l.target].includes('jwt'))).toBe(true)
  })

  it('ningún concepto de REST se declara de nuevo en Python', () => {
    const restConcepts = new Set(fs.readdirSync(path.join(contentDir, 'rest')).flatMap((id) => (YAMLparse(path.join(contentDir, 'rest', id, 'meta.yaml')).concepts as string[]) ?? []))
    const pyConcepts = fs.readdirSync(pyDir).flatMap((id) => YAMLparse(path.join(pyDir, id, 'meta.yaml')).concepts as string[])
    expect(pyConcepts.filter((c) => restConcepts.has(c))).toEqual([])
  })

  it('ningún tema de Python lleva demo', () => {
    for (const id of fs.readdirSync(pyDir)) expect(YAMLparse(path.join(pyDir, id, 'meta.yaml')).demo).toBeUndefined()
  })

  it('ningún texto fuera de los bloques de código menciona Angular, NestJS ni RxJS', () => {
    const offenders: string[] = []
    for (const id of fs.readdirSync(pyDir)) {
      for (const f of ['es.md', 'en.md']) {
        const prose = fs
          .readFileSync(path.join(pyDir, id, f), 'utf8')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/^(\s+)code: \|-?\n(?:\1\s+.*\n|\n)*/gm, '')
        if (/Angular|NestJS|RxJS|HttpClient|interceptor|TestBed|ng serve|proxy\.conf/i.test(prose)) offenders.push(`${id}/${f}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('ejercicios trasladados: códigos de estado y clasificación de métodos en REST', async () => {
    const { topics } = await build()
    const codes = topics.es.find((t) => t.id === 'codigos-de-estado')!.exercises
    const g = codes[codes.length - 1]
    expect(g.type === 'choice' && g.items.slice(-2).map((it) => it.q)).toEqual([
      'Un cliente autenticado pide <code>GET /pedidos/1042</code>, pero ese pedido es de otro cliente.',
      '<code>POST /clientes</code> con un email que ya está registrado.',
    ])
    const methods = topics.es.find((t) => t.id === 'metodos-seguros-idempotentes')!.exercises
    expect(methods[methods.length - 1]).toMatchObject({ type: 'classify', prompt: '¿Qué método HTTP corresponde?', categories: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] })
  })
})

function YAMLparse(file: string): Record<string, unknown> {
  return YAML.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>
}
