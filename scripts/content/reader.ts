import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import YAML from 'yaml'
import { LOCALES, type BodySectionKey, type Locale } from '../../src/content/model.ts'
import {
  ContentError,
  frontmatterSchema,
  metaSchema,
  parseWith,
  tracksFileSchema,
  type Frontmatter,
  type TopicMeta,
  type TrackDef,
} from './schema.ts'
import { splitSections } from './sections.ts'

export interface LocalizedTopic {
  file: string
  front: Frontmatter
  sections: Partial<Record<BodySectionKey, string>>
}

export interface RawTopic {
  /** Ruta relativa a `content/`, p. ej. `rest/idempotencia`. */
  dir: string
  meta: TopicMeta
  locales: Partial<Record<Locale, LocalizedTopic>>
}

export interface RawContent {
  tracks: TrackDef[]
  topics: RawTopic[]
}

const isDir = (p: string) => fs.existsSync(p) && fs.statSync(p).isDirectory()

/** Interpreta YAML (los errores de sintaxis se informan con el archivo). */
function readYaml(abs: string, rel: string, problems: string[]): unknown {
  try {
    return YAML.parse(fs.readFileSync(abs, 'utf8'))
  } catch (e) {
    problems.push(`${rel}: YAML inválido: ${(e as Error).message}`)
    return undefined
  }
}

/** Lee `content/` completo. Lanza `ContentError` con todos los problemas de forma encontrados. */
export function readContent(root: string): RawContent {
  const problems: string[] = []
  const tracksPath = path.join(root, 'tracks.yaml')
  let tracks: TrackDef[] = []
  if (!fs.existsSync(tracksPath)) problems.push('tracks.yaml: no existe')
  else tracks = parseWith(tracksFileSchema, readYaml(tracksPath, 'tracks.yaml', problems), 'tracks.yaml', problems) ?? []

  const topics: RawTopic[] = []
  const trackDirs = fs.readdirSync(root).filter((d) => isDir(path.join(root, d))).sort()
  for (const trackDir of trackDirs) {
    const topicDirs = fs.readdirSync(path.join(root, trackDir)).filter((d) => isDir(path.join(root, trackDir, d))).sort()
    for (const topicDir of topicDirs) {
      const dir = `${trackDir}/${topicDir}`
      const abs = path.join(root, trackDir, topicDir)
      const metaRel = `${dir}/meta.yaml`
      if (!fs.existsSync(path.join(abs, 'meta.yaml'))) {
        problems.push(`${metaRel}: no existe (tema "${topicDir}")`)
        continue
      }
      const meta = parseWith(metaSchema, readYaml(path.join(abs, 'meta.yaml'), metaRel, problems), metaRel, problems)
      if (!meta) continue
      if (meta.id !== topicDir) problems.push(`${metaRel}: id "${meta.id}" no coincide con la carpeta "${topicDir}"`)
      if (meta.track !== trackDir) problems.push(`${metaRel}: track "${meta.track}" no coincide con la carpeta "${trackDir}"`)

      const locales: RawTopic['locales'] = {}
      for (const locale of LOCALES) {
        const rel = `${dir}/${locale}.md`
        const file = path.join(abs, `${locale}.md`)
        if (!fs.existsSync(file)) {
          problems.push(`tema "${meta.id}": falta el idioma "${locale}" (${rel})`)
          continue
        }
        let parsed: matter.GrayMatterFile<string>
        try {
          parsed = matter(fs.readFileSync(file, 'utf8'))
        } catch (e) {
          problems.push(`${rel}: frontmatter inválido: ${(e as Error).message}`)
          continue
        }
        if (meta.kind === 'project') {
          // Decisión 6 de contenido-claro: una entrada de proyecto lleva title, summary y short; ni concepts ni exercises.
          for (const f of ['concepts', 'exercises']) {
            if (Object.hasOwn(parsed.data, f)) problems.push(`${rel}: la entrada de proyecto "${meta.id}" no puede declarar "${f}"`)
          }
        }
        const front = parseWith(frontmatterSchema, parsed.data, rel, problems)
        const sections = splitSections(parsed.content, rel, problems, meta.kind)
        if (front) locales[locale] = { file: rel, front, sections }
      }
      topics.push({ dir, meta, locales })
    }
  }
  if (problems.length) throw new ContentError(problems)
  return { tracks, topics }
}
