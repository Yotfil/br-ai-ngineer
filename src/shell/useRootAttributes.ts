import { useEffect } from 'react'

/** Refleja estado global en atributos del elemento raíz (modos del lector, animaciones, lector abierto). */
export function useRootAttributes(attrs: Record<string, string | boolean | undefined>): void {
  const key = JSON.stringify(attrs)
  useEffect(() => {
    const el = document.documentElement
    for (const [k, v] of Object.entries(attrs)) {
      const name = `data-${k}`
      if (v === false || v === undefined) el.removeAttribute(name)
      else el.setAttribute(name, v === true ? '' : v)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
