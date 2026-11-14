/**
 * Tipos y constantes compartidos entre la compilación de contenido (scripts/) y la aplicación (src/).
 * Este archivo no debe importar nada del navegador ni de Node.
 */

export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

export const FREQS = ['always', 'often', 'sometimes'] as const
export type Freq = (typeof FREQS)[number]

/** Tipos de `code:<tipo>` registrados. Añadir uno exige su rótulo en `src/locales/*.json`. */
export const CODE_KINDS = ['example', 'wire', 'server'] as const
/** Tecnologías de `bridge:<tecnología>` admitidas. */
export const BRIDGE_TECHS = ['typescript'] as const

/** Claves de sección en el orden de design.md decisión 2. */
export const SECTION_KEYS = [
  'definition',
  'analogy',
  'problem',
  'code:example',
  'code:wire',
  'code:server',
  'bad',
  'good',
  'bridge:typescript',
  'interview',
  'myths',
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const REQUIRED_SECTIONS: readonly SectionKey[] = ['definition', 'analogy', 'problem', 'interview', 'myths']

/** Tipos de entrada distintos de un tema normal (`kind` en meta.yaml; design.md de contenido-claro, decisión 6). */
export const KINDS = ['project'] as const
export type Kind = (typeof KINDS)[number]

/** Secciones de una entrada de proyecto, en el orden del lector; las dos son obligatorias (decisión 6 de contenido-claro). */
export const PROJECT_SECTION_KEYS = ['context', 'walkthrough'] as const
export type ProjectSectionKey = (typeof PROJECT_SECTION_KEYS)[number]

/** Cualquier sección del cuerpo: de un tema o de una entrada de proyecto. */
export type BodySectionKey = SectionKey | ProjectSectionKey

/** Secciones que admite el cuerpo según el tipo de entrada. */
export function sectionKeysOf(kind: Kind | undefined): readonly BodySectionKey[] {
  return kind === 'project' ? PROJECT_SECTION_KEYS : SECTION_KEYS
}

export type Tab = 'understand' | 'code' | 'practice' | 'interview'

/** Pestaña de cada sección. */
export const SECTION_TAB: Record<SectionKey, Exclude<Tab, 'practice'>> = {
  definition: 'understand',
  analogy: 'understand',
  problem: 'understand',
  'code:example': 'code',
  'code:wire': 'code',
  'code:server': 'code',
  bad: 'code',
  good: 'code',
  'bridge:typescript': 'code',
  interview: 'interview',
  myths: 'interview',
}

// ---------- Salida generada (src/generated) ----------

/** Grupo de temas dentro de una pista (design.md de pista-python, decisión 5). */
export interface TrackGroup {
  id: string
  name: Record<Locale, string>
}

export interface TrackInfo {
  id: string
  abbr: string
  color: string
  order: number
  name: Record<Locale, string>
  /** Grupos de temas, en orden; solo si la pista los declara. */
  groups?: TrackGroup[]
  /** Pista declarada sin temas ("Próximamente"). */
  empty: boolean
}

export type NodeType = 'track' | 'topic' | 'concept'

export interface GraphNode {
  id: string
  type: NodeType
  track: string
  /** Tema hogar (conceptos) o pista (temas). */
  parent?: string
  /** Frecuencia del tema (no la tiene una entrada de proyecto). */
  freq?: Freq
  /** Solo en una entrada de proyecto. */
  kind?: Kind
  /** Temas que reúne una entrada de proyecto, en el orden declarado. */
  covers?: string[]
  /** Orden del tema dentro de su pista. */
  order?: number
  /** Grupo del tema dentro de su pista (solo en pistas con grupos). */
  group?: string
  /** Pista sin temas. */
  empty?: boolean
  x: number
  y: number
  z: number
}

export type LinkKind = 'hierarchy' | 'related' | 'mention'

export interface GraphLink {
  source: string
  target: string
  kind: LinkKind
}

export interface GraphData {
  tracks: TrackInfo[]
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface SearchDoc {
  id: string
  type: 'topic' | 'concept'
  track: string
  name: string
  aliases: string[]
  /** Solo en temas. */
  summary?: string
  /** Título corto (solo en temas que lo declaran). No se indexa en el buscador. */
  short?: string
  /** Tema hogar (para conceptos, el tema al que pertenecen; para temas, el propio). */
  topic: string
  /** Nombre del tema hogar (solo en conceptos). */
  topicName?: string
}

export interface ChoiceItem {
  q: string
  /** Bloque de código ya resaltado (HTML), entre el enunciado y las opciones. */
  code?: string
  options: string[]
  answer: number
  why: string
}

export interface ClassifyItem {
  text: string
  /** Índice de la categoría correcta en `categories` del grupo. */
  answer: number
  why: string
}

export interface VerdictItem {
  statement: string
  ok: boolean
  why: string
}

export type ExerciseGroup =
  | { type: 'choice'; prompt: string; items: ChoiceItem[] }
  | { type: 'verdict'; prompt: string; items: VerdictItem[] }
  | { type: 'classify'; prompt: string; categories: string[]; items: ClassifyItem[] }

/**
 * Un tema, o una entrada de proyecto (`kind: 'project'`, decisión 6 de contenido-claro): esta lleva `covers`
 * y las secciones `context` y `walkthrough`, y no lleva `freq`, demo, conceptos ni ejercicios.
 */
export interface TopicContent {
  id: string
  track: string
  order: number
  /** Siempre en un tema; nunca en una entrada de proyecto. */
  freq?: Freq
  kind?: Kind
  /** Temas que reúne una entrada de proyecto, en el orden declarado. */
  covers?: string[]
  demo?: string
  title: string
  /** Título corto, si el tema lo declara. */
  short?: string
  summary: string
  /** HTML ya saneado y resaltado, por clave de sección. */
  sections: Partial<Record<BodySectionKey, string>>
  /** Campos de texto en HTML inline saneado. */
  exercises: ExerciseGroup[]
}
