/** Ids de demo con componente registrado. La compilación de contenido rechaza cualquier otro. */
export const DEMO_IDS = ['idempotency-retry', 'status-explorer', 'token-bucket'] as const
export type DemoId = (typeof DEMO_IDS)[number]
