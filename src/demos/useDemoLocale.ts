import { useTranslation } from 'react-i18next'
import type { Locale } from '../content/model.ts'

/** Textos propios de cada demo, por idioma. */
export function useDemoText<T>(text: Record<Locale, T>): T {
  const { i18n } = useTranslation()
  return text[(i18n.language as Locale) in text ? (i18n.language as Locale) : 'es']
}
