import { Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Locale, Tab, TopicContent, TrackInfo } from '../content/model.ts'
import { loadTopic } from '../data/content.ts'
import { DEMOS, hasDemo } from '../demos/registry.ts'
import type { ReaderMode } from '../prefs/store.ts'
import Exercises from './Exercises.tsx'
import styles from './Reader.module.css'

const MODES: ReaderMode[] = ['glass', 'pure', 'solid']

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
  mode: ReaderMode
  onMode: (m: ReaderMode) => void
  onClose: () => void
  prev: { id: string; name: string } | null
  next: { id: string; name: string } | null
  onGo: (id: string) => void
  /** Clic en un enlace `[[id]]` del texto. */
  onLink: (id: string) => void
  /** Se muestra al final del lector en tableta y teléfono. */
  footer?: React.ReactNode
}

const html = (s: string | undefined) => ({ __html: s ?? '' })

export default function Reader({ locale, topicId, track, tab, onTab, mode, onMode, onClose, prev, next, onGo, onLink, footer }: Props) {
  const { t } = useTranslation()
  const [content, setContent] = useState<TopicContent | null>(null)

  useEffect(() => {
    let alive = true
    const p = loadTopic(locale, topicId)
    p?.then((c) => alive && setContent(c))
    return () => {
      alive = false
    }
  }, [locale, topicId])

  const c = content && content.id === topicId ? content : null
  const tabs = c ? tabsFor(c) : (['understand', 'code', 'interview'] as Tab[])
  const active = tabs.includes(tab) ? tab : 'understand'
  const s = c?.sections ?? {}

  const onBodyClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[data-node]')
    if (a) {
      e.preventDefault()
      onLink(a.getAttribute('data-node')!)
    }
  }

  const body = !c ? (
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

  return (
    <article className={`${styles.reader} glass`} style={{ '--track': track?.color } as React.CSSProperties} aria-labelledby="reader-title">
      <div className={styles.rhead}>
        <div className={styles.crumbs}>
          <span className={`${styles.chip} ${styles.trackChip}`}>{track?.name[locale]}</span>
          {c && <span className={styles.chip}>{t(`freq.${c.freq}`)}</span>}
          <button
            className={`${styles.chip} ${styles.modeBtn}`}
            onClick={() => onMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length])}
            aria-label={`${t('reader.mode.label')}: ${t(`reader.mode.${mode}`)}`}
            data-mode={mode}
          >
            {t(`reader.mode.${mode}`)}
          </button>
          <button className="icon-btn" onClick={onClose} aria-label={t('reader.close')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <h1 id="reader-title">{c?.title ?? ' '}</h1>
        <p className={styles.lead}>{c?.summary ?? ' '}</p>
        <div className={styles.tabs} role="tablist">
          {tabs.map((k) => (
            <button key={k} role="tab" aria-selected={k === active} className={k === active ? styles.on : ''} onClick={() => onTab(k)}>
              {t(`reader.tabs.${k}`)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.scroll}>
        <div key={`${topicId}:${active}:${locale}`} className={styles.rbody} role="tabpanel" onClick={onBodyClick}>
          {body}
        </div>
      </div>
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
      {footer && <div className={styles.footer}>{footer}</div>}
    </article>
  )
}

function DemoBlock({ id }: { id: keyof typeof DEMOS }) {
  const { t } = useTranslation()
  const Demo = DEMOS[id]
  return (
    <section className={styles.demo} aria-label={t('demo.label')}>
      <span className={styles.demoTag}>{t('demo.label')}</span>
      <Suspense fallback={<p className={styles.loading}>{t('reader.loading')}</p>}>
        <Demo />
      </Suspense>
    </section>
  )
}
