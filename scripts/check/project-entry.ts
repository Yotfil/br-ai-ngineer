/**
 * Escenario "Entrada de proyecto válida" de specs/content-model, sobre el contenido real y sin escribir `src/generated/`.
 * Para cada entrada muestra, en los dos idiomas, su tipo, secciones y temas reunidos (con su pista), y comprueba
 * que no lleva frecuencia ni ejercicios, que su nodo del cerebro conserva el orden de `covers` y está conectado por
 * relación con cada tema reunido, y cuáles son el tema anterior y el siguiente de su pista.
 *
 * Uso: npx tsx scripts/check/project-entry.ts [id ...]   (sin ids: todas las entradas de proyecto)
 */
import { buildContent } from '../content/build.ts'
import { LOCALES } from '../../src/content/model.ts'
import { CONTENT, reportError } from './shared.ts'

let problems = 0
const expect = (ok: boolean, message: string) => {
  if (ok) return
  problems++
  console.log(`   PROBLEMA: ${message}`)
}

try {
  const out = await buildContent(CONTENT)
  const args = process.argv.slice(2)
  const ids = args.length ? args : out.topics.es.filter((t) => t.kind === 'project').map((t) => t.id)
  for (const id of ids) {
    const node = out.graph.nodes.find((n) => n.id === id)
    console.log(`\n${id}`)
    if (!node) {
      expect(false, 'no existe en el cerebro')
      continue
    }
    for (const lang of LOCALES) {
      const t = out.topics[lang].find((x) => x.id === id)
      if (!t) {
        expect(false, `no existe en "${lang}"`)
        continue
      }
      const keys = Object.keys(t.sections).join(', ')
      console.log(`${lang} | kind: ${t.kind ?? '—'} | freq: ${t.freq ?? '—'} | secciones: ${keys} | ejercicios: ${t.exercises.length}`)
      expect(t.kind === 'project', 'no es kind: project')
      expect(t.freq === undefined, 'declara frecuencia')
      expect(t.exercises.length === 0, 'tiene ejercicios')
      expect(keys === 'context, walkthrough', 'sus secciones no son context y walkthrough')
      const covers = t.covers ?? []
      const titles = covers.map((c) => {
        const topic = out.topics[lang].find((x) => x.id === c)
        return topic ? `${topic.title} (${topic.track})` : `¿${c}?`
      })
      console.log(`   reúne ${covers.length}: ${titles.join(' · ')}`)
    }
    const covers = node.covers ?? []
    const byTrack = new Map<string, number>()
    for (const c of covers) {
      const track = out.graph.nodes.find((n) => n.id === c)?.track ?? '?'
      byTrack.set(track, (byTrack.get(track) ?? 0) + 1)
    }
    console.log(`nodo: ${node.type}, pista ${node.track}, orden ${node.order}, grupo ${node.group ?? '—'}, kind ${node.kind ?? '—'}`)
    console.log(`   temas reunidos por pista: ${[...byTrack].map(([track, n]) => `${n} de ${track}`).join(', ')}`)
    const declared = out.topics.es.find((x) => x.id === id)?.covers ?? []
    expect(JSON.stringify(covers) === JSON.stringify(declared), 'el nodo no conserva el orden de covers')
    for (const c of covers) {
      const linked = out.graph.links.some(
        (l) => l.kind === 'related' && ((l.source === id && l.target === c) || (l.source === c && l.target === id)),
      )
      expect(linked, `sin conexión de relación con "${c}"`)
    }
    const track = out.graph.nodes
      .filter((n) => n.type === 'topic' && n.track === node.track)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const i = track.findIndex((n) => n.id === id)
    console.log(`   anterior: ${track[i - 1]?.id ?? '—'} | siguiente: ${track[i + 1]?.id ?? '—'}`)
  }
  console.log(problems ? `\n${problems} PROBLEMAS` : '\nTODO OK')
  if (problems) process.exitCode = 1
} catch (e) {
  reportError('check-entry', e)
}
