import { useEffect, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import type { GraphData, Locale, SearchDoc } from './content/model.ts'
import { graph as generatedGraph, labelsFor, searchDocs } from './data/content.ts'
import i18n, { isLocale } from './i18n/index.ts'
import { resolveInitialLocale } from './i18n/initialLocale.ts'
import { usePrefs } from './prefs/PrefsContext.tsx'
import Shell from './shell/Shell.tsx'

export interface AppData {
  graph: GraphData
  docs: Record<Locale, SearchDoc[]>
}

const DEFAULT_DATA: AppData = { graph: generatedGraph, docs: searchDocs }

/** `/` redirige según la preferencia guardada, el idioma del navegador o español. */
export function RootRedirect() {
  const { prefs } = usePrefs()
  const langs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : []
  return <Navigate to={`/${resolveInitialLocale(prefs.locale, langs)}`} replace />
}

function LocaleRoute({ data }: { data: AppData }) {
  const params = useParams()
  const locale = params.locale
  const valid = isLocale(locale)
  // Una instancia por idioma de la ruta: el idioma sale de la dirección sin mutar estado global al renderizar.
  const i18nForRoute = useMemo(() => (valid ? i18n.cloneInstance({ lng: locale, initAsync: false }) : i18n), [locale, valid])
  useEffect(() => {
    if (valid && i18n.language !== locale) void i18n.changeLanguage(locale)
  }, [locale, valid])
  const labels = useMemo(() => (valid ? labelsFor(data.graph, data.docs[locale], locale) : {}), [data, locale, valid])
  if (!valid) return <Navigate to="/" replace />
  return (
    <I18nextProvider i18n={i18nForRoute}>
      <Shell locale={locale} path={params['*'] ?? ''} graph={data.graph} docs={data.docs} labels={labels} />
    </I18nextProvider>
  )
}

export default function App({ data = DEFAULT_DATA }: { data?: AppData }) {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/:locale/*" element={<LocaleRoute data={data} />} />
    </Routes>
  )
}
