# Mapa de contenido de `contenido-claro`

> Vinculante. Fija identificadores, títulos, orden, reparto de conceptos y ejercicios, relaciones y alcance de cada entrada de proyecto. Lo que este documento no resuelva es una pregunta para Fable 5.2.
>
> En las tablas, el español y el inglés van siempre en columnas separadas. Ninguna celda usa un separador que pueda aparecer en un valor.

## 1. Temas que se parten

Aprobado por el usuario el 2026-11-13. Cada tema de la izquierda desaparece (su carpeta se borra) y lo sustituyen los dos de la derecha. Los conceptos se mueven con su identificador, su nombre y sus alias sin cambios.

| Tema actual | Tema nuevo | Conceptos que se lleva |
|---|---|---|
| `comprehensions-y-generadores` | `comprehensions` | `comprehension` |
| | `generadores` | `generador`, `yield` |
| `funciones-y-closures` | `funciones-y-parametros` | `args-kwargs`, `default-mutable` |
| | `closures-y-lambdas` | `closure`, `lambda` |
| `errores-y-context-managers` | `excepciones` | `try-except`, `eafp` |
| | `context-managers` | `context-manager` |
| `modulos-y-entornos` | `modulos-y-paquetes` | `modulo`, `paquete` |
| | `entornos-y-dependencias` | `entorno-virtual`, `uv` |
| `concurrencia` | `async-y-event-loop` | `async-await`, `event-loop` |
| | `hilos-procesos-y-gil` | `gil`, `hilos-vs-procesos` |
| `base-de-datos` | `orm-y-sesiones` | `orm`, `sqlalchemy`, `sqlmodel`, `session-orm` |
| | `migraciones-con-alembic` | `alembic` |
| `middleware-cors-background` | `middleware-y-cors` | `middleware`, `cors-middleware` |
| | `tareas-en-segundo-plano` | `background-tasks` |
| `openapi-y-despliegue` | `openapi-automatico` | `openapi` |
| | `despliegue-uvicorn-docker` | `uvicorn`, `docker` |

Cada tema nuevo hereda de su tema de origen `freq` y `group`.

### Títulos de los temas nuevos

| Id | Título (es) | Título (en) | Corto (es) | Corto (en) |
|---|---|---|---|---|
| `comprehensions` | Comprehensions: listas, dicts y sets en una línea | Comprehensions: lists, dicts and sets in one line | Comprehensions | Comprehensions |
| `generadores` | Generadores y yield | Generators and yield | Generadores y yield | Generators and yield |
| `funciones-y-parametros` | Funciones: parámetros, *args, **kwargs y valores por defecto | Functions: parameters, *args, **kwargs and default values | Funciones y parámetros | Functions and parameters |
| `closures-y-lambdas` | Closures y lambdas | Closures and lambdas | Closures y lambdas | Closures and lambdas |
| `excepciones` | Excepciones: try, except, finally y EAFP | Exceptions: try, except, finally and EAFP | Excepciones | Exceptions |
| `context-managers` | Context managers y with | Context managers and with | Context managers y with | Context managers and with |
| `modulos-y-paquetes` | Módulos, paquetes e imports | Modules, packages and imports | Módulos y paquetes | Modules and packages |
| `entornos-y-dependencias` | Entornos virtuales y dependencias con uv | Virtual environments and dependencies with uv | Entornos y uv | Environments and uv |
| `async-y-event-loop` | async/await y el event loop | async/await and the event loop | async/await | async/await |
| `hilos-procesos-y-gil` | Hilos, procesos y el GIL | Threads, processes and the GIL | Hilos, procesos y GIL | Threads, processes, GIL |
| `orm-y-sesiones` | Base de datos: ORM, SQLModel y sesiones | Database: ORM, SQLModel and sessions | ORM y sesiones | ORM and sessions |
| `migraciones-con-alembic` | Migraciones con Alembic | Migrations with Alembic | Migraciones con Alembic | Migrations with Alembic |
| `middleware-y-cors` | Middleware y CORS en FastAPI | Middleware and CORS in FastAPI | Middleware y CORS | Middleware and CORS |
| `tareas-en-segundo-plano` | Tareas en segundo plano con BackgroundTasks | Background tasks with BackgroundTasks | Tareas en segundo plano | Background tasks |
| `openapi-automatico` | OpenAPI automático y documentación | Automatic OpenAPI and documentation | OpenAPI | OpenAPI |
| `despliegue-uvicorn-docker` | Despliegue con Uvicorn y Docker | Deployment with Uvicorn and Docker | Uvicorn y Docker | Uvicorn and Docker |

Los títulos y títulos cortos de los temas que no se parten no cambian. El resumen (`summary`) de cada tema reescrito se redacta de nuevo con las reglas de la guía, dentro del límite de 140 caracteres.

### Reparto de los ejercicios

No se escriben ejercicios nuevos en este cambio. Los existentes se reparten así; un tema que quede sin ejercicios no muestra la pestaña Practicar.

| Tema de origen | Ejercicio | Va a |
|---|---|---|
| `comprehensions-y-generadores` | "¿Qué imprime?" con `g = (x * 2 for x in range(3))` | `generadores` |
| | "¿Qué imprime?" con `{n: n ** 2 for n in range(3)}` | `comprehensions` |
| `funciones-y-closures` | Los dos "¿Qué imprime?" (lista por defecto; `*a`, `**k`) | `funciones-y-parametros` |
| `errores-y-context-managers` | Grupo "¿Qué imprime este código?" | `excepciones` |
| | Grupo "Pregunta rápida" (`with open(...)`) | `context-managers` |
| `modulos-y-entornos` | Pregunta sobre el archivo de bloqueo de uv | `entornos-y-dependencias` |
| | Pregunta sobre `if __name__ == "__main__":` | `modulos-y-paquetes` |
| `concurrencia` | Grupo de clasificación "¿Qué herramienta de concurrencia usarías?" | `hilos-procesos-y-gil` |
| | Grupo "¿Qué imprime este código?" | `async-y-event-loop` |
| `base-de-datos` | Pregunta sobre `session.add` sin `commit` | `orm-y-sesiones` |
| | Pregunta sobre `alembic revision --autogenerate` | `migraciones-con-alembic` |
| `middleware-cors-background` | Pregunta sobre `tareas.add_task(...)` | `tareas-en-segundo-plano` |
| | Pregunta sobre `await call_next(request)` | `middleware-y-cors` |
| `openapi-y-despliegue` | Las dos preguntas (Docker Compose; `fastapi run` frente a `fastapi dev`) | `despliegue-uvicorn-docker` |

Cuando un grupo se reparte entre dos temas, cada mitad conserva el enunciado (`prompt`) del grupo. El texto de las preguntas y sus explicaciones (`why`) se revisan con la regla 4 de la guía; las respuestas correctas no cambian.

Si al ejecutar el código de un ejercicio la respuesta marcada resulta incorrecta, no se corrige en silencio: se anota y es una pregunta para Fable 5.2.

### Relaciones (`related`) de los temas nuevos

| Tema | `related` |
|---|---|
| `comprehensions` | `estructuras-de-datos`, `generadores` |
| `generadores` | `comprehensions` |
| `funciones-y-parametros` | `closures-y-lambdas`, `mutabilidad` |
| `closures-y-lambdas` | `funciones-y-parametros`, `decoradores` |
| `excepciones` | `context-managers`, `errores-y-httpexception` |
| `context-managers` | `excepciones` |
| `modulos-y-paquetes` | `entornos-y-dependencias`, `estructura-del-proyecto` |
| `entornos-y-dependencias` | `modulos-y-paquetes` |
| `async-y-event-loop` | `hilos-procesos-y-gil`, `endpoints-async-vs-sync` |
| `hilos-procesos-y-gil` | `async-y-event-loop`, `threadpool` |
| `orm-y-sesiones` | `depends`, `context-manager`, `migraciones-con-alembic` |
| `migraciones-con-alembic` | `orm-y-sesiones` |
| `middleware-y-cors` | `cors-concepto`, `preflight` |
| `tareas-en-segundo-plano` | `endpoints-async-vs-sync` |
| `openapi-automatico` | `modelos-y-response-model` |
| `despliegue-uvicorn-docker` | `estructura-del-proyecto`, `entornos-y-dependencias` |

Referencias de otros temas que hay que actualizar:

| Tema | Antes | Después |
|---|---|---|
| `estructura-del-proyecto` (`related`) | `modulos-y-entornos` | `modulos-y-paquetes` |
| `inyeccion-con-depends` (`related`) | `base-de-datos` | `orm-y-sesiones` |

Los enlaces `[[id]]` dentro del texto que apunten a un tema desaparecido se cambian por el tema nuevo que tenga el concepto del que habla la frase. La compilación ya falla si queda alguno roto.

## 2. Orden final de la pista Python y FastAPI

34 entradas: 29 temas y 5 entradas de proyecto. La pista HTTP y REST no cambia de orden ni de número de temas.

| Orden | Grupo | Id | Tipo |
|---|---|---|---|
| 1 | `lenguaje` | `tipado-y-type-hints` | tema |
| 2 | `lenguaje` | `estructuras-de-datos` | tema |
| 3 | `lenguaje` | `comprehensions` | tema nuevo |
| 4 | `lenguaje` | `generadores` | tema nuevo |
| 5 | `lenguaje` | `funciones-y-parametros` | tema nuevo |
| 6 | `lenguaje` | `closures-y-lambdas` | tema nuevo |
| 7 | `lenguaje` | `decoradores` | tema |
| 8 | `lenguaje` | `proyecto-total-del-pedido` | proyecto |
| 9 | `lenguaje` | `excepciones` | tema nuevo |
| 10 | `lenguaje` | `context-managers` | tema nuevo |
| 11 | `lenguaje` | `modulos-y-paquetes` | tema nuevo |
| 12 | `lenguaje` | `entornos-y-dependencias` | tema nuevo |
| 13 | `lenguaje` | `async-y-event-loop` | tema nuevo |
| 14 | `lenguaje` | `hilos-procesos-y-gil` | tema nuevo |
| 15 | `lenguaje` | `dataclasses-y-pydantic` | tema |
| 16 | `lenguaje` | `identidad-copias-mutabilidad` | tema |
| 17 | `lenguaje` | `proyecto-importar-catalogo` | proyecto |
| 18 | `fastapi` | `rutas-y-parametros` | tema |
| 19 | `fastapi` | `modelos-y-response-model` | tema |
| 20 | `fastapi` | `inyeccion-con-depends` | tema |
| 21 | `fastapi` | `errores-y-httpexception` | tema |
| 22 | `fastapi` | `endpoints-async-vs-sync` | tema |
| 23 | `fastapi` | `proyecto-crear-pedido` | proyecto |
| 24 | `fastapi` | `orm-y-sesiones` | tema nuevo |
| 25 | `fastapi` | `migraciones-con-alembic` | tema nuevo |
| 26 | `fastapi` | `autenticacion-en-fastapi` | tema |
| 27 | `fastapi` | `middleware-y-cors` | tema nuevo |
| 28 | `fastapi` | `tareas-en-segundo-plano` | tema nuevo |
| 29 | `fastapi` | `proyecto-pedidos-con-login` | proyecto |
| 30 | `fastapi` | `estructura-del-proyecto` | tema |
| 31 | `fastapi` | `pytest-y-testclient` | tema |
| 32 | `fastapi` | `openapi-automatico` | tema nuevo |
| 33 | `fastapi` | `despliegue-uvicorn-docker` | tema nuevo |
| 34 | `fastapi` | `proyecto-api-completa` | proyecto |

Resultado: grupo "Python", 15 temas y 2 proyectos; grupo "FastAPI", 14 temas y 3 proyectos.

### Orden provisional mientras dura el cambio

La reescritura va por grupos de tareas y la app debe compilar al final de cada uno. Por eso, en la tarea 3.1 todos los temas actuales reciben ya su orden final, y cada tema que aún no se ha partido ocupa de forma provisional el menor de los dos órdenes de sus sustitutos:

| Tema aún sin partir | Orden provisional |
|---|---|
| `comprehensions-y-generadores` | 3 |
| `funciones-y-closures` | 5 |
| `errores-y-context-managers` | 9 |
| `modulos-y-entornos` | 11 |
| `concurrencia` | 13 |
| `base-de-datos` | 24 |
| `middleware-cors-background` | 27 |
| `openapi-y-despliegue` | 32 |

Mientras tanto el orden tiene huecos; la lista, y los botones anterior y siguiente, siguen el orden creciente.

## 3. Entradas de proyecto

Aprobadas por el usuario el 2026-11-13: cinco, todas en la pista Python y FastAPI, ninguna en HTTP y REST.

| Id | Título (es) | Título (en) | Corto (es) | Corto (en) |
|---|---|---|---|---|
| `proyecto-total-del-pedido` | Proyecto: calcular el total de un pedido | Project: calculating an order total | Proyecto: total del pedido | Project: order total |
| `proyecto-importar-catalogo` | Proyecto: importar el catálogo de productos | Project: importing the product catalog | Proyecto: importar catálogo | Project: catalog import |
| `proyecto-crear-pedido` | Proyecto: el endpoint de crear un pedido | Project: the create-order endpoint | Proyecto: crear un pedido | Project: create an order |
| `proyecto-pedidos-con-login` | Proyecto: pedidos con base de datos y login | Project: orders with a database and login | Proyecto: BD y login | Project: DB and login |
| `proyecto-api-completa` | Proyecto: la API completa, de las carpetas al contenedor | Project: the full API, from folders to container | Proyecto: la API completa | Project: the full API |

### Qué construye cada una y qué temas reúne (`covers`)

Cada entrada muestra código de los archivos indicados de `proyecto-tienda.md`. Los temas de `covers` son exactamente los de la tabla, en ese orden; cada uno debe quedar enlazado al menos una vez en el recorrido.

| Id | Qué construye | Archivos | `covers` |
|---|---|---|---|
| `proyecto-total-del-pedido` | La función que calcula el total de un pedido: recorre sus líneas, aplica un descuento y deja registro de cada cálculo. Python puro, sin FastAPI. | `app/pedidos/service.py` | `tipado-y-type-hints`, `estructuras-de-datos`, `comprehensions`, `generadores`, `funciones-y-parametros`, `closures-y-lambdas`, `decoradores` |
| `proyecto-importar-catalogo` | El script que carga el catálogo de productos desde un archivo CSV del proveedor: lo descarga, valida cada fila, descarta las que tienen errores y devuelve los productos listos para guardar. | `scripts/importar_catalogo.py` | `excepciones`, `context-managers`, `modulos-y-paquetes`, `async-y-event-loop`, `dataclasses-y-pydantic`, `identidad-copias-mutabilidad` |
| `proyecto-crear-pedido` | El endpoint `POST /v1/pedidos` completo: recibe y valida los datos, comprueba que los productos existen, guarda el pedido y responde 201; responde 404 o 422 cuando corresponde. | `app/pedidos/router.py`, `app/pedidos/schemas.py`, `app/deps.py` | `rutas-y-parametros`, `modelos-y-response-model`, `inyeccion-con-depends`, `errores-y-httpexception`, `endpoints-async-vs-sync`, `metodos-http`, `codigos-de-estado`, `errores-problem-details` |
| `proyecto-pedidos-con-login` | Lo que hace falta para que solo el dueño vea y pague sus pedidos: las tablas, una migración, el login que entrega el token, la dependencia que identifica al cliente, CORS para el frontend y el pago con clave de idempotencia y correo de confirmación en segundo plano. | `app/pedidos/models.py`, `migrations/`, `app/core/security.py`, `app/deps.py`, `app/main.py`, `app/pagos/router.py` | `orm-y-sesiones`, `migraciones-con-alembic`, `autenticacion-en-fastapi`, `middleware-y-cors`, `tareas-en-segundo-plano`, `autenticacion-autorizacion`, `cors`, `idempotencia-en-la-practica` |
| `proyecto-api-completa` | El proyecto visto entero: cómo se reparten las carpetas, cómo `main.py` une los routers, una prueba que sustituye la base de datos, la documentación automática, el listado paginado y cacheable de productos y el contenedor que lo despliega. | `app/main.py`, `app/productos/router.py`, `tests/`, `Dockerfile` | `estructura-del-proyecto`, `pytest-y-testclient`, `openapi-automatico`, `despliegue-uvicorn-docker`, `diseno-api-rest`, `cache-http` |

Los temas `entornos-y-dependencias` y `hilos-procesos-y-gil` no figuran en ninguna entrada de proyecto a propósito: no tienen un lugar natural en ese código.

Las entradas de proyecto no declaran conceptos, frecuencia, ejercicios ni demo.

## 4. Piloto

Aprobado por el usuario el 2026-11-13. Siete piezas, en español e inglés:

| Pieza | Tipo | Modelo de la guía que imita |
|---|---|---|
| `decoradores` | tema | Modelo 1 |
| `funciones-y-parametros` | tema nuevo (mitad de `funciones-y-closures`) | Modelo 2 |
| `closures-y-lambdas` | tema nuevo (la otra mitad) | Modelo 2 |
| `cache-http` | tema | Modelo 3 |
| `codigos-de-estado` | tema | Modelo 3 |
| `inyeccion-con-depends` | tema | Modelo 4 |
| `proyecto-crear-pedido` | proyecto | — (es la primera; define el patrón de las otras cuatro) |

Los textos de los modelos 1 a 4 de `openspec/guia-de-contenido.md` son el punto de partida de sus temas: se usan tal cual en lo que cubren y se completan con las secciones que el modelo no muestra (`bad`, `good`, `bridge:typescript`, `interview`) y con el paso de proyecto.

## 5. Reparto del resto por grupos de tareas

| Grupo de `tasks.md` | Piezas |
|---|---|
| 5 | `tipado-y-type-hints`, `estructuras-de-datos`, `comprehensions`, `generadores`, `proyecto-total-del-pedido` |
| 6 | `excepciones`, `context-managers`, `modulos-y-paquetes`, `entornos-y-dependencias` |
| 7 | `async-y-event-loop`, `hilos-procesos-y-gil`, `dataclasses-y-pydantic`, `identidad-copias-mutabilidad`, `proyecto-importar-catalogo` |
| 8 | `rutas-y-parametros`, `modelos-y-response-model`, `errores-y-httpexception`, `endpoints-async-vs-sync` |
| 9 | `orm-y-sesiones`, `migraciones-con-alembic`, `autenticacion-en-fastapi`, `middleware-y-cors`, `tareas-en-segundo-plano`, `proyecto-pedidos-con-login` |
| 10 | `estructura-del-proyecto`, `pytest-y-testclient`, `openapi-automatico`, `despliegue-uvicorn-docker`, `proyecto-api-completa` |
| 11 | `url-a-respuesta`, `anatomia-peticion-respuesta`, `anatomia-url`, `metodos-http`, `metodos-seguros-idempotentes`, `cabeceras` |
| 12 | `http-sin-estado`, `autenticacion-autorizacion`, `cors`, `https-tls`, `versiones-http`, `rest-richardson` |
| 13 | `diseno-api-rest`, `errores-problem-details`, `idempotencia-en-la-practica`, `rate-limiting`, `rest-vs-alternativas`, `seguridad-api` |

## 6. Lo que no cambia en ningún tema

- Identificadores, nombres y alias de los conceptos.
- `freq`, `demo` y `track`.
- Las respuestas correctas de los ejercicios.
- Las claves de sección de los temas y el orden de las pestañas.
- La regla de no mencionar Angular, NestJS ni RxJS fuera de los bloques de código.
