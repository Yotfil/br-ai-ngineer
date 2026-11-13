import { Component, lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Locale, Tab, TopicContent, TrackInfo } from '../content/model.ts'
import { loadTopic } from '../data/content.ts'
import { withNewVersionCheck } from '../data/newVersion.ts'
import { DEMO_LOADERS, hasDemo } from '../demos/registry.ts'
import type { DemoId } from '../demos/ids.ts'
import type { ReaderMode } from '../prefs/store.ts'
import Exercises from './Exercises.tsx'
import styles from './Reader.module.css'

const MODES: ReaderMode[] = ['glass', 'solid']

/** Tramo de ancho (design.md de rendimiento-movil, decisiones 4 y 5): cada uno tiene su disposición del lector. */
export type ReaderLayout = 'desktop' | 'tablet' | 'phone'

export function tabsFor(c: Pick<TopicContent, 'exercises' | 'demo'>): Tab[] {
  const practice = c.exercises.length > 0 || hasDemo(c.demo)
  return practice ? ['understand', 'code', 'practice', 'interview'] : ['understand', 'code', 'interview']
}

interface Props {
  locale: Locale
  topicId: string
  track: TrackInfo | undefined
  tab: Tab
  onTab: (t: Tab) => void
  layout: ReaderLayout
  /** Modo efectivo: en teléfono siempre `solid` (decisión 2). */
  mode: ReaderMode
  onMode: (m: ReaderMode) => void
  onClose: () => void
  prev: { id: string; name: string } | null
  next: { id: string; name: string } | null
  onGo: (id: string) => void
  /** Clic en un enlace `[[id]]` del texto. */
  onLink: (id: string) => void
  /** Relacionados dentro del lector, en tableta y teléfono: al final de la zona desplazable. */
  footer?: React.ReactNode
}

const html = (s: string | undefined) => ({ __html: s ?? '' })

export default function Reader({ locale, topicId, track, tab, onTab, layout, mode, onMode, onClose, prev, next, onGo, onLink, footer }: Props) {
  const { t } = useTranslation()
  const [content, setContent] = useState<TopicContent | null>(null)
  /** Reintentos pedidos con el botón del aviso de error (despliegue-automatico, decisión 3). */
  const [attempt, setAttempt] = useState(0)
  /** Carga que falló sin versión nueva: `idioma:tema:intento`. */
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const loadKey = `${locale}:${topicId}:${attempt}`

  useEffect(() => {
    let alive = true
    const load = loadTopic(locale, topicId)
    if (load) {
      // Si falla y hay versión nueva, la página se recarga y la promesa no se resuelve: sigue «Cargando…».
      withNewVersionCheck(() => load).then(
        (c) => alive && setContent(c),
        () => alive && setFailedKey(`${locale}:${topicId}:${attempt}`),
      )
    }
    return () => {
      alive = false
    }
  }, [locale, topicId, attempt])

  const c = content && content.id === topicId ? content : null
  const failed = !c && failedKey === loadKey
  const tabs = c ? tabsFor(c) : (['understand', 'code', 'interview'] as Tab[])
  const active = tabs.includes(tab) ? tab : 'understand'
  const s = c?.sections ?? {}

  // ---------- Posición de desplazamiento (decisiones 4 y 5) ----------
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabsAnchorRef = useRef<HTMLDivElement>(null)
  /** Posición a aplicar tras el cambio de pestaña; `null` = no tocarla. */
  const pendingTop = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    pendingTop.current = null
  }, [topicId])
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && pendingTop.current !== null) el.scrollTop = pendingTop.current
    pendingTop.current = null
  }, [active])
  const selectTab = (k: Tab) => {
    if (k !== active) {
      const el = scrollRef.current
      if (layout !== 'phone') pendingTop.current = 0
      else {
        // Teléfono: si las pestañas están fijas arriba, el contenido nuevo se muestra desde su inicio, justo debajo.
        const anchor = tabsAnchorRef.current?.offsetTop ?? 0
        pendingTop.current = el && el.scrollTop >= anchor - 1 ? anchor : null
      }
    }
    onTab(k)
  }

  const onBodyClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[data-node]')
    if (a) {
      e.preventDefault()
      onLink(a.getAttribute('data-node')!)
    }
  }

  const body = failed ? (
    <LoadError onRetry={() => setAttempt((n) => n + 1)} />
  ) : !c ? (
    <p className={styles.loading}>{t('reader.loading')}</p>
  ) : active === 'understand' ? (
    <>
      <div className={styles.def} dangerouslySetInnerHTML={html(s.definition)} />
      <h3>{t('section.analogy')}</h3>
      <div className={styles.box} dangerouslySetInnerHTML={html(s.analogy)} />
      <h3>{t('section.problem')}</h3>
      <div dangerouslySetInnerHTML={html(s.problem)} />
    </>
  ) : active === 'code' ? (
    <>
      {s['code:example'] && (
        <>
          <h3>{t('section.code:example')}</h3>
          <div className={styles.example} data-section="code:example" dangerouslySetInnerHTML={html(s['code:example'])} />
        </>
      )}
      {s['code:wire'] && (
        <>
          <h3>{t('section.code:wire')}</h3>
          <div dangerouslySetInnerHTML={html(s['code:wire'])} />
        </>
      )}
      {s['code:server'] && (
        <>
          <h3>{t('section.code:server')}</h3>
          <div dangerouslySetInnerHTML={html(s['code:server'])} />
        </>
      )}
      {s.bad && s.good && (
        <div className={styles.pair}>
          <div>
            <span className={`${styles.lbl} ${styles.bad}`}>{t('section.bad')}</span>
            <div className={styles.noted} data-section="bad" dangerouslySetInnerHTML={html(s.bad)} />
          </div>
          <div>
            <span className={`${styles.lbl} ${styles.good}`}>{t('section.good')}</span>
            <div className={styles.noted} data-section="good" dangerouslySetInnerHTML={html(s.good)} />
          </div>
        </div>
      )}
      {s['bridge:typescript'] && (
        <>
          <h3>{t('section.bridge:typescript')}</h3>
          <div className={styles.box} data-section="bridge:typescript" dangerouslySetInnerHTML={html(s['bridge:typescript'])} />
        </>
      )}
    </>
  ) : active === 'practice' ? (
    <>
      {c.exercises.length > 0 && <Exercises key={topicId} groups={c.exercises} />}
      {hasDemo(c.demo) && <DemoBlock id={c.demo} />}
    </>
  ) : (
    <>
      <h3>{t('section.interview')}</h3>
      <div className={`${styles.box} ${styles.say}`} dangerouslySetInnerHTML={html(s.interview)} />
      <h3>{t('section.myths')}</h3>
      <div className={styles.myths} dangerouslySetInnerHTML={html(s.myths)} />
    </>
  )

  const closeBtn = (
    <button className={`icon-btn ${styles.close}`} onClick={onClose} aria-label={t('reader.close')}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  )
  const crumbs = (
    <div className={styles.crumbs}>
      <span className={`${styles.chip} ${styles.trackChip}`}>{track?.name[locale]}</span>
      {c && <span className={styles.chip}>{t(`freq.${c.freq}`)}</span>}
      {layout !== 'phone' && (
        <button
          className={`${styles.chip} ${styles.modeBtn}`}
          onClick={() => onMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length])}
          aria-label={`${t('reader.mode.label')}: ${t(`reader.mode.${mode}`)}`}
          data-mode={mode}
        >
          {t(`reader.mode.${mode}`)}
        </button>
      )}
      {layout !== 'phone' && closeBtn}
    </div>
  )
  const titleBlock = (
    <>
      <h1 id="reader-title">{c?.title ?? ' '}</h1>
      <p className={styles.lead}>{c?.summary ?? ' '}</p>
    </>
  )
  const tabList = (
    <div className={styles.tabs} role="tablist">
      {tabs.map((k) => (
        <button key={k} role="tab" aria-selected={k === active} className={k === active ? styles.on : ''} onClick={() => selectTab(k)}>
          {t(`reader.tabs.${k}`)}
        </button>
      ))}
    </div>
  )
  const panel = (
    <div key={`${topicId}:${active}:${locale}`} className={styles.rbody} role="tabpanel" onClick={onBodyClick}>
      {body}
    </div>
  )
  const nav = (
    <div className={styles.rfoot}>
      {prev && (
        <button className={styles.btn} onClick={() => onGo(prev.id)} title={prev.name}>
          {t('reader.prev')}
        </button>
      )}
      {next && (
        <button className={`${styles.btn} ${styles.go}`} onClick={() => onGo(next.id)} title={next.name}>
          {t('reader.next')}
        </button>
      )}
    </div>
  )
  const related = layout !== 'desktop' && footer ? <div className={styles.footer}>{footer}</div> : null

  return (
    <article
      className={`${styles.reader} ${styles[layout]} glass`}
      style={{ '--track': track?.color } as React.CSSProperties}
      aria-labelledby="reader-title"
      data-layout={layout}
    >
      {layout === 'phone' ? (
        // Teléfono (decisión 5): un único desplazamiento; pestañas adhesivas y cerrar anclado fuera de él.
        <>
          {closeBtn}
          <div className={styles.scroll} ref={scrollRef} data-testid="reader-scroll">
            <div className={styles.rhead}>
              {crumbs}
              {titleBlock}
            </div>
            <div ref={tabsAnchorRef} className={styles.tabsAnchor} aria-hidden="true" />
            {tabList}
            {panel}
            {nav}
            {related}
          </div>
        </>
      ) : (
        // Escritorio y tableta (decisión 4): cabecera y botones fijos; se desplaza el contenido (y en tableta, los relacionados).
        <>
          <div className={styles.rhead}>
            {crumbs}
            {titleBlock}
            {tabList}
          </div>
          <div className={styles.scroll} ref={scrollRef} data-testid="reader-scroll">
            {panel}
            {related}
          </div>
          {nav}
        </>
      )}
    </article>
  )
}

/** Aviso de error de carga con botón de reintentar (despliegue-automatico, decisión 3). */
function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div className={styles.loadError}>
      <p role="alert">{t('reader.loadError')}</p>
      <button type="button" className={styles.btn} onClick={onRetry}>
        {t('reader.retry')}
      </button>
    </div>
  )
}

/** Fallo al cargar el código de una demo (no un error de la demo ya cargada). */
class DemoLoadFailure extends Error {}

/** Recoge solo los fallos de carga de la demo; cualquier otro error sigue hacia arriba como antes. */
class DemoLoadBoundary extends Component<{ onRetry: () => void; children: ReactNode }, { error: unknown }> {
  state: { error: unknown } = { error: null }
  static getDerivedStateFromError(error: unknown) {
    return { error }
  }
  render() {
    const { error } = this.state
    if (error === null) return this.props.children
    if (error instanceof DemoLoadFailure) return <LoadError onRetry={this.props.onRetry} />
    throw error
  }
}

function DemoBlock({ id }: { id: DemoId }) {
  const { t } = useTranslation()
  const [attempt, setAttempt] = useState(0)
  // Un `lazy` nuevo por intento: el anterior conserva su fallo.
  const Demo = useMemo(
    () =>
      lazy(() =>
        withNewVersionCheck(DEMO_LOADERS[id]).catch((e: unknown) => {
          throw new DemoLoadFailure(String(e))
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `attempt` fuerza un componente nuevo al reintentar
    [id, attempt],
  )
  return (
    <section className={styles.demo} aria-label={t('demo.label')}>
      <span className={styles.demoTag}>{t('demo.label')}</span>
      <DemoLoadBoundary key={attempt} onRetry={() => setAttempt((n) => n + 1)}>
        <Suspense fallback={<p className={styles.loading}>{t('reader.loading')}</p>}>
          <Demo />
        </Suspense>
      </DemoLoadBoundary>
    </section>
  )
}
