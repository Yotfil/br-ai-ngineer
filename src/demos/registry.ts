import type { ComponentType } from 'react'
import type { DemoId } from './ids.ts'

/**
 * Demos registradas por id, cargadas bajo demanda (design.md decisión 10). Se exponen las funciones de carga
 * y no componentes `lazy` ya creados: un `lazy` que falla se queda fallando, y la demo tiene que poder
 * reintentarse (despliegue-automatico, decisión 3).
 */
export const DEMO_LOADERS: Record<DemoId, () => Promise<{ default: ComponentType }>> = {
  'idempotency-retry': () => import('./IdempotencyRetry.tsx'),
  'status-explorer': () => import('./StatusExplorer.tsx'),
  'token-bucket': () => import('./TokenBucket.tsx'),
}

export const hasDemo = (id: string | undefined): id is DemoId => !!id && id in DEMO_LOADERS
