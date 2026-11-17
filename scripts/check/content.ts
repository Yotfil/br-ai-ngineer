/**
 * Valida el contenido igual que `npm run content`, pero sin escribir `src/generated/`.
 * Sirve mientras el servidor de desarrollo está abierto: su vigilante compila `content/` y escribir a la vez lo deja sin datos.
 *
 * Uso: npx tsx scripts/check/content.ts [carpeta]   (por defecto, content/)
 */
import path from 'node:path'
import { buildContent } from '../content/build.ts'
import { CONTENT, reportError } from './shared.ts'

const dir = process.argv[2] ? path.resolve(process.argv[2]) : CONTENT

try {
  const out = await buildContent(dir)
  console.log(`[check] OK: ${out.topics.es.length} temas, ${out.graph.nodes.length} nodos, ${out.graph.links.length} enlaces`)
} catch (e) {
  reportError('check', e)
}
