// @vitest-environment node
/**
 * Pruebas del modelo de contenido ampliado en el cambio contenido-claro: grupo 1 (pasos y paridad de código) y
 * grupo 2 (entradas de proyecto: modelo, validación, salida, buscador y grafo).
 */
import { describe, expect, it } from 'vitest'
import { computeHighlight } from '../../src/graph/highlight.ts'
import { indexGraph, relatedOf } from '../../src/graph/relations.ts'
import { buildSearchIndex } from '../../src/search/searchIndex.ts'
import { buildContent } from './build.ts'
import { BASE_SECTIONS, GROUPED_TRACKS_YAML, makeContent, project, topic, walkthrough, type TopicFixture } from './fixtures.ts'
import { renderMarkdown } from './markdown.ts'
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

/** Secuencia de piezas de primer nivel de una sección ya generada: `h4:<texto>`, `p:<texto>` o `pre`. */
function pieces(html: string): string[] {
  const out: string[] = []
  const re = /<h4>([\s\S]*?)<\/h4>|<p>([\s\S]*?)<\/p>|<pre class="shiki[^"]*"[^>]*>[\s\S]*?<\/pre>/g
  for (const m of html.matchAll(re)) {
    if (m[1] !== undefined) out.push(`h4:${m[1]}`)
    else if (m[2] !== undefined) out.push(`p:${m[2]}`)
    else out.push('pre')
  }
  return out
}

const DECORADORES = [
  '### Paso 1. Una función se puede pasar a otra función',
  'Una función es un valor más.',
  '```python\ndef saludar():\n    print("hola")\n```',
  '### Paso 2. Un decorador hecho a mano',
  'Envuelve la función original.',
  '```python\ndef registrar(f):\n    return f\n```',
  '### Paso 3. La sintaxis con @',
  'La arroba es un atajo.',
  '```python\n@registrar\ndef saludar(): ...\n```',
  '### Paso 4. En el proyecto: registrar cada cálculo',
  'En la tienda se usa así.',
  '```python\n@registrar\ndef total_del_pedido(): ...\n```',
  '### Avanzado. Conservar el nombre con functools.wraps',
  'Sin `wraps` se pierde el nombre.',
  '```python\nfrom functools import wraps\n```',
].join('\n\n')

const CACHE_WIRE = [
  '### Momento 1. El navegador pide el recurso',
  '```http\nGET /productos/7 HTTP/1.1\n```',
  '### Momento 2. El navegador guarda la respuesta',
  'No viaja nada por la red: el navegador usa su copia mientras siga fresca.',
  '### Momento 3. La copia caduca y se revalida',
  '```http\nGET /productos/7 HTTP/1.1\nIf-None-Match: "v1"\n```',
].join('\n\n')

describe('1.2 pasos con título en las secciones de código', () => {
  it('Ejemplo principal con pasos: conserva los cinco títulos, los textos y los bloques, en orden', async () => {
    const out = await buildContent(makeContent([topic('decoradores', { track: 'rest', sections: { ...BASE_SECTIONS, 'code:example': DECORADORES } })]))
    expect(pieces(out.topics.es[0].sections['code:example']!)).toEqual([
      'h4:Paso 1. Una función se puede pasar a otra función',
      'p:Una función es un valor más.',
      'pre',
      'h4:Paso 2. Un decorador hecho a mano',
      'p:Envuelve la función original.',
      'pre',
      'h4:Paso 3. La sintaxis con @',
      'p:La arroba es un atajo.',
      'pre',
      'h4:Paso 4. En el proyecto: registrar cada cálculo',
      'p:En la tienda se usa así.',
      'pre',
      'h4:Avanzado. Conservar el nombre con functools.wraps',
      'p:Sin <code>wraps</code> se pierde el nombre.',
      'pre',
    ])
  })

  it('Conversación por la red con momentos: conserva los tres títulos y el texto del segundo, que no lleva código', async () => {
    const out = await buildContent(makeContent([topic('cache-http', { sections: { ...BASE_SECTIONS, 'code:wire': CACHE_WIRE } })]))
    expect(pieces(out.topics.es[0].sections['code:wire']!)).toEqual([
      'h4:Momento 1. El navegador pide el recurso',
      'pre',
      'h4:Momento 2. El navegador guarda la respuesta',
      'p:No viaja nada por la red: el navegador usa su copia mientras siga fresca.',
      'h4:Momento 3. La copia caduca y se revalida',
      'pre',
    ])
  })

  it('el ejemplo del lado del servidor también admite pasos y texto', async () => {
    const server = '### Paso 1. La ruta\n\nSe declara así.\n\n```python\n@app.get("/")\ndef f(): ...\n```\n\nY responde con JSON.'
    const out = await buildContent(makeContent([topic('a', { sections: { ...BASE_SECTIONS, 'code:server': server } })]))
    expect(pieces(out.topics.es[0].sections['code:server']!)).toEqual(['h4:Paso 1. La ruta', 'p:Se declara así.', 'pre', 'p:Y responde con JSON.'])
  })

  it.each(['definition', 'analogy', 'problem', 'interview', 'myths'])('Título de paso en "%s": la compilación falla y nombra el archivo y la sección', (key) => {
    const sections = { ...BASE_SECTIONS, [key]: `Texto.\n\n### Paso 1. No va aquí\n\nMás texto.` }
    expect(problemsOf(() => readContent(makeContent([topic('a', { sections })])))).toEqual([
      `rest/a/es.md: la sección "${key}" no admite títulos de paso (###)`,
      `rest/a/en.md: la sección "${key}" no admite títulos de paso (###)`,
    ])
  })

  it.each(['bad', 'good', 'bridge:typescript'])('Título de paso en "%s": la compilación falla y nombra el archivo y la sección', (key) => {
    const sections = { ...BASE_SECTIONS, bad: '```python\nx = 1\n```', good: '```python\nx = 2\n```', [key]: '### Paso 1. No va aquí\n\n```python\nx = 3\n```' }
    const p = problemsOf(() => readContent(makeContent([topic('a', { sections })])))
    expect(p.filter((m) => m.startsWith('rest/a/es.md'))).toEqual([`rest/a/es.md: la sección "${key}" no admite títulos de paso (###)`])
  })

  it('un "###" dentro de un bloque de código no es un título de paso', async () => {
    const sections = { ...BASE_SECTIONS, definition: 'Así:\n\n```text\n### esto es código\n```' }
    const out = await buildContent(makeContent([topic('a', { sections })]))
    expect(out.topics.es[0].sections.definition).not.toContain('<h4>')
    expect(out.topics.es[0].sections.definition).toContain('### esto es código')
  })

  it('un encabezado de otro nivel no se convierte en título de paso', async () => {
    const html = await renderMarkdown('#### Cuatro\n\n```python\nx = 1\n```', 'code:example')
    expect(html).not.toMatch(/<h\d>/)
    expect(html).toContain('Cuatro')
  })

  it('el título de paso admite código y enlaces, y se sanea', async () => {
    const html = await renderMarkdown(
      '### Paso 2. Un decorador con `@` y [[otro]] <script>alert(1)</script><img src=x onerror=alert(1)>\n\n```python\nx = 1\n```',
      'code:example',
      (id) => (id === 'otro' ? { href: '/es/rest/otro', name: 'Otro tema' } : null),
    )
    const h4 = /<h4>([\s\S]*?)<\/h4>/.exec(html)![1]
    expect(h4).toBe('Paso 2. Un decorador con <code>@</code> y <a href="/es/rest/otro" data-node="otro">Otro tema</a> ')
    expect(html).not.toMatch(/script|onerror|<img/)
  })
})

describe('1.4 paridad de código entre idiomas', () => {
  const check = (es: string, en: string, key = 'code:example') => () =>
    validateContent(readContent(makeContent([topic('decoradores', { sections: { ...BASE_SECTIONS, [key]: es }, enSections: { ...BASE_SECTIONS, [key]: en } })])))
  const block = (comment: string, lang = 'python') => `\`\`\`${lang}\nx = 1  # ${comment}\nprint(x)\n\`\`\``

  it('Comentarios traducidos: los mismos tres bloques de Python con comentarios en cada idioma compilan', () => {
    const es = ['### Paso 1. Uno', block('uno'), '### Paso 2. Dos', block('dos'), 'Texto en español.', block('tres')].join('\n\n')
    const en = ['### Step 1. One', block('one'), '### Step 2. Two', block('two'), 'English text.', block('three')].join('\n\n')
    expect(check(es, en)).not.toThrow()
  })

  it('Falta un bloque en un idioma: nombra el tema y la sección', () => {
    const es = [block('a'), block('b'), block('c'), block('d')].join('\n\n')
    const en = [block('a'), block('b'), block('c')].join('\n\n')
    expect(problemsOf(check(es, en))).toEqual(['tema "decoradores": la sección "code:example" tiene 4 bloques de código en "es" y 3 en "en"'])
  })

  it('Lenguaje distinto: el segundo bloque es Python en español y texto en inglés; nombra el tema y la sección', () => {
    const es = [block('a'), block('b'), block('c')].join('\n\n')
    const en = [block('a'), block('b', 'text'), block('c')].join('\n\n')
    expect(problemsOf(check(es, en))).toEqual(['tema "decoradores": en la sección "code:example", el bloque 2 es python en "es" y text en "en"'])
  })

  it('Falta un paso en un idioma: nombra el tema y la sección', () => {
    const steps = (word: string, n: number) => Array.from({ length: n }, (_, i) => `### ${word} ${i + 1}. Título\n\nTexto.`).join('\n\n')
    const es = `${steps('Paso', 5)}\n\n${block('a')}`
    const en = `${steps('Step', 4)}\n\n${block('a')}`
    expect(problemsOf(check(es, en))).toEqual(['tema "decoradores": la sección "code:example" tiene 5 títulos de paso en "es" y 4 en "en"'])
  })

  it('se aplica a todas las secciones, también a las que no admiten pasos', () => {
    const p = problemsOf(check('```python\nx = 1\n```', 'Sin código.', 'definition'))
    expect(p).toEqual(['tema "decoradores": la sección "definition" tiene 1 bloques de código en "es" y 0 en "en"'])
  })

  it('en la red, un bloque sin lenguaje declarado se compara por el lenguaje que se le deduce', () => {
    const es = '```\nGET /productos HTTP/1.1\n```'
    expect(check(es, '```\nGET /products HTTP/1.1\n```', 'code:wire')).not.toThrow()
    expect(problemsOf(check(es, '```\nimport httpx\n```', 'code:wire'))).toEqual([
      'tema "decoradores": en la sección "code:wire", el bloque 1 es http en "es" y python en "en"',
    ])
  })

  it('el contenido real completo cumple la paridad', async () => {
    const out = await buildContent(new URL('../../content', import.meta.url).pathname)
    expect(out.topics.es.length).toBe(out.topics.en.length)
  })
})

// ---------- Grupo 2: entradas de proyecto ----------

/** Cinco temas de Python y FastAPI y tres de HTTP y REST, como los de "Proyecto: el endpoint de crear un pedido". */
const PY_TOPICS = ['rutas-y-parametros', 'modelos-y-response-model', 'inyeccion-con-depends', 'errores-y-httpexception', 'endpoints-async-vs-sync']
const REST_TOPICS = ['metodos-http', 'codigos-de-estado', 'errores-problem-details']
/** En el orden de `content-map.md`, sección 3: mezcla las dos pistas. */
const COVERS = [...PY_TOPICS, ...REST_TOPICS]

const pyTopic = (id: string, order: number, group = 'fastapi') => topic(id, { track: 'python', order, group })
const BASE: Array<[string, TopicFixture]> = [
  pyTopic('decoradores', 1, 'lenguaje'),
  ...PY_TOPICS.map((id, i) => pyTopic(id, 10 + i)),
  pyTopic('orm-y-sesiones', 30),
  ...REST_TOPICS.map((id, i) => topic(id, { track: 'rest', order: i + 1 })),
]
const crearPedido = (opts: Partial<Parameters<typeof project>[1]> = {}) =>
  project('proyecto-crear-pedido', { order: 23, group: 'fastapi', covers: COVERS, short: 'Proyecto: crear un pedido', ...opts })
const contentWith = (...extra: Array<[string, TopicFixture]>) => makeContent([...BASE, ...extra], GROUPED_TRACKS_YAML)
const validate = (...extra: Array<[string, TopicFixture]>) => () => validateContent(readContent(contentWith(...extra)))
const read = (...extra: Array<[string, TopicFixture]>) => () => readContent(contentWith(...extra))

describe('2.1 entradas de proyecto: modelo y validación', () => {
  it('Entrada de proyecto válida: compila con su contexto, su recorrido y los ocho temas en el orden declarado', async () => {
    const out = await buildContent(contentWith(crearPedido()))
    for (const locale of ['es', 'en'] as const) {
      const entry = out.topics[locale].find((t) => t.id === 'proyecto-crear-pedido')!
      expect(entry.kind).toBe('project')
      expect(entry.covers).toEqual(COVERS)
      expect(Object.keys(entry.sections)).toEqual(['context', 'walkthrough'])
      expect(entry.sections.context).toMatch(/^<p>/)
      expect(entry.sections.walkthrough!.match(/<h4>/g)).toHaveLength(8)
      expect(entry).not.toHaveProperty('freq')
      expect(entry).not.toHaveProperty('demo')
      expect(entry.exercises).toEqual([])
    }
  })

  it('Tema reunido inexistente: nombra la entrada y el identificador', () => {
    const p = problemsOf(validate(crearPedido({ covers: [...COVERS, 'no-existe'] })))
    expect(p).toContain('entrada de proyecto "proyecto-crear-pedido": el tema reunido "no-existe" no existe')
  })

  it('Reúne un concepto: nombra la entrada y el identificador', () => {
    const conDep = topic('dependencias', { track: 'python', order: 31, group: 'fastapi', concepts: { 'depends-concepto': 'Depends' } })
    const p = problemsOf(validate(conDep, crearPedido({ covers: [...COVERS, 'depends-concepto'] })))
    expect(p).toContain('entrada de proyecto "proyecto-crear-pedido": "depends-concepto" es un concepto y covers solo admite temas')
  })

  it('Tema reunido sin enlazar: nombra la entrada, el idioma y el tema', () => {
    const enWalk = walkthrough(COVERS.filter((c) => c !== 'codigos-de-estado'), 'en')
    const p = problemsOf(validate(crearPedido({ enSections: { context: 'What we build.', walkthrough: enWalk } })))
    expect(p).toContain('entrada de proyecto "proyecto-crear-pedido" (en): el recorrido (walkthrough) no enlaza el tema reunido "codigos-de-estado"')
    expect(p.filter((m) => m.includes('(es)'))).toEqual([])
  })

  it('un enlace en el contexto no cuenta: cada tema reunido se enlaza en el recorrido', () => {
    const esWalk = walkthrough(COVERS, 'es').replace(`[[${COVERS[0]}]]`, 'el tema de rutas')
    const p = problemsOf(validate(crearPedido({ sections: { context: `Usa [[${COVERS[0]}]].`, walkthrough: esWalk } })))
    expect(p).toEqual([`entrada de proyecto "proyecto-crear-pedido" (es): el recorrido (walkthrough) no enlaza el tema reunido "${COVERS[0]}"`])
  })

  it('Entrada de proyecto con conceptos: en meta.yaml o en el idioma, nombra la entrada', () => {
    expect(problemsOf(read(crearPedido({ meta: { concepts: ['pedido'] } })))).toEqual([
      'python/proyecto-crear-pedido/meta.yaml: concepts: la entrada de proyecto "proyecto-crear-pedido" no puede declarar "concepts"',
    ])
    expect(problemsOf(read(crearPedido({ front: { concepts: { pedido: { name: 'pedido' } } } })))).toEqual([
      'python/proyecto-crear-pedido/es.md: la entrada de proyecto "proyecto-crear-pedido" no puede declarar "concepts"',
      'python/proyecto-crear-pedido/en.md: la entrada de proyecto "proyecto-crear-pedido" no puede declarar "concepts"',
    ])
  })

  it.each([
    ['freq', 'always'],
    ['related', ['decoradores']],
    ['demo', 'status-explorer'],
  ])('una entrada de proyecto no puede declarar "%s"', (field, value) => {
    expect(problemsOf(read(crearPedido({ meta: { [field]: value } })))).toEqual([
      `python/proyecto-crear-pedido/meta.yaml: ${field}: la entrada de proyecto "proyecto-crear-pedido" no puede declarar "${field}"`,
    ])
  })

  it('una entrada de proyecto no lleva ejercicios', () => {
    const exercises = [{ type: 'verdict', prompt: 'Revisa', items: [{ statement: 'x', ok: true, why: 'y' }] }]
    expect(problemsOf(read(crearPedido({ front: { exercises } })))).toEqual([
      'python/proyecto-crear-pedido/es.md: la entrada de proyecto "proyecto-crear-pedido" no puede declarar "exercises"',
      'python/proyecto-crear-pedido/en.md: la entrada de proyecto "proyecto-crear-pedido" no puede declarar "exercises"',
    ])
  })

  it('covers es obligatorio, con al menos dos temas distintos', () => {
    const meta = (m: Record<string, unknown>) => problemsOf(read(crearPedido({ meta: m, sections: { context: 'C.', walkthrough: 'W.' }, enSections: { context: 'C.', walkthrough: 'W.' } })))
    expect(meta({ covers: undefined })).toEqual([
      'python/proyecto-crear-pedido/meta.yaml: covers: la entrada de proyecto "proyecto-crear-pedido" debe declarar los temas que reúne (covers)',
    ])
    expect(meta({ covers: ['decoradores'] })).toEqual(['python/proyecto-crear-pedido/meta.yaml: covers: la entrada de proyecto "proyecto-crear-pedido" debe reunir al menos 2 temas'])
    expect(meta({ covers: ['decoradores', 'decoradores'] })).toEqual(['python/proyecto-crear-pedido/meta.yaml: covers: la entrada de proyecto "proyecto-crear-pedido" repite el tema "decoradores"'])
  })

  it('un tema reunido no puede ser otra entrada de proyecto, ni la propia', () => {
    const otra = project('proyecto-total-del-pedido', { order: 2, group: 'lenguaje', covers: ['decoradores', 'rutas-y-parametros'] })
    const p = problemsOf(validate(otra, crearPedido({ covers: [...COVERS, 'proyecto-total-del-pedido', 'proyecto-crear-pedido'] })))
    expect(p).toContain('entrada de proyecto "proyecto-crear-pedido": el tema reunido "proyecto-total-del-pedido" es otra entrada de proyecto')
    expect(p).toContain('entrada de proyecto "proyecto-crear-pedido": se reúne a sí misma en covers')
  })

  it('kind solo admite "project"', () => {
    const p = problemsOf(read(crearPedido({ meta: { kind: 'tutorial' } })))
    expect(p.join('\n')).toMatch(/^python\/proyecto-crear-pedido\/meta\.yaml: kind: /)
  })

  it('Falta una sección: nombra la entrada y la sección ausente', () => {
    const p = problemsOf(read(crearPedido({ sections: { walkthrough: walkthrough(COVERS) } })))
    expect(p).toEqual(['python/proyecto-crear-pedido/es.md: falta la sección obligatoria "context"'])
    const q = problemsOf(read(crearPedido({ enSections: { context: 'What we build.' } })))
    expect(q).toEqual(['python/proyecto-crear-pedido/en.md: falta la sección obligatoria "walkthrough"'])
  })

  it('Sección de tema en una entrada de proyecto: una analogía nombra el archivo y la sección', () => {
    const sections = { context: 'Qué vamos a construir.', analogy: 'Como una cocina.', walkthrough: walkthrough(COVERS) }
    expect(problemsOf(read(crearPedido({ sections })))).toEqual([
      'python/proyecto-crear-pedido/es.md: la sección "analogy" es de un tema y no se admite en una entrada de proyecto',
    ])
  })

  it('las dos secciones admiten títulos de paso; el recorrido exige el lenguaje de cada bloque', () => {
    const context = '### Qué hace\n\nCrea un pedido.'
    expect(read(crearPedido({ sections: { context, walkthrough: walkthrough(COVERS) } }))).not.toThrow()
    const sinLenguaje = `${walkthrough(COVERS)}\n\n### Parte 9. Sin lenguaje\n\n\`\`\`\nx = 1\n\`\`\``
    expect(problemsOf(read(crearPedido({ sections: { context: 'C.', walkthrough: sinLenguaje } })))).toEqual([
      'python/proyecto-crear-pedido/es.md: el bloque 9 de "walkthrough" no declara lenguaje',
    ])
  })

  it('la paridad de código entre idiomas se aplica a las dos secciones', () => {
    const enWalk = `${walkthrough(COVERS, 'en')}\n\n\`\`\`python\nextra = 1\n\`\`\``
    const p = problemsOf(validate(crearPedido({ enSections: { context: "### What\n\nWe're building it.", walkthrough: enWalk } })))
    expect(p).toEqual([
      'tema "proyecto-crear-pedido": la sección "context" tiene 0 títulos de paso en "es" y 1 en "en"',
      'tema "proyecto-crear-pedido": la sección "walkthrough" tiene 8 bloques de código en "es" y 9 en "en"',
    ])
  })

  it('Un tema normal no cambia: exige las secciones de siempre y no puede declarar temas reunidos', () => {
    const conCovers = topic('a', { track: 'python', order: 40, group: 'fastapi' })
    conCovers[1].meta.covers = ['decoradores', 'orm-y-sesiones']
    expect(problemsOf(read(conCovers))).toEqual([
      'python/a/meta.yaml: covers: el tema "a" no es una entrada de proyecto (kind: project) y no puede declarar covers',
    ])
    const comoProyecto = topic('b', { track: 'python', order: 40, group: 'fastapi', sections: { context: 'C.', walkthrough: walkthrough(['decoradores', 'orm-y-sesiones']) } })
    const p = problemsOf(read(comoProyecto)).filter((m) => m.startsWith('python/b/es.md'))
    expect(p).toEqual([
      'python/b/es.md: la sección "context" solo se admite en una entrada de proyecto (kind: project)',
      'python/b/es.md: la sección "walkthrough" solo se admite en una entrada de proyecto (kind: project)',
      ...['definition', 'analogy', 'problem', 'interview', 'myths'].map((k) => `python/b/es.md: falta la sección obligatoria "${k}"`),
    ])
    const sinFreq = topic('c', { track: 'python', order: 40, group: 'fastapi' })
    delete sinFreq[1].meta.freq
    expect(problemsOf(read(sinFreq))).toEqual(['python/c/meta.yaml: freq: el tema "c" debe declarar su frecuencia (freq)'])
  })
})

describe('2.2 entradas de proyecto: salida, buscador y grafo', () => {
  it('Aparece sin cambios de código: en el cerebro, en el buscador y en la lista de su pista, en la posición de su orden', async () => {
    const before = await buildContent(contentWith())
    const out = await buildContent(contentWith(crearPedido()))

    // Cerebro: un nodo de tema más, de su pista y su grupo, sin frecuencia ni conceptos.
    expect(out.graph.nodes.length).toBe(before.graph.nodes.length + 1)
    const n = out.graph.nodes.find((x) => x.id === 'proyecto-crear-pedido')!
    expect(n).toMatchObject({ type: 'topic', track: 'python', parent: 'python', order: 23, group: 'fastapi', kind: 'project', covers: COVERS })
    expect(n).not.toHaveProperty('freq')
    expect(out.graph.nodes.filter((x) => x.parent === 'proyecto-crear-pedido')).toEqual([])

    // Lista de la pista: entre "endpoints-async-vs-sync" (orden 14) y "orm-y-sesiones" (orden 30).
    const list = indexGraph(out.graph).topicsOfTrack.get('python')!.map((x) => x.id)
    expect(list).toEqual(['decoradores', ...PY_TOPICS, 'proyecto-crear-pedido', 'orm-y-sesiones'])

    // Buscador: un documento de tema con título, título del otro idioma como alias, resumen y título corto.
    for (const [locale, other] of [['es', 'en'], ['en', 'es']] as const) {
      const d = out.search[locale].find((x) => x.id === 'proyecto-crear-pedido')!
      const title = { es: 'Proyecto: proyecto-crear-pedido', en: 'Project: proyecto-crear-pedido' }
      expect(d).toEqual({
        id: 'proyecto-crear-pedido',
        type: 'topic',
        track: 'python',
        name: title[locale],
        aliases: [title[other]],
        summary: 'Resumen de proyecto-crear-pedido.',
        short: 'Proyecto: crear un pedido',
        topic: 'proyecto-crear-pedido',
      })
    }
    expect(out.search.es.filter((x) => x.topic === 'proyecto-crear-pedido')).toHaveLength(1)
    const hits = buildSearchIndex(out.search.es).search('crear pedido')
    expect(hits[0]?.id).toBe('proyecto-crear-pedido')
  })

  it('Vecinos de una entrada de proyecto: los ocho temas que reúne, con una relación cada uno; los tres de HTTP y REST son de esa pista', async () => {
    const out = await buildContent(contentWith(crearPedido()))
    const own = out.graph.links.filter((l) => l.source === 'proyecto-crear-pedido' || l.target === 'proyecto-crear-pedido')
    const other = (l: (typeof own)[number]) => (l.source === 'proyecto-crear-pedido' ? l.target : l.source)
    expect(own.filter((l) => l.kind === 'related').map(other)).toEqual(COVERS)
    expect(own.filter((l) => l.kind === 'hierarchy').map(other)).toEqual(['python'])
    // Los enlaces [[id]] del recorrido no añaden conexiones distintas: ya son los mismos temas.
    expect(own).toHaveLength(COVERS.length + 1)

    const idx = indexGraph(out.graph)
    const lit = computeHighlight(idx, { hovered: 'proyecto-crear-pedido', selected: null, matches: null })!
    for (const c of COVERS) expect(lit.has(c)).toBe(true)
    expect(COVERS.filter((c) => idx.byId.get(c)!.track === 'rest')).toEqual(REST_TOPICS)

    // Relacionados: los temas reunidos en su orden, y ningún concepto.
    expect(relatedOf(idx, 'proyecto-crear-pedido').map((x) => x.id)).toEqual(COVERS)
  })

  it('una mención anterior al mismo tema no cambia el tipo de la conexión con la entrada de proyecto', async () => {
    const menciona = topic('aaa-menciona', { track: 'rest', order: 9, sections: { ...BASE_SECTIONS, definition: 'Ver [[proyecto-crear-pedido]].' } })
    const covers = ['aaa-menciona', ...COVERS]
    const out = await buildContent(contentWith(menciona, crearPedido({ covers })))
    const l = out.graph.links.find((x) => [x.source, x.target].includes('aaa-menciona') && [x.source, x.target].includes('proyecto-crear-pedido'))
    expect(l?.kind).toBe('related')
  })

  it('el recorrido puede enlazar otros temas o conceptos: conectan en el cerebro, pero no son relacionados de la entrada', async () => {
    const conConcepto = topic('idempotencia', { track: 'rest', order: 9, concepts: { 'clave-idempotencia': 'clave de idempotencia' } })
    const extra = `${walkthrough(COVERS)}\n\nVer también [[clave-idempotencia]] y [[orm-y-sesiones]].`
    const enExtra = `${walkthrough(COVERS, 'en')}\n\nSee also [[clave-idempotencia]] and [[orm-y-sesiones]].`
    const out = await buildContent(contentWith(conConcepto, crearPedido({ sections: { context: 'C.', walkthrough: extra }, enSections: { context: 'C.', walkthrough: enExtra } })))
    const idx = indexGraph(out.graph)
    expect(idx.neighbors.get('proyecto-crear-pedido')!.has('clave-idempotencia')).toBe(true)
    expect(relatedOf(idx, 'proyecto-crear-pedido').map((x) => x.id)).toEqual(COVERS)
  })

  it('Más conexiones entre pistas: las entradas de proyecto del grupo FastAPI unen Python y FastAPI con HTTP y REST', async () => {
    const cross = (g: Awaited<ReturnType<typeof buildContent>>['graph']) => {
      const track = new Map(g.nodes.map((x) => [x.id, x.track]))
      return g.links.filter((l) => l.kind !== 'hierarchy' && track.get(l.source) !== track.get(l.target))
    }
    const before = await buildContent(contentWith())
    expect(cross(before.graph)).toEqual([])

    const projects = [
      crearPedido(),
      project('proyecto-pedidos-con-login', { order: 31, group: 'fastapi', covers: ['orm-y-sesiones', 'codigos-de-estado'] }),
      project('proyecto-api-completa', { order: 32, group: 'fastapi', covers: ['rutas-y-parametros', 'metodos-http', 'errores-problem-details'] }),
    ]
    const out = await buildContent(contentWith(...projects))
    const links = cross(out.graph)
    expect(links.every((l) => l.kind === 'related' && l.source.startsWith('proyecto-'))).toBe(true)
    expect(links.map((l) => `${l.source}→${l.target}`).sort()).toEqual(
      [
        ...REST_TOPICS.map((r) => `proyecto-crear-pedido→${r}`),
        'proyecto-pedidos-con-login→codigos-de-estado',
        'proyecto-api-completa→metodos-http',
        'proyecto-api-completa→errores-problem-details',
      ].sort(),
    )
  })

  it('el contenido real: solo las entradas de content-map.md (sección 3) son entradas de proyecto; los demás temas no cambian', async () => {
    // Las cinco entradas de proyecto de este cambio; se escriben a partir del grupo 4 (piloto).
    const PROJECTS = new Set(['proyecto-total-del-pedido', 'proyecto-importar-catalogo', 'proyecto-crear-pedido', 'proyecto-pedidos-con-login', 'proyecto-api-completa'])
    const out = await buildContent(new URL('../../content', import.meta.url).pathname)
    for (const t of out.topics.es) {
      const esperado = PROJECTS.has(t.id) ? { kind: 'project', conFreq: false } : { kind: undefined, conFreq: true }
      expect({ id: t.id, kind: t.kind, conFreq: t.freq !== undefined }).toEqual({ id: t.id, ...esperado })
    }
    expect(out.graph.nodes.filter((n) => n.kind !== undefined).every((n) => n.kind === 'project' && PROJECTS.has(n.id))).toBe(true)
  })
})
