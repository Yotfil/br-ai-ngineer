import { Marked, type Tokens } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { createHighlighter, type Highlighter, type ThemeRegistration } from 'shiki'
import type { SectionKey } from '../../src/content/model.ts'

export const CODE_LANGS = ['python', 'http', 'json', 'bash', 'typescript'] as const
export type CodeLang = (typeof CODE_LANGS)[number]

/** Paleta de bloques de código de mockups/ui-v2.html (`pre`, `.c`, `.k`, `.s`). */
const cerebroTheme: ThemeRegistration = {
  name: 'cerebro',
  type: 'dark',
  colors: { 'editor.background': '#00000000', 'editor.foreground': '#cfd3ea' },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#5f6388' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.logical', 'constant.language', 'support.type.builtin'],
      settings: { foreground: '#7dd3fc' },
    },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string'], settings: { foreground: '#fcd34d' } },
  ],
}

let highlighter: Promise<Highlighter> | null = null
export function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: [cerebroTheme], langs: [...CODE_LANGS] })
  return highlighter
}

const FENCE_ALIASES: Record<string, CodeLang> = { py: 'python', python: 'python', http: 'http', json: 'json', bash: 'bash', sh: 'bash', ts: 'typescript', typescript: 'typescript' }

/**
 * Regla de design.md decisión 2: `code:server` es python; en `code:wire`, `bad` y `good` el bloque es
 * python si contiene `def `, `@app.` o `import `, y http en caso contrario. En el resto se respeta el
 * lenguaje de la valla (por defecto, sin resaltado de lenguaje: se trata como texto http).
 */
export function codeLanguage(section: SectionKey | null, code: string, fence: string | undefined): CodeLang {
  if (section === 'code:server') return 'python'
  if (section === 'code:wire' || section === 'bad' || section === 'good') {
    return /def |@app\.|import /.test(code) ? 'python' : 'http'
  }
  return FENCE_ALIASES[(fence ?? '').toLowerCase()] ?? 'http'
}

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'b', 'strong', 'i', 'em', 'code', 'ul', 'ol', 'li', 'a', 'br', 'blockquote', 'pre', 'span', 'sup', 'sub', 'del', 'kbd'],
  allowedAttributes: { a: ['href', 'data-node'], pre: ['data-code'] },
  allowedSchemes: ['http', 'https'],
  allowProtocolRelative: false,
}

/** Sanea HTML de texto (no de código ya resaltado). */
export function sanitize(html: string): string {
  return sanitizeHtml(html, SANITIZE)
}

export type MentionResolver = (id: string) => { href: string; name: string } | null

function replaceMentions(md: string, resolve: MentionResolver): string {
  return md.replace(/\[\[([a-z0-9]+(?:-[a-z0-9]+)*)\]\]/g, (whole, id: string) => {
    const r = resolve(id)
    return r ? `<a href="${r.href}" data-node="${id}">${r.name.replace(/</g, '&lt;')}</a>` : whole
  })
}

/** Convierte una sección Markdown a HTML saneado, con los bloques de código resaltados por Shiki. */
export async function renderMarkdown(md: string, section: SectionKey | null, resolve: MentionResolver = () => null): Promise<string> {
  const hl = await getHighlighter()
  const blocks: string[] = []
  const marked = new Marked({
    renderer: {
      code(token: Tokens.Code) {
        const lang = codeLanguage(section, token.text, token.lang)
        blocks.push(hl.codeToHtml(token.text, { lang, theme: 'cerebro' }))
        return `<pre data-code="${blocks.length - 1}"></pre>`
      },
    },
  })
  const html = sanitize(await marked.parse(replaceMentions(md, resolve)))
  return html.replace(/<pre data-code="(\d+)"><\/pre>/g, (_, i: string) => blocks[Number(i)])
}

/** Markdown inline (enunciados y opciones de ejercicios) a HTML saneado. */
export async function renderInline(md: string, resolve: MentionResolver = () => null): Promise<string> {
  const marked = new Marked()
  return sanitize(await marked.parseInline(replaceMentions(md, resolve)))
}
