import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import type { GraphData, Locale, SearchDoc, Tab } from '../content/model.ts'
import Brain from '../graph/Brain.tsx'
import { homeTopic, indexGraph, relatedOf } from '../graph/relations.ts'
import type { BrainFocus } from '../graph/types.ts'
import { usePrefs } from '../prefs/PrefsContext.tsx'
import SearchBox from '../search/SearchBox.tsx'
import BottomBar from './BottomBar.tsx'
import Reader from './Reader.tsx'
import Related from './Related.tsx'
import Sidebar from './Sidebar.tsx'
import TopBar from './TopBar.tsx'
import { useMediaQuery } from './useMediaQuery.ts'
import { useRootAttributes } from './useRootAttributes.ts'
import styles from './Shell.module.css'

interface Props {
  locale: Locale
  /** Resto de la ruta tras el idioma, p. ej. `rest/cors`. */
  path: string
  graph: GraphData
  docs: Record<Locale, SearchDoc[]>
  labels: Record<string, string>
}

export default function Shell({ locale, path, graph, docs, labels }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { prefs, motion, update } = usePrefs()
  const isPhone = useMediaQuery('(max-width: 760px)')
  // Tramo de escritorio (decisión 9): por encima del de tableta.
  const isDesktop = !useMediaQuery('(max-width: 1080px)')

  const idx = useMemo(() => indexGraph(graph), [graph])
  const trackById = useMemo(() => new Map(graph.tracks.map((tr) => [tr.id, tr])), [graph])
  const topicsOf = useCallback((id: string) => idx.topicsOfTrack.get(id) ?? [], [idx])

  // ---------- Ruta → tema abierto ----------
  const segments = path.split('/').filter(Boolean)
  const routeTopic = segments.length === 2 ? idx.byId.get(segments[1]) : undefined
  const topic = routeTopic && routeTopic.type === 'topic' && routeTopic.track === segments[0] ? routeTopic : null
  const notFound = segments.length > 0 && !topic
  const hashId = decodeURIComponent(location.hash.slice(1))
  const hashConcept = topic && hashId && idx.byId.get(hashId)?.parent === topic.id ? hashId : null

  // Último tema mostrado: se conserva durante la transición de salida del lector.
  const [shown, setShown] = useState<string | null>(topic?.id ?? null)
  useEffect(() => {
    if (topic) setShown(topic.id)
  }, [topic])
  const shownTopic = shown ? idx.byId.get(shown) : undefined

  // ---------- Estado de navegación ----------
  const [tab, setTab] = useState<Tab>('understand')
  const [openTracks, setOpenTracks] = useState<Set<string>>(() => new Set(graph.tracks.filter((tr) => !tr.empty).slice(0, 1).map((tr) => tr.id)))
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [matches, setMatches] = useState<ReadonlySet<string> | null>(null)

  // Abrir otro tema: pestaña Entender, su pista desplegada; cambiar de idioma no la reinicia.
  const topicId = topic?.id ?? null
  useEffect(() => {
    if (!topicId) return
    setTab('understand')
    setSelectedTrack(null)
    const tr = idx.byId.get(topicId)?.track
    if (tr) setOpenTracks((s) => (s.has(tr) ? s : new Set(s).add(tr)))
  }, [topicId, idx])

  const go = useCallback(
    (id: string) => {
      const home = homeTopic(idx, id)
      if (!home) return
      const concept = home.id !== id ? `#${id}` : ''
      navigate(`/${locale}/${home.track}/${home.id}${concept}`)
    },
    [idx, locale, navigate],
  )
  const closeReader = useCallback(() => {
    if (topic) navigate(`/${locale}`)
  }, [topic, locale, navigate])

  const openTrackInSidebar = useCallback(
    (id: string) => {
      const tr = trackById.get(id)
      if (!tr || tr.empty) return
      if (prefs.sidebarCollapsed) update({ sidebarCollapsed: false })
      setOpenTracks((s) => new Set(s).add(id))
      setSelectedTrack(id)
    },
    [trackById, prefs.sidebarCollapsed, update],
  )

  const onSidebarTrack = (id: string) => {
    const tr = trackById.get(id)
    if (!tr || tr.empty) return
    if (prefs.sidebarCollapsed) {
      update({ sidebarCollapsed: false })
      setOpenTracks((s) => new Set(s).add(id))
      setSelectedTrack(id)
      return
    }
    const open = !openTracks.has(id)
    setOpenTracks((s) => {
      const n = new Set(s)
      if (open) n.add(id)
      else n.delete(id)
      return n
    })
    setSelectedTrack(open ? id : null)
  }

  // ---------- Cerebro ----------
  const onNodeOpen = useCallback(
    (id: string) => {
      const n = idx.byId.get(id)
      if (!n) return
      if (n.type === 'track') {
        if (isPhone) {
          if (!n.empty) setSelectedTrack(id)
        } else openTrackInSidebar(id)
      } else go(id)
    },
    [idx, go, openTrackInSidebar, isPhone],
  )
  const onBackgroundClick = useCallback(() => {
    setSelectedTrack(null)
    closeReader()
  }, [closeReader])

  const focus: BrainFocus = useMemo(
    () => ({ hovered, selected: selectedTrack ?? hashConcept ?? topicId, matches }),
    [hovered, selectedTrack, hashConcept, topicId, matches],
  )

  // ---------- Teclado: Escape cierra el lector ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const el = document.activeElement
      if (el instanceof HTMLInputElement) return
      closeReader()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeReader])

  const switchLocale = (l: Locale) => {
    update({ locale: l })
    if (l !== locale) navigate(`/${l}${path ? `/${path}` : ''}${location.hash}`)
  }

  useRootAttributes({ reading: !!topic, 'reader-mode': prefs.readerMode, motion, collapsed: prefs.sidebarCollapsed })
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // ---------- Lector ----------
  const list = shownTopic ? topicsOf(shownTopic.track) : []
  const pos = shownTopic ? list.findIndex((x) => x.id === shownTopic.id) : -1
  const neighbor = (i: number) => (i >= 0 && i < list.length ? { id: list[i].id, name: labels[list[i].id] ?? list[i].id } : null)
  const concepts = shownTopic ? (idx.conceptsOfTopic.get(shownTopic.id) ?? []) : []
  const related = shownTopic ? relatedOf(idx, shownTopic.id) : []
  const relatedPanel = (cls?: string) => (
    <Related concepts={concepts} related={related} tracks={trackById} labels={labels} onOpen={go} onHover={setHovered} className={cls} />
  )

  return (
    <>
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />
      <Brain
        graph={graph}
        labels={labels}
        ariaLabel={t('brain.label')}
        focus={focus}
        motion={motion}
        readerOpen={!!topic}
        onNodeHover={setHovered}
        onNodeOpen={onNodeOpen}
        onBackgroundClick={onBackgroundClick}
      />
      <div className="scrim" />
      {isDesktop && (
        // Decisión 18: ayuda de gestos, solo en escritorio y sin tema abierto; no intercepta el puntero.
        <p className={`${styles.gestureHint} ${topic ? styles.hintHidden : ''}`} data-testid="gesture-hint" aria-hidden={!!topic || undefined}>
          {t('brain.gestures')}
        </p>
      )}

      <TopBar
        locale={locale}
        collapsed={prefs.sidebarCollapsed}
        motion={motion}
        onToggleSidebar={() => update({ sidebarCollapsed: !prefs.sidebarCollapsed })}
        onToggleMotion={() => update({ motion: motion === 'on' ? 'off' : 'on' })}
        onLocale={switchLocale}
        search={<SearchBox locale={locale} docs={docs[locale]} tracks={graph.tracks} onOpen={(h) => go(h.id)} onMatches={setMatches} onHover={setHovered} />}
      />

      <Sidebar
        inactive={isPhone}
        locale={locale}
        tracks={graph.tracks}
        topicsOf={topicsOf}
        labels={labels}
        open={openTracks}
        collapsed={prefs.sidebarCollapsed}
        currentTopic={topicId}
        onTrack={onSidebarTrack}
        onTopic={go}
        onHover={setHovered}
      />

      <div className={`${styles.stage} ${topic ? styles.open : ''}`} aria-hidden={!topic} inert={!topic || undefined}>
        {shownTopic && (
          <>
            <Reader
              locale={locale}
              topicId={shownTopic.id}
              track={trackById.get(shownTopic.track)}
              tab={tab}
              onTab={setTab}
              mode={prefs.readerMode}
              onMode={(m) => update({ readerMode: m })}
              onClose={closeReader}
              prev={neighbor(pos - 1)}
              next={neighbor(pos + 1)}
              onGo={go}
              onLink={go}
              footer={relatedPanel(styles.inlineRelated)}
            />
            {relatedPanel(styles.sideRelated)}
          </>
        )}
      </div>

      <BottomBar
        inactive={!isPhone}
        locale={locale}
        tracks={graph.tracks}
        topicsOf={topicsOf}
        labels={labels}
        currentTrack={topic?.track ?? null}
        currentTopic={topicId}
        onSelect={(id) => {
          if (!isPhone) return
          setSelectedTrack(topic && topic.track === id ? null : id)
        }}
        onTopic={go}
      />

      {notFound && (
        <div className={`${styles.toast} glass`} role="status" key={path}>
          {t('reader.notFound')}
        </div>
      )}
    </>
  )
}
