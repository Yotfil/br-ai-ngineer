/**
 * Valida el español de un tema antes de que exista su traducción.
 * Copia `content/` a una carpeta temporal del sistema y, donde falta `en.md`, pone una copia de `es.md` en su lugar.
 * Los temas pasados como argumento usan también `es.md` como inglés (para los que aún tienen el inglés antiguo).
 * No toca `content/` ni `src/generated/`, y varias ejecuciones a la vez no se pisan.
 *
 * Uso: npx tsx scripts/check/content-es.ts [id-de-tema ...]
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildContent } from '../content/build.ts'
import { CONTENT, reportError } from './shared.ts'

const forced = new Set(process.argv.slice(2))
const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'content-es-'))

try {
  fs.cpSync(CONTENT, copy, { recursive: true })
  const filled: string[] = []
  for (const track of fs.readdirSync(copy)) {
    const trackDir = path.join(copy, track)
    if (!fs.statSync(trackDir).isDirectory()) continue
    for (const topic of fs.readdirSync(trackDir)) {
      const dir = path.join(trackDir, topic)
      const es = path.join(dir, 'es.md')
      const en = path.join(dir, 'en.md')
      if (fs.existsSync(es) && (!fs.existsSync(en) || forced.has(topic))) {
        fs.copyFileSync(es, en)
        filled.push(topic)
      }
    }
  }
  const out = await buildContent(copy)
  const provisional = filled.join(', ') || 'ninguno'
  console.log(`[check-es] OK: ${out.topics.es.length} temas, ${out.graph.nodes.length} nodos, ${out.graph.links.length} enlaces (en.md provisional: ${provisional})`)
} catch (e) {
  reportError('check-es', e)
} finally {
  fs.rmSync(copy, { recursive: true, force: true })
}
