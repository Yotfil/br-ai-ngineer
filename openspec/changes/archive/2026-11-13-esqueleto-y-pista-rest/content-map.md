# Mapa de contenido — pista HTTP y REST

Este archivo es vinculante para la migración (tareas del grupo 7). Fija los identificadores, la demo, los conceptos y las relaciones de cada tema. Quien implementa no añade, quita ni renombra entradas, con una sola excepción explícita: si un concepto listado aquí no se menciona en el texto del tema de la guía original, se omite y se informa en el resumen final; no se sustituye por otro.

## Pistas (`tracks.yaml`)

| id | abbr | color | orden | nombre ES | nombre EN | contenido en este cambio |
|---|---|---|---|---|---|---|
| `rest` | RE | `#22d3ee` | 1 | HTTP y REST | HTTP & REST | 20 temas |
| `python` | PY | `#4ade80` | 2 | Python y FastAPI | Python & FastAPI | ninguno (Próximamente) |
| `sql` | SQ | `#fbbf24` | 3 | SQL | SQL | ninguno (Próximamente) |
| `git` | GI | `#fb7a4a` | 4 | Git | Git | ninguno (Próximamente) |
| `oop` | OO | `#a78bfa` | 5 | POO | OOP | ninguno (Próximamente) |

## Frecuencia

| guía original (`f`) | `freq` | rótulo ES | rótulo EN |
|---|---|---|---|
| `casi` | `always` | casi siempre | almost always |
| `seguido` | `often` | seguido | often |
| `aveces` | `sometimes` | a veces | sometimes |

## Demos portadas

| demo original | id nuevo | tema |
|---|---|---|
| `idem` | `idempotency-retry` | 5 |
| `status` | `status-explorer` | 6 |
| `ratelimit` | `token-bucket` | 18 |

Los demás temas no llevan `demo` en `meta.yaml`.

## Temas

`order` es el número de la primera columna. El tema hogar de cada concepto es la fila donde aparece. `related` usa ids de tema o de concepto de esta misma tabla.

| # | id del tema | conceptos (id: ES / EN) | related |
|---|---|---|---|
| 1 | `url-a-respuesta` | `dns`: DNS / DNS · `tcp`: TCP / TCP · `ttfb`: TTFB / TTFB | `https-tls`, `anatomia-peticion-respuesta` |
| 2 | `anatomia-peticion-respuesta` | `linea-inicial`: línea inicial / start line · `body`: cuerpo (body) / body | `cabeceras`, `anatomia-url` |
| 3 | `anatomia-url` | `query-string`: query string / query string · `parametro-de-ruta`: parámetro de ruta / path parameter · `fragmento`: fragmento / fragment | `diseno-api-rest` |
| 4 | `metodos-http` | `put-vs-patch`: PUT vs. PATCH / PUT vs. PATCH · `get-vs-post`: GET vs. POST / GET vs. POST | `metodos-seguros-idempotentes`, `preflight` |
| 5 | `metodos-seguros-idempotentes` | `idempotencia`: idempotencia / idempotency · `metodo-seguro`: método seguro / safe method | `metodos-http`, `idempotencia-en-la-practica` |
| 6 | `codigos-de-estado` | `401-vs-403`: 401 vs. 403 / 401 vs. 403 · `4xx-vs-5xx`: 4xx vs. 5xx / 4xx vs. 5xx | `errores-problem-details`, `autenticacion-autorizacion` |
| 7 | `cabeceras` | `content-type`: Content-Type / Content-Type · `negociacion-de-contenido`: negociación de contenido / content negotiation | `anatomia-peticion-respuesta`, `cache-http` |
| 8 | `http-sin-estado` | `stateless`: sin estado (stateless) / stateless · `cookie`: cookie / cookie · `sesion`: sesión / session | `autenticacion-autorizacion`, `almacenamiento-del-token` |
| 9 | `autenticacion-autorizacion` | `jwt`: JWT / JWT · `oauth2`: OAuth2 / OAuth2 · `refresh-token`: refresh token / refresh token | `http-sin-estado`, `401-vs-403`, `seguridad-api` |
| 10 | `cors` | `cors-concepto`: CORS / CORS · `preflight`: preflight / preflight · `origen`: origen / origin | `metodos-http`, `seguridad-api` |
| 11 | `cache-http` | `cache-control`: Cache-Control / Cache-Control · `etag`: ETag / ETag · `304`: 304 Not Modified / 304 Not Modified | `cabeceras`, `codigos-de-estado` |
| 12 | `https-tls` | `tls`: TLS / TLS · `certificado`: certificado / certificate | `url-a-respuesta`, `seguridad-api` |
| 13 | `versiones-http` | `http2`: HTTP/2 / HTTP/2 · `http3`: HTTP/3 / HTTP/3 · `multiplexacion`: multiplexación / multiplexing | `url-a-respuesta` |
| 14 | `rest-richardson` | `restricciones-rest`: restricciones REST / REST constraints · `modelo-de-richardson`: modelo de Richardson / Richardson maturity model · `hateoas`: HATEOAS / HATEOAS | `diseno-api-rest`, `stateless` |
| 15 | `diseno-api-rest` | `paginacion`: paginación / pagination · `paginacion-por-cursor`: paginación por cursor / cursor pagination · `versionado-de-api`: versionado de API / API versioning | `rest-richardson`, `anatomia-url`, `errores-problem-details` |
| 16 | `errores-problem-details` | `problem-details`: Problem Details / Problem Details | `codigos-de-estado`, `diseno-api-rest` |
| 17 | `idempotencia-en-la-practica` | `clave-de-idempotencia`: clave de idempotencia / idempotency key · `reintentos`: reintentos / retries | `idempotencia`, `rate-limiting` |
| 18 | `rate-limiting` | `token-bucket-concepto`: token bucket / token bucket · `429`: 429 Too Many Requests / 429 Too Many Requests · `retry-after`: Retry-After / Retry-After | `reintentos`, `codigos-de-estado` |
| 19 | `rest-vs-alternativas` | `graphql`: GraphQL / GraphQL · `grpc`: gRPC / gRPC · `websockets`: WebSockets / WebSockets · `sse`: SSE / SSE · `webhooks`: webhooks / webhooks | `rest-richardson` |
| 20 | `seguridad-api` | `almacenamiento-del-token`: dónde guardar el token / token storage · `xss`: XSS / XSS · `csrf`: CSRF / CSRF | `autenticacion-autorizacion`, `cors`, `https-tls` |

## Alias

Cada concepto lleva como alias, en cada idioma, su nombre en el otro idioma. Los temas no declaran alias: el compilador añade solo su título en el otro idioma al índice de búsqueda (design.md, decisión 17). Además, estos conceptos llevan alias adicionales:

- `clave-de-idempotencia`: `Idempotency-Key`
- `paginacion-por-cursor`: `cursor`, `offset`
- `jwt`: `JSON Web Token`
- `sse`: `Server-Sent Events`
- `tls`: `HTTPS`, `SSL`
- `429`: `Too Many Requests`

No se añaden más alias.

## Títulos

El título en español de cada tema es el de la guía original (campo `t`), sin cambios. El título en inglés es su traducción directa.
