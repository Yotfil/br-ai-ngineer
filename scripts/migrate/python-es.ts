/**
 * Textos en español que la guía no trae o que cambian al migrar (design.md decisiones 1 y 9):
 * - `summary`: una oración, sin HTML, de 140 caracteres como máximo, que condensa la primera oración de `def`.
 * - `BRIDGES`, `PHRASES` y `EXERCISE_19`: textos de openspec/changes/pista-python/rewrites.md, copiados literalmente.
 * Los títulos cortos están en `python-map.ts`.
 */

/** Resumen por `id` de tema de la guía. */
export const SUMMARIES: Record<number, string> = {
  1: "Python tiene tipado dinámico y fuerte: los valores tienen tipo, las variables no, y no hay conversiones implícitas.",
  // rewrites.md, "Resumen fijado".
  2: "list, tuple, dict y set: cuándo usar cada una según orden, mutabilidad, búsqueda por clave y elementos únicos.",
  3: "Una comprehension construye una lista, dict o set en una sola expresión.",
  4: "Python acepta parámetros posicionales, con nombre y con valor por defecto.",
  5: "Un decorador es una función que recibe otra función y devuelve una que la envuelve para añadirle comportamiento sin tocar su código.",
  6: "try / except / else / finally controla errores: else corre si no hubo excepción y finally corre siempre.",
  7: "Un módulo es un archivo .py; un paquete es una carpeta de módulos, normalmente con __init__.py.",
  8: "async/await da concurrencia cooperativa en un solo hilo con un event loop (asyncio), ideal para esperas de I/O.",
  9: "@dataclass genera __init__, __repr__ y __eq__ a partir de las anotaciones, sin validar.",
  10: "== compara valor (llama a __eq__); is compara identidad: si es el mismo objeto en memoria.",
  12: "Una path operation es método + ruta + función.",
  13: "Separa los esquemas: lo que entra, lo que sale y lo que se guarda.",
  14: "Depends declara que el valor de un parámetro lo provee una función que FastAPI ejecuta antes del handler, en cada petición.",
  15: "raise HTTPException(status_code, detail) corta la ejecución y FastAPI responde un JSON con detail y ese código.",
  16: "Un endpoint async def corre en el event loop: úsalo cuando todo lo que hace por dentro es awaitable.",
  17: "Un ORM mapea clases a tablas.",
  18: "Autenticación: quién eres.",
  19: "Un middleware envuelve cada petición y respuesta (logs, tiempos, cabeceras).",
  20: "Separa por responsabilidad: routers, servicios, repositorios, schemas, models y configuración con pydantic-settings.",
  21: "pytest descubre funciones test_* en archivos test_*.py, usa assert normal y prepara contexto con fixtures inyectadas por nombre.",
  22: "FastAPI genera un esquema OpenAPI a partir de rutas, type hints y modelos, y lo sirve en /docs, /redoc y /openapi.json.",
}

/** Puentes reescritos (completos), por `id` de tema de la guía. */
export const BRIDGES: Record<number, string> = {
  // comprehensions-y-generadores
  3: "La comprehension equivale a `.filter().map()` encadenados. Los generadores existen igual en JS (`function*` y `yield`). Frente a un stream que *empuja* valores hacia ti (push), como un `EventEmitter` o un `ReadableStream`, un generador los entrega cuando tú los pides (pull).",
  // decoradores
  5: "En TypeScript, un decorador de clase (como `@Entity` en TypeORM) suele adjuntar *metadatos* a la clase para que una librería los lea después. En Python el decorador es una función normal que se ejecuta al definir y *reemplaza* el objeto por lo que devuelva. `@app.get(\"/productos\")` en FastAPI registra tu función en el router y te la devuelve igual.",
  // concurrencia
  8: "La sintaxis es casi igual a JS y `asyncio.gather` ≈ `Promise.all`. Diferencia clave: en JS una Promise empieza a ejecutarse en cuanto se crea; en Python una corrutina **no hace nada** hasta que la awaiteas o la conviertes en Task. Node también tiene un solo hilo con event loop, pero no tiene GIL porque nunca tuvo hilos de JS compartiendo memoria. En JS cancelas con `AbortController`; asyncio tiene Tasks cancelables y async generators.",
  // rutas-y-parametros
  12: "En Express escribirías `app.get('/productos/:id', (req, res) => ...)` y convertirías `req.params.id` a mano. Aquí la conversión y validación salen del type hint. Es la misma idea de `:id` en el router de una SPA, pero sin parsear el valor tú mismo.",
  // modelos-y-response-model
  13: "Es la idea de los DTO: tener un tipo `CreateClienteDto` para lo que entra y otro `ClienteResponse` para lo que sale. La diferencia es que aquí el modelo de salida no es solo un tipo: se valida y filtra en ejecución. Pydantic frente a una interfaz de TS: la interfaz desaparece al compilar; el modelo actúa.",
  // inyeccion-con-depends
  14: "Se parece a un contenedor de inyección de dependencias de TypeScript (como InversifyJS o tsyringe), pero hay diferencias que conviene decir en la entrevista. Esos contenedores resuelven por **tipo o token** y suelen entregar singletons. FastAPI resuelve por **función**, la ejecuta en cada petición y sus parámetros pueden salir de la propia petición (query, cabeceras, body). Para tests, `app.dependency_overrides` ≈ `jest.mock` sobre un módulo.",
  // errores-y-httpexception
  15: "Equivale a lanzar un error con código de estado en Express y dejar que un middleware de errores lo convierta en respuesta. Del otro lado, es lo que tu frontend recibe tras `await fetch(...)`: una respuesta con `response.ok` en `false` y el motivo en el campo `detail` del body. El `exception_handler` es el equivalente al middleware de errores global de Express.",
  // autenticacion-en-fastapi
  18: "En el frontend guardabas el token y una función que envuelve `fetch` añadía `Authorization: Bearer`; ahora estás del otro lado. Las **rutas protegidas** del frontend se parecen a dependencias como `requiere_admin`, con una diferencia de fondo: la protección del frontend es experiencia de usuario; la dependencia del backend es la seguridad real.",
  // middleware-cors-background
  19: "El middleware se parece al `(req, res, next)` de Express: `await call_next(request)` ≈ `next()`. Del lado del cliente, es la misma idea que una función que envuelve `fetch` para tocar cada petición. Y el error de CORS que veías en la consola del navegador se arregla aquí, no en el frontend (en desarrollo también lo esquivabas con el proxy del servidor de desarrollo).",
  // estructura-del-proyecto
  20: "Es la organización por *features* que ya usas en el frontend: cada carpeta con su router (como las rutas del feature), sus servicios y sus modelos. `Settings` ≈ un archivo de configuración por entorno o `import.meta.env`, pero se lee de variables de entorno en ejecución, no al compilar.",
  // pytest-y-testclient
  21: "pytest ≈ Jest o Vitest, y `assert` ≈ `expect`. Una fixture ≈ `beforeEach`, pero se inyecta por el **nombre del parámetro** (otra vez inyección de dependencias). `dependency_overrides` ≈ `jest.mock` sobre un módulo, y TestClient ≈ supertest.",
  // openapi-y-despliegue
  22: "`fastapi dev` vs `fastapi run` ≈ el servidor de desarrollo (`vite dev`) vs servir el build. Uvicorn ocupa el lugar del servidor HTTP de Node. Con `/openapi.json` puedes generar el cliente tipado de TypeScript con openapi-generator y dejar de escribir interfaces a mano.",
}

/** Oraciones sustituidas fuera del puente. `field` es el campo de la guía (ya convertido a Markdown). */
export const PHRASES: Array<{ guide: number; field: 'answer' | 'problem'; from: string; to: string }> = [
  { guide: 14, field: "answer", from: "A diferencia de Angular, no hay singletons por defecto ni resolución por tipo, y en tests reemplazo dependencias con dependency_overrides.", to: "A diferencia de los contenedores de inyección clásicos, no hay singletons por defecto ni resolución por tipo, y en tests reemplazo dependencias con dependency_overrides." },
  { guide: 19, field: "problem", from: "Sin CORS configurado, tu app Angular en `localhost:4200` no puede leer las respuestas de la API en `localhost:8000`.", to: "Sin CORS configurado, tu frontend en `localhost:4200` no puede leer las respuestas de la API en `localhost:8000`." },
  { guide: 19, field: "answer", from: "lo uso para logs, métricas o cabeceras, como un interceptor de Angular pero en el servidor.", to: "lo uso para logs, métricas o cabeceras, como una función que envuelve `fetch` en el cliente, pero en el servidor." },
]

/** Segundo ejercicio (`kind: concept`) del tema 19 de la guía, reescrito. Respuesta correcta: la segunda opción. */
export const EXERCISE_19 = { index: 1, q: "¿Qué equivale a `await call_next(request)` en un middleware de Express?", opts: ["`req.clone()`", "`next()`", "`res.send()`", "`app.use()`"], a: 1, exp: "Ambos pasan la petición al siguiente eslabón de la cadena. En FastAPI, además, `call_next` te devuelve la respuesta para modificarla." }
