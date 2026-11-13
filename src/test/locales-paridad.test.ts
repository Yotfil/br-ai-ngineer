/// <reference types="node" />
/**
 * Paridad de textos de interfaz entre `src/locales/es.json` y `en.json`
 * (despliegue-automatico, specs/localization; design.md decisión 11).
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

type Texts = Record<string, unknown>
type Lang = 'es' | 'en'

/** Valores finales por clave completa (`reader.retry`); los objetos solo agrupan. */
function leaves(obj: Texts, prefix = '', out = new Map<string, unknown>()): Map<string, unknown> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) leaves(v as Texts, key, out)
    else out.set(key, v)
  }
  return out
}

const markers = (s: string) => new Set([...s.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g)].map((m) => m[1]))
const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x))

/** Lista de fallos de paridad; vacía si los textos están en paridad. */
export function parityErrors(texts: Record<Lang, Texts>): string[] {
  const errors: string[] = []
  const flat = { es: leaves(texts.es), en: leaves(texts.en) }
  const langs: Lang[] = ['es', 'en']
  for (const lang of langs) {
    const other = lang === 'es' ? 'en' : 'es'
    for (const [key, value] of flat[lang]) {
      if (!flat[other].has(key)) errors.push(`falta la clave "${key}" en ${other}`)
      if (typeof value !== 'string') errors.push(`la clave "${key}" en ${lang} no es un texto`)
      else if (value.trim() === '') errors.push(`la clave "${key}" está vacía en ${lang}`)
    }
  }
  for (const [key, es] of flat.es) {
    const en = flat.en.get(key)
    if (typeof es === 'string' && typeof en === 'string' && !sameSet(markers(es), markers(en)))
      errors.push(`la clave "${key}" no usa los mismos marcadores en es y en`)
  }
  return errors
}

const read = (lang: Lang) => JSON.parse(fs.readFileSync(path.join(process.cwd(), `src/locales/${lang}.json`), 'utf8')) as Texts

describe('paridad de textos de interfaz (specs/localization)', () => {
  it('Clave ausente en un idioma: falla y nombra la clave y el idioma', () => {
    expect(parityErrors({ es: { a: { b: 'Hola', c: 'Sí' } }, en: { a: { b: 'Hi' } } })).toEqual(['falta la clave "a.c" en en'])
    expect(parityErrors({ es: { x: 'Uno' }, en: { x: 'One', y: 'Two' } })).toEqual(['falta la clave "y" en es'])
  })

  it('Texto vacío o solo espacios: falla y nombra la clave y el idioma', () => {
    expect(parityErrors({ es: { a: '   ' }, en: { a: 'A' } })).toEqual(['la clave "a" está vacía en es'])
    expect(parityErrors({ es: { a: { b: 'B' } }, en: { a: { b: '' } } })).toEqual(['la clave "a.b" está vacía en en'])
  })

  it('un valor final que no es texto también falla', () => {
    expect(parityErrors({ es: { n: 3, l: ['x'], z: null }, en: { n: 'tres', l: 'x', z: 'z' } })).toEqual([
      'la clave "n" en es no es un texto',
      'la clave "l" en es no es un texto',
      'la clave "z" en es no es un texto',
    ])
  })

  it('Marcadores distintos: falla y nombra la clave', () => {
    expect(parityErrors({ es: { r: { t: 'Abrir {{topic}}' } }, en: { r: { t: 'Open it' } } })).toEqual([
      'la clave "r.t" no usa los mismos marcadores en es y en',
    ])
  })

  it('se comparan los nombres de marcador, no el orden ni las repeticiones', () => {
    expect(parityErrors({ es: { a: '{{x}} y {{y}} y {{x}}' }, en: { a: '{{y}} then {{x}}' } })).toEqual([])
  })

  it('Textos en paridad: los archivos reales cumplen', () => {
    const texts = { es: read('es'), en: read('en') }
    expect(parityErrors(texts)).toEqual([])
    expect(leaves(texts.es).size).toBe(leaves(texts.en).size)
  })
})
