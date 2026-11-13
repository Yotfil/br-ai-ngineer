/**
 * Datos de openspec/changes/esqueleto-y-pista-rest/content-map.md (vinculante) para la migración de un solo uso.
 * El orden del arreglo es el de la guía original.
 */

export interface ConceptDef {
  id: string
  es: string
  en: string
}

export interface TopicMap {
  id: string
  demo?: string
  concepts: ConceptDef[]
  related: string[]
}

const c = (id: string, es: string, en: string): ConceptDef => ({ id, es, en })

export const REST_MAP: TopicMap[] = [
  { id: 'url-a-respuesta', concepts: [c('dns', 'DNS', 'DNS'), c('tcp', 'TCP', 'TCP'), c('ttfb', 'TTFB', 'TTFB')], related: ['https-tls', 'anatomia-peticion-respuesta'] },
  { id: 'anatomia-peticion-respuesta', concepts: [c('linea-inicial', 'línea inicial', 'start line'), c('body', 'cuerpo (body)', 'body')], related: ['cabeceras', 'anatomia-url'] },
  {
    id: 'anatomia-url',
    concepts: [c('query-string', 'query string', 'query string'), c('parametro-de-ruta', 'parámetro de ruta', 'path parameter'), c('fragmento', 'fragmento', 'fragment')],
    related: ['diseno-api-rest'],
  },
  { id: 'metodos-http', concepts: [c('put-vs-patch', 'PUT vs. PATCH', 'PUT vs. PATCH'), c('get-vs-post', 'GET vs. POST', 'GET vs. POST')], related: ['metodos-seguros-idempotentes', 'preflight'] },
  {
    id: 'metodos-seguros-idempotentes',
    demo: 'idempotency-retry',
    concepts: [c('idempotencia', 'idempotencia', 'idempotency'), c('metodo-seguro', 'método seguro', 'safe method')],
    related: ['metodos-http', 'idempotencia-en-la-practica'],
  },
  {
    id: 'codigos-de-estado',
    demo: 'status-explorer',
    concepts: [c('401-vs-403', '401 vs. 403', '401 vs. 403'), c('4xx-vs-5xx', '4xx vs. 5xx', '4xx vs. 5xx')],
    related: ['errores-problem-details', 'autenticacion-autorizacion'],
  },
  {
    id: 'cabeceras',
    concepts: [c('content-type', 'Content-Type', 'Content-Type'), c('negociacion-de-contenido', 'negociación de contenido', 'content negotiation')],
    related: ['anatomia-peticion-respuesta', 'cache-http'],
  },
  {
    id: 'http-sin-estado',
    concepts: [c('stateless', 'sin estado (stateless)', 'stateless'), c('cookie', 'cookie', 'cookie'), c('sesion', 'sesión', 'session')],
    related: ['autenticacion-autorizacion', 'almacenamiento-del-token'],
  },
  {
    id: 'autenticacion-autorizacion',
    concepts: [c('jwt', 'JWT', 'JWT'), c('oauth2', 'OAuth2', 'OAuth2'), c('refresh-token', 'refresh token', 'refresh token')],
    related: ['http-sin-estado', '401-vs-403', 'seguridad-api'],
  },
  { id: 'cors', concepts: [c('cors-concepto', 'CORS', 'CORS'), c('preflight', 'preflight', 'preflight'), c('origen', 'origen', 'origin')], related: ['metodos-http', 'seguridad-api'] },
  {
    id: 'cache-http',
    concepts: [c('cache-control', 'Cache-Control', 'Cache-Control'), c('etag', 'ETag', 'ETag'), c('304', '304 Not Modified', '304 Not Modified')],
    related: ['cabeceras', 'codigos-de-estado'],
  },
  { id: 'https-tls', concepts: [c('tls', 'TLS', 'TLS'), c('certificado', 'certificado', 'certificate')], related: ['url-a-respuesta', 'seguridad-api'] },
  { id: 'versiones-http', concepts: [c('http2', 'HTTP/2', 'HTTP/2'), c('http3', 'HTTP/3', 'HTTP/3'), c('multiplexacion', 'multiplexación', 'multiplexing')], related: ['url-a-respuesta'] },
  {
    id: 'rest-richardson',
    concepts: [
      c('restricciones-rest', 'restricciones REST', 'REST constraints'),
      c('modelo-de-richardson', 'modelo de Richardson', 'Richardson maturity model'),
      c('hateoas', 'HATEOAS', 'HATEOAS'),
    ],
    related: ['diseno-api-rest', 'stateless'],
  },
  {
    id: 'diseno-api-rest',
    concepts: [
      c('paginacion', 'paginación', 'pagination'),
      c('paginacion-por-cursor', 'paginación por cursor', 'cursor pagination'),
      c('versionado-de-api', 'versionado de API', 'API versioning'),
    ],
    related: ['rest-richardson', 'anatomia-url', 'errores-problem-details'],
  },
  { id: 'errores-problem-details', concepts: [c('problem-details', 'Problem Details', 'Problem Details')], related: ['codigos-de-estado', 'diseno-api-rest'] },
  {
    id: 'idempotencia-en-la-practica',
    concepts: [c('clave-de-idempotencia', 'clave de idempotencia', 'idempotency key'), c('reintentos', 'reintentos', 'retries')],
    related: ['idempotencia', 'rate-limiting'],
  },
  {
    id: 'rate-limiting',
    demo: 'token-bucket',
    concepts: [c('token-bucket-concepto', 'token bucket', 'token bucket'), c('429', '429 Too Many Requests', '429 Too Many Requests'), c('retry-after', 'Retry-After', 'Retry-After')],
    related: ['reintentos', 'codigos-de-estado'],
  },
  {
    id: 'rest-vs-alternativas',
    concepts: [c('graphql', 'GraphQL', 'GraphQL'), c('grpc', 'gRPC', 'gRPC'), c('websockets', 'WebSockets', 'WebSockets'), c('sse', 'SSE', 'SSE'), c('webhooks', 'webhooks', 'webhooks')],
    related: ['rest-richardson'],
  },
  {
    id: 'seguridad-api',
    concepts: [c('almacenamiento-del-token', 'dónde guardar el token', 'token storage'), c('xss', 'XSS', 'XSS'), c('csrf', 'CSRF', 'CSRF')],
    related: ['autenticacion-autorizacion', 'cors', 'https-tls'],
  },
]

/** Alias adicionales de content-map.md ("No se añaden más alias"). Valen para ambos idiomas. */
export const EXTRA_ALIASES: Record<string, string[]> = {
  'clave-de-idempotencia': ['Idempotency-Key'],
  'paginacion-por-cursor': ['cursor', 'offset'],
  jwt: ['JSON Web Token'],
  sse: ['Server-Sent Events'],
  tls: ['HTTPS', 'SSL'],
  '429': ['Too Many Requests'],
}

export const FREQ_MAP: Record<string, 'always' | 'often' | 'sometimes'> = { casi: 'always', seguido: 'often', aveces: 'sometimes' }

/** Enunciados de grupo (design.md decisión 2). */
export const PROMPTS = {
  es: {
    status: '¿Qué código de estado devuelve este caso?',
    method: '¿Qué método o respuesta corresponde?',
    verdict: 'Revisa este diseño: ¿cada endpoint está bien o tiene un error?',
  },
  en: {
    status: 'Which status code does this case return?',
    method: 'Which method or response fits?',
    verdict: 'Review this design: is each endpoint correct or does it have an error?',
  },
}
