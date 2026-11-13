# Textos reescritos — pista Python y FastAPI

Vinculante. Criterio decidido por el usuario: se conservan las comparaciones con JavaScript, TypeScript, Node, npm y librerías del ecosistema (Zod, Express, Prisma, TypeORM, Jest, supertest); se quita lo que es de un framework concreto (Angular, NestJS) y RxJS.

Reglas:

- Los textos de este archivo se usan **literalmente** en español. La versión en inglés es su traducción directa, sin cambiar los identificadores de código.
- Los puentes que no aparecen aquí (temas 1, 2, 4, 6, 7, 9, 10, 16 y 17 de la guía) se migran sin cambios de contenido.
- Fuera de lo listado aquí no se reescribe nada. Si tras aplicar este archivo queda en el contenido alguna mención a "Angular", "NestJS", "RxJS", "HttpClient", "interceptor", "TestBed", "ng serve" o "proxy.conf", quien implementa se detiene y la reporta.
- El código de los ejemplos no se toca. En particular, `http://localhost:4200` se conserva dentro de los bloques de código.

Los números son el `id` del tema en la guía.

## Puentes (campo `bridge`, completos)

**3 — `comprehensions-y-generadores`**

La comprehension equivale a `.filter().map()` encadenados. Los generadores existen igual en JS (`function*` y `yield`). Frente a un stream que *empuja* valores hacia ti (push), como un `EventEmitter` o un `ReadableStream`, un generador los entrega cuando tú los pides (pull).

**5 — `decoradores`**

En TypeScript, un decorador de clase (como `@Entity` en TypeORM) suele adjuntar *metadatos* a la clase para que una librería los lea después. En Python el decorador es una función normal que se ejecuta al definir y *reemplaza* el objeto por lo que devuelva. `@app.get("/productos")` en FastAPI registra tu función en el router y te la devuelve igual.

**8 — `concurrencia`**

La sintaxis es casi igual a JS y `asyncio.gather` ≈ `Promise.all`. Diferencia clave: en JS una Promise empieza a ejecutarse en cuanto se crea; en Python una corrutina **no hace nada** hasta que la awaiteas o la conviertes en Task. Node también tiene un solo hilo con event loop, pero no tiene GIL porque nunca tuvo hilos de JS compartiendo memoria. En JS cancelas con `AbortController`; asyncio tiene Tasks cancelables y async generators.

**12 — `rutas-y-parametros`**

En Express escribirías `app.get('/productos/:id', (req, res) => ...)` y convertirías `req.params.id` a mano. Aquí la conversión y validación salen del type hint. Es la misma idea de `:id` en el router de una SPA, pero sin parsear el valor tú mismo.

**13 — `modelos-y-response-model`**

Es la idea de los DTO: tener un tipo `CreateClienteDto` para lo que entra y otro `ClienteResponse` para lo que sale. La diferencia es que aquí el modelo de salida no es solo un tipo: se valida y filtra en ejecución. Pydantic frente a una interfaz de TS: la interfaz desaparece al compilar; el modelo actúa.

**14 — `inyeccion-con-depends`**

Se parece a un contenedor de inyección de dependencias de TypeScript (como InversifyJS o tsyringe), pero hay diferencias que conviene decir en la entrevista. Esos contenedores resuelven por **tipo o token** y suelen entregar singletons. FastAPI resuelve por **función**, la ejecuta en cada petición y sus parámetros pueden salir de la propia petición (query, cabeceras, body). Para tests, `app.dependency_overrides` ≈ `jest.mock` sobre un módulo.

**15 — `errores-y-httpexception`**

Equivale a lanzar un error con código de estado en Express y dejar que un middleware de errores lo convierta en respuesta. Del otro lado, es lo que tu frontend recibe tras `await fetch(...)`: una respuesta con `response.ok` en `false` y el motivo en el campo `detail` del body. El `exception_handler` es el equivalente al middleware de errores global de Express.

**18 — `autenticacion-en-fastapi`**

En el frontend guardabas el token y una función que envuelve `fetch` añadía `Authorization: Bearer`; ahora estás del otro lado. Las **rutas protegidas** del frontend se parecen a dependencias como `requiere_admin`, con una diferencia de fondo: la protección del frontend es experiencia de usuario; la dependencia del backend es la seguridad real.

**19 — `middleware-cors-background`**

El middleware se parece al `(req, res, next)` de Express: `await call_next(request)` ≈ `next()`. Del lado del cliente, es la misma idea que una función que envuelve `fetch` para tocar cada petición. Y el error de CORS que veías en la consola del navegador se arregla aquí, no en el frontend (en desarrollo también lo esquivabas con el proxy del servidor de desarrollo).

**20 — `estructura-del-proyecto`**

Es la organización por *features* que ya usas en el frontend: cada carpeta con su router (como las rutas del feature), sus servicios y sus modelos. `Settings` ≈ un archivo de configuración por entorno o `import.meta.env`, pero se lee de variables de entorno en ejecución, no al compilar.

**21 — `pytest-y-testclient`**

pytest ≈ Jest o Vitest, y `assert` ≈ `expect`. Una fixture ≈ `beforeEach`, pero se inyecta por el **nombre del parámetro** (otra vez inyección de dependencias). `dependency_overrides` ≈ `jest.mock` sobre un módulo, y TestClient ≈ supertest.

**22 — `openapi-y-despliegue`**

`fastapi dev` vs `fastapi run` ≈ el servidor de desarrollo (`vite dev`) vs servir el build. Uvicorn ocupa el lugar del servidor HTTP de Node. Con `/openapi.json` puedes generar el cliente tipado de TypeScript con openapi-generator y dejar de escribir interfaces a mano.

## Frases fuera del puente

Se sustituye solo la oración indicada; el resto del campo no cambia.

**14 — `inyeccion-con-depends`, campo `answer` (sección `interview`)**

- Original: "A diferencia de Angular, no hay singletons por defecto ni resolución por tipo, y en tests reemplazo dependencias con dependency_overrides."
- Nuevo: "A diferencia de los contenedores de inyección clásicos, no hay singletons por defecto ni resolución por tipo, y en tests reemplazo dependencias con dependency_overrides."

**19 — `middleware-cors-background`, campo `problem`**

- Original: "Sin CORS configurado, tu app Angular en `localhost:4200` no puede leer las respuestas de la API en `localhost:8000`."
- Nuevo: "Sin CORS configurado, tu frontend en `localhost:4200` no puede leer las respuestas de la API en `localhost:8000`."

**19 — `middleware-cors-background`, campo `answer` (sección `interview`)**

- Original: "lo uso para logs, métricas o cabeceras, como un interceptor de Angular pero en el servidor."
- Nuevo: "lo uso para logs, métricas o cabeceras, como una función que envuelve `fetch` en el cliente, pero en el servidor."

## Ejercicio reescrito

**19 — `middleware-cors-background`, segundo ejercicio (`kind: concept`)**

- Enunciado: ¿Qué equivale a `await call_next(request)` en un middleware de Express?
- Opciones, en este orden: `req.clone()` · `next()` · `res.send()` · `app.use()`
- Respuesta correcta: la segunda (`next()`).
- Explicación: Ambos pasan la petición al siguiente eslabón de la cadena. En FastAPI, además, `call_next` te devuelve la respuesta para modificarla.

## Resumen fijado

La regla general del `summary` (condensar la primera oración de `def`) se mantiene para los demás temas. En este no sirve, porque la primera oración describe solo `list`. Texto fijado por el usuario el 2026-11-13:

**2 — `estructuras-de-datos`, campo `summary`**

- ES: list, tuple, dict y set: cuándo usar cada una según orden, mutabilidad, búsqueda por clave y elementos únicos.
- EN: list, tuple, dict and set: when to use each one based on order, mutability, key lookup and uniqueness.
