// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { describe, expect, it } from 'vitest'
import { buildContent, writeOutput } from './build.ts'
import { BASE_SECTIONS, makeContent, md, topic, TRACKS_YAML } from './fixtures.ts'
import { codeLanguage, renderMarkdown } from './markdown.ts'
import { readContent } from './reader.ts'
import { ContentError, frontmatterSchema, metaSchema, parseWith, tracksFileSchema } from './schema.ts'
import { splitSections } from './sections.ts'
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

const CHOICE = { type: 'choice', prompt: '¿Qué método corresponde?', items: [{ q: 'Cambiar un campo', options: ['PUT', 'PATCH'], answer: 1, why: 'Parcial.' }] }
const VERDICT = { type: 'verdict', prompt: 'Revisa este diseño', items: [{ statement: 'GET /v1/clientes/7', ok: true, why: 'Correcto.' }] }

describe('2.1 esquemas', () => {
  const validFront = { title: 'Idempotencia', summary: 'Repetir no cambia el estado.', concepts: { idempotencia: { name: 'idempotencia', aliases: ['idempotency'] } }, exercises: [CHOICE, VERDICT] }
  const validMeta = { id: 'idempotencia', track: 'rest', order: 1, freq: 'always', concepts: ['idempotencia'], related: [] }

  it('un tema válido pasa', () => {
    const p: string[] = []
    expect(parseWith(metaSchema, validMeta, 'rest/idempotencia/meta.yaml', p)).not.toBeNull()
    expect(parseWith(frontmatterSchema, validFront, 'rest/idempotencia/es.md', p)).not.toBeNull()
    expect(p).toEqual([])
  })

  it('un tema sin ejercicios pasa', () => {
    const p: string[] = []
    const { exercises: _drop, ...noEx } = validFront
    void _drop
    expect(parseWith(frontmatterSchema, noEx, 'x/es.md', p)?.exercises).toEqual([])
    expect(parseWith(frontmatterSchema, { ...noEx, exercises: [] }, 'x/es.md', p)?.exercises).toEqual([])
    expect(p).toEqual([])
  })

  it('una pista sin temas pasa (tracks.yaml con abbr)', () => {
    const p: string[] = []
    const root = makeContent([])
    const c = readContent(root)
    expect(c.tracks.map((t) => t.abbr)).toEqual(['RE', 'SQ'])
    expect(c.topics).toEqual([])
    expect(parseWith(tracksFileSchema, YAML.parse(TRACKS_YAML), 'tracks.yaml', p)).not.toBeNull()
  })

  it.each(['id', 'track', 'order', 'freq'])('meta.yaml sin "%s" nombra el archivo', (field) => {
    const p: string[] = []
    const { [field]: _gone, ...rest } = validMeta as Record<string, unknown>
    void _gone
    parseWith(metaSchema, rest, 'rest/idempotencia/meta.yaml', p)
    expect(p.join('\n')).toMatch(new RegExp(`rest/idempotencia/meta.yaml: ${field}`))
  })

  it.each(['title', 'summary'])('frontmatter sin "%s" nombra el archivo', (field) => {
    const p: string[] = []
    const { [field]: _gone, ...rest } = validFront as Record<string, unknown>
    void _gone
    parseWith(frontmatterSchema, rest, 'rest/idempotencia/en.md', p)
    expect(p.join('\n')).toMatch(new RegExp(`rest/idempotencia/en.md: ${field}`))
  })

  it.each(['id', 'abbr', 'color', 'order', 'name'])('tracks.yaml sin "%s" nombra el archivo', (field) => {
    const p: string[] = []
    const t = { id: 'rest', abbr: 'RE', color: '#22d3ee', order: 1, name: { es: 'a', en: 'b' } } as Record<string, unknown>
    delete t[field]
    parseWith(tracksFileSchema, [t], 'tracks.yaml', p)
    expect(p.join('\n')).toMatch(new RegExp(`tracks.yaml: 0.${field}`))
  })

  it('grupos de ejercicio: campos obligatorios ausentes nombran el archivo', () => {
    const p: string[] = []
    parseWith(frontmatterSchema, { ...validFront, exercises: [{ type: 'choice', items: CHOICE.items }] }, 'rest/x/es.md', p)
    parseWith(frontmatterSchema, { ...validFront, exercises: [{ type: 'verdict', prompt: 'p', items: [{ statement: 's', why: 'w' }] }] }, 'rest/x/es.md', p)
    expect(p[0]).toMatch(/rest\/x\/es.md: exercises.0.prompt/)
    expect(p[1]).toMatch(/rest\/x\/es.md: exercises.0.items.0.ok/)
  })

  it('abbr debe ser de dos mayúsculas', () => {
    const p: string[] = []
    parseWith(tracksFileSchema, [{ id: 'rest', abbr: 'Re', color: '#22d3ee', order: 1, name: { es: 'a', en: 'b' } }], 'tracks.yaml', p)
    expect(p.join()).toMatch(/abbr/)
  })
})

describe('2.2 lector y secciones', () => {
  it('devuelve las cinco obligatorias y acepta las opcionales', () => {
    const p: string[] = []
    const body = Object.entries({
      ...BASE_SECTIONS,
      'code:wire': '```\nGET / HTTP/1.1\n```',
      'code:server': '```\n@app.get("/")\ndef f(): ...\n```',
      bad: '```\nGET /borrar\n```',
      good: '```\nDELETE /x\n```',
      'bridge:typescript': 'Con `fetch`.',
    })
      .map(([k, v]) => `## ${k}\n${v}`)
      .join('\n\n')
    const s = splitSections(body, 'rest/x/es.md', p)
    expect(p).toEqual([])
    expect(Object.keys(s).sort()).toEqual(
      ['analogy', 'bad', 'bridge:typescript', 'code:server', 'code:wire', 'definition', 'good', 'interview', 'myths', 'problem'].sort(),
    )
  })

  it('las opcionales pueden faltar', () => {
    const p: string[] = []
    const s = splitSections(Object.entries(BASE_SECTIONS).map(([k, v]) => `## ${k}\n${v}`).join('\n'), 'rest/x/es.md', p)
    expect(p).toEqual([])
    expect(Object.keys(s)).toHaveLength(5)
    expect(s['bridge:typescript']).toBeUndefined()
  })

  it('un "##" dentro de un bloque de código no corta la sección', () => {
    const p: string[] = []
    const s = splitSections(`## definition\nx\n\n\`\`\`\n## no es sección\n\`\`\`\n## analogy\na\n## problem\np\n## interview\ni\n## myths\nm`, 'f', p)
    expect(p).toEqual([])
    expect(s.definition).toContain('## no es sección')
  })

  it('falta la definición: nombra tema y sección', () => {
    const p: string[] = []
    const { definition: _d, ...rest } = BASE_SECTIONS
    void _d
    splitSections(Object.entries(rest).map(([k, v]) => `## ${k}\n${v}`).join('\n'), 'rest/idempotencia/es.md', p)
    expect(p).toEqual(['rest/idempotencia/es.md: falta la sección obligatoria "definition"'])
  })

  it('rechaza bad sin good', () => {
    const p: string[] = []
    splitSections(Object.entries({ ...BASE_SECTIONS, bad: 'x' }).map(([k, v]) => `## ${k}\n${v}`).join('\n'), 'rest/idempotencia/es.md', p)
    expect(p).toEqual(['rest/idempotencia/es.md: falta la sección "good" ("bad" y "good" van juntas)'])
  })

  it('rechaza un code:<tipo> no registrado y un puente no admitido', () => {
    const p: string[] = []
    splitSections(Object.entries({ ...BASE_SECTIONS, 'code:client': 'x', 'bridge:angular': 'y' }).map(([k, v]) => `## ${k}\n${v}`).join('\n'), 'rest/x/es.md', p)
    expect(p[0]).toMatch(/rest\/x\/es.md: tipo de código "code:client" no registrado/)
    expect(p[1]).toMatch(/rest\/x\/es.md: puente "bridge:angular" no admitido/)
  })

  it('readContent recorre content/ y separa secciones', () => {
    const root = makeContent([topic('idempotencia', { concepts: { idempotencia: 'idempotencia' } })])
    const c = readContent(root)
    expect(c.topics).toHaveLength(1)
    expect(Object.keys(c.topics[0].locales.es!.sections)).toEqual(['definition', 'analogy', 'problem', 'interview', 'myths'])
  })
})

describe('2.3 validaciones cruzadas', () => {
  const validate = (topics: ReturnType<typeof topic>[], tracks?: string) => () => validateContent(readContent(makeContent(topics, tracks)))

  it('contenido correcto pasa', () => {
    expect(() => validate([topic('a', { concepts: { ca: 'A' } }), topic('b', { order: 2, related: ['ca'] })])()).not.toThrow()
  })

  it('concepto en dos temas: nombra el concepto y ambos temas', () => {
    const p = problemsOf(validate([topic('a', { concepts: { dup: 'D' } }), topic('b', { concepts: { dup: 'D' } })]))
    expect(p).toEqual(['concepto "dup": aparece como propio de dos temas ("a" y "b")'])
  })

  it('relación rota en meta.yaml: nombra tema e id', () => {
    expect(problemsOf(validate([topic('a', { related: ['no-existe'] })]))).toEqual(['tema "a": el relacionado "no-existe" no existe'])
  })

  it('enlace [[id]] roto: nombra tema e id', () => {
    const p = problemsOf(validate([topic('a', { sections: { ...BASE_SECTIONS, problem: 'Ver [[fantasma]].' } })]))
    expect(p).toEqual(['tema "a" (es): el enlace [[fantasma]] en "problem" no existe', 'tema "a" (en): el enlace [[fantasma]] en "problem" no existe'])
  })

  it('falta una traducción: nombra tema e idioma', () => {
    expect(problemsOf(() => readContent(makeContent([topic('a', { noEn: true })])))).toEqual(['tema "a": falta el idioma "en" (rest/a/en.md)'])
  })

  it('secciones distintas entre idiomas: nombra tema y sección', () => {
    const extra = { ...BASE_SECTIONS, 'bridge:typescript': 'Con fetch.' }
    expect(problemsOf(validate([topic('a', { sections: extra, enSections: BASE_SECTIONS })]))).toEqual([
      'tema "a": la sección "bridge:typescript" está en "es" y falta en "en"',
    ])
  })

  it('conceptos distintos entre idiomas: nombra tema y concepto', () => {
    const [dir, t] = topic('a', { concepts: { ca: 'A' } })
    t.en = md({ title: 'a', summary: 's', concepts: {} }, BASE_SECTIONS)
    expect(problemsOf(validate([[dir, t]]))).toEqual(['tema "a" (en): falta el nombre del concepto "ca"'])
  })

  it('ejercicios distintos entre idiomas: nombra tema', () => {
    const p = problemsOf(validate([topic('a', { exercises: [CHOICE], enExercises: [] })]))
    expect(p).toEqual(['tema "a": "es" tiene 1 grupos de ejercicios y "en" 0'])
  })

  it('demo sin componente: nombra tema e id', () => {
    expect(problemsOf(validate([topic('a', { demo: 'journey' })]))).toEqual(['tema "a": la demo "journey" no tiene componente registrado'])
  })

  it('pista no declarada: nombra tema y pista', () => {
    const p = problemsOf(validate([topic('a', { track: 'git' })]))
    expect(p).toEqual(['tema "a": la pista "git" no está declarada en tracks.yaml'])
  })
})

describe('2.4 Markdown y Shiki', () => {
  it('resalta un bloque de código', async () => {
    const html = await renderMarkdown('Texto\n\n```python\ndef f():\n    return "x"  # c\n```', 'definition')
    expect(html).toContain('<pre class="shiki cerebro"')
    expect(html).toMatch(/<span style="color:#7DD3FC">def<\/span>/i)
    expect(html).toMatch(/<span style="color:#5F6388">/i)
  })

  it('sanea el HTML del texto', async () => {
    const html = await renderMarkdown('Hola <script>alert(1)</script> <img src=x onerror=alert(1)> <b onclick="x()">b</b> [l](javascript:alert(1))', 'definition')
    expect(html).not.toMatch(/script|onerror|onclick|javascript:|<img/)
    expect(html).toContain('<b>b</b>')
  })

  it('elige el lenguaje con la regla de la decisión 2', () => {
    expect(codeLanguage('code:server', 'GET /', undefined)).toBe('python')
    // pista-python, decisión 2: la valla con lenguaje manda.
    expect(codeLanguage('code:wire', 'GET / HTTP/1.1', 'python')).toBe('python')
    expect(codeLanguage('code:wire', 'GET / HTTP/1.1', undefined)).toBe('http')
    expect(codeLanguage('bad', '@app.post("/x")\ndef f(): ...', undefined)).toBe('python')
    expect(codeLanguage('good', 'import os', undefined)).toBe('python')
    expect(codeLanguage('good', 'DELETE /v1/x', undefined)).toBe('http')
    expect(codeLanguage('bridge:typescript', 'x', 'ts')).toBe('typescript')
    expect(codeLanguage(null, '{}', 'json')).toBe('json')
  })
})

describe('2.5 grafo', () => {
  const contentDir = () =>
    makeContent([
      topic('a', { order: 1, concepts: { ca: 'Concepto A' } }),
      topic('b', { order: 2, related: ['ca'] }),
      topic('c', { order: 3, related: ['ca'], sections: { ...BASE_SECTIONS, problem: 'Ver [[a]].' } }),
    ])

  it('dos ejecuciones producen el mismo archivo', async () => {
    const dir = contentDir()
    const g1 = JSON.stringify((await buildContent(dir)).graph)
    const g2 = JSON.stringify((await buildContent(dir)).graph)
    expect(g1).toBe(g2)
  })

  it('un concepto relacionado desde dos temas es un solo nodo', async () => {
    const { graph } = await buildContent(contentDir())
    expect(graph.nodes.filter((n) => n.id === 'ca')).toHaveLength(1)
    const touching = graph.links.filter((l) => l.source === 'ca' || l.target === 'ca')
    expect(touching.map((l) => l.kind).sort()).toEqual(['hierarchy', 'related', 'related'])
  })

  it('incluye enlaces de las tres fuentes', async () => {
    const { graph } = await buildContent(contentDir())
    expect(new Set(graph.links.map((l) => l.kind))).toEqual(new Set(['hierarchy', 'related', 'mention']))
    expect(graph.links).toContainEqual({ source: 'c', target: 'a', kind: 'mention' })
  })

  it('una pista sin temas produce un nodo marcado como vacío y sin hijos', async () => {
    const { graph } = await buildContent(contentDir())
    const sql = graph.nodes.find((n) => n.id === 'sql')!
    expect(sql).toMatchObject({ type: 'track', empty: true })
    expect(graph.links.some((l) => l.source === 'sql' || l.target === 'sql')).toBe(false)
    expect(graph.tracks.find((t) => t.id === 'sql')!.empty).toBe(true)
    expect(graph.tracks.find((t) => t.id === 'rest')!.empty).toBe(false)
  })

  it('las posiciones están asentadas y son finitas', async () => {
    const { graph } = await buildContent(contentDir())
    for (const n of graph.nodes) for (const v of [n.x, n.y, n.z]) expect(Number.isFinite(v)).toBe(true)
  })
})

describe('2.6 salida', () => {
  it('escribe graph.json, search.<locale>.json y topics/<locale>/<id>.json', async () => {
    const dir = makeContent([topic('a', { concepts: { ca: 'A' }, exercises: [CHOICE, VERDICT] })])
    const out = await buildContent(dir)
    const outDir = path.join(dir, 'generated')
    const files = writeOutput(out, outDir).sort()
    expect(files).toEqual(['graph.json', 'search.en.json', 'search.es.json', 'topics/en/a.json', 'topics/es/a.json'])
    const t = JSON.parse(fs.readFileSync(path.join(outDir, 'topics/en/a.json'), 'utf8'))
    expect(t.title).toBe('a en')
    expect(t.exercises.map((g: { type: string }) => g.type)).toEqual(['choice', 'verdict'])
    const s = JSON.parse(fs.readFileSync(path.join(outDir, 'search.es.json'), 'utf8'))
    expect(s).toContainEqual(expect.objectContaining({ id: 'ca', type: 'concept', topic: 'a', topicName: 'a es' }))
  })
})

describe('9.1–9.2 enlaces en el contenido real de REST', () => {
  const appRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
  const restDir = path.join(appRoot, 'content', 'rest')

  it('ningún texto se refiere a otro tema por su número', () => {
    const offenders: string[] = []
    for (const id of fs.readdirSync(restDir)) {
      for (const f of ['es.md', 'en.md']) {
        const text = fs.readFileSync(path.join(restDir, id, f), 'utf8')
        if (/\((tema|topic) \d+/.test(text)) offenders.push(`${id}/${f}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('enlace en el texto: metodos-http y cors aparecen conectados aunque cors no esté en sus relacionados', () => {
    const meta = YAML.parse(fs.readFileSync(path.join(restDir, 'metodos-http', 'meta.yaml'), 'utf8')) as { related: string[] }
    expect(meta.related).not.toContain('cors')
    const graph = JSON.parse(fs.readFileSync(path.join(appRoot, 'src', 'generated', 'graph.json'), 'utf8')) as { links: Array<{ source: string; target: string; kind: string }> }
    const pair = new Set(['metodos-http', 'cors'])
    expect(graph.links.some((l) => pair.has(l.source) && pair.has(l.target) && l.source !== l.target)).toBe(true)
  })
})
