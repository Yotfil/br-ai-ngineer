import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChoiceItem, ExerciseGroup, VerdictItem } from '../content/model.ts'
import styles from './Exercises.module.css'

const html = (s: string) => ({ __html: s })

function Choice({ item }: { item: ChoiceItem }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const right = picked === item.answer
  return (
    <div className={styles.q}>
      <p className={styles.stem} dangerouslySetInnerHTML={html(item.q)} />
      <div className={styles.opts}>
        {item.options.map((o, i) => (
          <button
            key={i}
            className={`${styles.opt} ${answered && i === item.answer ? styles.ok : ''} ${answered && i === picked && !right ? styles.no : ''}`}
            onClick={() => !answered && setPicked(i)}
            aria-disabled={answered || undefined}
            dangerouslySetInnerHTML={html(o)}
          />
        ))}
      </div>
      {answered && (
        <p className={styles.fb} role="status">
          <b>{right ? `✓ ${t('exercise.right')}` : `✗ ${t('exercise.wrongChoice')}`}</b> <span dangerouslySetInnerHTML={html(item.why)} />
        </p>
      )}
    </div>
  )
}

function Verdict({ item }: { item: VerdictItem }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<boolean | null>(null)
  const answered = picked !== null
  const right = picked === item.ok
  const cls = (v: boolean) => (answered && picked === v ? (right ? styles.ok : styles.no) : '')
  return (
    <div className={styles.q}>
      <p className={styles.stem}>
        <code dangerouslySetInnerHTML={html(item.statement)} />
      </p>
      <div className={styles.opts}>
        <button className={`${styles.opt} ${styles.inline} ${cls(true)}`} onClick={() => !answered && setPicked(true)} aria-disabled={answered || undefined}>
          {t('exercise.isOk')}
        </button>
        <button className={`${styles.opt} ${styles.inline} ${cls(false)}`} onClick={() => !answered && setPicked(false)} aria-disabled={answered || undefined}>
          {t('exercise.hasError')}
        </button>
      </div>
      {answered && (
        <p className={styles.fb} role="status">
          <b>{right ? `✓ ${t('exercise.right')}` : `✗ ${t('exercise.wrongVerdict')}`}</b> <span dangerouslySetInnerHTML={html(item.why)} />
        </p>
      )}
    </div>
  )
}

/** Grupos de ejercicios con respuesta inmediata; nada se guarda (el estado vive en el componente). */
export default function Exercises({ groups }: { groups: readonly ExerciseGroup[] }) {
  return (
    <>
      {groups.map((g, gi) => (
        <section key={gi} className={styles.group}>
          <h3 dangerouslySetInnerHTML={html(g.prompt)} />
          {g.type === 'choice' ? g.items.map((it, i) => <Choice key={i} item={it} />) : g.items.map((it, i) => <Verdict key={i} item={it} />)}
        </section>
      ))}
    </>
  )
}
