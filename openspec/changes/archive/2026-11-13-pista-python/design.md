# Design

## Context

Motivación y alcance: ver `proposal.md`. Requisitos observables: ver `specs/`. Identificadores, conceptos y relaciones: `content-map.md`. Textos reescritos: `rewrites.md`. Ambos archivos son vinculantes.

Estructura del repositorio (el usuario la reorganizó el 2026-11-13): hay un solo repositorio Git, cuya raíz es la carpeta `ai-engineer-path`. Contiene la app (`src/`, `scripts/`, `content/`), `openspec/`, `.claude/` y `legacy/`, donde están las cinco guías HTML originales y las maquetas (`legacy/ui-v2.html` es la referencia visual aprobada). Todas las rutas de este cambio son relativas a esa raíz. Las sesiones se abren en esa carpeta.

Estado de partida (verificado en el código el 2026-11-13):

- La app está implementada en la raíz del repositorio (carpeta `ai-engineer-path`), con la pista REST migrada y las otras cuatro como "Próximamente".
- El formato de contenido vigente está documentado en `content/README.md` y validado en `scripts/content/schema.ts` y `scripts/content/sections.ts`. Hoy admite: secciones `definition`, `analogy`, `problem`, `code:wire`, `code:server`, `bad`, `good`, `bridge:typescript`, `interview`, `myths`; ejercicios `choice` y `verdict`; lenguajes de resaltado `python`, `http`, `json`, `bash`, `typescript`.
- `scripts/migrate/migrate-rest.ts` todavía apunta a la ruta antigua de la guía de REST (`../API Rest/…`). Es un script de un solo uso ya ejecutado; no se corrige ni se vuelve a ejecutar en este cambio.
- La migración de REST se hizo con scripts de un solo uso en `scripts/migrate/` (`migrate-rest.ts`, `rest-map.ts`, `rest-es.ts`, `rest-en.ts`). Sirven de patrón.

La guía de Python (`legacy/Python y FastAPI para entrevistas.html`, arreglo `TOPICS`, 22 temas) se cruzó campo por campo con ese modelo. Todos los temas tienen: `id`, `block` (A o B), `title`, `short`, `freq`, `def`, `analogy`, `code`, `problem`, `bad` y `good` (cada uno un objeto con `code` y `note`), `bridge`, `pitfalls` (4 elementos), `answer`, `demo` y `ex`. Campos que solo tienen algunos temas: `codeLang` (temas 11 y 20, valor `txt`), `code2` (temas 20 y 22), `code2Lang` (tema 22, valor `txt`), `table` y `table2` (solo tema 11). Los ejercicios (`ex`) son de cuatro clases: `output`, `concept`, `status` y `classify`. Ningún texto remite a otro tema por número.

## Reglas de implementación

Fijadas por el usuario y no negociables:

- Estas especificaciones las define Fable 5.2; las implementa Opus 5.5.
- Quien implementa no toma decisiones de producto, de diseño ni de contenido. Ante un vacío, una ambigüedad o una contradicción en estos artefactos, se detiene, informa exactamente qué falta (archivo y requisito o tarea) y deja la decisión para una sesión de definición con Fable 5.2. No rellena el hueco con un supuesto.
- No modifica `proposal.md`, `design.md`, `content-map.md`, `rewrites.md` ni los archivos de `specs/`. En `tasks.md` solo marca casillas.
- Al retomar en otro contexto, el prompt de arranque está en `openspec/handoff-prompt.md`.

## Goals / Non-Goals

**Goals:**

- Los 21 temas de Python disponibles en ES y EN, buscables y conectados en el cerebro, incluidos sus enlaces con REST.
- Ampliar el modelo de contenido de forma genérica, para que SQL, POO y Git reutilicen grupos, título corto, ejemplo principal y clasificación.
- No alterar cómo se ve hoy la pista REST, salvo los ejercicios que recibe.

**Non-Goals:**

- Las demos de la guía (campo `demo`): no se migran ni se registran. Ningún tema de Python lleva `demo` en `meta.yaml`.
- El simulacro final (`OPEN_QS`, `TEST_QS`).
- El tema 11 de la guía y sus campos `table` y `table2`. No se crea soporte para tablas.
- Títulos cortos para los temas de REST.
- Buscar por título corto: el buscador sigue indexando título, alias y resumen.

## Decisions

### 1. Correspondencia de campos

| Campo de la guía | Destino | Notas |
|---|---|---|
| `title` | `title` | salvo el tema renombrado en `content-map.md` |
| `short` | `short` (nuevo, decisión 4) | valores en `content-map.md` |
| `block` | `group` en `meta.yaml` (decisión 5) | A → `lenguaje`, B → `fastapi` |
| `freq` | `freq` | misma tabla que REST |
| `def` | sección `definition` | |
| `analogy` | sección `analogy` | |
| `code`, `code2` | sección `code:example` (decisión 2) | |
| `problem` | sección `problem` | |
| `bad.code` + `bad.note`, `good.code` + `good.note` | secciones `bad` y `good` (decisión 3) | |
| `bridge` | sección `bridge:typescript` | texto de `rewrites.md` si el tema figura allí; si no, sin cambios |
| `pitfalls[]` | sección `myths`, como lista | decidido por el usuario; el rótulo sigue siendo "Malentendidos comunes" |
| `answer` | sección `interview` | con las sustituciones de `rewrites.md` |
| `ex[]` | `exercises` (decisión 6) | |
| `demo`, `table`, `table2`, `codeLang`, `code2Lang` | no se migran como campos | `codeLang` y `code2Lang` solo deciden el lenguaje de la valla (decisión 2) |
| — | `summary` | se redacta con la regla de REST: una oración, sin HTML, 140 caracteres como máximo, condensando la primera oración de `def` sin añadir información |

El HTML incrustado se convierte a Markdown igual que en la migración de REST (`<b>` a negrita, `<i>` a cursiva, `<code>` a código en línea).

### 2. Sección `code:example` y lenguaje por bloque

Nuevo tipo de código registrado: `example`. Es opcional y se muestra **primero** en la pestaña En código, antes de `code:wire` y `code:server`. Rótulo en las traducciones — ES: "Ejemplo: la API de la tienda". EN: "Example: the store API".

La sección contiene uno o más bloques de código consecutivos. Para Python: primero `code` y, si existe, `code2` a continuación.

Lenguaje de resaltado, regla nueva que aplica a **todas** las secciones:

- Si la valla declara un lenguaje, ese lenguaje manda.
- Si la valla no declara lenguaje, se mantiene la regla vigente (`code:server` es python; en `code:wire`, `bad` y `good`, python si contiene `def `, `@app.` o `import `, y http en caso contrario).
- En `code:example`, una valla sin lenguaje es un error de validación: debe declararlo siempre.
- Se añade el lenguaje `text` (alias de valla `txt`): el bloque se muestra con la tipografía y el fondo de código, sin resaltado.

Vallas en la migración de Python: todo bloque es `python`, salvo `code` del tema 20 de la guía y `code2` del tema 22, que son `text` (así lo marcan `codeLang` y `code2Lang`). Los bloques de `bad` y `good` son siempre `python`.

- *Por qué la valla manda:* la heurística de REST fallaría con ejemplos de Python de una línea que no contienen `def ` ni `import `.
- *Riesgo sobre REST:* el contenido de REST ya tiene vallas con lenguaje (`http` y `python`). La tarea 1.4 verifica que la salida generada de REST no cambia; si cambia, quien implementa se detiene y lo reporta.

### 3. Notas en `bad` y `good`

Cada sección contiene el bloque de código y, debajo, un párrafo con la nota (`bad.note`, `good.note`). El lector muestra la nota bajo el código, dentro de la misma columna "Riesgoso" o "Correcto". Los rótulos no cambian. No hay campo nuevo: es prosa Markdown dentro de la sección, que el compilador ya convierte.

### 4. Título corto

Campo opcional `short` en el frontmatter de `es.md` y `en.md`. Máximo 32 caracteres, sin HTML. Si un idioma lo tiene, el otro también (error de validación en caso contrario).

Dónde se usa, con el título completo como alternativa cuando no existe:

- filas de tema del sidebar,
- filas de la hoja de temas de teléfono,
- nombre del nodo de tema en el cerebro.

Dónde **no** se usa (siempre el título completo): cabecera del lector, resultados del buscador, panel de relacionados, enlaces dentro del texto, botones anterior y siguiente, y el atributo de título (`title`) de las filas del sidebar, que muestra el título completo al pasar el cursor.

### 5. Grupos de temas

- `tracks.yaml`: campo opcional `groups` en una pista, lista ordenada de `{ id, name: { es, en } }`.
- `meta.yaml`: campo `group` con el id de un grupo de su pista. Obligatorio si la pista declara grupos; prohibido si no los declara.
- Validaciones (error de compilación que nombra el tema): grupo inexistente; tema sin grupo en una pista con grupos; tema con grupo en una pista sin grupos; temas de un mismo grupo no contiguos según `order`; grupos cuyo primer tema no respeta el orden declarado en `tracks.yaml`.
- Presentación: en el sidebar expandido y en la hoja de temas de teléfono, cada grupo va precedido por una fila de subtítulo con el nombre del grupo, en el estilo del rótulo "PISTAS" del sidebar (monoespaciada, mayúsculas, color atenuado). La fila no es interactiva y no recibe foco. Con el sidebar contraído no se muestra.
- Los grupos no son nodos del cerebro, no aparecen en el buscador, no tienen dirección propia y no afectan a anterior y siguiente, que siguen recorriendo la pista por `order`.
- El contador de temas de la pista en el sidebar no cambia: sigue siendo el total.

### 6. Ejercicios

Se amplía el modelo:

- Ítem de `choice`: campo opcional `code` (cadena con el código, sin valla). Se muestra como bloque de código resaltado en `python`, entre el enunciado y las opciones.
- Nuevo tipo de grupo `classify`: `prompt`, `categories` (lista de 2 o más cadenas distintas) e `items`, cada uno con `text`, `category` (debe ser una de `categories`) y `why`.
- Presentación de `classify`: cada ítem muestra su texto y un botón por categoría. Se comporta exactamente como un ítem de opción múltiple cuyas opciones son las categorías del grupo: respuesta inmediata, marca de correcto o incorrecto y explicación, sin guardar.
- Paridad entre idiomas: mismo número de categorías y, en cada ítem, la misma posición de la categoría correcta.

Conversión del campo `ex` de la guía, en su orden original. Los ejercicios consecutivos de la misma clase se agrupan en un solo grupo; un cambio de clase abre un grupo nuevo.

| Clase en la guía | Tipo | `prompt` ES | `prompt` EN | Ítem |
|---|---|---|---|---|
| `output` | `choice` | ¿Qué imprime este código? | What does this code print? | `q` → `q`, `code` → `code`, `opts` → `options`, `a` → `answer`, `exp` → `why` |
| `status` | `choice` | ¿Qué código de estado devuelve? | Which status code does it return? | igual, sin `code` |
| `concept` | `choice` | Pregunta rápida | Quick question | igual, sin `code` |
| `classify` | `classify` | el campo `q` del ejercicio | su traducción | `cats` → `categories`; por ítem `t` → `text`, `c` → `category`, `why` → `why` |

Un ejercicio `classify` nunca se agrupa con otro: cada uno es su propio grupo.

### 7. Tema 11 de la guía y ejercicios trasladados

No se migra (ver `content-map.md`). Sus ejercicios entran en dos temas de REST como allí se indica. El de códigos de estado añade ítems a un grupo `choice` existente; el de clasificación añade un grupo `classify` nuevo. Es el único cambio de contenido en la pista REST.

### 8. Conceptos compartidos con REST

Se aplica la tabla de hogares acordada (decisión 11 del cambio `esqueleto-y-pista-rest`): los temas de Python enlazan con `related` los conceptos de REST listados en `content-map.md` y no los declaran. Como las relaciones son conexiones del cerebro, las dos pistas quedan unidas por esos enlaces. No se edita ningún `meta.yaml` de REST.

### 9. Migración

Scripts de un solo uso en `scripts/migrate/`, con el mismo reparto que en REST: `migrate-python.ts` (extrae `TOPICS` y escribe las carpetas), `python-map.ts` (lo que fija `content-map.md`), `python-es.ts` (resúmenes, títulos cortos y textos de `rewrites.md`) y `python-en.ts` (traducción). La traducción al inglés sigue el criterio de REST: mismo contenido, mismo código, identificadores sin traducir.

### 10. El cerebro con dos pistas

Las posiciones se recalculan al compilar con la misma semilla; las de los nodos de REST cambiarán respecto a hoy porque el grafo crece. Es esperado. El nodo de la pista Python deja de estar atenuado al tener temas. No se cambian parámetros de la simulación ni del dibujo.

### 11. Decisiones confirmadas tras la primera sesión de implementación (2026-11-13)

Opus tomó varias decisiones donde los artefactos no eran explícitos. Revisadas con el usuario:

**Se confirman tal como están implementadas:**

- Los alias adicionales de `content-map.md` van en los dos idiomas.
- El texto `<coroutine object f at 0x...> y un RuntimeWarning` de un ejercicio de `concurrencia` se escapa para mostrarse literal, sin formato. Regla general: cuando un texto de la guía contiene `<` o `>` que no forman una etiqueta HTML de formato (`<b>`, `<i>`, `<code>`), se muestran como caracteres literales.
- La ayuda al pasar el cursor en una fila del sidebar solo existe cuando la fila muestra un título corto distinto del completo; las filas de REST no cambian.
- `code:example` solo admite bloques de código consecutivos: texto entre los bloques es un error de validación.
- Los títulos cortos en inglés y el cambio de comillas, recogidos en `content-map.md`.

**Se corrigen:**

- **Nombres de dos conceptos.** `try-except` es "try/except/finally" y `async-await` es "async/await", iguales en ambos idiomas, con los alias de `content-map.md`. Con ellos se restablece también el `related` hacia `async-await` del tema `endpoints-async-vs-sync`.
- **Resumen de `estructuras-de-datos`.** Texto fijado en `rewrites.md`.
- **Presentación de `classify`.** Las categorías de cada caso se muestran **en fila**, como botones compactos del ancho de su texto, con el mismo estilo visual que las opciones de opción múltiple (borde, radio, estados de correcto e incorrecto). Si no caben en el ancho disponible, continúan en la línea siguiente. Las opciones de `choice` y `verdict` no cambian: siguen a todo el ancho, en columna. Esto sustituye a "se comporta exactamente como un ítem de opción múltiple" de la decisión 6 solo en lo visual; el comportamiento (respuesta inmediata, marca, explicación, casos independientes) es el mismo.
- **Valla con lenguaje no admitido.** Un bloque cuya valla declara un lenguaje que no está en la lista admitida (`python`, `http`, `json`, `bash`, `typescript`, `text` y sus alias) es un **error de validación** que nombra el archivo y el lenguaje, en cualquier sección. No se trata como "sin lenguaje": un error de tipeo no debe pasar inadvertido. Decisión técnica de Fable; no hay ningún caso en el contenido actual.

### 12. Hoja de temas de teléfono totalmente opaca

Pedido por el usuario al probar la pista en el teléfono: con el 90 % de opacidad actual (`--glass-strong`), el lector se transparenta bajo la hoja, y con los 21 temas de Python se nota más.

- La hoja de temas pasa a un fondo **100 % opaco**, con el mismo color base que `--glass-strong` (`rgb(9, 10, 20)`), sin desenfoque. Borde, radio y sombra no cambian.
- Aplica en los tres modos del lector y también cuando la hoja muestra "Próximamente".
- No se modifica `--glass-strong`, que sigue usándose en el modo Sólido del lector; la hoja usa un valor propio.
- Sustituye, solo en la opacidad, a la decisión 19 del cambio archivado `esqueleto-y-pista-rest`.

## Risks / Trade-offs

- **Más nodos y nombres en el cerebro** (unos 21 temas y 60 conceptos más) → los nombres de tema solo aparecen al acercar y ahora usan el título corto; si aun así se amontonan, se ajusta en un cambio posterior, no aquí.
- **Regla de lenguaje nueva aplicada a REST** → verificación explícita de que la salida de REST no cambia (tarea 1.4).
- **`rewrites.md` no cubre alguna mención de framework** → la tarea 3.4 hace una búsqueda y obliga a detenerse y reportar.
- **Conceptos del mapa que el texto no menciona** → se omiten y se reportan; no se inventan sustitutos.
- **Sin demos, la pestaña Practicar de Python solo tiene ejercicios** → decidido por el usuario; los 21 temas tienen ejercicios, así que la pestaña existe en todos.
- **N+1 e inyección de dependencias quedan sin concepto propio por ahora** → se conectarán al migrar SQL y POO.

## Temas que se retoman en cambios posteriores

Pedido expresamente por el usuario: estos temas son importantes para estudiar y quedan comprometidos, no descartados. La lista viva está en la memoria del proyecto (`plan-de-cambios`, tabla "Compromisos pendientes entre pistas"); esta sección deja constancia en el cambio.

| Tema | Por qué no entra aquí | Dónde se retoma |
|---|---|---|
| N+1 | Su hogar es el tema "El problema N+1 y SQL frente a un ORM" de la pista SQL. El tema de Python `base-de-datos` lo menciona en su texto sin enlace. | Cambio de la pista SQL: se declara el concepto y se enlaza desde `base-de-datos`. |
| Inyección de dependencias (el principio) | Su hogar es el tema "Inyección de dependencias" de la pista POO. Aquí solo existe `depends`. | Cambio de la pista POO: se declara el concepto y se enlaza desde `inyeccion-con-depends` y `pytest-y-testclient`. |
| Inyección SQL y transacciones | Hogar en la pista SQL. | Cambio de la pista SQL: se enlazan desde `base-de-datos`. |
| Demos de los 21 temas (incluidos el simulador N+1 y el de `Depends`) | Las demos van rediseñadas en un cambio propio. | Cambio de demos y Casos. |
| Simulacro final de la guía (`OPEN_QS` y `TEST_QS`, 12 y 12) | Pertenece al modo Simulacro. | Cambio de modos Repasar y Simulacro. |

Quien implemente este cambio no adelanta nada de esta tabla.

## Migration Plan

1. Ampliar modelo y compilación; comprobar que REST no cambia.
2. Ampliar la interfaz.
3. Migrar los 21 temas y trasladar los tres ejercicios a REST.
4. `npm run typecheck`, `npm test` y `npm run build` en verde.

No hay despliegue en este cambio. Para deshacer, basta con retirar `content/python/` y los grupos de `tracks.yaml`: la pista vuelve a "Próximamente".
