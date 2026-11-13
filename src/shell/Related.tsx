import { useTranslation } from 'react-i18next'
import type { GraphNode, TrackInfo } from '../content/model.ts'
import styles from './Related.module.css'

interface Props {
  concepts: readonly GraphNode[]
  related: readonly GraphNode[]
  tracks: ReadonlyMap<string, TrackInfo>
  labels: Readonly<Record<string, string>>
  onOpen: (id: string) => void
  onHover: (id: string | null) => void
  /** Dentro del lector (tableta y teléfono): sección sin cristal, separada por una línea (rendimiento-movil, decisión 4). */
  inline?: boolean
}

/** Conceptos del tema y temas relacionados, indicando la pista de cada uno. */
export default function Related({ concepts, related, tracks, labels, onOpen, onHover, inline = false }: Props) {
  const { t } = useTranslation()
  const row = (n: GraphNode) => {
    const tr = tracks.get(n.track)
    return (
      <button
        key={n.id}
        className={styles.res}
        style={{ '--c': tr?.color } as React.CSSProperties}
        onClick={() => onOpen(n.id)}
        onMouseEnter={() => onHover(n.id)}
        onFocus={() => onHover(n.id)}
        onBlur={() => onHover(null)}
        data-node={n.id}
      >
        <span className="dot" />
        <span className={styles.name}>{labels[n.id] ?? n.id}</span>
        <small>{tr?.abbr}</small>
      </button>
    )
  }
  return (
    <aside className={inline ? `${styles.rel} ${styles.inline}` : `${styles.rel} glass`}
      data-inline={inline || undefined} onMouseLeave={() => onHover(null)} aria-label={t('related.related')}>
      {concepts.length > 0 && (
        <>
          <h6>{t('related.concepts')}</h6>
          {concepts.map(row)}
          <hr />
        </>
      )}
      <h6>{t('related.related')}</h6>
      {related.length ? related.map(row) : <p className={styles.none}>{t('related.none')}</p>}
    </aside>
  )
}
