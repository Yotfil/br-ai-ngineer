import { describe, expect, it } from 'vitest'

describe('humo', () => {
  it('ejecuta pruebas en jsdom', () => {
    expect(typeof document.createElement).toBe('function')
  })
})
