// @vitest-environment node
/** Pruebas del modelo de contenido ampliado en el cambio contenido-claro (grupo 1: pasos y paridad de código). */
import { describe, expect, it } from 'vitest'
import { buildContent } from './build.ts'
import { BASE_SECTIONS, makeContent, topic } from './fixtures.ts'
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
