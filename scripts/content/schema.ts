import { z } from 'zod'
import { FREQS, KINDS } from '../../src/content/model.ts'

/** Identificador estable: minúsculas, dígitos y guiones. */
export const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'identificador inválido (minúsculas, dígitos y guiones)')

const localizedName = z.object({ es: z.string().min(1), en: z.string().min(1) }).strict()

export const trackSchema = z
  .object({
    id: idSchema,
    abbr: z.string().regex(/^[A-Z]{2}$/, 'abbr debe ser de dos letras mayúsculas'),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'color debe ser hexadecimal #rrggbb'),
    order: z.number().int(),
    name: localizedName,
    /** Grupos de temas, en orden (decisión 5 de pista-python). */
    groups: z.array(z.object({ id: idSchema, name: localizedName }).strict()).min(1).optional(),
  })
  .strict()
  .superRefine((t, ctx) => {
    const seen = new Set<string>()
    for (const [i, g] of (t.groups ?? []).entries()) {
      if (seen.has(g.id)) ctx.addIssue({ code: 'custom', path: ['groups', i, 'id'], message: `grupo "${g.id}" repetido en la pista "${t.id}"` })
      seen.add(g.id)
    }
  })

export const tracksFileSchema = z.array(trackSchema).min(1)

/** Campos de meta.yaml que una entrada de proyecto no puede declarar (design.md de contenido-claro, decisión 6). */
const NOT_IN_PROJECT = ['freq', 'concepts', 'related', 'demo'] as const

export const metaSchema = z
  .object({
    id: idSchema,
    track: idSchema,
    order: z.number().int(),
    /** Obligatorio en un tema; prohibido en una entrada de proyecto. */
    freq: z.enum(FREQS).optional(),
    concepts: z.array(idSchema).optional(),
    related: z.array(idSchema).optional(),
    demo: z.string().min(1).optional(),
    /** Id de un grupo de su pista: obligatorio si la pista declara grupos, prohibido si no. */
    group: idSchema.optional(),
    /** `project`: entrada de proyecto. Sin `kind`, la entrada es un tema. */
    kind: z.enum(KINDS).optional(),
    /** Temas que reúne una entrada de proyecto: obligatorio en ella, con al menos dos; prohibido en un tema. */
    covers: z.array(idSchema).optional(),
  })
  .strict()
  .superRefine((m, ctx) => {
    const issue = (field: string, message: string) => ctx.addIssue({ code: 'custom', path: [field], message })
    if (m.kind === 'project') {
      for (const f of NOT_IN_PROJECT) {
        if (m[f] !== undefined) issue(f, `la entrada de proyecto "${m.id}" no puede declarar "${f}"`)
      }
      if (m.covers === undefined) issue('covers', `la entrada de proyecto "${m.id}" debe declarar los temas que reúne (covers)`)
      else if (m.covers.length < 2) issue('covers', `la entrada de proyecto "${m.id}" debe reunir al menos 2 temas`)
      else {
        const repeated = new Set(m.covers.filter((c, i) => m.covers!.indexOf(c) !== i))
        for (const c of repeated) issue('covers', `la entrada de proyecto "${m.id}" repite el tema "${c}"`)
      }
    } else {
      if (m.freq === undefined) issue('freq', `el tema "${m.id}" debe declarar su frecuencia (freq)`)
      if (m.covers !== undefined) issue('covers', `el tema "${m.id}" no es una entrada de proyecto (kind: project) y no puede declarar covers`)
    }
  })
  .transform((m) => ({ ...m, concepts: m.concepts ?? [], related: m.related ?? [] }))

const choiceItem = z
  .object({
    q: z.string().min(1),
    /** Código sin valla; se muestra resaltado en python entre el enunciado y las opciones. */
    code: z.string().min(1).optional(),
    options: z.array(z.string().min(1)).min(2),
    answer: z.number().int().min(0),
    why: z.string().min(1),
  })
  .strict()
  .refine((it) => it.answer < it.options.length, { message: 'answer fuera del rango de options', path: ['answer'] })

const verdictItem = z
  .object({
    statement: z.string().min(1),
    ok: z.boolean(),
    why: z.string().min(1),
  })
  .strict()

const classifyItem = z
  .object({
    text: z.string().min(1),
    category: z.string().min(1),
    why: z.string().min(1),
  })
  .strict()

const classifyGroup = z
  .object({
    type: z.literal('classify'),
    prompt: z.string().min(1),
    categories: z.array(z.string().min(1)).min(2, 'categories necesita al menos 2 categorías'),
    items: z.array(classifyItem).min(1),
  })
  .strict()
  .superRefine((g, ctx) => {
    if (new Set(g.categories).size !== g.categories.length) ctx.addIssue({ code: 'custom', path: ['categories'], message: 'las categorías deben ser distintas' })
    g.items.forEach((it, i) => {
      if (!g.categories.includes(it.category)) {
        ctx.addIssue({ code: 'custom', path: ['items', i, 'category'], message: `la categoría "${it.category}" no está en categories` })
      }
    })
  })

export const exerciseGroupSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), prompt: z.string().min(1), items: z.array(choiceItem).min(1) }).strict(),
  z.object({ type: z.literal('verdict'), prompt: z.string().min(1), items: z.array(verdictItem).min(1) }).strict(),
  classifyGroup,
])

export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    short: z
      .string()
      .min(1)
      .max(32, 'short no puede superar 32 caracteres')
      .refine((s) => !/[<>]/.test(s), 'short no puede contener HTML')
      .optional(),
    summary: z
      .string()
      .min(1)
      .max(140, 'summary no puede superar 140 caracteres')
      .refine((s) => !/[<>]/.test(s), 'summary no puede contener HTML'),
    concepts: z
      .record(idSchema, z.object({ name: z.string().min(1), aliases: z.array(z.string().min(1)).default([]) }).strict())
      .default({}),
    exercises: z.array(exerciseGroupSchema).nullish().transform((v) => v ?? []),
  })
  .strict()

export type TrackDef = z.infer<typeof trackSchema>
export type TopicMeta = z.infer<typeof metaSchema>
export type Frontmatter = z.infer<typeof frontmatterSchema>

/** Error de contenido: siempre nombra el archivo o el tema implicado. */
export class ContentError extends Error {
  readonly problems: string[]
  constructor(problems: string[]) {
    super(`Contenido inválido:\n${problems.map((p) => `  - ${p}`).join('\n')}`)
    this.name = 'ContentError'
    this.problems = problems
  }
}

/** Valida `data` con `schema`; devuelve el dato o añade a `problems` un mensaje por cada fallo que nombra `file`. */
export function parseWith<S extends z.ZodType>(schema: S, data: unknown, file: string, problems: string[]): z.output<S> | null {
  const res = schema.safeParse(data)
  if (res.success) return res.data
  for (const issue of res.error.issues) {
    const where = issue.path.length ? issue.path.join('.') : '(raíz)'
    problems.push(`${file}: ${where}: ${issue.message}`)
  }
  return null
}
