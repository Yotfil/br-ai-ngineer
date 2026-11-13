import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../content/model.ts'
import en from '../locales/en.json'
import es from '../locales/es.json'

void i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...LOCALES],
  interpolation: { escapeValue: false },
  // Las claves de sección llevan dos puntos (code:wire, bridge:typescript).
  nsSeparator: false,
  initAsync: false,
})

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (LOCALES as readonly string[]).includes(v)

export default i18n
