import { z } from 'zod'
import { FREQS } from '../../src/content/model.ts'

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
  })
  .strict()

export const tracksFileSchema = z.array(trackSchema).min(1)

export const metaSchema = z
  .object({
    id: idSchema,
    track: idSchema,
    order: z.number().int(),
    freq: z.enum(FREQS),
    concepts: z.array(idSchema).default([]),
    related: z.array(idSchema).default([]),
    demo: z.string().min(1).optional(),
  })
  .strict()

const choiceItem = z
  .object({
    q: z.string().min(1),
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

export const exerciseGroupSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), prompt: z.string().min(1), items: z.array(choiceItem).min(1) }).strict(),
  z.object({ type: z.literal('verdict'), prompt: z.string().min(1), items: z.array(verdictItem).min(1) }).strict(),
])

export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
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
