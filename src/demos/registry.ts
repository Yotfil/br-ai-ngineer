import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { DemoId } from './ids.ts'

/** Demos registradas por id, cargadas bajo demanda (design.md decisión 10). */
export const DEMOS: Record<DemoId, LazyExoticComponent<ComponentType>> = {
  'idempotency-retry': lazy(() => import('./IdempotencyRetry.tsx')),
  'status-explorer': lazy(() => import('./StatusExplorer.tsx')),
  'token-bucket': lazy(() => import('./TokenBucket.tsx')),
}

export const hasDemo = (id: string | undefined): id is DemoId => !!id && id in DEMOS
