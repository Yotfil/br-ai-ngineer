/**
 * Datos de openspec/changes/pista-python/content-map.md (vinculante) para la migración de un solo uso.
 * El orden del arreglo es el de la pista (el tema 11 de la guía no se migra).
 */

export interface ConceptDef {
  id: string
  /** `null`: nombre pendiente de definir en content-map.md (el concepto no se escribe hasta entonces). */
  es: string | null
  en: string | null
}

export interface TopicMap {
  /** `id` del tema en el arreglo `TOPICS` de la guía. */
  guide: number
  id: string
  group: 'lenguaje' | 'fastapi'
  /** Título corto en español. */
  short: string
  concepts: ConceptDef[]
  related: string[]
}

const c = (id: string, es: string | null, en: string | null): ConceptDef => ({ id, es, en })

/** Tema de la guía que no se migra ("HTTP por dentro y principios REST"). */
export const SKIPPED_GUIDE_TOPIC = 11

export const PYTHON_MAP: TopicMap[] = [
  { guide: 1, id: 'tipado-y-type-hints', group: 'lenguaje', short: 'Tipado y type hints', concepts: [c('tipado-dinamico', 'tipado dinámico', 'dynamic typing'), c('type-hints', 'type hints', 'type hints')], related: ['dataclasses-y-pydantic'] },
  { guide: 2, id: 'estructuras-de-datos', group: 'lenguaje', short: 'list, tuple, dict, set', concepts: [c('list', 'list', 'list'), c('tuple', 'tuple', 'tuple'), c('dict', 'dict', 'dict'), c('set', 'set', 'set')], related: ['identidad-copias-mutabilidad'] },
  {
    guide: 3,
    id: 'comprehensions-y-generadores',
    group: 'lenguaje',
    short: 'Comprehensions y generadores',
    concepts: [c('comprehension', 'comprehension', 'comprehension'), c('generador', 'generador', 'generator'), c('yield', 'yield', 'yield')],
    related: ['estructuras-de-datos'],
  },
  {
    guide: 4,
    id: 'funciones-y-closures',
    group: 'lenguaje',
    short: 'Funciones y closures',
    concepts: [c('args-kwargs', '*args y **kwargs', '*args and **kwargs'), c('closure', 'closure', 'closure'), c('lambda', 'lambda', 'lambda'), c('default-mutable', 'default mutable', 'mutable default argument')],
    related: ['decoradores', 'mutabilidad'],
  },
  { guide: 5, id: 'decoradores', group: 'lenguaje', short: 'Decoradores', concepts: [c('decorador', 'decorador', 'decorator')], related: ['closure', 'rutas-y-parametros'] },
  {
    guide: 6,
    id: 'errores-y-context-managers',
    group: 'lenguaje',
    short: 'Errores y with',
    concepts: [c('context-manager', 'context manager', 'context manager'), c('try-except', 'try/except/finally', 'try/except/finally'), c('eafp', 'EAFP', 'EAFP')],
    related: ['errores-y-httpexception'],
  },
  {
    guide: 7,
    id: 'modulos-y-entornos',
    group: 'lenguaje',
    short: 'Módulos, venv y uv',
    concepts: [c('modulo', 'módulo', 'module'), c('paquete', 'paquete', 'package'), c('entorno-virtual', 'entorno virtual', 'virtual environment'), c('uv', 'uv', 'uv')],
    related: ['estructura-del-proyecto'],
  },
  {
    guide: 8,
    id: 'concurrencia',
    group: 'lenguaje',
    short: 'async, hilos y GIL',
    concepts: [c('async-await', 'async/await', 'async/await'), c('event-loop', 'event loop', 'event loop'), c('gil', 'GIL', 'GIL'), c('hilos-vs-procesos', 'hilos vs. procesos', 'threads vs. processes')],
    related: ['endpoints-async-vs-sync'],
  },
  { guide: 9, id: 'dataclasses-y-pydantic', group: 'lenguaje', short: 'Dataclasses y Pydantic', concepts: [c('dataclass', 'dataclass', 'dataclass'), c('pydantic', 'Pydantic', 'Pydantic')], related: ['modelos-y-response-model', 'type-hints'] },
  {
    guide: 10,
    id: 'identidad-copias-mutabilidad',
    group: 'lenguaje',
    short: 'is, ==, copias',
    concepts: [c('is-vs-igual', 'is vs. ==', 'is vs. =='), c('copia-superficial-y-profunda', 'copia superficial y profunda', 'shallow and deep copy'), c('mutabilidad', 'mutabilidad', 'mutability')],
    related: ['default-mutable', 'estructuras-de-datos'],
  },
  { guide: 12, id: 'rutas-y-parametros', group: 'fastapi', short: 'Rutas y parámetros', concepts: [c('path-operation', 'path operation', 'path operation')], related: ['parametro-de-ruta', 'query-string', 'body', 'type-hints'] },
  {
    guide: 13,
    id: 'modelos-y-response-model',
    group: 'fastapi',
    short: 'Modelos y response_model',
    concepts: [c('response-model', 'response_model', 'response_model'), c('modelos-de-entrada-y-salida', 'modelos de entrada y salida', 'input and output models')],
    related: ['pydantic', 'codigos-de-estado'],
  },
  {
    guide: 14,
    id: 'inyeccion-con-depends',
    group: 'fastapi',
    short: 'Depends',
    concepts: [c('depends', 'Depends', 'Depends'), c('dependency-overrides', 'dependency_overrides', 'dependency_overrides')],
    related: ['pytest-y-testclient', 'base-de-datos'],
  },
  {
    guide: 15,
    id: 'errores-y-httpexception',
    group: 'fastapi',
    short: 'HTTPException',
    concepts: [c('httpexception', 'HTTPException', 'HTTPException'), c('exception-handler', 'exception handler', 'exception handler')],
    related: ['codigos-de-estado', 'problem-details'],
  },
  { guide: 16, id: 'endpoints-async-vs-sync', group: 'fastapi', short: 'async def vs def', concepts: [c('threadpool', 'threadpool', 'threadpool')], related: ['async-await', 'event-loop'] },
  {
    guide: 17,
    id: 'base-de-datos',
    group: 'fastapi',
    short: 'BD, sesiones y Alembic',
    concepts: [c('orm', 'ORM', 'ORM'), c('sqlalchemy', 'SQLAlchemy', 'SQLAlchemy'), c('sqlmodel', 'SQLModel', 'SQLModel'), c('session-orm', 'Session', 'Session'), c('alembic', 'Alembic', 'Alembic')],
    related: ['depends', 'context-manager'],
  },
  {
    guide: 18,
    id: 'autenticacion-en-fastapi',
    group: 'fastapi',
    short: 'Auth: OAuth2 y hashing',
    concepts: [c('hashing-de-contrasenas', 'hashing de contraseñas', 'password hashing'), c('oauth2-password-flow', 'flujo de contraseña de OAuth2', 'OAuth2 password flow')],
    related: ['jwt', 'oauth2', 'autenticacion-autorizacion', 'depends'],
  },
  {
    guide: 19,
    id: 'middleware-cors-background',
    group: 'fastapi',
    short: 'Middleware, CORS, background',
    concepts: [c('middleware', 'middleware', 'middleware'), c('cors-middleware', 'CORSMiddleware', 'CORSMiddleware'), c('background-tasks', 'BackgroundTasks', 'BackgroundTasks')],
    related: ['cors-concepto', 'preflight'],
  },
  {
    guide: 20,
    id: 'estructura-del-proyecto',
    group: 'fastapi',
    short: 'Estructura del proyecto',
    concepts: [c('api-router', 'APIRouter', 'APIRouter'), c('capas', 'capas (router, servicio, repositorio)', 'layers (router, service, repository)'), c('settings', 'Settings', 'Settings')],
    related: ['modulos-y-entornos', 'depends'],
  },
  {
    guide: 21,
    id: 'pytest-y-testclient',
    group: 'fastapi',
    short: 'pytest y TestClient',
    concepts: [c('pytest', 'pytest', 'pytest'), c('fixture', 'fixture', 'fixture'), c('testclient', 'TestClient', 'TestClient')],
    related: ['dependency-overrides'],
  },
  {
    guide: 22,
    id: 'openapi-y-despliegue',
    group: 'fastapi',
    short: 'OpenAPI, Uvicorn y Docker',
    concepts: [c('openapi', 'OpenAPI', 'OpenAPI'), c('uvicorn', 'Uvicorn', 'Uvicorn'), c('docker', 'Docker', 'Docker')],
    related: ['modelos-y-response-model'],
  },
]

/** Título que cambia respecto a la guía. */
export const RENAMED: Record<string, { es: string; en: string; shortEn: string }> = {
  'autenticacion-en-fastapi': {
    es: 'Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas',
    en: 'Authentication in FastAPI: OAuth2, JWT and password hashing',
    shortEn: 'Auth: OAuth2 and hashing',
  },
}

/** Alias adicionales (sección "Alias" de content-map.md). Se añaden en ambos idiomas, como en REST. */
export const EXTRA_ALIASES: Record<string, string[]> = {
  'try-except': ['try except', 'try except finally'],
  'async-await': ['async await'],
  'entorno-virtual': ['venv', 'virtualenv'],
  gil: ['Global Interpreter Lock'],
  'default-mutable': ['argumento mutable por defecto'],
  'hashing-de-contrasenas': ['Argon2', 'pwdlib', 'hash'],
  'oauth2-password-flow': ['OAuth2PasswordBearer'],
  'background-tasks': ['tareas en segundo plano', 'background tasks'],
  alembic: ['migraciones', 'migrations'],
  'session-orm': ['sesión de base de datos', 'database session'],
  'args-kwargs': ['args', 'kwargs'],
  'copia-superficial-y-profunda': ['deepcopy', 'shallow copy', 'deep copy'],
}

export const FREQ_MAP: Record<string, 'always' | 'often' | 'sometimes'> = { casi: 'always', seguido: 'often', aveces: 'sometimes' }

/** Enunciados de grupo por clase de ejercicio (design.md decisión 6). `classify` usa el `q` del ejercicio. */
export const PROMPTS = {
  es: { output: '¿Qué imprime este código?', status: '¿Qué código de estado devuelve?', concept: 'Pregunta rápida' },
  en: { output: 'What does this code print?', status: 'Which status code does it return?', concept: 'Quick question' },
} as const

/** Lenguaje de valla de los bloques del ejemplo principal (design.md decisión 2; `codeLang`/`code2Lang` de la guía). */
export const TEXT_BLOCKS: Record<number, { code?: boolean; code2?: boolean }> = { 20: { code: true }, 22: { code2: true } }
