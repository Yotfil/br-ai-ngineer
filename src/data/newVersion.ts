/**
 * Recuperación ante una versión nueva (despliegue-automatico, design.md decisión 2). Común a temas y demos:
 * al fallar una carga diferida se compara el script de entrada de la página en ejecución con el de
 * `/index.html` recién pedido; si difieren, se recarga una sola vez por esa versión.
 */

/** Clave de `sessionStorage` con la dirección del script de entrada por la que ya se recargó. */
export const RELOADED_FOR_KEY = 'ai-engineer-path:reloaded-for'

const ENTRY_SELECTOR = 'script[type="module"][src^="/assets/"]'

/** Dirección del script de entrada (`<script type="module">` cuyo `src` empieza por `/assets/`), o `null`. */
export function entryScriptOf(doc: ParentNode): string | null {
  return doc.querySelector(ENTRY_SELECTOR)?.getAttribute('src') ?? null
}

export interface VersionDeps {
  /** HTML actual de `/index.html`, sin caché. Rechaza si la petición falla. */
  fetchIndex: () => Promise<string>
  /** Script de entrada de la página en ejecución. */
  currentEntry: () => string | null
  /** `sessionStorage`; puede lanzar si no está disponible. */
  storage: () => Storage
  reload: () => void
}

export const browserDeps: VersionDeps = {
  fetchIndex: async () => {
    const r = await fetch('/index.html', { cache: 'no-store' })
    if (!r.ok) throw new Error(`index.html: ${r.status}`)
    return r.text()
  },
  currentEntry: () => entryScriptOf(document),
  storage: () => window.sessionStorage,
  reload: () => window.location.reload(),
}

/**
 * Comprueba si hay una versión nueva publicada y, si procede, recarga la página.
 * Devuelve `true` si se pidió la recarga; `false` si hay que mostrar el estado de error.
 */
export async function reloadIfNewVersion(deps: VersionDeps = browserDeps): Promise<boolean> {
  let html: string
  try {
    html = await deps.fetchIndex()
  } catch {
    return false
  }
  const fresh = entryScriptOf(new DOMParser().parseFromString(html, 'text/html'))
  const current = deps.currentEntry()
  if (!fresh || !current || fresh === current) return false
  try {
    const storage = deps.storage()
    if (storage.getItem(RELOADED_FOR_KEY) === fresh) return false
    storage.setItem(RELOADED_FOR_KEY, fresh)
  } catch {
    return false
  }
  deps.reload()
  return true
}

/**
 * Envuelve una carga diferida: si falla y hay versión nueva, recarga y la promesa no se resuelve nunca
 * (se sigue mostrando el estado de carga hasta que la página se recarga); si no, rechaza con el error.
 */
export function withNewVersionCheck<T>(load: () => Promise<T>, deps: VersionDeps = browserDeps): Promise<T> {
  return load().catch(async (err: unknown) => {
    if (await reloadIfNewVersion(deps)) return new Promise<T>(() => {})
    throw err
  })
}
