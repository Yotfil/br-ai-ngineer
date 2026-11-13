import { useTranslation } from 'react-i18next'
import { LOCALES, type Locale } from '../content/model.ts'
import type { Motion } from '../prefs/store.ts'
import styles from './TopBar.module.css'

interface Props {
  locale: Locale
  collapsed: boolean
  motion: Motion
  onToggleSidebar: () => void
  onToggleMotion: () => void
  onLocale: (l: Locale) => void
  search: React.ReactNode
}

export default function TopBar({ locale, collapsed, motion, onToggleSidebar, onToggleMotion, onLocale, search }: Props) {
  const { t } = useTranslation()
  const motionLabel = motion === 'on' ? t('top.motionStop') : t('top.motionResume')
  return (
    <header className={`${styles.top} glass`}>
      <button className={`icon-btn ${styles.toggle}`} onClick={onToggleSidebar} aria-label={collapsed ? t('top.expand') : t('top.collapse')} aria-expanded={!collapsed}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M9 4v16" />
        </svg>
      </button>
      <span className={styles.brand}>{t('brand')}</span>
      {search}
      <button className="icon-btn" onClick={onToggleMotion} aria-label={motionLabel} title={motionLabel} aria-pressed={motion === 'off'}>
        {motion === 'on' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M9 6v12M15 6v12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 5.5v13l10-6.5z" />
          </svg>
        )}
      </button>
      <div className={styles.seg} role="group" aria-label={t('top.language')}>
        {LOCALES.map((l) => (
          <button key={l} className={l === locale ? styles.on : ''} aria-pressed={l === locale} onClick={() => onLocale(l)} lang={l}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  )
}
