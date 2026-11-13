import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChoiceItem, ClassifyItem, ExerciseGroup, VerdictItem } from '../content/model.ts'
import styles from './Exercises.module.css'

const html = (s: string) => ({ __html: s })

/** `inline`: opciones en fila, como botones compactos que pasan de línea (las categorías de `classify`). */
function Choice({ item, inline = false }: { item: ChoiceItem; inline?: boolean }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const right = picked === item.answer
  return (
    <div className={styles.q}>
      <p className={styles.stem} dangerouslySetInnerHTML={html(item.q)} />
      {item.code && <div className={styles.code} data-testid="choice-code" dangerouslySetInnerHTML={html(item.code)} />}
      <div className={styles.opts}>
        {item.options.map((o, i) => (
          <button
            key={i}
            className={`${styles.opt} ${inline ? styles.inline : ''} ${answered && i === item.answer ? styles.ok : ''} ${answered && i === picked && !right ? styles.no : ''}`}
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

/**
 * Caso de clasificación: se comporta como un ítem de opción múltiple cuyas opciones son las categorías del grupo,
 * pero las categorías van en fila (decisión 11 de pista-python).
 */
function Classify({ item, categories }: { item: ClassifyItem; categories: readonly string[] }) {
  return <Choice inline item={{ q: item.text, options: [...categories], answer: item.answer, why: item.why }} />
}

function Items({ group }: { group: ExerciseGroup }) {
  switch (group.type) {
    case 'choice':
      return group.items.map((it, i) => <Choice key={i} item={it} />)
    case 'verdict':
      return group.items.map((it, i) => <Verdict key={i} item={it} />)
    case 'classify':
      return group.items.map((it, i) => <Classify key={i} item={it} categories={group.categories} />)
  }
}

/** Grupos de ejercicios con respuesta inmediata; nada se guarda (el estado vive en el componente). */
export default function Exercises({ groups }: { groups: readonly ExerciseGroup[] }) {
  return (
    <>
      {groups.map((g, gi) => (
        <section key={gi} className={styles.group}>
          <h3 dangerouslySetInnerHTML={html(g.prompt)} />
          <Items group={g} />
        </section>
      ))}
    </>
  )
}
