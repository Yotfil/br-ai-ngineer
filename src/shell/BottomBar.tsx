import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GraphNode, Locale, TrackInfo } from '../content/model.ts'
import { centeredIndex, COPIES, ITEM, relocate, scaleFor, scrollFor, STEP, itemCenter, trackIndex } from './carousel.ts'
import styles from './BottomBar.module.css'

interface Props {
  /** Fuera de teléfono la barra inferior no está disponible. */
  inactive?: boolean
  locale: Locale
  tracks: readonly TrackInfo[]
  topicsOf: (trackId: string) => readonly GraphNode[]
  labels: Readonly<Record<string, string>>
  /** Pista del tema abierto: el carrusel la centra. */
  currentTrack: string | null
  currentTopic: string | null
  onSelect: (trackId: string) => void
  onTopic: (topicId: string) => void
}

const SETTLE_MS = 140

/** Barra inferior de teléfono: carrusel circular de pistas (desplazamiento nativo, tres copias). */
export default function BottomBar({ inactive = false, locale, tracks, topicsOf, labels, currentTrack, currentTopic, onSelect, onTopic }: Props) {
  const { t } = useTranslation()
  const n = tracks.length
  const total = n * COPIES
  const scroller = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const settleTimer = useRef<number | undefined>(undefined)
  /** Posicionamiento por código (carga, cambio de tamaño): no cuenta como elección del usuario. */
  const silent = useRef(false)
  const silence = () => {
    silent.current = true
    // Si el desplazamiento no cambió la posición no habrá evento: se libera solo.
    window.setTimeout(() => (silent.current = false), SETTLE_MS * 3)
  }
  const [centered, setCentered] = useState(n) // índice absoluto (copia central)
  const [sheet, setSheet] = useState(false)
  const selectedTrack = n ? tracks[trackIndex(centered, n)] : undefined

  const pad = () => {
    const el = scroller.current
    return el ? el.clientWidth / 2 - ITEM / 2 : 0
  }

  const paintScales = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    const p = pad()
    items.current.forEach((b, i) => {
      if (!b) return
      const s = scaleFor(itemCenter(i, p) - center)
      b.style.setProperty('--s', s.toFixed(3))
    })
  }, [])

  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const el = scroller.current
    if (!el) return
    const left = scrollFor(i, pad(), el.clientWidth)
    if (smooth && typeof el.scrollTo === 'function') el.scrollTo({ left, behavior: 'smooth' })
    else el.scrollLeft = left
  }, [])

  /** Al asentarse: reubica en la copia central si hace falta y selecciona la pista centrada. */
  const settle = useCallback(() => {
    const el = scroller.current
    if (!el || !n) return
    let i = centeredIndex(el.scrollLeft, el.clientWidth, pad(), total)
    const j = relocate(i, n)
    if (j !== i) {
      el.scrollLeft += (j - i) * STEP
      i = j
    }
    paintScales()
    setCentered(i)
    if (silent.current) {
      silent.current = false
      return
    }
    onSelect(tracks[trackIndex(i, n)].id)
  }, [n, total, tracks, onSelect, paintScales])

  const onScroll = () => {
    paintScales()
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(settle, SETTLE_MS)
  }

  // Posición inicial: copia central, en la pista del tema abierto o la primera.
  useLayoutEffect(() => {
    const k = Math.max(0, tracks.findIndex((tr) => tr.id === currentTrack))
    silence()
    scrollToIndex(n + k, false)
    setCentered(n + k)
    paintScales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // Un tema abierto centra su pista.
  useEffect(() => {
    if (!currentTrack || !n) return
    const k = tracks.findIndex((tr) => tr.id === currentTrack)
    if (k < 0 || trackIndex(centered, n) === k) return
    scrollToIndex(n + k, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack])

  useEffect(() => () => window.clearTimeout(settleTimer.current), [])
  useEffect(() => {
    const onResize = () => {
      silence()
      scrollToIndex(centered, false)
      paintScales()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [centered, scrollToIndex, paintScales])

  const onItem = (i: number) => {
    if (trackIndex(i, n) === trackIndex(centered, n)) {
      setSheet((s) => !s)
      return
    }
    setSheet(false)
    scrollToIndex(i, true)
  }

  const topics = selectedTrack ? topicsOf(selectedTrack.id) : []

  return (
    <div className={styles.wrap} aria-hidden={inactive || undefined} inert={inactive || undefined}>
      {sheet && selectedTrack && (
        <div className={styles.sheet} role="dialog" aria-label={t('side.topics', { track: selectedTrack.name[locale] })} style={{ '--c': selectedTrack.color } as React.CSSProperties}>
          <h6>{selectedTrack.name[locale]}</h6>
          {selectedTrack.empty ? (
            <p className={styles.soon}>{t('side.soon')}</p>
          ) : (
            topics.map((tp) => (
              <button
                key={tp.id}
                className={`${styles.sub} ${tp.id === currentTopic ? styles.cur : ''}`}
                onClick={() => {
                  setSheet(false)
                  onTopic(tp.id)
                }}
              >
                {labels[tp.id] ?? tp.id}
              </button>
            ))
          )}
        </div>
      )}
      <nav className={`${styles.bar} glass`} aria-label={t('side.tracks')}>
        <div ref={scroller} className={styles.scroller} onScroll={onScroll} data-testid="carousel">
          <div className={styles.track} style={{ paddingInline: `calc(50% - ${ITEM / 2}px)` }}>
            {Array.from({ length: total }, (_, i) => {
              const tr = tracks[trackIndex(i, n)]
              const copy = Math.floor(i / n)
              const isCenter = i === centered
              const hidden = copy !== 1
              return (
                <button
                  key={i}
                  ref={(el) => {
                    items.current[i] = el
                  }}
                  className={`${styles.icon} ${isCenter ? styles.center : ''} ${tr.empty ? styles.empty : ''}`}
                  style={{ '--c': tr.color } as React.CSSProperties}
                  aria-hidden={hidden || undefined}
                  tabIndex={hidden ? -1 : 0}
                  aria-label={hidden ? undefined : `${tr.name[locale]}${tr.empty ? ` · ${t('side.soon')}` : ''}`}
                  aria-current={!hidden && trackIndex(centered, n) === trackIndex(i, n) ? 'true' : undefined}
                  data-index={i}
                  onClick={() => onItem(i)}
                >
                  {tr.abbr}
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
