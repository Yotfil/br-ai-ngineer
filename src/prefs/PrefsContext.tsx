import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { effectiveMotion, loadPrefs, savePrefs, type Motion, type Prefs } from './store.ts'

interface PrefsApi {
  prefs: Prefs
  motion: Motion
  systemReducedMotion: boolean
  update: (patch: Partial<Prefs>) => void
}

const Ctx = createContext<PrefsApi | null>(null)

function systemReduced(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())
  const [reduced] = useState(systemReduced)
  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      savePrefs(next)
      return next
    })
  }, [])
  const value = useMemo(() => ({ prefs, motion: effectiveMotion(prefs, reduced), systemReducedMotion: reduced, update }), [prefs, reduced, update])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePrefs(): PrefsApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePrefs fuera de PrefsProvider')
  return v
}
