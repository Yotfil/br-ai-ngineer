import { useEffect, useState } from 'react'
import styles from './Demo.module.css'
import { useDemoText } from './useDemoLocale.ts'

/** Demo `token-bucket` (original `ratelimit`): capacidad 5, se recarga 1 cada 2 segundos. */
export const CAPACITY = 5
export const REFILL_MS = 2000

const TEXT = {
  es: {
    title: 'Token bucket: 5 de capacidad, se recarga 1 cada 2 segundos',
    one: 'Enviar 1 petición',
    eight: 'Enviar 8 seguidas',
    quota: 'Cupo disponible',
    available: (n: number) => `${n} de ${CAPACITY} disponibles`,
    result: (ok: number, rej: number) => `${ok} aceptadas, ${rej} rechazadas con 429.`,
    advice: ' Un cliente bien hecho espera lo que dice Retry-After antes de reintentar.',
  },
  en: {
    title: 'Token bucket: capacity 5, refills 1 every 2 seconds',
    one: 'Send 1 request',
    eight: 'Send 8 in a row',
    quota: 'Available quota',
    available: (n: number) => `${n} of ${CAPACITY} available`,
    result: (ok: number, rej: number) => `${ok} accepted, ${rej} rejected with 429.`,
    advice: ' A well-built client waits as long as Retry-After says before retrying.',
  },
}

const ok = (remaining: number) => `HTTP/1.1 200 OK\nRateLimit-Limit: ${CAPACITY}\nRateLimit-Remaining: ${remaining}`
const rejected = 'HTTP/1.1 429 Too Many Requests\nRetry-After: 2\nContent-Type: application/problem+json\n\n{"title":"Demasiadas peticiones","status":429}'

export default function TokenBucket() {
  const tx = useDemoText(TEXT)
  const [tokens, setTokens] = useState(CAPACITY)
  const [last, setLast] = useState<{ raw: string; ok: number; rej: number } | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setTokens((t) => Math.min(CAPACITY, t + 1)), REFILL_MS)
    return () => window.clearInterval(id)
  }, [])

  const send = (n: number) => {
    let t = tokens
    let okCount = 0
    let rej = 0
    let raw = ''
    for (let i = 0; i < n; i++) {
      if (t > 0) {
        t--
        okCount++
        raw = ok(t)
      } else {
        rej++
        raw = rejected
      }
    }
    setTokens(t)
    setLast({ raw, ok: okCount, rej })
  }

  return (
    <>
      <h4 className={styles.title}>{tx.title}</h4>
      <div className={styles.row}>
        <button className={`${styles.btn} ${styles.pri}`} onClick={() => send(1)}>
          {tx.one}
        </button>
        <button className={styles.btn} onClick={() => send(8)}>
          {tx.eight}
        </button>
      </div>
      <div className={styles.row} aria-label={tx.quota}>
        {Array.from({ length: CAPACITY }, (_, k) => (
          <span key={k} className={`${styles.cell} ${k < tokens ? styles.full : ''}`} />
        ))}
        <span className={styles.note}>{tx.available(tokens)}</span>
      </div>
      {last && (
        <>
          <pre>{last.raw}</pre>
          <div className={`${styles.res} ${last.rej ? styles.bad : styles.ok}`} role="status">
            {tx.result(last.ok, last.rej)}
            {last.rej ? tx.advice : ''}
          </div>
        </>
      )}
    </>
  )
}
