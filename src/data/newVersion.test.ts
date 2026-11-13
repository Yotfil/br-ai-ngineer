/**
 * Comprobación de versión nueva y recarga única (despliegue-automatico, design.md decisiones 2 y 11).
 */
import { describe, expect, it, vi } from 'vitest'
import { RELOADED_FOR_KEY, reloadIfNewVersion, withNewVersionCheck, type VersionDeps } from './newVersion.ts'

const page = (src: string) => `<!doctype html><html><head><script type="module" crossorigin src="${src}"></script></head><body></body></html>`
const CURRENT = '/assets/index-OLD.js'
const NEW = '/assets/index-NEW.js'

function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    get length() {
      return m.size
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  }
}

function deps(over: Partial<VersionDeps> = {}) {
  const storage = memoryStorage()
  const d = {
    fetchIndex: vi.fn(async () => page(NEW)),
    currentEntry: () => CURRENT,
    storage: () => storage,
    reload: vi.fn(),
    ...over,
  }
  return { d, storage }
}

describe('reloadIfNewVersion (decisión 2)', () => {
  it('versión nueva: guarda la dirección nueva y recarga', async () => {
    const { d, storage } = deps()
    expect(await reloadIfNewVersion(d)).toBe(true)
    expect(d.reload).toHaveBeenCalledOnce()
    expect(storage.getItem(RELOADED_FOR_KEY)).toBe(NEW)
    expect(d.fetchIndex).toHaveBeenCalledOnce()
  })

  it('misma versión: no recarga', async () => {
    const { d } = deps({ fetchIndex: vi.fn(async () => page(CURRENT)) })
    expect(await reloadIfNewVersion(d)).toBe(false)
    expect(d.reload).not.toHaveBeenCalled()
  })

  it('petición fallida: no recarga', async () => {
    const { d } = deps({ fetchIndex: vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))) })
    expect(await reloadIfNewVersion(d)).toBe(false)
    expect(d.reload).not.toHaveBeenCalled()
  })

  it('respuesta sin script de entrada: no recarga', async () => {
    const { d } = deps({ fetchIndex: vi.fn(async () => '<!doctype html><title>Error</title><script type="module" src="/src/main.tsx"></script>') })
    expect(await reloadIfNewVersion(d)).toBe(false)
    expect(d.reload).not.toHaveBeenCalled()
  })

  it('segunda vez con la misma versión nueva: no vuelve a recargar', async () => {
    const { d, storage } = deps()
    storage.setItem(RELOADED_FOR_KEY, NEW)
    expect(await reloadIfNewVersion(d)).toBe(false)
    expect(d.reload).not.toHaveBeenCalled()
  })

  it('una versión todavía más nueva sí recarga otra vez', async () => {
    const { d, storage } = deps()
    storage.setItem(RELOADED_FOR_KEY, '/assets/index-MID.js')
    expect(await reloadIfNewVersion(d)).toBe(true)
    expect(storage.getItem(RELOADED_FOR_KEY)).toBe(NEW)
  })

  it('almacenamiento no disponible: no recarga', async () => {
    const { d } = deps({
      storage: () => {
        throw new DOMException('denied', 'SecurityError')
      },
    })
    expect(await reloadIfNewVersion(d)).toBe(false)
    expect(d.reload).not.toHaveBeenCalled()
  })

  it('almacenamiento que no deja escribir: no recarga', async () => {
    const storage = memoryStorage()
    storage.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
    const { d } = deps({ storage: () => storage })
    expect(await reloadIfNewVersion(d)).toBe(false)
    expect(d.reload).not.toHaveBeenCalled()
  })
})

describe('withNewVersionCheck', () => {
  it('si la carga va bien, no consulta la versión', async () => {
    const { d } = deps()
    expect(await withNewVersionCheck(async () => 42, d)).toBe(42)
    expect(d.fetchIndex).not.toHaveBeenCalled()
  })

  it('si falla sin versión nueva, rechaza con el error original', async () => {
    const { d } = deps({ fetchIndex: vi.fn(async () => page(CURRENT)) })
    const err = new Error('chunk')
    await expect(withNewVersionCheck(() => Promise.reject(err), d)).rejects.toBe(err)
  })

  it('si falla con versión nueva, recarga y no se resuelve (sigue el estado de carga)', async () => {
    const { d } = deps()
    const settled = vi.fn()
    withNewVersionCheck(() => Promise.reject(new Error('chunk')), d).then(settled, settled)
    await vi.waitFor(() => expect(d.reload).toHaveBeenCalledOnce())
    await new Promise((r) => setTimeout(r, 10))
    expect(settled).not.toHaveBeenCalled()
  })
})
