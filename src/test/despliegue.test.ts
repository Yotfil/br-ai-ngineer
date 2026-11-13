/// <reference types="node" />
/**
 * Configuración del despliegue en el repositorio (despliegue-automatico, design.md decisiones 4, 5 y 6).
 * Que `dist/_headers` existe tras compilar se comprueba en la tarea de compilación.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8')

/** Quita los comentarios de JSONC (`//` y bloque) fuera de las cadenas. */
function parseJsonc(src: string): unknown {
  let out = ''
  let inStr = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inStr) {
      out += ch
      if (ch === '\\') out += src[++i] ?? ''
      else if (ch === '"') inStr = false
    } else if (ch === '"') {
      inStr = true
      out += ch
    } else if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++
      out += '\n'
    } else if (ch === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2) + 1
    } else out += ch
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'))
}

describe('wrangler.jsonc (decisión 4)', () => {
  const cfg = parseJsonc(read('wrangler.jsonc')) as Record<string, unknown>

  it('apunta al Worker br-ai-ngineer con las direcciones workers.dev activadas', () => {
    expect(cfg.name).toBe('br-ai-ngineer')
    expect(cfg.workers_dev).toBe(true)
    expect(cfg.preview_urls).toBe(true)
  })

  it('sirve dist/ como aplicación de una sola página', () => {
    expect(cfg.assets).toEqual({ directory: './dist', not_found_handling: 'single-page-application' })
  })

  it('tiene el bloque previews vacío y no tiene código de Worker', () => {
    expect(cfg.previews).toEqual({})
    expect(cfg).not.toHaveProperty('main')
  })
})

describe('versión de Wrangler (decisión 4)', () => {
  const pkg = JSON.parse(read('package.json')) as { devDependencies: Record<string, string> }
  const v = pkg.devDependencies.wrangler

  it('es exacta, de la serie 4 y no menor que 4.135.0', () => {
    expect(v).toMatch(/^\d+\.\d+\.\d+$/)
    const [major, minor] = v.split('.').map(Number)
    expect(major).toBe(4)
    expect(minor).toBeGreaterThanOrEqual(135)
  })
})

describe('.nvmrc (decisión 5)', () => {
  it('declara Node 24', () => {
    expect(read('.nvmrc').trim()).toBe('24')
  })
})

describe('public/_headers (decisión 6)', () => {
  it('tiene solo la regla de caché inmutable de /assets/*', () => {
    expect(read('public/_headers')).toBe('/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n')
  })
})
