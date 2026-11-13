import { describe, expect, it } from 'vitest'
import { searchDocs } from '../data/content.ts'
import { buildSearchIndex } from './searchIndex.ts'

const es = buildSearchIndex(searchDocs.es)
const en = buildSearchIndex(searchDocs.en)
const ids = (q: string, idx = es) => idx.search(q).map((h) => h.id)

describe('6.1 búsqueda', () => {
  it('"idemp" trae los dos temas con resumen y los dos conceptos con su tema', () => {
    const hits = es.search('idemp')
    const byId = new Map(hits.map((h) => [h.id, h]))
    expect(byId.get('metodos-seguros-idempotentes')).toMatchObject({ type: 'topic', summary: expect.any(String) })
    expect(byId.get('idempotencia-en-la-practica')).toMatchObject({ type: 'topic', summary: expect.any(String) })
    expect(byId.get('idempotencia')).toMatchObject({ type: 'concept', topic: 'metodos-seguros-idempotentes', topicName: 'Métodos seguros e idempotentes' })
    expect(byId.get('clave-de-idempotencia')).toMatchObject({ type: 'concept', topicName: 'Idempotencia en la práctica: claves y pagos duplicados' })
    for (const h of hits) expect(h.track).toBe('rest')
  })

  it('sin coincidencias devuelve una lista vacía', () => {
    expect(es.search('zzxqv')).toEqual([])
  })

  it('"paginacion" sin tilde trae el concepto paginación del tema "Diseño de una API REST"', () => {
    const h = es.search('paginacion').find((x) => x.id === 'paginacion')
    expect(h).toMatchObject({ name: 'paginación', topicName: 'Diseño de una API REST' })
  })

  it('"idenpotencia" con error de tipeo trae el concepto idempotencia', () => {
    expect(ids('idenpotencia')).toContain('idempotencia')
  })

  it('"idempotency" con la interfaz en español trae el concepto idempotencia', () => {
    expect(ids('idempotency')).toContain('idempotencia')
  })

  it('9.3 título de un tema en el otro idioma: "status codes" con la interfaz en español', () => {
    const hit = es.search('status codes').find((h) => h.id === 'codigos-de-estado')
    expect(hit).toMatchObject({ type: 'topic', name: 'Códigos de estado y sus confusiones clásicas' })
  })

  it('ignora mayúsculas', () => {
    expect(ids('CORS')).toEqual(ids('cors'))
    expect(ids('cors')).toContain('cors-concepto')
  })

  it('una pista "Próximamente" no produce resultados', () => {
    expect(es.search('Git')).toEqual([])
    // "SQL" aparece en temas de Python (SQLAlchemy, SQLModel), pero ningún resultado es de la pista SQL.
    expect(es.search('SQL').filter((h) => h.track === 'sql')).toEqual([])
    expect(en.search('OOP')).toEqual([])
  })

  it('en inglés también encuentra por el nombre en español', () => {
    expect(ids('idempotencia', en)).toContain('idempotencia')
  })
})
