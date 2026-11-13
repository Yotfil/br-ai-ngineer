/**
 * Textos en español que la guía no trae o que cambian al migrar:
 * - `summary`: regla de design.md decisión 2 (una oración, sin HTML, ≤140, condensa la primera oración de `def`).
 * - `bridge`: reescrito con la tabla de design.md decisión 14. `null` = se conserva el original (no depende del framework).
 *   En los temas 2, 6, 7 y 20 se usan literalmente los textos fijados al final de la decisión 14.
 * - `prob`: solo cuando cambia respecto a la guía (referencias por número pasan a enlaces `[[id]]`, decisión 16).
 */
export const REST_ES: Array<{ summary: string; bridge: string | null; prob?: string }> = [
  // 1
  { summary: 'El navegador resuelve el dominio (DNS), abre una conexión (TCP), la cifra (TLS), envía la petición HTTP y recibe la respuesta.', bridge: null },
  // 2 — frase fijada en la decisión 14.
  {
    summary: 'Un mensaje HTTP tiene línea inicial, headers, una línea en blanco y un body opcional.',
    bridge:
      'Cuando escribes `fetch(url, { method: "POST", headers, body: JSON.stringify(datos) })`, armas exactamente esta estructura: el método y la URL van a la línea inicial, los parámetros que agregues a la URL con `URLSearchParams` van a la query string, `headers` al bloque de headers y el body viaja como el texto JSON que serializaste. Tu función propia que envuelve `fetch` solo agrega una línea más al bloque de headers.',
  },
  // 3
  {
    summary: 'Una URL identifica un recurso y dónde encontrarlo: esquema, host, puerto, ruta, query y fragmento.',
    bridge:
      'El fragmento es justo lo que usaban los routers de SPA en modo hash (`/#/pedidos`): como el servidor nunca lo ve, siempre servía el mismo `index.html`. Con rutas normales (el router de una SPA) el servidor sí recibe `/pedidos`, y por eso hay que configurarlo para que devuelva el `index.html` en cualquier ruta.',
  },
  // 4
  {
    summary: 'El método indica la intención de la petición sobre el recurso: leer, crear, reemplazar, modificar, eliminar, pedir headers o consultar.',
    bridge:
      'La petición `OPTIONS` que ves en Network antes de tu `PUT` no la hiciste tú: es el preflight de CORS que lanza el navegador (ver [[cors]]). Y cuando usas `fetch` con `method: "PUT"` para editar un formulario a medias, estás borrando en el servidor los campos que no enviaste, si el backend implementa PUT correctamente.',
  },
  // 5
  {
    summary: 'Un método es seguro si no modifica el estado del servidor (GET, HEAD, OPTIONS).',
    bridge:
      'Un bucle de reintento en una función propia que envuelve `fetch`, aplicado a todo, es peligroso justo por esto: reintentar un GET está bien, pero reintentar un POST de pago puede cobrar dos veces. Una función que envuelve `fetch` bien hecha solo reintenta métodos idempotentes o peticiones con clave de idempotencia.',
    prob:
      'Es la base de los reintentos. Los clientes HTTP, los balanceadores y las colas reintentan automáticamente cuando hay timeouts. Si el método es idempotente, reintentar no causa daño; si no lo es (POST), el reintento puede duplicar pedidos o cobros, y hay que protegerlo con claves de idempotencia (ver [[idempotencia-en-la-practica]]).',
  },
  // 6 — frase fijada en la decisión 14.
  {
    summary: 'Número de tres dígitos que resume el resultado.',
    bridge:
      'Tras `await fetch(...)`, `response.ok` y `response.status` te indican error solo cuando el código es 4xx o 5xx. Cuando un backend responde 200 con un error dentro, tienes que revisar un campo del body (por ejemplo `ok: false`) después de cada petición: eso es síntoma de una API mal diseñada. Y tu función propia que envuelve `fetch` y redirige al login debería reaccionar a **401**, no a 403.',
  },
  // 7 — frase fijada en la decisión 14.
  {
    summary: 'Los headers son metadatos del mensaje.',
    bridge:
      'Cuando en DevTools miras **Response Headers**, la mayoría la pone el backend o el proxy. `Content-Type` de la petición lo pones tú: con `fetch`, si envías JSON debes declarar `application/json`; si envías `FormData`, el navegador lo arma con su `boundary`, y si lo fijas a mano rompes la subida de archivos.',
  },
  // 8
  {
    summary: 'HTTP es stateless: cada petición es independiente y el servidor no recuerda la anterior.',
    bridge:
      'Tu función propia que envuelve `fetch` y agrega `Authorization: Bearer` a cada petición existe justamente porque HTTP no tiene memoria. Con cookies no necesitas esa función: el navegador las adjunta solo, y por eso necesitas `credentials: "include"` cuando la API está en otro dominio.',
  },
  // 9
  {
    summary: 'Autenticación responde «¿quién eres?» (401 si falla).',
    bridge:
      'Tu función propia que envuelve `fetch` y, ante un 401, llama a `/refresh` y reintenta la petición original es la mitad cliente del flujo de refresh token. Del lado del servidor, ese 401 aparece cuando `jwt.decode` detecta que `exp` ya pasó. Y cuando haces login con Google en una app, el backend está actuando como cliente de OAuth2.',
  },
  // 10
  {
    summary: 'CORS es un mecanismo del navegador que deja a JavaScript de un origen leer respuestas de otro solo si el servidor lo autoriza.',
    bridge:
      "El mensaje rojo `blocked by CORS policy: No 'Access-Control-Allow-Origin' header` no significa que tu petición no llegó: en muchos casos el servidor sí la procesó, pero el navegador te ocultó la respuesta. El proxy del servidor de desarrollo lo «resuelve» porque hace que la petición salga del mismo origen (el dev server), no porque arregle el backend. Por eso con Postman o curl nunca ves errores de CORS.",
  },
  // 11
  { summary: 'El servidor indica con Cache-Control si una respuesta se puede guardar, quién la puede guardar y por cuánto tiempo.', bridge: null },
  // 12
  {
    summary: 'HTTPS es HTTP dentro de un canal TLS.',
    bridge:
      'El candado del navegador y el error `NET::ERR_CERT_DATE_INVALID` son la validación del certificado. Por eso el certificado autofirmado del servidor de desarrollo muestra advertencias: ninguna autoridad de confianza lo respalda. La cookie con `Secure` solo se envía por HTTPS.',
  },
  // 13
  { summary: 'HTTP/1.1 es texto, con conexiones persistentes pero una petición a la vez por conexión.', bridge: null },
  // 14
  {
    summary: 'REST es un estilo de arquitectura (Roy Fielding, 2000), no un protocolo ni un estándar.',
    bridge:
      'Un módulo cliente de la API con `getAll`, `getById`, `create`, `update` y `remove` mapea casi uno a uno con una API de nivel 2. Si tu módulo tiene métodos como `ejecutarAccion(tipo, payload)` contra un solo endpoint, estás consumiendo un nivel 0.',
  },
  // 15
  {
    summary: 'Diseñar una API REST es modelar el dominio como recursos en plural, con rutas predecibles, filtros, paginación y versionado.',
    bridge:
      'Una tabla paginada funciona con offset porque necesita saltar entre páginas y mostrar el total. Un scroll infinito, en cambio, encaja con cursor. Cuando diseñes la API para tu propio frontend, elige la paginación según la UI.',
  },
  // 16
  {
    summary: 'Una buena API responde siempre con la misma forma: éxitos consistentes y errores con el código correcto y un cuerpo estructurado.',
    bridge:
      'Tras `await fetch(...)`, tu función propia que envuelve `fetch` tiene `response.status` y el body. Con Problem Details en todo el backend, esa función puede mostrar el `title` del body en un toast sin un `switch` por endpoint.',
  },
  // 17
  {
    summary: 'Para operaciones no idempotentes, el cliente genera una clave de idempotencia única y la envía en un header.',
    bridge:
      'Deshabilitar el botón «Pagar» después del clic e ignorar clics mientras hay una petición en curso evitan el doble clic, pero no protegen de un reintento de tu función que envuelve `fetch` ni de la red. La solución robusta es generar un `crypto.randomUUID()` al abrir el checkout y enviarlo en cada intento como `Idempotency-Key`.',
  },
  // 18
  {
    summary: 'El rate limiting limita cuántas peticiones puede hacer un cliente en un período.',
    bridge:
      'Un buscador con autocompletado que no espera antes de enviar es el clásico generador de 429. Y una función propia de reintentos que envuelve `fetch` debería leer `Retry-After` y usar **backoff exponencial con jitter** en lugar de reintentar de inmediato.',
  },
  // 19
  { summary: 'REST es el estándar para APIs públicas de recursos.', bridge: null },
  // 20 — cláusula fijada en la decisión 14.
  {
    summary: 'Las bases son HTTPS obligatorio, validar la entrada, autenticar y autorizar en cada endpoint, limitar peticiones y cuidar el token.',
    bridge:
      'Guardar el token en `localStorage` es lo más común en SPAs y es vulnerable a XSS: cualquier script inyectado lo lee. Una cookie `HttpOnly` no es accesible desde JavaScript, pero reabre la puerta a CSRF, que se mitiga con `SameSite` y tokens CSRF. Un patrón equilibrado es el access token en memoria (en un módulo cliente de la API) y el refresh token en cookie HttpOnly. Los frameworks de frontend escapan por defecto lo que renderizan y eso te protege del XSS, salvo cuando insertas HTML sin escapar (por ejemplo con `innerHTML`); del lado del servidor, la defensa es validar entradas y devolver JSON con el `Content-Type` correcto, nunca HTML armado con datos del usuario.',
  },
]
