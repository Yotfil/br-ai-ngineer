import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildContent, writeOutput } from './content/build.ts'
import { ContentError } from './content/schema.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = path.join(root, 'content')
const outDir = path.join(root, 'src', 'generated')

try {
  const out = await buildContent(contentDir)
  const files = writeOutput(out, outDir)
  const topics = out.topics.es.length
  console.log(`[content] ${topics} temas, ${out.graph.nodes.length} nodos, ${out.graph.links.length} enlaces → ${files.length} archivos en src/generated/`)
} catch (e) {
  if (e instanceof ContentError) {
    console.error(`[content] ${e.message}`)
    process.exit(1)
  }
  throw e
}
