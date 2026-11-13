import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Locale, SearchDoc, TrackInfo } from '../content/model.ts'
import { buildSearchIndex, type SearchHit } from './searchIndex.ts'
import styles from './SearchBox.module.css'

interface Props {
  locale: Locale
  docs: readonly SearchDoc[]
  tracks: readonly TrackInfo[]
  /** Abre un resultado (para conceptos, el tema hogar). */
  onOpen: (hit: SearchDoc) => void
  /** Coincidencias visibles para el resaltado del cerebro; `null` si la lista no está visible. */
  onMatches: (ids: ReadonlySet<string> | null) => void
  onHover?: (id: string | null) => void
}

export default function SearchBox({ locale, docs, tracks, onOpen, onMatches, onHover }: Props) {
  const { t } = useTranslation()
  const index = useMemo(() => buildSearchIndex(docs), [docs])
  const trackById = useMemo(() => new Map(tracks.map((tr) => [tr.id, tr])), [tracks])
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const hits: SearchHit[] = useMemo(() => index.search(query), [index, query])
  const open = focused && query.trim().length > 0

  useEffect(() => setSel(0), [query, locale])

  // Resaltado del cerebro mientras haya resultados visibles.
  const matchKey = open ? hits.map((h) => h.id).join('|') : null
  useEffect(() => {
    onMatches(matchKey ? new Set(matchKey.split('|')) : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchKey])

  // Ctrl+K / Cmd+K desde cualquier parte.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const choose = (hit: SearchDoc) => {
    onOpen(hit)
    setQuery('')
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      inputRef.current?.blur()
      return
    }
    if (!hits.length) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => (s + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const hit = hits[sel]
      if (hit) choose(hit)
    }
  }

  return (
    <div className={styles.search}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        spellCheck={false}
        value={query}
        placeholder={t('search.placeholder')}
        aria-label={t('search.label')}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && hits[sel] ? `${listId}-${sel}` : undefined}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
      />
      <span className={styles.kbd} aria-hidden="true">
        {t('search.shortcut')}
      </span>
      <div id={listId} role="listbox" className={`${styles.results} glass ${open ? styles.on : ''}`} onMouseLeave={() => onHover?.(null)}>
        {open &&
          (hits.length ? (
            hits.map((h, i) => {
              const tr = trackById.get(h.track)
              return (
                <div
                  key={h.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === sel}
                  className={`${styles.res} ${i === sel ? styles.sel : ''}`}
                  style={{ '--c': tr?.color } as React.CSSProperties}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(h)
                  }}
                  onMouseEnter={() => {
                    setSel(i)
                    onHover?.(h.id)
                  }}
                >
                  <span className="dot" />
                  <span className={styles.text}>
                    <span className={styles.name}>{h.name}</span>
                    <span className={styles.meta}>{h.type === 'topic' ? h.summary : t('search.conceptOf', { topic: h.topicName })}</span>
                  </span>
                  <small className={styles.kind}>
                    {h.type === 'topic' ? t('search.topic') : t('search.concept')} · {tr?.abbr}
                  </small>
                </div>
              )
            })
          ) : (
            <p className={styles.empty}>{t('search.empty')}</p>
          ))}
      </div>
    </div>
  )
}
