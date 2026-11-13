# Mapa de contenido — pista Python y FastAPI

Vinculante para la migración. Fija identificadores, orden, grupo, título corto, conceptos y relaciones. Quien implementa no añade, quita ni renombra entradas, con una sola excepción explícita: si un concepto listado aquí no se menciona en el texto del tema de la guía original (cualquier campo de texto, incluido el puente), se omite y se informa en el resumen final; no se sustituye por otro.

Fuente: arreglo `TOPICS` de `legacy/Python y FastAPI para entrevistas.html`. La columna "guía" es el `id` del tema en ese arreglo.

## Pista y grupos (`tracks.yaml`)

La pista `python` ya existe (abbr `PY`, color `#4ade80`, orden 2). Se le añaden dos grupos, en este orden:

| id del grupo | nombre ES | nombre EN | temas |
|---|---|---|---|
| `lenguaje` | Python | Python | orden 1 a 10 |
| `fastapi` | FastAPI | FastAPI | orden 11 a 21 |

## Frecuencia

Igual que en REST: `casi` → `always`, `seguido` → `often`, `aveces` → `sometimes`.

## Tema que no se migra

El tema 11 de la guía, "HTTP por dentro y principios REST", no se migra: ni su texto, ni su código, ni sus tablas, ni su demo. Sus tres ejercicios pasan a REST (ver "Ejercicios trasladados a REST").

## Temas

Formato de la columna de conceptos: `id`: nombre en español / nombre en inglés, con " / " (barra entre espacios) como único separador entre idiomas. Una barra sin espacios forma parte del nombre (`try/except/finally`, `async/await`).

El título en español es el de la guía (campo `title`) salvo donde la columna "título" indica otro. El título corto en español es el de la columna; ambos se traducen de forma directa al inglés, salvo los que aquí se dan en inglés.

| orden | guía | id del tema | grupo | título corto ES | conceptos (id: ES / EN) | related |
|---|---|---|---|---|---|---|
| 1 | 1 | `tipado-y-type-hints` | `lenguaje` | Tipado y type hints | `tipado-dinamico`: tipado dinámico / dynamic typing · `type-hints`: type hints / type hints | `dataclasses-y-pydantic` |
| 2 | 2 | `estructuras-de-datos` | `lenguaje` | list, tuple, dict, set | `list`: list / list · `tuple`: tuple / tuple · `dict`: dict / dict · `set`: set / set | `identidad-copias-mutabilidad` |
| 3 | 3 | `comprehensions-y-generadores` | `lenguaje` | Comprehensions y generadores | `comprehension`: comprehension / comprehension · `generador`: generador / generator · `yield`: yield / yield | `estructuras-de-datos` |
| 4 | 4 | `funciones-y-closures` | `lenguaje` | Funciones y closures | `args-kwargs`: *args y **kwargs / *args and **kwargs · `closure`: closure / closure · `lambda`: lambda / lambda · `default-mutable`: default mutable / mutable default argument | `decoradores`, `mutabilidad` |
| 5 | 5 | `decoradores` | `lenguaje` | Decoradores | `decorador`: decorador / decorator | `closure`, `rutas-y-parametros` |
| 6 | 6 | `errores-y-context-managers` | `lenguaje` | Errores y with | `context-manager`: context manager / context manager · `try-except`: try/except/finally / try/except/finally · `eafp`: EAFP / EAFP | `errores-y-httpexception` |
| 7 | 7 | `modulos-y-entornos` | `lenguaje` | Módulos, venv y uv | `modulo`: módulo / module · `paquete`: paquete / package · `entorno-virtual`: entorno virtual / virtual environment · `uv`: uv / uv | `estructura-del-proyecto` |
| 8 | 8 | `concurrencia` | `lenguaje` | async, hilos y GIL | `async-await`: async/await / async/await · `event-loop`: event loop / event loop · `gil`: GIL / GIL · `hilos-vs-procesos`: hilos vs. procesos / threads vs. processes | `endpoints-async-vs-sync` |
| 9 | 9 | `dataclasses-y-pydantic` | `lenguaje` | Dataclasses y Pydantic | `dataclass`: dataclass / dataclass · `pydantic`: Pydantic / Pydantic | `modelos-y-response-model`, `type-hints` |
| 10 | 10 | `identidad-copias-mutabilidad` | `lenguaje` | is, ==, copias | `is-vs-igual`: is vs. == / is vs. == · `copia-superficial-y-profunda`: copia superficial y profunda / shallow and deep copy · `mutabilidad`: mutabilidad / mutability | `default-mutable`, `estructuras-de-datos` |
| 11 | 12 | `rutas-y-parametros` | `fastapi` | Rutas y parámetros | `path-operation`: path operation / path operation | `parametro-de-ruta`, `query-string`, `body`, `type-hints` |
| 12 | 13 | `modelos-y-response-model` | `fastapi` | Modelos y response_model | `response-model`: response_model / response_model · `modelos-de-entrada-y-salida`: modelos de entrada y salida / input and output models | `pydantic`, `codigos-de-estado` |
| 13 | 14 | `inyeccion-con-depends` | `fastapi` | Depends | `depends`: Depends / Depends · `dependency-overrides`: dependency_overrides / dependency_overrides | `pytest-y-testclient`, `base-de-datos` |
| 14 | 15 | `errores-y-httpexception` | `fastapi` | HTTPException | `httpexception`: HTTPException / HTTPException · `exception-handler`: exception handler / exception handler | `codigos-de-estado`, `problem-details` |
| 15 | 16 | `endpoints-async-vs-sync` | `fastapi` | async def vs def | `threadpool`: threadpool / threadpool | `async-await`, `event-loop` |
| 16 | 17 | `base-de-datos` | `fastapi` | BD, sesiones y Alembic | `orm`: ORM / ORM · `sqlalchemy`: SQLAlchemy / SQLAlchemy · `sqlmodel`: SQLModel / SQLModel · `session-orm`: Session / Session · `alembic`: Alembic / Alembic | `depends`, `context-manager` |
| 17 | 18 | `autenticacion-en-fastapi` | `fastapi` | Auth: OAuth2 y hashing | `hashing-de-contrasenas`: hashing de contraseñas / password hashing · `oauth2-password-flow`: flujo de contraseña de OAuth2 / OAuth2 password flow | `jwt`, `oauth2`, `autenticacion-autorizacion`, `depends` |
| 18 | 19 | `middleware-cors-background` | `fastapi` | Middleware, CORS, background | `middleware`: middleware / middleware · `cors-middleware`: CORSMiddleware / CORSMiddleware · `background-tasks`: BackgroundTasks / BackgroundTasks | `cors-concepto`, `preflight` |
| 19 | 20 | `estructura-del-proyecto` | `fastapi` | Estructura del proyecto | `api-router`: APIRouter / APIRouter · `capas`: capas (router, servicio, repositorio) / layers (router, service, repository) · `settings`: Settings / Settings | `modulos-y-entornos`, `depends` |
| 20 | 21 | `pytest-y-testclient` | `fastapi` | pytest y TestClient | `pytest`: pytest / pytest · `fixture`: fixture / fixture · `testclient`: TestClient / TestClient | `dependency-overrides` |
| 21 | 22 | `openapi-y-despliegue` | `fastapi` | OpenAPI, Uvicorn y Docker | `openapi`: OpenAPI / OpenAPI · `uvicorn`: Uvicorn / Uvicorn · `docker`: Docker / Docker | `modelos-y-response-model` |

Títulos que cambian respecto a la guía:

- `autenticacion-en-fastapi` — ES: "Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas". EN: "Authentication in FastAPI: OAuth2, JWT and password hashing". Título corto EN: "Auth: OAuth2 and hashing".

Conceptos que **no** se declaran en esta pista aunque el texto los mencione, porque su hogar es otro:

- `jwt`, `oauth2`, `cors-concepto`, `preflight`, `stateless`, `idempotencia`: hogar en REST. Se enlazan con `related`.
- N+1: su hogar será la pista SQL. No se declara ni se enlaza todavía.
- Inyección de dependencias (el principio general): su hogar será la pista POO. Aquí solo existe `depends`.

## Alias

Cada concepto lleva como alias, en cada idioma, su nombre en el otro idioma cuando difiere. Además:

- `try-except`: `try except`, `try except finally`
- `async-await`: `async await`
- `entorno-virtual`: `venv`, `virtualenv`
- `gil`: `Global Interpreter Lock`
- `default-mutable`: `argumento mutable por defecto`
- `hashing-de-contrasenas`: `Argon2`, `pwdlib`, `hash`
- `oauth2-password-flow`: `OAuth2PasswordBearer`
- `background-tasks`: `tareas en segundo plano`, `background tasks`
- `alembic`: `migraciones`, `migrations`
- `session-orm`: `sesión de base de datos`, `database session`
- `args-kwargs`: `args`, `kwargs`
- `copia-superficial-y-profunda`: `deepcopy`, `shallow copy`, `deep copy`

Los alias adicionales de esta lista se añaden en los dos idiomas, igual que se hizo en REST.

No se añaden más alias.

## Ejercicios trasladados a REST

Del campo `ex` del tema 11 de la guía de Python:

| ejercicio | destino | cómo entra |
|---|---|---|
| `classify` "¿Qué método HTTP corresponde?" (5 ítems) | `rest/metodos-seguros-idempotentes` | nuevo grupo de tipo `classify`, al final de sus grupos, con ese enunciado y las categorías GET, POST, PUT, PATCH, DELETE |
| `status` "Un cliente autenticado pide GET /pedidos/1042…" | `rest/codigos-de-estado` | dos ítems nuevos al final de su grupo `choice` existente ("¿Qué código de estado devuelve este caso?") |
| `status` "POST /clientes con un email que ya está registrado." | `rest/codigos-de-estado` | ídem |

Se añaden en `es.md` y, traducidos, en `en.md`.

## Títulos cortos en inglés

Confirmados por el usuario el 2026-11-13, en el orden de la tabla "Temas":

"Typing and type hints", "list, tuple, dict, set", "Comprehensions and generators", "Functions and closures", "Decorators", "Errors and with", "Modules, venv and uv", "async, threads and GIL", "Dataclasses and Pydantic", "is, ==, copies", "Routes and parameters", "Models and response_model", "Depends", "HTTPException", "async def vs def", "DB, sessions and Alembic", "Auth: OAuth2 and hashing", "Middleware, CORS, background", "Project structure", "pytest and TestClient", "OpenAPI, Uvicorn and Docker".

En la traducción al inglés, las comillas «» del español pasan a “”.
