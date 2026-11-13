import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import type { GraphNode, Locale, TrackInfo } from '../content/model.ts'
import { sectionsOf } from './groups.ts'
import styles from './Sidebar.module.css'

interface Props {
  /** En teléfono el sidebar no está disponible (lo sustituye la barra inferior). */
  inactive?: boolean
  locale: Locale
  tracks: readonly TrackInfo[]
  topicsOf: (trackId: string) => readonly GraphNode[]
  /** Título completo de cada tema (ayuda al pasar el cursor). */
  labels: Readonly<Record<string, string>>
  /** Nombre de cada fila: el título corto si existe, si no el completo. */
  listLabels: Readonly<Record<string, string>>
  open: ReadonlySet<string>
  collapsed: boolean
  currentTopic: string | null
  onTrack: (trackId: string) => void
  onTopic: (topicId: string) => void
  onHover: (id: string | null) => void
}

export default function Sidebar({ inactive = false, locale, tracks, topicsOf, labels, listLabels, open, collapsed, currentTopic, onTrack, onTopic, onHover }: Props) {
  const { t } = useTranslation()
  return (
    <nav className={`${styles.side} glass ${collapsed ? styles.collapsed : ''}`} aria-label={t('side.tracks')} aria-hidden={inactive || undefined} inert={inactive || undefined} onMouseLeave={() => onHover(null)}>
      <h6>{t('side.tracks')}</h6>
      {tracks.map((tr) => {
        const topics = topicsOf(tr.id)
        const isOpen = !tr.empty && open.has(tr.id)
        const name = tr.name[locale]
        return (
          <div key={tr.id} style={{ '--c': tr.color } as React.CSSProperties}>
            <button
              className={`${styles.trk} ${isOpen ? styles.open : ''} ${tr.empty ? styles.soon : ''}`}
              onClick={() => onTrack(tr.id)}
              aria-expanded={tr.empty ? undefined : isOpen}
              aria-disabled={tr.empty || undefined}
              title={name}
              data-track={tr.id}
            >
              <span className={styles.badge} aria-hidden="true">
                {tr.abbr}
              </span>
              <b>{name}</b>
              <i>{tr.empty ? t('side.soon') : topics.length}</i>
              {!tr.empty && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              )}
            </button>
            {!tr.empty && (
              <div className={`${styles.subs} ${isOpen ? styles.subsOpen : ''}`} aria-hidden={!isOpen}>
                <div className={styles.subsIn}>
                  {sectionsOf(tr, topics, locale).map((sec) => (
                    <Fragment key={sec.heading?.id ?? '-'}>
                      {sec.heading && !collapsed && (
                        <p className={styles.group} data-group={sec.heading.id}>
                          {sec.heading.name}
                        </p>
                      )}
                      {sec.topics.map((n) => {
                        const full = labels[n.id] ?? n.id
                        const shown = listLabels[n.id] ?? full
                        return (
                          <button
                            key={n.id}
                            className={`${styles.sub} ${n.id === currentTopic ? styles.cur : ''}`}
                            aria-current={n.id === currentTopic ? 'page' : undefined}
                            tabIndex={isOpen ? 0 : -1}
                            title={shown !== full ? full : undefined}
                            onClick={() => onTopic(n.id)}
                            onMouseEnter={() => onHover(n.id)}
                            onFocus={() => onHover(n.id)}
                            onBlur={() => onHover(null)}
                          >
                            {shown}
                          </button>
                        )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
