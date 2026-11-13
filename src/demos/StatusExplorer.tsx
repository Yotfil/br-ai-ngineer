import { useState } from 'react'
import styles from './Demo.module.css'
import { useDemoText } from './useDemoLocale.ts'

/** Demo `status-explorer` (original `status`): explorar los códigos por familia. */
const TEXT = {
  es: {
    title: 'Explora los códigos por familia',
    codes: {
      '200': 'OK. Éxito con body.',
      '201': 'Created. Se creó un recurso; incluye Location.',
      '202': 'Accepted. Se aceptó para procesar después (asíncrono).',
      '204': 'No Content. Éxito sin body.',
      '301': 'Moved Permanently. La URL cambió para siempre; los clientes la recuerdan.',
      '302': 'Found. Redirección temporal.',
      '304': 'Not Modified. Tu copia en caché sigue vigente.',
      '307': 'Temporary Redirect. Temporal y conserva el método.',
      '308': 'Permanent Redirect. Permanente y conserva el método.',
      '400': 'Bad Request. Petición mal formada (JSON roto, parámetro imposible).',
      '401': 'Unauthorized. No autenticado: falta el token o es inválido.',
      '403': 'Forbidden. Autenticado, pero sin permiso.',
      '404': 'Not Found. No existe (o no se revela).',
      '405': 'Method Not Allowed. El recurso no admite ese método; incluye Allow.',
      '406': 'Not Acceptable. No se puede producir el formato pedido en Accept.',
      '409': 'Conflict. Choca con el estado actual (email duplicado, versión desactualizada).',
      '410': 'Gone. Existió y se eliminó para siempre.',
      '415': 'Unsupported Media Type. El Content-Type del body no se admite.',
      '422': 'Unprocessable Content. Sintaxis correcta, contenido inválido (validación).',
      '429': 'Too Many Requests. Superaste el rate limit; mira Retry-After.',
      '500': 'Internal Server Error. Tu aplicación falló (excepción no controlada).',
      '502': 'Bad Gateway. El proxy recibió una respuesta inválida de tu app (se cayó el proceso).',
      '503': 'Service Unavailable. Sin capacidad o en mantenimiento; suele traer Retry-After.',
      '504': 'Gateway Timeout. El proxy se cansó de esperar a tu app.',
    } as Record<string, string>,
  },
  en: {
    title: 'Explore the codes by family',
    codes: {
      '200': 'OK. Success with a body.',
      '201': 'Created. A resource was created; includes Location.',
      '202': 'Accepted. Accepted to be processed later (asynchronous).',
      '204': 'No Content. Success without a body.',
      '301': 'Moved Permanently. The URL changed for good; clients remember it.',
      '302': 'Found. Temporary redirect.',
      '304': 'Not Modified. Your cached copy is still valid.',
      '307': 'Temporary Redirect. Temporary and keeps the method.',
      '308': 'Permanent Redirect. Permanent and keeps the method.',
      '400': 'Bad Request. Malformed request (broken JSON, impossible parameter).',
      '401': 'Unauthorized. Not authenticated: the token is missing or invalid.',
      '403': 'Forbidden. Authenticated, but without permission.',
      '404': 'Not Found. It does not exist (or it is not revealed).',
      '405': 'Method Not Allowed. The resource does not support that method; includes Allow.',
      '406': 'Not Acceptable. The format requested in Accept cannot be produced.',
      '409': 'Conflict. It clashes with the current state (duplicate email, outdated version).',
      '410': 'Gone. It existed and was deleted for good.',
      '415': 'Unsupported Media Type. The body Content-Type is not supported.',
      '422': 'Unprocessable Content. Correct syntax, invalid content (validation).',
      '429': 'Too Many Requests. You exceeded the rate limit; check Retry-After.',
      '500': 'Internal Server Error. Your application failed (unhandled exception).',
      '502': 'Bad Gateway. The proxy got an invalid response from your app (the process crashed).',
      '503': 'Service Unavailable. No capacity or under maintenance; usually brings Retry-After.',
      '504': 'Gateway Timeout. The proxy got tired of waiting for your app.',
    } as Record<string, string>,
  },
}

const fam = (c: string) => (c[0] === '2' ? styles.ok : c[0] === '3' ? styles.warn : styles.bad)

export default function StatusExplorer() {
  const tx = useDemoText(TEXT)
  const [sel, setSel] = useState('401')
  return (
    <>
      <h4 className={styles.title}>{tx.title}</h4>
      <div className={styles.row}>
        {Object.keys(tx.codes).map((c) => (
          <button key={c} className={`${styles.btn} ${c === sel ? styles.sel : ''}`} aria-pressed={c === sel} onClick={() => setSel(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className={`${styles.res} ${fam(sel)}`} role="status">
        <b>{sel}</b> · {tx.codes[sel]}
      </div>
    </>
  )
}
