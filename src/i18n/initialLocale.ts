import { DEFAULT_LOCALE, LOCALES, type Locale } from '../content/model.ts'

/**
 * Idioma inicial al entrar sin idioma en la dirección (specs/localization, "Idioma inicial"):
 * preferencia guardada; si no hay, el idioma del navegador cuando sea español o inglés; si no, español.
 */
export function resolveInitialLocale(saved: Locale | undefined, browserLanguages: readonly string[]): Locale {
  if (saved) return saved
  for (const tag of browserLanguages) {
    const base = tag.toLowerCase().split('-')[0]
    if ((LOCALES as readonly string[]).includes(base)) return base as Locale
  }
  return DEFAULT_LOCALE
}
