import { useState } from 'react'
import styles from './Demo.module.css'
import { useDemoText } from './useDemoLocale.ts'

/** Demo `idempotency-retry` (original `idem`): enviar la misma petición tres veces y observar el estado. */
interface ServerState {
  pedidos: number[]
  sig: number
  email: string
  stock: number
}
const initial = (): ServerState => ({ pedidos: [1093], sig: 1094, email: 'ana@mail.co', stock: 10 })

const OPS: Array<[string, (s: ServerState) => ServerState]> = [
  ['GET /v1/pedidos', (s) => s],
  ['POST /v1/pedidos', (s) => ({ ...s, pedidos: [...s.pedidos, s.sig], sig: s.sig + 1 })],
  ['PUT /v1/clientes/7 {"email":"ana@nuevo.co"}', (s) => ({ ...s, email: 'ana@nuevo.co' })],
  ['PATCH /v1/productos/42 {"stock":"+1"}', (s) => ({ ...s, stock: s.stock + 1 })],
  ['DELETE /v1/pedidos/1093', (s) => ({ ...s, pedidos: s.pedidos.filter((x) => x !== 1093) })],
]

const TEXT = {
  es: {
    title: 'Envía la misma petición tres veces',
    note: 'Simula un cliente que reintenta por timeout. Observa si el estado del servidor cambia después del primer envío.',
    reset: 'Reiniciar estado',
    state: 'Estado del servidor',
    log: 'Registro',
    empty: 'Sin peticiones aún',
    same: 'estado sin cambios',
    changed: 'estado CAMBIÓ',
    order: 'pedidos',
    email: 'cliente 7 email',
    stock: 'producto 42 stock',
    safe: ['Seguro e idempotente.', 'GET nunca cambió el estado.'],
    notIdem: ['No idempotente.', 'Cada reintento volvió a cambiar el estado. Con un pago, esto serían cobros duplicados.'],
    idem: ['Idempotente.', 'Solo el primer envío cambió el estado; los reintentos no.'],
  },
  en: {
    title: 'Send the same request three times',
    note: 'Simulates a client that retries after a timeout. Watch whether the server state changes after the first send.',
    reset: 'Reset state',
    state: 'Server state',
    log: 'Log',
    empty: 'No requests yet',
    same: 'state unchanged',
    changed: 'state CHANGED',
    order: 'orders',
    email: 'customer 7 email',
    stock: 'product 42 stock',
    safe: ['Safe and idempotent.', 'GET never changed the state.'],
    notIdem: ['Not idempotent.', 'Every retry changed the state again. With a payment, these would be duplicate charges.'],
    idem: ['Idempotent.', 'Only the first send changed the state; the retries did not.'],
  },
}

type Verdict = 'safe' | 'notIdem' | 'idem'

export default function IdempotencyRetry() {
  const tx = useDemoText(TEXT)
  const [st, setSt] = useState(initial)
  const [log, setLog] = useState<Array<{ op: number; k: number; changed: boolean }>>([])
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  const run = (o: number) => {
    let s = st
    let after1 = ''
    let changedAfter = false
    const entries: typeof log = []
    for (let k = 1; k <= 3; k++) {
      const before = JSON.stringify(s)
      s = OPS[o][1](s)
      const after = JSON.stringify(s)
      if (k === 1) after1 = after
      else if (after !== after1) changedAfter = true
      if (k > 1) after1 = after
      entries.unshift({ op: o, k, changed: before !== after })
    }
    setSt(s)
    setLog((l) => [...entries, ...l])
    setVerdict(o === 0 ? 'safe' : changedAfter ? 'notIdem' : 'idem')
  }

  return (
    <>
      <h4 className={styles.title}>{tx.title}</h4>
      <p className={styles.note}>{tx.note}</p>
      <div className={styles.row}>
        {OPS.map(([label], i) => (
          <button key={i} className={styles.btn} onClick={() => run(i)}>
            {label} ×3
          </button>
        ))}
        <button
          className={styles.btn}
          onClick={() => {
            setSt(initial())
            setLog([])
            setVerdict(null)
          }}
        >
          {tx.reset}
        </button>
      </div>
      <div className={styles.cols}>
        <div>
          <span className={styles.tag}>{tx.state}</span>
          <pre className={styles.state}>
            {`${tx.order}: [${st.pedidos.join(', ')}]\n${tx.email}: ${st.email}\n${tx.stock}: ${st.stock}`}
          </pre>
        </div>
        <div>
          <span className={styles.tag}>{tx.log}</span>
          <div className={styles.log} aria-live="polite">
            {log.length ? (
              log.map((l, i) => (
                <div key={log.length - i} className={l.changed ? styles.ch : ''}>
                  #{l.k} {OPS[l.op][0]} → {l.changed ? tx.changed : tx.same}
                </div>
              ))
            ) : (
              <div>{tx.empty}</div>
            )}
          </div>
        </div>
      </div>
      {verdict && (
        <div className={`${styles.res} ${verdict === 'notIdem' ? styles.bad : styles.ok}`} role="status">
          <b>{tx[verdict][0]}</b> {tx[verdict][1]}
        </div>
      )}
    </>
  )
}
