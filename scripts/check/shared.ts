/**
 * Utilidades comunes de los scripts de verificación del contenido (design.md de contenido-claro, decisión 11).
 * No son pruebas: `npm test` no los ejecuta. Se lanzan a mano con `npx tsx scripts/check/<script>.ts`.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ContentError } from '../content/schema.ts'

/** Raíz del repositorio, calculada desde este archivo: no depende de la carpeta desde la que se ejecute. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const CONTENT = path.join(ROOT, 'content')

/** Informa un error de compilación del contenido con su mensaje y marca el proceso como fallido; relanza cualquier otro. */
export function reportError(label: string, e: unknown): void {
  if (!(e instanceof ContentError)) throw e
  console.error(`[${label}] ${e.message}`)
  process.exitCode = 1
}
