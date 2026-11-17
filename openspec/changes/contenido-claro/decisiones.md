# Decisiones no críticas de la implementación

Bitácora de Opus 5.5 (regla "Anotar y seguir"). Una entrada por decisión: tarea, qué se decidió, por qué y cómo deshacerlo. Antes de archivar, Fable 5.2 la revisa y señala las que debieron escalarse.

## Confirmaciones del usuario

- **2026-11-13, al empezar el grupo 1.** El usuario confirmó los cinco detalles del diseño que Fable escribió por recomendación: rótulo "Paso a paso" / "Step by step" (decisión 5); direcciones de los ocho temas partidos sin redirección (decisión 8); entrada de proyecto como nodo igual que un tema en el cerebro (decisión 6); borrar `scripts/migrate/` (decisión 13); sin ejercicios nuevos para `closures-y-lambdas` y `openapi-automatico` (`content-map.md`, sección 1). Respuesta: "Sí, confirmo".

## Grupo 1. Formato: pasos y paridad de código

**Comprobaciones.** 1.1, antes de tocar nada: `typecheck`, `test` (264 pruebas en 14 archivos), `lint` (0 errores, 14 avisos) y `build` en verde. 1.6, al cerrar el grupo: `typecheck`, `test` (289 pruebas en 16 archivos), `lint` (0 errores, los mismos 14 avisos) y `build` en verde. `npm run content`: 41 temas, 156 nodos, 215 enlaces; el contenido actual cumple la paridad de la 1.4 sin tocarlo. En el navegador, el rótulo se ve como "Paso a paso" en `/es/python/decoradores` y "Step by step" en `/en/python/decoradores`, sin errores en la consola.

### 1.2 El título de paso se genera como `<h4>`, saneado aparte

- **Qué.** En `scripts/content/markdown.ts`, un encabezado `###` se genera como `<h4>`. Su texto inline se sanea por separado y el `<h4>` se inserta después del saneado general, igual que ya se hacía con el código resaltado (el marcador interno pasa de `data-code` a `data-raw`, porque ahora guarda las dos cosas). Los encabezados de otros niveles no cambian: el saneado general sigue sin admitir encabezados y los quita, como antes.
- **Por qué.** El lector ya usa `<h3>` para el rótulo de cada sección ("Paso a paso", "Así viaja por la red"…): el paso va un nivel por debajo. Si se añadiera `h4` a la lista general de etiquetas, un `####` escrito por error en cualquier sección aparecería con aspecto de paso.
- **Cómo deshacerlo.** Revertir el cambio de `renderMarkdown` y de `SANITIZE` en `markdown.ts`.

### 1.2 Qué se reconoce como título de paso

- **Qué.** `scanSection` (en `scripts/content/sections.ts`) reconoce `###` como lo hace marked: hasta tres espacios delante, `###` seguido de espacio o solo. `####` no es un paso y lo que va dentro de un bloque de código no cuenta. Error en una sección que no lo admite: `<archivo>: la sección "<clave>" no admite títulos de paso (###)`. La misma función sirve para `checkExample` y para la paridad (1.4).
- **Por qué.** Validación y render deben estar de acuerdo sobre qué es un paso; una sola función evita que se separen.
- **Cómo deshacerlo.** Revertir `sections.ts`.

### 1.3 Aspecto de los títulos de paso

- **Qué.** En `src/shell/Reader.module.css`, clase `.steps`, la misma en las tres secciones (`code:example`, `code:wire`, `code:server`); sustituye a `.example`. El título de paso: 16 px, peso 700, blanco, línea vertical de 2 px a la izquierda con el color de la pista al 70 %, 22 px de margen arriba (2 px si es lo primero de la sección) y 8 px abajo, y `overflow-wrap: anywhere` para que nunca se recorte. Entre un bloque de código y lo que le sigue (y entre lo que precede a un bloque y el bloque) quedan 10 px, la misma separación que ya había entre bloques consecutivos. `code:wire` y `code:server` reciben también `data-section` en el lector.
- **Por qué.** El rótulo de sección es mayúscula pequeña en monoespaciada y color de pista; el paso debía distinguirse de él y del texto sin salirse de la estética: tamaño y peso de subtítulo, y la línea de color como único acento. Ningún tema actual tiene texto junto al código en estas tres secciones (comprobado en los 41 temas), así que la separación nueva no cambia nada de lo publicado.
- **Comprobación a 390 px** (escenario "Teléfono"). Se añadieron pasos de prueba a `content/python/decoradores/es.md` solo en local; después se restauró con `git checkout`. Medidas en el navegador: ancho de página 390 px sin desplazamiento horizontal (`scrollWidth` 390); cada título de paso ocupa 326 px y su contenido no desborda (`scrollWidth` = `clientWidth`), el más largo pasa a tres líneas; los bloques anchos se desplazan dentro de su recuadro (contenido de 735 y 796 px en 326 px, `overflow-x: auto`). Captura fuera del repositorio: `/Users/yotfil/.claude/projects/-Users-yotfil-Documents-Yotfil-TechForge-Learning-ai-engineer-ai-engineer-path/159158de-9577-4108-96de-cabe20f65413/tool-results/mcp-Claude_Browser-blob-1794626986332-qhhecv.jpg`.
- **Cómo deshacerlo.** Revertir el bloque `.steps` de `Reader.module.css` y las tres clases de `Reader.tsx`.

### 1.4 Paridad de código: alcance y mensajes

- **Qué.** `checkCodeParity` (en `scripts/content/validate.ts`) se aplica a todas las secciones presentes en los dos idiomas, no solo a las de código, y compara el lenguaje resuelto con la misma regla del render (`codeLanguage`): en `code:wire`, `bad` y `good`, un bloque sin lenguaje declarado se compara por el lenguaje que se le deduce. Mensajes: `tema "<id>": la sección "<clave>" tiene N bloques de código en "es" y M en "en"`, `… el bloque N es <lenguaje> en "es" y <lenguaje> en "en"` y `… tiene N títulos de paso en "es" y M en "en"`.
- **Por qué.** La spec dice "en cada sección". Comparar el lenguaje resuelto, y no el texto de la valla, deja pasar `py` frente a `python`, que se ven igual, y detecta lo que el lector mostraría distinto.
- **Cómo deshacerlo.** Quitar la llamada a `checkCodeParity` en `validateContent`.

### 1.2 a 1.4 Dónde van las pruebas

- **Qué.** Archivos nuevos `scripts/content/contenido-claro.test.ts` (pasos y paridad) y `src/test/contenido-claro.test.tsx` (lector), como ya se hizo con un archivo por cambio en `pista-python` y `rendimiento-movil`. La prueba de `pista-python.test.ts` que exigía "solo bloques de código" se adaptó a la regla nueva (design.md decisión 14), y a su lado se añadió el escenario "Ejemplo principal sin código": así los cinco escenarios de "Ejemplo principal opcional" quedan juntos en el `describe('1.3 ejemplo principal opcional')` de ese archivo. Las pruebas que comprobaban el rótulo antiguo ("Ejemplo: la API de la tienda") pasan a comprobar "Paso a paso" / "Step by step".
- **Por qué.** Mantener la trazabilidad por cambio sin duplicar los escenarios que ya estaban probados.
- **Cómo deshacerlo.** Mover o borrar los archivos nuevos; restaurar la prueba adaptada desde Git.

## Grupo 2. Modelo: entradas de proyecto

**Comprobaciones.** Antes de tocar nada: `typecheck`, `test` (289 pruebas en 16 archivos), `lint` (0 errores, 14 avisos) y `build` en verde. 2.5, al cerrar el grupo: `typecheck`, `test` (327 pruebas en 16 archivos: 38 nuevas), `lint` (0 errores, los mismos 14 avisos) y `build` en verde. `npm run content` sobre el contenido real: 41 temas, 156 nodos, 215 enlaces, y los 85 archivos de `src/generated/` son idénticos byte a byte a los de antes del grupo (comparados con `diff -r` antes y después). En el navegador, a 1280 px: `decoradores`, `cache-http`, `metodos-http` y `rate-limiting` se ven con sus pestañas y su frecuencia; pestañas, anterior, siguiente, sidebar, un enlace del texto (`metodos-http` → `cors`) y un relacionado funcionan como antes, sin errores en la consola. Captura de un tema existente: `/Users/yotfil/.claude/projects/-Users-yotfil-Documents-Yotfil-TechForge-Learning-ai-engineer-ai-engineer-path/7e067968-eead-447c-8abc-db2a441f4465/tool-results/mcp-Claude_Browser-blob-1794628548151-9v1156.jpg`.

**Comprobación visual de una entrada de proyecto.** Se creó solo en local `content/python/proyecto-prueba-local` (tres partes, `covers` con dos temas de Python y `codigos-de-estado`), se miró en el navegador y se borró; después se recompiló y la salida volvió a ser idéntica a la de antes. A 1280 px: sin pestañas ni frecuencia, contexto, partes y lista en una columna, relacionados con los tres temas. A 375 px: sin desplazamiento horizontal (`scrollWidth` 375) y los bloques se desplazan dentro de su recuadro. Capturas fuera del repositorio, en la misma carpeta que la anterior: `mcp-Claude_Browser-blob-1794628633860-rzsvmu.jpg` (escritorio), `mcp-Claude_Browser-blob-1794628643265-ip4sou.png` (final de la columna, con la lista) y `mcp-Claude_Browser-blob-1794628643265-mfykqx.jpg` (teléfono). Observación: con el servidor de desarrollo abierto, compilar el contenido a mano mientras su vigilante también lo compilaba dejó la app sin datos hasta reiniciar el servidor; no afecta a `build` ni a la vista previa publicada, y no se tocó.

### 2.1 y 2.2 El modelo: `kind`, `covers` y `freq` opcional, también en el nodo del grafo

- **Qué.** En `src/content/model.ts`: `KINDS = ['project']`, `PROJECT_SECTION_KEYS = ['context', 'walkthrough']`, el tipo `BodySectionKey` (secciones de un tema o de una entrada) y `sectionKeysOf(kind)`. `TopicContent` gana `kind` y `covers` y su `freq` pasa a opcional; una entrada lleva `exercises: []`. El nodo del grafo (`GraphNode`) de una entrada lleva también `kind` y `covers` (en el orden declarado) y no lleva `freq`.
- **Por qué.** La decisión 6 fija que en la salida generada una entrada es un tema con `kind` y `covers` y sin `freq`; `graph.json` es parte de esa salida. La app necesita saber que un nodo es una entrada antes de cargar su contenido (para no pintar pestañas mientras carga) y conocer sus `covers` para el panel de relacionados. **Para que Fable lo revise:** toca el contrato entre la compilación y la app; lo clasifiqué como no crítico porque aplica la representación que ya fija la decisión 6 y es aditivo (el contenido real genera exactamente lo mismo).
- **Cómo deshacerlo.** Quitar `kind` y `covers` de `GraphNode` y de `graph.ts`, y hacer que el lector y `relatedOf` lean `covers` del contenido cargado.

### 2.1 Reglas de validación y mensajes

- **Qué.** En `meta.yaml` (`scripts/content/schema.ts`): una entrada no puede declarar `freq`, `concepts`, `related` ni `demo`, aunque sea una lista vacía (se rechaza el campo); `covers` es obligatorio, con al menos 2 temas, y además **no puede repetir un tema**; un tema normal sigue necesitando `freq` y no puede declarar `covers`. En `es.md`/`en.md` (`reader.ts`): una entrada no puede declarar `concepts` ni `exercises`. En el cuerpo (`sections.ts`): una entrada exige `context` y `walkthrough` y ninguna otra; las dos admiten títulos de paso; cada bloque de `walkthrough` declara su lenguaje (anunciado al usuario al empezar el grupo); un tema con `## context` o `## walkthrough` recibe un mensaje propio ("solo se admite en una entrada de proyecto") en lugar de "sección desconocida". En la validación cruzada (`validate.ts`): cada tema de `covers` existe, no es un concepto, no es otra entrada **ni la propia**, y aparece enlazado con `[[id]]` en `walkthrough` (un enlace en `context` no cuenta) en cada idioma; la paridad de código recorre las secciones de la entrada. Mensajes, por ejemplo: `entrada de proyecto "<id>": el tema reunido "<x>" no existe`, `entrada de proyecto "<id>" (en): el recorrido (walkthrough) no enlaza el tema reunido "<x>"`, `<archivo>: la sección "analogy" es de un tema y no se admite en una entrada de proyecto`.
- **No se comprueba al compilar** (son límites de redacción de la decisión 6, no reglas de compilación): de 3 a 6 partes, 25 líneas por bloque, `context` sin código, ni que haya al menos un bloque en `walkthrough`.
- **Por qué.** Las reglas añadidas (`covers` sin repetidos ni la propia entrada, mensaje propio para `context` en un tema) solo rechazan casos sin sentido y hacen los mensajes más claros; ninguna afecta al contenido real.
- **Cómo deshacerlo.** Quitar la comprobación correspondiente en `schema.ts`, `sections.ts` o `validate.ts`.

### 2.2 Conexiones de una entrada en el cerebro

- **Qué.** En `scripts/content/graph.ts`, las conexiones de tipo relación entre cada entrada y sus temas reunidos se crean antes que las de `related` y las menciones `[[id]]`. Así ese par siempre queda como "relación", aunque otro tema mencione antes la entrada.
- **Por qué.** El grafo guarda una sola conexión por par; sin este orden, una mención previa ocuparía el par con el tipo "mención". En el contenido actual no hay entradas y el grafo sale idéntico.
- **Cómo deshacerlo.** Mover ese bucle dentro del de `related`.

### 2.2 y 2.4 Relacionados y vecinos de una entrada

- **Qué.** `relatedOf` (`src/graph/relations.ts`) devuelve, para una entrada, exactamente sus temas de `covers` en su orden: sin conceptos y sin lo que el recorrido enlace aparte. Al pasar el cursor por su nodo en el cerebro se resaltan la entrada y esos temas.
- **Consecuencia, para que Fable la revise (no la elegí: sale de que la relación es una conexión en los dos sentidos):** en el panel de relacionados de un tema reunido aparece la entrada de proyecto que lo reúne.
- **Cómo deshacerlo.** Quitar la línea de `kind === 'project'` en `relatedOf`.

### 2.3 Aspecto del lector de una entrada

- **Qué.** En `Reader.tsx`: si el nodo o el contenido es una entrada, no hay pestañas ni etiqueta de frecuencia; la columna lleva `context`, `walkthrough` y la lista de `covers`, cada uno bajo su rótulo `h3`. `context` y `walkthrough` usan la clase `.steps`, así cada "Parte N." se ve igual que un título de paso del grupo 1. La lista es una `<ul>` de enlaces con `data-node` (los abre el mismo manejador que los enlaces del texto), con el título completo de cada tema y el color de enlace de siempre. Sin pestañas, una línea igual a la que subraya las pestañas (`.noTabs::after` en `Reader.module.css`) separa la cabecera del contenido. El cuerpo de una entrada no lleva `role="tabpanel"`, porque no hay pestañas. Rótulos nuevos: `section.context`, `section.walkthrough` y `reader.covers` en `src/locales/es.json` y `en.json`, con los textos de la decisión 6.
- **Por qué.** Reutilizar el estilo de los pasos y de los enlaces mantiene la estética sin elementos nuevos; la línea evita que la cabecera se pegue al contenido cuando faltan las pestañas.
- **Cómo deshacerlo.** Revertir el bloque `isProject` de `Reader.tsx`, `.noTabs` del CSS y las tres claves de los textos.

### 2.4 Listas y cerebro: sin refuerzo visual

- **Qué.** No se añadió ningún refuerzo visual opcional a la entrada en el sidebar ni en la hoja del teléfono: la distingue solo el prefijo "Proyecto:" de su título corto. En el cerebro, el nodo de una entrada, que no tiene frecuencia, toma el tamaño de un tema "a veces" (el valor por defecto que el renderizador ya usaba para un tema sin frecuencia); no se cambió código para ello.
- **Por qué.** La decisión 6 deja el refuerzo como opcional y el prefijo ya cumple; el tamaño del nodo no está fijado en el diseño. **Para que Fable lo revise:** el tamaño del nodo es visible para el usuario.
- **Cómo deshacerlo.** No hay nada que revertir; un refuerzo o un tamaño propio se añadiría en `Sidebar.tsx`, `BottomBar.tsx` o `canvas-renderer/scene.ts`.

### 2.1 a 2.4 Dónde van las pruebas

- **Qué.** En los mismos archivos del grupo 1: `scripts/content/contenido-claro.test.ts` (`describe` "2.1" con los nueve escenarios de content-model y las reglas añadidas, y "2.2" con salida, buscador, grafo y "Más conexiones entre pistas") y `src/test/contenido-claro.test.tsx` ("2.3" con los seis escenarios de lectura, más cerrar, teléfono y un tema normal, y "2.4" con los tres de las listas, más relacionados y cerebro). Las entradas de prueba usan los identificadores y títulos de `content-map.md`, sección 3, para que los escenarios se lean igual que en la spec. `scripts/content/fixtures.ts` gana `project()` y `walkthrough()`.
- **Cómo deshacerlo.** Borrar esos `describe` y las dos funciones de `fixtures.ts`.

## Grupo 3. Orden de la pista Python y FastAPI

**Comprobaciones.** Antes de tocar nada: `typecheck`, `test` (327 pruebas en 16 archivos), `lint` (0 errores, 14 avisos) y `build` en verde. 3.1, al cerrar el grupo: `typecheck`, `test` (327 pruebas en 16 archivos: la prueba de orden se sustituye, no se añade ninguna), `lint` (0 errores, los mismos 14 avisos) y `build` en verde. `npm run content`: 41 temas, 156 nodos, 215 enlaces.

**Orden.** Los 21 `meta.yaml` llevan el orden de `content-map.md` sección 2: final en 13 temas y provisional en los 8 aún sin partir (3, 5, 9, 11, 13, 24, 27 y 32); 18 archivos cambian, porque `tipado-y-type-hints`, `estructuras-de-datos` y `comprehensions-y-generadores` ya tenían 1, 2 y 3. La lista de temas de Python de `graph.json`, ordenada por `order`, es idéntica antes y después (21 temas, mismo grupo y misma posición), y los 85 archivos de `src/generated/` solo difieren en el valor de `order` (comparados sin ese campo). En el navegador (`/es/python/decoradores`, servidor de desarrollo): el sidebar lista 10 temas bajo "Python" y 11 bajo "FastAPI" en el mismo orden de antes; "Siguiente" desde `decoradores` lleva a `errores-y-context-managers`, "Anterior" a `funciones-y-closures`, y "Siguiente" desde `identidad-copias-mutabilidad` (16) lleva a `rutas-y-parametros` (18), saltando el hueco; sin errores en la consola. Captura del sidebar fuera del repositorio: `/Users/yotfil/.claude/projects/-Users-yotfil-Documents-Yotfil-TechForge-Learning-ai-engineer-ai-engineer-path/2d7217d5-9eee-4b13-87f0-fe353501d7cf/tool-results/mcp-Claude_Browser-blob-1794630246970-zjzekp.png`.

**Observación.** Había un servidor de desarrollo de este proyecto abierto en el puerto 5173 desde antes de la sesión (no lo arrancó Opus); `npm test` y `npm run build` compilan el contenido y podían dejarlo sin datos (aviso del handoff). Se comprobó después: seguía mostrando el tema y la lista completa. No se tocó.

### 3.1 La prueba fija el orden de `content-map.md`, final o provisional

- **Qué.** En `scripts/content/pista-python.test.ts`, la prueba "21 temas en el orden de la guía" (21 temas, órdenes de 1 a 21, `concurrencia` en el octavo puesto) pasa a ser "orden relativo: cada entrada lleva el orden y el grupo de content-map.md, final o provisional". Lleva copiadas la tabla de la sección 2 (34 filas con su grupo y su tipo: tema, tema nuevo o proyecto) y las ocho particiones de la sección 1, y comprueba: (a) que cada entrada de la pista tiene el orden y el grupo de la tabla, o el provisional (el del primero de sus sustitutos) si aún no se ha partido, lo que implica el orden relativo y que "Python" va antes que "FastAPI"; (b) que existen los 13 temas que se conservan; (c) que cada tema que se parte está entero o partido en sus dos mitades, nunca a medias ni a la vez. Las entradas de proyecto no se exigen mientras no existan. Se mantiene la comprobación de pistas vacías. Se verificó que falla con un mensaje claro si un tema lleva un orden distinto del de la tabla (`decoradores` con 4 en lugar de 7, y luego restaurado).
- **Por qué.** La decisión 9 pide comprobar el orden relativo sin exigir órdenes consecutivos. Comparar con los números de la tabla lo cumple y además sirve sin cambios en los grupos 4 a 13, mientras se parten temas y se añaden entradas (ninguna tarea de esos grupos adapta la prueba; se deja con las cifras finales en la 14.1), y detecta un número equivocado en una mitad o una entrada nueva. Es más estricta que comprobar solo la secuencia, pero los números son los del documento vinculante, no una elección de Opus.
- **Cómo deshacerlo.** Para comprobar solo la secuencia, comparar los `id` ordenados con los de `FINAL_ORDER` (con cada tema sin partir en el lugar de su primera mitad) filtrados a los presentes, sin mirar `order`; o restaurar la prueba anterior desde Git.

## Grupo 4. Piloto

**Comprobaciones antes de tocar nada** (2026-11-13): `typecheck`, `test` (327 pruebas en 16 archivos), `lint` (0 errores, 14 avisos) y `build` en verde. Había un servidor de desarrollo de este proyecto escuchando en el puerto 5173 (proceso `vite`, no lo arrancó Opus); no se tocó.

**Herramientas fuera del repositorio** (en el scratchpad de la sesión, `/private/tmp/claude-501/-Users-yotfil--claude-spares-spare-QTpqJO/f3e5da49-0ef9-411b-bf0b-1fb84992f1fe/scratchpad/`):

- `check-python.py`: extrae los bloques de Python de un `es.md` o `en.md`, cuenta sus líneas, ejecuta los ejecutables con `python3` (3.14.7) y compara la salida real con las líneas `# …` escritas debajo. En `code:example` ejecuta los pasos acumulados (cada paso ve lo definido en los anteriores); las demás secciones, cada bloque solo. No ejecuta los bloques que importan de `app.`, FastAPI, SQLModel o Pydantic.
- `check-content.mts`: llama a `buildContent` sin escribir `src/generated/`, para validar el contenido sin pisar el vigilante del servidor abierto.

### 4.1 Patrón de reescritura de un tema

- **Qué.** Lo que fija `decoradores` para los demás temas:
  - **Frontmatter.** `title`, `short` y `concepts` no cambian. `summary` se redacta de nuevo (aquí 111 caracteres). En `exercises` no cambian `prompt`, `q`, `code`, `options` ni `answer`; solo se reescribe `why`, con la regla 4 (por qué, sin repetir la respuesta).
  - **Pasos.** `### Paso N. …`; el de proyecto es el último numerado, `### Paso N. En el proyecto: …`; el avanzado va después, `### Avanzado. …`.
  - **15 líneas por bloque, contando todas**: las vacías y las de salida. Si un paso no cabe, lleva dos bloques (la definición y el uso, con una frase entre ellos), como permite design.md decisión 2.
  - **Salida.** Debajo del código, como líneas `# …`. Si el bloque termina en un error, se escribe solo la última línea del traceback (`# TypeError: …`), que es la que reconoce el lector; una aclaración, entre paréntesis en esa misma línea.
  - **Pasos que se apoyan en los anteriores**, como en el modelo: el paso 2 usa `saludar` del paso 1. Se ejecutan acumulados. `bad` y `good` se pueden ejecutar solos.
  - **Conceptos de otros temas**: enlace `[[id]]` y una frase (`[[closure]]` en el paso 2, `[[args-kwargs]]` en el paso 4).
  - **Paso de proyecto.** Comentario con la ruta, imports de `app.*` para lo que se da por hecho (convención 7 de `proyecto-tienda.md`) y frase de cuándo se ejecuta. Se comprueba con simulaciones mínimas de los módulos importados en el scratchpad (`decoradores/proyecto/`), nunca en el repositorio.
- **Por qué.** El modelo de la guía ya pasa de 15 líneas en el paso 4 (17) y en el `code:server` del Modelo 3 (20); contar todas las líneas es la lectura estricta de la regla 3 y de la pregunta 6.
- **Cómo deshacerlo.** Es redacción: se reescribe el tema.

### 4.1 Diferencias con el Modelo 1

- **Qué.**
  - Paso 3: añadida la llamada `saludar()` con su salida (pregunta 7).
  - Paso 4: dos bloques (definición y uso), y un comentario que explica `__name__` (pregunta 2).
  - Paso 5, de proyecto, nuevo: el código del ejemplo de la regla 6 de la guía, más el import de `LineaPedido`.
  - Avanzado: el `consultar` con `...` pasa a ser uno que falla siempre y muestra los tres intentos y el error, para que se pueda ejecutar; dos bloques. Al final, una frase sobre `@app.get(...)` de FastAPI, que es un decorador con argumentos.
  - `bad` y `good`: un solo fallo, el `return` olvidado, mostrando que el error salta lejos del decorador. `functools.wraps` queda en el paso 4 y en el malentendido 2. Antes, `bad` juntaba los dos fallos.
  - Malentendido 2: dice solo lo confirmado. Sin `wraps`, Python ve `(*args, **kwargs)` en lugar de `(a, b)` (ejecutado con `inspect.signature`), y FastAPI saca los parámetros con `inspect.signature` (fuente abajo). El modelo decía que FastAPI "lee el nombre y los parámetros ... para saber qué recibe el endpoint": el nombre lo usa para el nombre de la ruta, no para saber qué recibe, así que se quitó.
  - Malentendido 3: añadido el error real de `@avisar()`.
  - `bridge:typescript`: se quita "un decorador de clase (como `@Entity` en TypeORM) suele adjuntar metadatos", que no se confirmó.
- **Paso de proyecto, para que Fable lo revise.** La guía, en su ejemplo para Decoradores, dice que `calcular_total` "la llama el endpoint `POST /v1/pedidos` cada vez que un cliente crea un pedido". No se usó: la entrada `proyecto-crear-pedido` (4.6) muestra ese endpoint completo con el alcance de `content-map.md` sección 3, que no incluye el total, y `proyecto-tienda.md` no fija quién llama a `calcular_total` ni que el pedido tenga total. La frase dice cuándo se ejecuta ("cada vez que la tienda calcula el total de un pedido"), que la regla 6 admite. Conviene fijarlo antes de `proyecto-total-del-pedido` (grupo 5).
- **Cómo deshacerlo.** Restaurar el texto del modelo en cada punto.

### 4.1 Patrón de traducción

- **Qué.**
  - Se traducen: textos, títulos de paso (`### Step N.`, `In the project:`, `### Advanced.`), comentarios, lo que el código imprime (`print("hola")` → `print("hello")`), los mensajes de las excepciones que crea el ejemplo (`ConnectionError("sin red")` → `"no network"`) y, en consecuencia, las salidas escritas.
  - No se traducen: nombres de variables, funciones, clases, módulos y rutas; los mensajes que genera Python (`TypeError: …`), que ya están en inglés; los enlaces `[[id]]`.
  - Ejercicios: no se tocan `code` ni `options`, porque las opciones citan lo que imprime ese código y las respuestas no cambian. Se traducen `prompt`, `q` y `why`.
  - Si el texto español nombra en castellano algo que el lector inglés ve en el código, la traducción lo señala: "*wrapper* (envoltura)" pasa a "*wrapper* (`envoltura` in the code)".
  - La versión inglesa se ejecuta también con `check-python.py`.
- **Por qué.** design.md decisiones 4 y 10, y la convención 1 de `proyecto-tienda.md`.
- **Cómo deshacerlo.** Es redacción: se rehace la traducción.

### 4.1 Fuentes de `decoradores` (consultadas el 2026-11-13)

- Ejecutado con `python3` 3.14.7: los diez bloques ejecutables en los dos idiomas, los tres malentendidos (incluido `inspect.signature` con y sin `wraps`) y los dos ejercicios.
- FastAPI, `fastapi/routing.py` (https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/routing.py): `APIRouter.get` devuelve `self.api_route(...)`, cuyo `decorator(func)` llama a `self.add_api_route(path, func, ...)` y hace `return func`; `route.name = get_name(endpoint) if name is None else name`.
- FastAPI, `fastapi/applications.py` (https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/applications.py): `FastAPI.get` hace `return self.router.get(...)`.
- FastAPI, `fastapi/dependencies/utils.py` (https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/dependencies/utils.py): `_get_signature` llama a `inspect.signature(call, eval_str=True)` y `get_dependant` recorre esos parámetros.
- TypeScript, manual de decoradores (https://www.typescriptlang.org/docs/handbook/decorators.html): "can be attached to a class declaration, method, accessor, property, or parameter".
- TypeScript 5.0 (https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html): los decoradores "customize classes and their members"; el ejemplo `loggedMethod` devuelve una función que reemplaza al método.

### 4.2 Patrón de partición de un tema

- **Qué.** Lo que fija `funciones-y-closures` para las otras siete particiones:
  - Se crean las dos carpetas nuevas con su `meta.yaml`: `id`, `track`, `order` de `content-map.md` sección 2; `freq` y `group` heredados; `concepts` y `related` de la sección 1.
  - La carpeta antigua se borra con `rm -r` (no `git rm`): el borrado queda sin preparar, como el resto de cambios, hasta que el usuario haga el commit. Antes se comprueba con `grep` que nada de `content/` la nombra.
  - Los conceptos se copian del tema antiguo con el mismo nombre y los mismos alias **en cada idioma** (el inglés tiene los suyos: `args-kwargs` se llama "*args and **kwargs" en `en.md`).
  - Los ejercicios van a la mitad que indica la sección 1, con las reglas de la 4.1 (solo cambia `why`). Una mitad sin ejercicios no lleva la clave `exercises`.
  - Una mitad nombra a la otra con `[[id]]` cuando la usa (`closures-y-lambdas`, paso 5, enlaza `[[funciones-y-parametros]]` por el valor por defecto `n=numero`), sin repetir su explicación (design.md decisión 8).
  - Mientras falta el inglés, el español se valida con `check-content-es.mts`, que copia `content/` al scratchpad y usa `es.md` como inglés provisional donde falta `en.md`.
- **Comprobación.** `funciones-y-closures` ya no existe y `grep -rn funciones-y-closures content/` no encuentra nada. `check-content-es.mts`: 42 temas, 157 nodos, 221 enlaces.
- **Cómo deshacerlo.** `git checkout -- content/python/funciones-y-closures` y borrar las dos carpetas nuevas.

### 4.2 `closures-y-lambdas`: diferencias con el Modelo 2

- **Qué.**
  - El modelo explica solo `closure`; el tema tiene también `lambda`. Se añade un párrafo a la definición, una frase al problema, el paso 4 ("Una lambda es una función de una línea, sin nombre", con `sorted` y los tres productos de la tienda) y un cuarto malentendido.
  - La trampa del bucle pasa del paso 4 al 5, porque usa lambdas y en el modelo aparecían antes de explicarlas.
  - Analogía: entre paréntesis, qué es cada cosa (pregunta 3).
  - Paso 6, de proyecto: `crear_descuento(porcentaje)` en `app/pedidos/service.py`, con un segundo bloque que lo usa con el precio del café.
  - `bad` y `good`: la trampa del bucle con descuentos de la tienda (5, 10 y 20 %).
  - Malentendido 2: añadido el mensaje real de `UnboundLocalError`.
  - En la entrevista se quita la frase sobre decoradores: el tema no explica qué es un decorador ni una envoltura (pregunta 10). El malentendido 4 sí lo menciona, enlazando `[[decoradores]]`.
- **Para que Fable lo revise.** El descuento del paso 6 aplica un alcance que `content-map.md` (sección 3) da a `proyecto-total-del-pedido` ("aplica un descuento" en `app/pedidos/service.py`): un porcentaje entero con división entera, porque los precios son enteros en pesos. Esa entrada (grupo 5) debería usar este mismo `crear_descuento`.
- **Cómo deshacerlo.** Reescribir el paso 6 y `bad`/`good`.

### 4.2 `funciones-y-parametros`: cómo se escribió

- **Qué.**
  - No hay modelo propio: se escribe con la forma del Modelo 2 (definición corta, analogía y pasos).
  - Pasos: 1. por posición o por nombre; 2. valor por defecto; 3. `*args`; 4. `**kwargs`; 5. `*` y `**` al llamar; 6. de proyecto.
  - El paso 5 no estaba en el ejemplo antiguo, solo en su puente ("`f(*lista)` y `f(**dic)` ≈ spread"). Se añade porque `decoradores` (paso 4) usa `func(*args, **kwargs)` y lo necesita entendido.
  - La trampa del valor por defecto mutable va en `bad`/`good` y en un malentendido, no en los pasos. El paso 2 la anuncia.
  - Paso 6, de proyecto: `GET /v1/productos` en `app/productos/router.py`, con `pagina: int = 1` y `tamano: int = 20`, y `repository.listar(pagina, tamano)` dado por hecho. El router se crea con `router = APIRouter()` y la ruta completa en el decorador, sin prefijo; la 4.6 usa la misma forma.
- **Para que Fable lo revise.** `proyecto-api-completa` (grupo 10) muestra "el listado paginado y cacheable de productos" en este mismo archivo: debería conservar estos nombres y valores, o ajustar este paso.
- **Cómo deshacerlo.** Reescribir el paso 6.

### 4.2 Fuentes de las dos mitades (consultadas el 2026-11-13)

- Ejecutado con `python3` 3.14.7: todos los bloques ejecutables de las dos mitades, los mitos (`UnboundLocalError`, `type(lambda: 0)`, `lambda x: return x` → `SyntaxError`, `append` sobre la tupla de `*args`, `type` de `**kwargs` → `dict`) y los dos ejercicios. Los dos bloques de FastAPI y del servicio solo se compilan con `ast.parse`; `crear_descuento` además se ejecuta, porque no importa nada.
- Python, referencia, "Function definitions" (https://docs.python.org/3/reference/compound_stmts.html): los valores por defecto "are evaluated ... when the function definition is executed", el aviso sobre listas y diccionarios y la solución con `None`; `*identifier` es una tupla y `**identifier` "a new ordered mapping".
- Python, referencia, "Lambdas" (https://docs.python.org/3/reference/expressions.html): `lambda parameters: expression` equivale a un `def` con `return expression`; "cannot contain statements or annotations".
- MDN, "Closures" (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures): la trampa del bucle con `var` y su solución con `let`/`const`; `privateCounter += val` reasigna la variable de fuera sin palabra especial.
- MDN, funciones flecha (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions): "either an expression body or the usual block body".
- MDN, parámetros por defecto (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters): "evaluated at call time. Unlike with Python ... a new object is created each time".
- MDN, parámetros rest (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters): "accept an indefinite number of arguments as an array".
- FastAPI, "Query Parameters" (https://fastapi.tiangolo.com/tutorial/query-params/): los parámetros de consulta "can be optional and can have default values"; sin ellos en la URL se usan los valores por defecto.
- FastAPI, "Bigger Applications" (https://fastapi.tiangolo.com/tutorial/bigger-applications/): `router = APIRouter()` y `@router.get(...)`, "the same way you would use the `FastAPI` class".

### 4.3 `cache-http`: diferencias con el Modelo 3

- **Error del modelo, corregido** (regla 5 de "no se inventa información"). En el Modelo 3 el 304 solo lleva `ETag`, en la conversación y en el código del servidor. La RFC 9110, sección 15.4.5, dice que el servidor que genera un 304 "MUST generate any of the following header fields that would have been sent in a 200 (OK) response", entre ellos `ETag` y `Cache-Control`. Ahora el 304 lleva las dos, en el momento 3 (con un comentario que lo dice) y en el código (un solo diccionario `cache` para el 200 y el 304). Se añade además que con esas cabeceras el navegador renueva su copia (RFC 9111, sección 4.3.4).
- **Comparación del ETag.** El modelo comparaba `request.headers.get("if-none-match") == etag`. La RFC 9110, sección 13.1.2, admite una lista de ETag separados por comas en `If-None-Match` y obliga a responder 304 si coincide cualquiera. El código usa `etag in request.headers.get("if-none-match", "")`, con un comentario. Comprobado con una simulación mínima en el scratchpad (`cache/`): 304 con un ETag solo y dentro de una lista, y 200 con un ETag nuevo si el producto cambia.
- **Quitado por no confirmarse.** "En la pestaña Network aparece como `(disk cache)`" (momento 2). La referencia del panel Network de Chrome (https://developer.chrome.com/docs/devtools/network/reference) no documenta esa etiqueta; solo aparece en una prueba del código de DevTools, que no es documentación. El momento 2 dice lo confirmado: el navegador no envía nada.
- **Otros cambios.**
  - `problem`: "Pedro" pasa a "Luis", porque los clientes de ejemplo de `proyecto-tienda.md` son Ana y Luis.
  - Momento 1: línea vacía entre cabeceras y cuerpo, y `nombre` en el cuerpo del producto.
  - `code:server`: ruta del archivo, nombre `obtener_producto`, `repository.buscar` en lugar de `repo.buscar`, y como máximo 15 líneas (el bloque del modelo tiene 20). El caso 404 se omite y el comentario lo dice. Una frase antes del bloque dice qué son `router` y `repository`, y otra después, quién llama a la función.
  - `bad` y `good`: petición y respuesta completas, con `Authorization: Bearer <token de Ana>`. La nota de `bad` explica por qué `public` es lo que abre la puerta (RFC 9111, sección 3.5).
  - `bridge:typescript` reescrito con `fetch`; el antiguo hablaba del panel Network, no de TypeScript.
- **Para que Fable lo revise.** Las peticiones no llevan `Host`, como en el modelo. Los temas de REST sin reescribir usan `Host: api.tienda.co`, pero `proyecto-tienda.md` no fija ningún dominio; convendría fijarlo antes del grupo 11.
- **Cómo deshacerlo.** Restaurar el texto del modelo en cada punto. La corrección del 304 no debería deshacerse.

### 4.3 Fuentes de `cache-http` (consultadas el 2026-11-13)

- RFC 9110 (https://www.rfc-editor.org/rfc/rfc9110.txt, descargada al scratchpad, `rfc/`): 8.8.3 (`ETag`: "an opaque quoted string", `opaque-tag = DQUOTE *etagc DQUOTE`), 13.1.2 (`If-None-Match`: lista de ETag, comparación débil, 304 para GET y HEAD) y 15.4.5 (304: cabeceras obligatorias; "cannot contain content").
- RFC 9111 (https://www.rfc-editor.org/rfc/rfc9111.html): 5.2.2.1 `max-age`, 5.2.2.4 `no-cache` ("MUST NOT be used to satisfy any other request without forwarding it for validation"), 5.2.2.5 `no-store`, 5.2.2.7 `private` ("a shared cache MUST NOT store the response"), 5.2.2.9 `public` ("MAY store the response even if it would otherwise be prohibited"), 3.5 (respuestas a peticiones con `Authorization` en cachés compartidos), 4.3.4 (el caché actualiza su copia con las cabeceras del 304) y 2 (la clave del caché es, como mínimo, el método y la URI).
- FastAPI, "Response Headers" (https://fastapi.tiangolo.com/advanced/response-headers/): parámetro `response: Response` para poner cabeceras, y devolver un `Response` con `headers=`.
- FastAPI, "Using the Request Directly" (https://fastapi.tiangolo.com/advanced/using-request-directly/): un parámetro de tipo `Request` recibe la petición.
- Starlette, `starlette/datastructures.py` (https://raw.githubusercontent.com/encode/starlette/master/starlette/datastructures.py): `Headers` busca sin distinguir mayúsculas; `MutableHeaders.update(other)` asigna cada cabecera.
- MDN, `Request.cache` (https://developer.mozilla.org/en-US/docs/Web/API/Request/cache): con `default`, el navegador hace la petición condicional y, si no cambió, "it will be returned from the cache"; ejemplo `fetch("some.json", { cache: "no-store" })`.

### 4.4 `codigos-de-estado`: cómo se reescribió con el Modelo 3

- **Qué.**
  - `code:wire` en cuatro momentos (el máximo de la tabla de la guía), todos con rutas y clientes de la tienda: 201 con `Location` al crear un pedido, 401 sin token, 403 cuando Luis pide el pedido de Ana (con la nota de que se puede responder 404 para ocultarlo) y 422 con el cuerpo de error de FastAPI, recortado.
  - `code:server`: `GET /v1/pedidos/{id}` en `app/pedidos/router.py`, con los comentarios numerados en el orden de ejecución: 401 desde `ClienteActual`, 404, 403 y 200. Usa `HTTPException(status_code=..., detail=...)`, como la documentación.
  - `bad` y `good`: la misma petición con 200 y `{"ok": false}` frente a 404 con `{"detail": ...}`, el formato que produce el bloque del servidor. El `good` antiguo usaba `application/problem+json`, que no es lo que responde `HTTPException`.
  - Malentendidos: de seis a cuatro (la regla 5 pide 3 o 4). Se quedan 401/403, 400/422, 200/201/204 y la familia 5xx; salen 301/302 y 404/410.
  - Ejercicios: los nueve `why` reescritos con la regla 4. Enunciados, opciones y respuestas, sin cambios.
- **Error del contenido antiguo, corregido.** El malentendido decía "400 es una petición mal formada (JSON roto ...); FastAPI usa 422 para validación". En FastAPI un JSON roto en el cuerpo también responde 422: `routing.py` captura `json.JSONDecodeError` y lanza `RequestValidationError` con `"type": "json_invalid"`, y el manejador de ese error responde 422. El malentendido nuevo lo dice.
- **Quitado.** En `problem`, "que las cachés guarden respuestas de error como si fueran válidas": la RFC 9110 (sección 15.1) también trata el 404 como cacheable por heurística, así que la frase se presta a confusión.
- **Para que Fable lo revise.** El momento 1 responde `Location` al crear un pedido; la entrada `proyecto-crear-pedido` (4.6) lo envía igual, para ser coherente. El bloque del servidor da por hecho que `ClienteActual` responde 401 si el token falta o no vale, como en el tutorial de seguridad de FastAPI; `autenticacion-en-fastapi` (grupo 9) debería mantenerlo.
- **Cómo deshacerlo.** Reescribir las secciones; la corrección del 422 no debería deshacerse.

### 4.4 Fuentes de `codigos-de-estado` (consultadas el 2026-11-13)

- RFC 9110 (texto descargado al scratchpad, `rfc/rfc9110.txt`): sección 15 (tres dígitos; las cinco familias) y 15.1 (frases de estado orientativas; códigos cacheables por heurística, entre ellos 404); 201 (15.3.2, `Location`), 202 (15.3.3), 204 (15.3.5), 400 (15.5.1), 401 (15.5.2: "lacks valid authentication credentials", `WWW-Authenticate` obligatoria), 403 (15.5.4: credenciales insuficientes; puede responderse 404 para ocultar el recurso), 409 (15.5.10), 422 (15.5.21: nombre "Unprocessable Content"), 500 (15.6.1), 502 (15.6.3), 503 (15.6.4) y 504 (15.6.5).
- `python3`: `http.HTTPStatus(422).phrase` es "Unprocessable Content".
- FastAPI, "Handling Errors" (https://fastapi.tiangolo.com/tutorial/handling-errors/): `raise HTTPException(status_code=404, detail="Item not found")` responde `{"detail": "Item not found"}` y corta la función; ejemplo de error de cuerpo con `"loc": ["body", "size"]`.
- FastAPI, `fastapi/exception_handlers.py` (https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/exception_handlers.py): el error de validación responde 422 con `{"detail": ...}`.
- FastAPI, `fastapi/routing.py` (https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/routing.py): `json.JSONDecodeError` pasa a `RequestValidationError` con `"type": "json_invalid"`.
- FastAPI, "Security - First Steps" (https://fastapi.tiangolo.com/tutorial/security/first-steps/): sin `Authorization` o sin `Bearer`, `OAuth2PasswordBearer` responde 401 directamente.
- SQLModel, "Read One Model with FastAPI" (https://sqlmodel.tiangolo.com/tutorial/fastapi/read-one/): `session.get(Hero, hero_id)` y 404 si no existe.
- Pydantic, errores de validación (https://pydantic.dev/docs/validation/latest/errors/validation_errors/): tipo `greater_than` y el mensaje "Input should be greater than 10"; manejo de errores (https://pydantic.dev/docs/validation/latest/errors/errors/): `loc` como lista, con el índice del elemento, `('items', 1, 'value')`.
- MDN, `fetch()` (https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch): solo rechaza por fallo de red, no por 404 o 504; y `Response.ok` (https://developer.mozilla.org/en-US/docs/Web/API/Response/ok): "status in the range 200-299".

### 4.5 `inyeccion-con-depends`: diferencias con el Modelo 4

- **Qué.**
  - Las rutas de los pasos 1 a 3 pasan de `/pedidos` y `/clientes` a `/v1/productos` y `/v1/productos/{id}`, que están en la tabla de rutas de `proyecto-tienda.md` (`/v1/clientes` no está). La paginación de productos es la misma del paso 6 de `funciones-y-parametros` (`pagina=1`, `tamano=20`).
  - Paso 1: la salida de la respuesta, sin espacios (`{"offset":10,"limit":10}`), que es como la envía FastAPI. Además, una frase sobre `offset` y `limit`.
  - Paso 2: el comentario 3 decía "al terminar la petición"; ahora dice "cuando la respuesta ya salió". La documentación actual de FastAPI dice que el código tras el `yield` se ejecuta después de enviar la respuesta con el `scope` por defecto (`"request"`).
  - Pasos 2 y 3: comentarios para `select`, `session.exec` y `session.get`, porque el tema de ORM (orden 24) va después de este (20). Enlaces a `[[yield]]`, `[[context-manager]]` y `[[session-orm]]`.
  - Paso 4: el comentario de la columna 0 pasa al texto, para no confundirlo con una salida, y se añade cómo quitar el cambio (`app.dependency_overrides = {}`).
  - Paso 5, de proyecto: `GET /v1/pedidos` en `app/pedidos/router.py`, con `ClienteActual` y `SessionDep` de `app/deps.py` y un `where` para que cada cliente vea solo sus pedidos.
  - `bad` y `good`: la sesión global frente a `SessionDep`. La nota de `bad` se apoya en la documentación de SQLAlchemy y en que FastAPI ejecuta las funciones `def` en varios hilos.
  - Malentendido 1: "ejecutas la función tú" pasa a "llamas tú a la función". Con una función con `yield`, como `get_session`, llamarla no ejecuta su cuerpo: crea un generador. El ejercicio 2 dice lo mismo.
- **Error del contenido antiguo, corregido.** El puente decía que los contenedores de TypeScript "como InversifyJS o tsyringe ... suelen entregar singletons". No se confirmó, y no se escribe; el puente nuevo no nombra librerías. Fuente que no se consultó: la documentación de cada librería.
- **Para que Fable lo revise.** `related` sigue con `base-de-datos`: la tarea 9.1 lo cambia a `orm-y-sesiones` cuando exista ese tema. Hoy no se puede: la compilación falla con un `related` a un tema inexistente.
- **Cómo deshacerlo.** Restaurar el texto del modelo en cada punto.

### 4.5 Fuentes de `inyeccion-con-depends` (consultadas el 2026-11-13)

- `python3`: la función `paginacion` del paso 1 devuelve `{"offset": 10, "limit": 10}` con `pagina=2, tamano=10`. Los demás bloques importan FastAPI o SQLModel o usan nombres de otros pasos: solo se compilan con `ast.parse`.
- FastAPI, "Dependencies" (https://fastapi.tiangolo.com/tutorial/dependencies/): `Depends` recibe "something like a function" y "You don't call it directly"; en cada petición FastAPI la llama y asigna su resultado; alias con `Annotated` (`CommonsDep`).
- FastAPI, "Dependencies with yield" (https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/): "The code following the `yield` statement is executed after the response"; `scope` `"request"` por defecto y `"function"`; `with` dentro de la dependencia.
- FastAPI, "Sub-dependencies" (https://fastapi.tiangolo.com/tutorial/dependencies/sub-dependencies/): una dependencia pedida varias veces se llama "only once per request" y su valor se reutiliza; `use_cache=False`.
- FastAPI, "Testing Dependencies with Overrides" (https://fastapi.tiangolo.com/advanced/testing-dependencies/): `app.dependency_overrides` "is a simple `dict`"; se vacía con `app.dependency_overrides = {}`.
- FastAPI, "Concurrency and async / await" (https://fastapi.tiangolo.com/async/): una función `def` "is run in an external threadpool".
- FastAPI, `fastapi/routing.py`: sin modelo ni anotación de retorno, el `dict` se responde con `JSONResponse`. Starlette, `starlette/responses.py` (https://raw.githubusercontent.com/encode/starlette/master/starlette/responses.py): `JSONResponse.render` usa `separators=(",", ":")`.
- SQLModel, "Session with FastAPI Dependency" (https://sqlmodel.tiangolo.com/tutorial/fastapi/session-with-dependency/): `get_session` con `with Session(engine) as session: yield session`; `session.exec(select(Hero)...).all()`. "Filter Data with WHERE" (https://sqlmodel.tiangolo.com/tutorial/where/): `select(Hero).where(Hero.name == "Deadpond")`.
- SQLAlchemy, "Session Basics" (https://docs.sqlalchemy.org/en/20/orm/session_basics.html): la sesión "represents a single database transaction" y "cannot be shared among concurrent threads or asyncio tasks without careful synchronization".
- Vitest, `vi` (https://vitest.dev/api/vi.html): `vi.mock` "Substitutes all imported modules from provided `path` with another module".

### 4.7 Traducciones de Sonnet: encargo y revisión

- **Encargo.** Cinco subagentes `repetidor` en paralelo, uno por tema, lanzados al terminar el español de las cinco piezas y mientras Opus escribía la 4.6. Cada encargo llevaba: la tarea y la definición de "traducir"; `decoradores` en los dos idiomas como referencia, con las reglas del patrón de la 4.1; los requisitos de paridad (design.md decisiones 4 y 10); el título, el corto y los conceptos en inglés (para las dos mitades, los del `en.md` antiguo de `funciones-y-closures`, sacados de Git); qué se conserva del `en.md` antiguo (`title`, `short`, `concepts` y, de cada ejercicio, `prompt`, `q`, `options` y `answer`); la regla "no se inventa información" entera; y cómo verificar sin compilar en `src/generated/` (`check-python.py` y `check-content-es.mts`).
- **Ampliación del patrón de traducción, decidida para este encargo.** Los datos de ejemplo de la tienda (`café`, `taza`, `molinillo`, `Ana`, `Luis`) y las claves de los diccionarios y del JSON se quedan igual en los dos idiomas, como nombres propios. Las frases que el código devuelve al usuario sí se traducen: `detail="Pedido no encontrado"` pasa a `"Order not found"`, y `nota="es un regalo"` a `"it's a gift"`. Los marcadores también: `<token de Ana>` pasa a `<Ana's token>`. Rótulos citados en el texto: "Riesgoso" es "Risky".
- **Revisión de Opus.** Leídos los cinco `en.md` enteros frente a su español. `check-python.py` sobre los cinco: todas las salidas inglesas coinciden con la ejecución real. `check-content.mts` sobre el contenido real, sin inglés provisional: 42 temas, 157 nodos, 227 enlaces, paridad en verde. Correcciones de Opus tras la revisión:
  - `funciones-y-parametros` (en): "Ana's coffee" pasa a "the `café` Ana added", para que coincida con el dato del código.
  - `funciones-y-parametros` (es y en): el resumen terminaba en "y un valor por defecto, ninguno", poco claro también en español. Ahora dice que un valor por defecto permite omitir un argumento.
  - `cache-http` e `inyeccion-con-depends` (en): "In the shop" pasa a "In the store", como en los demás temas.
  - `codigos-de-estado` (en): las comillas anidadas del primer malentendido pasan a `"401 means 'not authorized'."`, y el primer `why` dice "The token already says who they are", como el español.
- **Lo que los subagentes señalaron y se dejó así.** Traducciones no literales ("the scrub nurse", "backpack", "taken for granted"), "café" dentro de frases inglesas porque es el nombre del producto, y "(`envoltura` in the code)" en el último malentendido de `closures-y-lambdas`, que sigue el patrón. Ninguno encontró errores en el español.
- **Cómo deshacerlo.** Rehacer la traducción del tema.

### 4.6 Patrón de una entrada de proyecto

- **Qué.** Lo que fija `proyecto-crear-pedido` para las otras cuatro:
  - `meta.yaml`: `id`, `track`, `order` y `group` de `content-map.md` sección 2, `kind: project` y `covers` en el orden de la sección 3. `es.md` y `en.md`: `title`, `short` y `summary` (títulos de la sección 3), sin `concepts` ni `exercises`.
  - `context`: cuatro frases, sin bloques de código: qué se construye, quién lo usa, qué hace y qué archivos se verán.
  - `walkthrough`: una parte por archivo o pieza (`### Parte N. …`), con un bloque que empieza por la ruta del archivo y una nota de 1 a 3 frases que dice qué hace esa parte y enlaza los temas. Si un archivo no cabe en un bloque, se parte en dos partes seguidas, y la segunda empieza por `# <ruta> (sigue)` (en inglés, `(continued)`).
  - El código es de la tienda de principio a fin. Lo que viene de archivos que la entrada no muestra se importa y se comenta ("se da por hecho: …").
  - Cada tema de `covers` queda enlazado al menos una vez en las notas, en los dos idiomas.
  - La traducción sigue el patrón de la 4.1: las frases que el código devuelve al usuario se traducen (`detail=f"No existe el producto {…}"` → `f"Product {…} does not exist"`).
- **Contenido.** Cuatro partes: 1. `schemas.py` (`LineaCrear`, `PedidoCrear`, `PedidoPublico`); 2. `deps.py` (`SessionDep`, `ClienteActual`); 3. `router.py`, con `buscar_productos`, que responde 404 si un producto no existe; 4. `router.py`, el endpoint: crea el pedido, `flush` para tener su id, una línea por producto con el precio copiado, `commit`, `Location` y 201, con `response_model=PedidoPublico`. Bloques de 16, 12, 19 y 15 líneas; el límite de una entrada es 25.
- **Comprobaciones.** Las partes 3 y 4 se ejecutaron con módulos falsos mínimos de FastAPI, SQLModel y la tienda (scratchpad, `proyecto-crear-pedido/`): sale 201 con `Location: /v1/pedidos/1093` y una línea con `precio_unitario` 38000, y sale 404 con "No existe el producto 7". `check-content.mts`: 43 temas, 158 nodos, 236 enlaces. Escenario "Entrada de proyecto válida" (`check-entry.mts`, en el scratchpad): en los dos idiomas la entrada tiene `kind: project`, sin `freq` ni ejercicios, las secciones `context` y `walkthrough` y los ocho temas en el orden declarado; el nodo es un tema de Python con orden 23 y grupo `fastapi`, conectado por relación con los ocho; el anterior es `endpoints-async-vs-sync` y el siguiente, hoy, `base-de-datos` (orden 24 provisional). Escenario "Abrir una entrada de proyecto", en el navegador (servidor de desarrollo, `/es/python/proyecto-crear-pedido`): sin pestañas ni frecuencia; rótulos "Qué vamos a construir", "El código, parte por parte" con las cuatro partes, y "Temas que reúne este proyecto" con ocho enlaces; en inglés, "What we're building", "The code, part by part" y "Topics this project brings together"; el enlace de la parte 2 abre `inyeccion-con-depends`; sin errores en la consola. Captura fuera del repositorio: `/Users/yotfil/.claude/projects/-Users-yotfil-Documents-Yotfil-TechForge-Learning-ai-engineer-ai-engineer-path/f3e5da49-0ef9-411b-bf0b-1fb84992f1fe/tool-results/mcp-Claude_Browser-blob-1794634145848-pm707l.jpg`.
- **Para que Fable lo revise.**
  - `errores-problem-details` está en `covers`, pero el formato Problem Details se produce con un manejador de excepciones en `app/main.py` (así lo muestra hoy ese tema), y `main.py` no está entre los archivos de la entrada (`content-map.md` sección 3). La entrada responde el 404 con el formato de `HTTPException` (`{"detail": …}`) y enlaza Problem Details como el formato estándar. Si se quiere que la entrada lo use, hay que añadir `main.py` a sus archivos.
  - Supuestos sobre archivos que llegan en grupos posteriores, dichos en comentarios: `get_cliente_actual` vive en `app/core/security.py`; `Cliente`, en `app/clientes/models.py`; `get_session`, en `app/db.py`, como dice `proyecto-tienda.md`; y el modelo `Pedido` pone `creado_en` solo al crearse. `proyecto-pedidos-con-login` (grupo 9) muestra `models.py` y `deps.py`, y debería coincidir con esto.
  - `PedidoPublico` lleva `id`, `estado` y `creado_en`, campos que ya tiene `Pedido` en `proyecto-tienda.md`. No se añadió ninguno: por eso no lleva total ni líneas.
  - El 404 por un producto inexistente en el cuerpo de la petición sigue `content-map.md` ("responde 404 o 422 cuando corresponde").
- **Cómo deshacerlo.** Borrar `content/python/proyecto-crear-pedido/`.

### 4.6 Fuentes de `proyecto-crear-pedido` (consultadas el 2026-11-13)

- RFC 9110, 9.3.3 (POST, en `rfc/rfc9110.txt`): uno de sus usos es "Creating a new resource that has yet to be identified by the origin server", y si se crea un recurso el servidor "SHOULD send a 201 (Created) response containing a Location header field".
- FastAPI, `fastapi/_compat/v2.py` (https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/_compat/v2.py): la respuesta se valida con `validate_python(value, from_attributes=True)`, así que un objeto de SQLModel pasa a un modelo de Pydantic sin configuración extra.
- FastAPI, "Response Model" (https://fastapi.tiangolo.com/tutorial/response-model/): `response_model` cuando se devuelve "a dictionary or a database object" distinto del tipo declarado, y el filtrado de los campos.
- FastAPI, "Response Status Code" (https://fastapi.tiangolo.com/tutorial/response-status-code/): `status_code=201` es parámetro del decorador.
- FastAPI, "Response Headers" y "Handling Errors": ver las fuentes de la 4.3 y la 4.4 (cabeceras con `response: Response`; `HTTPException` lanzada desde una función auxiliar corta la petición).
- FastAPI, "Concurrency and async / await" (https://fastapi.tiangolo.com/async/): con una librería de base de datos que no admite `await`, "declare your path operation functions as normally, with just `def`".
- Pydantic, tipos de la biblioteca estándar (https://pydantic.dev/docs/validation/latest/api/standard_library_types/): en listas, `min_length` es "The list must have at least this many items".
- SQLAlchemy, "Data Manipulation with the ORM" (https://docs.sqlalchemy.org/en/20/tutorial/orm_data_manipulation.html): tras el flush, los objetos tienen su clave primaria y la transacción sigue abierta hasta el commit. "Session Basics" (https://docs.sqlalchemy.org/en/20/orm/session_basics.html): `refresh()` vuelve a leer el objeto; al cerrar la sesión sin commit, la transacción se deshace.
- SQLModel: `session.get(...)` y `get_session` con `with`/`yield`, fuentes de la 4.4 y la 4.5.

### 4.8 Verificación del grupo

**Una línea por pieza** (lista de comprobación de la guía; las fuentes de cada pieza están en su sección de arriba):

- `decoradores`: lista pasada (13 de 13). El paso 4 conserva la forma del Modelo 1, que junta en un paso las tres mejoras de la versión real (argumentos, `return` y `wraps`). Fuentes: 4.1.
- `funciones-y-parametros`: lista pasada (13 de 13). Fuentes: 4.2.
- `closures-y-lambdas`: lista pasada (13 de 13). Fuentes: 4.2.
- `cache-http`: lista pasada (13 de 13). Fuentes: 4.3.
- `codigos-de-estado`: lista pasada (13 de 13). Fuentes: 4.4.
- `inyeccion-con-depends`: lista pasada (13 de 13). Fuentes: 4.5.
- `proyecto-crear-pedido`: cumple la sección "Entradas de proyecto" de la guía: 4 partes, bloques de 25 líneas como máximo, notas de 1 a 3 frases y los ocho temas de `covers` enlazados en los dos idiomas; reglas 2, 3 y 4 aplicadas. Fuentes: 4.6.

**Cómo se contó.** Las 15 líneas por bloque cuentan todas las líneas, también las vacías y las de salida (`check-python.py`); en la entrada, el límite es 25. Los bloques ejecutables de los dos idiomas se ejecutaron con `python3` 3.14.7, y su salida coincide con la escrita.

**Ejercicios "¿Qué imprime?"** (`check-48.mts`, en el scratchpad: extrae el código del contenido compilado y lo ejecuta). `decoradores`: "A B hola C", que coincide con la respuesta marcada, en los dos idiomas. `funciones-y-parametros`: "[1, 2]" y "(1, 2) {'x': 3}", que coinciden en los dos idiomas. Las demás piezas no tienen ejercicios de este tipo. Ninguna discrepancia.

**Sin cambios frente a `HEAD`** (`check-48.mts`, comparando con una copia de `content/` de `HEAD`): en las cuatro piezas con ejercicios, los ejercicios son idénticos salvo `why`, en los dos idiomas; para las dos mitades, se comparó con `funciones-y-closures`. Los 110 conceptos tienen los mismos ids, nombres y alias en los dos idiomas. Solo cambian de hogar los cuatro de `content-map.md` sección 1: `args-kwargs` y `default-mutable` pasan a `funciones-y-parametros`, y `closure` y `lambda`, a `closures-y-lambdas`. Ningún texto de las siete piezas fuera de los bloques de código menciona Angular, NestJS ni RxJS (la misma expresión que la prueba de `pista-python.test.ts`, aplicada también a los dos temas de REST).

**En el navegador** (servidor de desarrollo): `/es/python/funciones-y-closures` muestra "No se encontró el tema."; `closures-y-lambdas` no tiene la pestaña Practicar (no tiene ejercicios); la lista de Python pone "Funciones y parámetros" y "Closures y lambdas" entre "Comprehensions y generadores" y "Decoradores". Después de `npm test` y `npm run build`, el servidor del puerto 5173 siguió mostrando los temas, sin errores en la consola.

**Comprobaciones del proyecto.** `typecheck` en verde; `test`, 327 pruebas en 16 archivos, en verde; `lint`, 0 errores y los mismos 14 avisos; `build` en verde (`[content] 43 temas, 158 nodos, 236 enlaces → 89 archivos`).

### 4.8 Prueba adaptada: entradas de proyecto en el contenido real

- **Qué.** La primera vez, `npm test` falló en una sola prueba, de `scripts/content/contenido-claro.test.ts` (grupo 2): "el contenido real no cambia: ningún tema es entrada de proyecto todavía". Era una guarda temporal para el grupo 2, y la 4.6 añade a propósito la primera entrada. Se adaptó (design.md decisión 14) a "el contenido real: solo las entradas de `content-map.md` (sección 3) son entradas de proyecto; los demás temas no cambian": las cinco ids de la sección 3 deben ser `kind: project` y sin `freq`, y todos los demás temas, sin `kind` y con `freq`. Se comprobó que falla, nombrando el tema, si una entrada del contenido no está en la lista (se quitó `proyecto-crear-pedido` de la lista y luego se restauró).
- **Por qué.** Mantiene lo que la guarda protegía (que el modelo nuevo no cambia los temas normales) y lo ajusta al contenido que este cambio va añadiendo; los números son los del documento vinculante.
- **Cómo deshacerlo.** Restaurar la prueba desde Git; volvería a fallar mientras exista una entrada de proyecto.

### 4.9 Parada del piloto: guion de revisión

Rama publicada el 2026-11-14 a petición del usuario: commit `c1ebf73` ("feat: piloto de contenido claro (siete piezas, ES/EN)"), subido a `origin/feature/contenido-claro` junto con `f437d2f` (grupo 3). El usuario lee las siete piezas en la vista previa de la rama. Respuestas, en el orden del guion (design.md decisión 12):

1. **¿Entendiste cada tema leyéndolo una sola vez, sin buscar nada fuera?** Esperado: sí. **Respuesta: no del todo.** Palabras del usuario: "algunos si los estendí, otros no, hay un tema que si veo que sucede y es que en las preguntas de la tab "Practicar" algunos no los entiendo porque pregunta cosas que no se explicaron 😕 o al menos tener más pista para saber a qué se refiere". **No coincide: va a Fable 5.2.**
   - **Comprobado por Opus en el contenido** (búsqueda en el cuerpo de cada tema, fuera del frontmatter):
     - `codigos-de-estado`: el ejercicio "Recibes la orden de generar un reporte pesado…" tiene como respuesta 202, que el tema no menciona en ninguna sección. Los dos ejercicios del email repetido tienen como respuesta 409, que solo aparece en una frase de la respuesta de entrevista.
     - `decoradores`: el ejercicio "¿A qué equivale `@cache` encima de `def precio()`?" usa `cache` (`functools.cache`), que el tema no explica. Lo que pregunta (la arroba) sí está explicado.
     - `funciones-y-parametros` e `inyeccion-con-depends`: lo que preguntan sus ejercicios está en el tema ("Riesgoso" y los malentendidos).
   - **Por qué pasa.** La guía solo pide revisar el `why` de los ejercicios (regla 4), y `content-map.md` (sección 6) prohíbe cambiar sus respuestas y no prevé ejercicios nuevos. Nada obliga a que el tema explique lo que su ejercicio pregunta, y los ejercicios vienen de las guías originales sin tocar.
   - **Detalle del usuario** (pedido por Opus). El tema que no entendió del todo es `inyeccion-con-depends`: "aunque entiendo el concepto en general por angular, como que esa explicación es clara, luego en "Practicar" nombran "SessionDep" y no se nombró antes por lo que no sé a qué se refiere". **Comprobado por Opus:** `SessionDep` y `get_session` solo aparecen dentro de los bloques de código de la pestaña "En código" (pasos 2 y 3, y en el resto de pasos, en `good` y en los malentendidos). La frase del paso 3 explica `Annotated`, pero no nombra `SessionDep`, y la pestaña "Entender" no menciona ninguno de los dos. El primer ejercicio ("Dos dependencias del mismo endpoint piden `SessionDep`…") los da por sabidos y no dice qué son. Así que lo que el usuario echa en falta es doble: que el texto, y no solo el código, presente los nombres que luego usan los ejercicios, y que el ejercicio dé una pista de qué es cada nombre.
   - **Pregunta para Fable 5.2.** ¿Se añade a la guía una regla del tipo "todo lo que pregunta un ejercicio está explicado en su tema, y los nombres que usa se presentan en el texto, no solo dentro de un bloque de código", y se decide cómo cumplirla? Hay dos formas: ampliar el tema (por ejemplo, 202 y 409 en `codigos-de-estado`) o reescribir el enunciado (`q`) para dar la pista, sin cambiar la respuesta. Opus no lo corrige en el piloto: es un cambio de la guía.
2. **¿Apareció alguna palabra técnica sin explicar?** Esperado: no. **Respuesta: "No".** Coincide.
3. **¿Los pasos van de lo simple a lo real, sin saltos?** Esperado: sí. **Respuesta: "Sí".** Coincide.
4. **¿Los comentarios del código te ayudaron a entenderlo?** Esperado: sí. **Respuesta: "Sí".** Coincide.
5. **¿El último paso de cada tema te dejó claro dónde se usa eso en un proyecto real?** Esperado: sí. **Respuesta: "Sí".** Coincide.
6. **¿La entrada "Proyecto: el endpoint de crear un pedido" te ayudó a ver los temas trabajando juntos?** Esperado: sí. **Respuesta: "Sí".** Coincide.
7. **¿Los enlaces de la entrada de proyecto te llevan al tema que esperabas?** Esperado: sí. **Respuesta: "Sí".** Coincide.
8. **¿Algún tema se te hizo demasiado largo o aburrido?** Esperado: no. **Respuesta: "No".** Coincide.
9. **¿Los dos temas que salieron de "Funciones" se entienden mejor separados?** Esperado: sí. **Respuesta: "Sí".** Coincide.
10. **En inglés, abriendo un tema cualquiera del piloto: ¿los comentarios del código están en inglés?** Esperado: sí. **Respuesta: "Sí".** Coincide.
11. **En el teléfono: ¿los títulos de los pasos y los bloques de código se leen bien?** Esperado: sí. **Respuesta: "Sí".** Coincide.

**Resultado del guion.** Coinciden 10 de 11 respuestas; la 1 no coincide (detalle arriba). Según design.md decisión 12 y la tarea 4.9, el grupo 5 no empieza: antes va una sesión de Fable 5.2 que decida, con el usuario, cómo ajustar la guía para que los ejercicios de Practicar solo pregunten lo que su tema explica y presenten los nombres que usan.

## Resoluciones de Fable 5.2 con el usuario (2026-11-14)

Sesión de specs tras la parada del piloto. Cada punto lo eligió el usuario entre opciones; aquí solo se deja dónde quedó escrito. No son decisiones de Opus.

- **Pregunta 1 del guion (ejercicios).** Regla aprobada: un ejercicio solo pregunta lo que su tema explica en prosa, con nombres ya presentados; la respuesta de entrevista y el interior de un bloque de código no cuentan. Se cumple ampliando el tema (materia del tema) o reescribiendo el enunciado (nombre accesorio). Las correcciones del piloto van en una sesión propia antes del grupo 5 (tareas 4.10 a 4.16), y el usuario relee Practicar en una segunda parada. Escrito en: guía (sección "Los ejercicios" y pregunta 14), design.md decisiones 11, 12 y 17, `content-map.md` sección 7.
- **Ejercicios repetidos de `codigos-de-estado`.** Se quitan el 8 y el 9. Lo encontró Fable al revisar; no estaba en el relevo. Cambia el escenario "Ejercicios trasladados" de specs/content-model.
- **4.1, quién llama a `calcular_total`.** `POST /v1/pagos`, para saber cuánto cobrar. Corregida la frase del ejemplo de la regla 6 de la guía. Escrito en `proyecto-tienda.md`.
- **4.2, `crear_descuento` y la paginación de productos.** Se fijan como los escribió Opus. Escrito en `proyecto-tienda.md`, "Detalles ya fijados por el contenido publicado".
- **4.3, dominio.** `api.tienda.co`; la cabecera `Host` solo en los temas que la explican o la necesitan. El piloto queda como está. Escrito en `proyecto-tienda.md`, convención 8.
- **4.4 y 4.6, supuestos sobre archivos de grupos posteriores.** Se fijan como los escribió Opus. Escrito en `proyecto-tienda.md`, misma sección.
- **4.6, Problem Details.** `errores-problem-details` pasa de los `covers` de `proyecto-crear-pedido` a los de `proyecto-api-completa`, que muestra el manejador de `app/main.py`. Escrito en `content-map.md` sección 3 y en tres escenarios de las specs (siete temas reunidos, dos de HTTP y REST).
- **4.5, `related` con `base-de-datos`.** Sin cambio: lo resuelve la tarea 9.1, como estaba previsto.
- **Herramientas de verificación.** Se guardan en el repositorio (tarea 4.10) y se quedan al cerrar el cambio. Escrito en design.md decisión 11.
- **Modelos de la guía.** Corregidos por Fable los datos que la confirmación de Opus encontró mal: el 304 sin `Cache-Control` y la comparación del ETag (Modelo 3), la etiqueta `(disk cache)` (Modelo 3), lo que FastAPI lee sin `functools.wraps` (regla 5 y Modelo 1) y cuándo se ejecuta el código tras el `yield` (Modelo 4). La guía dice ahora que, si un modelo y su tema publicado difieren, vale el tema publicado.

## Grupo 4, correcciones del piloto (4.10 a 4.16)

**Comprobaciones antes de tocar nada** (2026-11-16): rama `feature/contenido-claro` y árbol como dice el relevo; `typecheck`, `test` (327 pruebas en 16 archivos), `lint` (0 errores, 14 avisos) y `build` (43 temas, 158 nodos, 236 enlaces) en verde. Servidor de desarrollo del proyecto escuchando en el puerto 5173 (no lo arrancó Opus); no se tocó.

### 4.10 Scripts de verificación en `scripts/check/`

- **Qué.** Los cinco scripts del scratchpad del grupo 4 pasan a `scripts/check/`, con nombres en inglés como el resto de `scripts/`. Se ejecutan desde la raíz del repositorio:

  | Script | Sustituye a | Qué hace | Cómo se ejecuta |
  |---|---|---|---|
  | `python-blocks.py` | `check-python.py` | Cuenta las líneas de cada bloque (15; 25 en `walkthrough`) y ejecuta los de Python, acumulados en `code:example`, comparando la salida real con la escrita. | `python3 scripts/check/python-blocks.py content/python/<tema>/es.md [...]` |
  | `content.ts` | `check-content.mts` | Valida el contenido como `npm run content`, sin escribir `src/generated/`. | `npx tsx scripts/check/content.ts` |
  | `content-es.ts` | `check-content-es.mts` | Lo mismo sobre una copia temporal, con `es.md` como inglés donde falta `en.md` o en los temas indicados. | `npx tsx scripts/check/content-es.ts [<tema> ...]` |
  | `project-entry.ts` | `check-entry.mts` | Escenario "Entrada de proyecto válida": tipo, secciones, temas reunidos con su pista, conexiones del cerebro, anterior y siguiente. | `npx tsx scripts/check/project-entry.ts [<entrada> ...]` |
  | `exercises.ts` | `check-48.mts` | Ejecuta los "¿Qué imprime?", compara cada ejercicio con un commit, ayuda con la pregunta 14 y compara los conceptos. | `npx tsx scripts/check/exercises.ts <tema>[=<origen>] ... [--ref <commit>]` |

  Más `shared.ts`, con la raíz del repositorio y el aviso de errores de compilación. Cada script explica su uso en su comentario inicial.
- **Cambios frente a los del scratchpad.**
  - Sin rutas absolutas: la raíz se calcula desde el propio archivo y las copias van a la carpeta temporal del sistema (`os.tmpdir()`), que se borra al terminar.
  - `exercises.ts` compara con un commit extraído con `git archive` (antes, una copia de `content/` hecha a mano). Compara ejercicio por ejercicio y campo por campo, porque desde la sección 7 de `content-map.md` `q` y las opciones sí pueden cambiar: dice qué campos cambian y cuáles se quitan o son nuevos, y marca PROBLEMA si cambian `answer`, `code`, `prompt` o el número de opciones, o si aparece un ejercicio nuevo. En un tema partido, `<tema>=<origen>` lo compara con el tema antiguo, y la mitad sin ejercicios lista como "quitados" los que fueron a la otra mitad.
  - `exercises.ts` añade una ayuda para la pregunta 14 que no estaba en el scratchpad. Por ejercicio, lista los nombres del enunciado y de las opciones (lo que va entre comillas invertidas y sus identificadores, las opciones cortas y las categorías) y en qué secciones del tema aparecen en prosa, sin contar los bloques de código ni `interview`. Si no aparecen, dice "NO PRESENTADO". Si la frase explica de verdad qué es cada nombre lo sigue decidiendo quien revisa.
  - `project-entry.ts` sirve para cualquier entrada (sin argumentos, todas) y termina con error si algo no se cumple. Además se corrigió una condición del original que daba por buena cualquier conexión de relación sin mirar a qué tema iba.
  - `python-blocks.py` usa el mismo intérprete que lo lanza, aplica 25 líneas en `walkthrough`, no ejecuta los bloques que importan de `starlette` y separa el frontmatter sin confundirlo con un `---` del cuerpo.
- **Sin dependencias nuevas** ni cambios en `package.json`: se lanzan con `tsx`, que ya era dependencia, y con `python3`. Los `.ts` quedan dentro de `tsconfig.node.json`, que incluye `scripts/`, así que `typecheck` y `lint` los revisan. `npm test` no los ejecuta: no se llaman `*.test.ts`.
- **Verificación.**
  - Sobre `decoradores`, `python-blocks.py` da la misma salida que `check-python.py` (`diff` vacío, salvo la línea nueva con la versión de Python, 3.14.7).
  - `content.ts`: 43 temas, 158 nodos, 236 enlaces. `content-es.ts decoradores`: lo mismo, con `decoradores` como inglés provisional.
  - `project-entry.ts`: `proyecto-crear-pedido` cumple. Hoy reúne 8 temas, 5 de Python y 3 de REST; la 4.14 lo cambia.
  - `exercises.ts` sobre las siete piezas frente a `HEAD`: todo igual, los tres "¿Qué imprime?" coinciden y los conceptos son los mismos. Frente a `f437d2f` (antes del piloto), con `funciones-y-parametros=funciones-y-closures` y `closures-y-lambdas=funciones-y-closures`, reproduce lo anotado en la 4.8: ejercicios iguales salvo `why`, conceptos iguales, y los cuatro cambios de hogar.
  - Sobre `decoradores`, la ayuda de la pregunta 14 ya señala `@cache`, `cache` y `precio` como "NO PRESENTADO".
  - `python-blocks.py` sobre el contenido completo, 86 archivos: 0 problemas en las siete piezas del piloto y 80 en los temas que aún no se han reescrito. Es lo esperado: los grupos 5 a 13 los reescriben.
  - `typecheck` en verde; `test`, 327 pruebas en 16 archivos; `lint`, 0 errores y los mismos 14 avisos.
- **Cómo deshacerlo.** Borrar `scripts/check/`.

### 4.11 `codigos-de-estado`: ejercicios y ampliación

- **Ejercicios.** Quitados el 8 y el 9, en los dos idiomas (`content-map.md` sección 7). Quedan siete, iguales a los de `HEAD` campo por campo, incluido `why` (`exercises.ts`).
- **202 y 409, en prosa.** No caben en un momento ni en un malentendido nuevos, porque los dos están en su máximo (4). Van como una frase más en dos malentendidos que ya existían, y los malentendidos siguen siendo cuatro:
  - 202, al final del de "Si salió bien, siempre 200", que ya distinguía 201 y 204: la petición se aceptó pero se procesará después, como un reporte pesado que se deja en cola; dice que aún no está terminada, y la respuesta debería indicar dónde consultar cómo va.
  - 409, al final del de "400 y 422 son lo mismo", que ya distinguía los dos errores de datos: los datos cumplen las reglas pero chocan con lo que ya está guardado, como un email que ya usa otro cliente; el cliente puede resolver el conflicto y volver a enviar la petición.
- **Ampliación que la tarea no nombra.** Al repasar los siete ejercicios con la pregunta 14 (lo pide la propia 4.11), el 6 ("La petición llega sin header Authorization…") nombra una cabecera que solo aparecía dentro de los bloques de código. Se hizo como en `inyeccion-con-depends` (el ejemplo de la guía): una frase la presenta. Es la del momento 2: la petición no lleva la cabecera `Authorization`, que es donde viaja el token que identifica al cliente, y sin ella el servidor responde 401. Por coherencia, el momento 1 gana también su frase: Ana crea un pedido con `POST /v1/pedidos`, la respuesta es 201 Created y `Location` dice dónde quedó. Esa ruta la nombra el ejercicio 5. Así los cuatro momentos llevan la frase que pide la tabla de la guía; antes la llevaban solo el 3 y el 4. El enunciado del 6 no se tocó.
- **El ejemplo del email, para que Fable lo revise.** Ni la RFC 9110 ni MDN ponen como ejemplo de 409 un email repetido: la RFC define el 409 como un conflicto "with the current state of the target resource", que el usuario puede resolver para volver a enviar la petición, y MDN pone ejemplos de WebDAV y de tareas simultáneas. La frase aplica esa definición al caso del ejercicio 3, cuya respuesta, 409, fija `content-map.md` sección 7, como ya lo hacía la respuesta de entrevista.
- **Prueba adaptada** (design.md decisión 14). En `scripts/content/pista-python.test.ts`, "ejercicios trasladados" exigía que los dos últimos ejercicios fueran los dos que se quitan. Ahora comprueba el escenario "Ejercicios trasladados": siete ejercicios en los dos idiomas, y en español el caso del pedido de otro cliente y el del email, una vez cada uno. Con los nueve de antes, la cuenta de siete falla. La parte de `metodos-seguros-idempotentes` no cambia.
- **Verificación.** `content.ts`: 43 temas, 158 nodos, 236 enlaces. `pista-python.test.ts`: 37 pruebas en verde. Pregunta 14 de los siete ejercicios: en la 4.15, con el registro por ejercicio.
- **Fuentes (consultadas el 2026-11-16).**
  - RFC 9110 (https://www.rfc-editor.org/rfc/rfc9110.txt, la copia descargada en el grupo 4): 15.3.3 (202: "accepted for processing, but the processing has not been completed"; la respuesta "ought to describe the request's current status and point to (or embed) a status monitor"), 15.5.10 (409) y 11.6.2 (`Authorization` lleva las credenciales con las que el cliente se autentica).
  - MDN, 202 (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202): "processing has not been completed or may not have started"; su ejemplo devuelve una URL para seguir el estado de la tarea. MDN, 409 (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409): "a request conflict with the current state of the target resource".
  - RFC 6750, 2.1 (https://www.rfc-editor.org/rfc/rfc6750.html): el token de acceso se envía en la cabecera `Authorization` con el esquema `Bearer`.
- **Cómo deshacerlo.** Restaurar los dos archivos del tema y la prueba desde Git.

### 4.12 `decoradores`: el ejercicio de `@cache`

- **Qué.** En los dos idiomas, `cache` pasa a `registrar`, como propone `content-map.md` sección 7, y además `precio` pasa a `calcular_total`. Los dos son nombres del paso 5, presentados en su frase ("el decorador `registrar` de `app/core/registro.py`…" y "`calcular_total` no sabe que existe"). `precio` tampoco se presentaba en ninguna parte del tema, y la sección 7 permite cambiar en `q` un nombre que el tema no presenta por uno que sí; las opciones solo cambian esos dos nombres. Enunciado: "¿A qué equivale `@registrar` encima de `def calcular_total`?". Sin paréntesis, porque `calcular_total` recibe `lineas`; la regla 2 de la guía escribe igual "`@avisar` encima de `def saludar`". El `why` cambia los mismos dos nombres. `answer` sigue en 1 (la segunda opción, `calcular_total = registrar(calcular_total)`); `code` y `prompt` no cambian.
- **Comprobación.** `exercises.ts decoradores`: cambian `text` y `options`, sin PROBLEMA. `answer`, `code`, `prompt` y el número de opciones se conservan. Ejecutado con `python3` 3.14.7 en el scratchpad (`registrar_eq.py`, con un `registrar` mínimo): `@registrar` sobre `def calcular_total` y `calcular_total = registrar(calcular_total)` dejan en el nombre la misma envoltura. `content.ts` en verde.
- **Cómo deshacerlo.** Restaurar el ejercicio desde Git.

### 4.13 `inyeccion-con-depends`: `get_session` y `SessionDep` en prosa

- **Qué, en los dos idiomas.**
  - Paso 2: la primera frase presenta `get_session` ("es la dependencia que abre una sesión de base de datos y se la entrega al endpoint"). Las dos frases que había se juntan en una, para que el paso siga con dos (regla 1).
  - Paso 3: una frase nueva presenta `SessionDep` ("una `Session` que FastAPI saca de `get_session` en cada petición"). Así queda presentado también `Session`, que nombra el ejercicio 2.
  - Ejercicio 1: el enunciado recuerda qué es cada nombre, como permite `content-map.md` sección 7: "piden `SessionDep`, la sesión que entrega `get_session`".
- **Ampliaciones que la tarea no nombra** (sección 7: lo que no cumpla la regla "se corrige igual"):
  - El ejercicio 1 da por hecho que una dependencia puede pedir otra ("Dos dependencias del mismo endpoint piden…"). El tema no lo decía en prosa. El malentendido 2 lo dice ahora entre paréntesis: "una dependencia también puede pedir otras, igual que un endpoint".
  - El ejercicio 2 tiene la opción "Falta async", y el tema no nombraba `async`. El malentendido 3 dice ahora que la dependencia es una función normal "con `def` o con `async def`" y enlaza `[[async-await]]`. Es una conexión más en el cerebro: 237 enlaces, antes 236.
  - Los malentendidos siguen siendo tres.
- **Verificación.** `exercises.ts inyeccion-con-depends`: solo cambia el enunciado del 1; `answer`, `code`, `prompt`, opciones y `why` quedan iguales. Los nombres `SessionDep`, `get_session`, `Session` y `Depends` aparecen en prosa en los dos idiomas. `content.ts` en verde. Pregunta 14 de los dos ejercicios: en la 4.15, con el registro por ejercicio.
- **Fuentes (consultadas el 2026-11-16).** FastAPI, "Sub-dependencies" (https://fastapi.tiangolo.com/tutorial/dependencies/sub-dependencies/): "You can create dependencies that have sub-dependencies"; si varias dependencias tienen una subdependencia común, FastAPI la llama "only once per request". FastAPI, "Dependencies" (https://fastapi.tiangolo.com/tutorial/dependencies/): "You can use `async def` or normal `def`" para las dependencias; alias con `Annotated` (`CommonsDep`). Lo que se ejecuta tras el `yield` ya estaba confirmado en la 4.5.
- **Ajuste de la herramienta.** En `exercises.ts`, una opción sin comillas invertidas cuenta como nombre solo si es una sola palabra con cifras, mayúsculas o signos de código ("401", "GET"). Antes salían como nombres palabras corrientes como "Una" o "Nada". Un nombre dentro de una frase sin comillas ("header Authorization", "Falta async") sigue sin detectarse: esa parte se revisa a mano.
- **Cómo deshacerlo.** Restaurar las frases y el enunciado desde Git.

### 4.14 `proyecto-crear-pedido`: siete temas reunidos

- **Qué.** `errores-problem-details` sale de `covers` en `meta.yaml`. El texto no cambia: la nota de la parte 3 sigue enlazando `[[errores-problem-details]]` en los dos idiomas, como el formato estándar de los errores. Esa mención mantiene en el cerebro la conexión entre la entrada y el tema, como "mención" en lugar de "relación". Por eso el total de enlaces no cambia (237).
- **Pruebas adaptadas** (design.md decisión 14).
  - `scripts/content/contenido-claro.test.ts`: los temas reunidos de prueba son cinco de Python y dos de REST. `errores-problem-details` sigue entre los temas de prueba, porque la prueba de "Más conexiones entre pistas" lo reúne en `proyecto-api-completa`. Los nombres de dos pruebas pasan de "ocho" a "siete" y de "tres de HTTP y REST" a "dos". "Entrada de proyecto válida" comprueba además que los temas reunidos son 7. Dos pruebas tenían fijo el número de partes del recorrido de prueba (el bloque 9; 8 y 9 bloques) y ahora lo calculan desde la lista de temas.
  - `src/test/contenido-claro.test.tsx`: la lista de temas de la entrada pierde `errores-problem-details`, y la prueba de "Abrir una entrada de proyecto" dice "siete".
- **Verificación.**
  - `project-entry.ts`: en los dos idiomas, 7 temas en el orden declarado, 5 de Python y 2 de REST, con una relación cada uno. El anterior sigue siendo `endpoints-async-vs-sync` y el siguiente, `base-de-datos`.
  - `npm test`: 327 pruebas en 16 archivos. Los escenarios "Entrada de proyecto válida", "Vecinos de una entrada de proyecto" y "Abrir una entrada de proyecto" quedan probados con siete temas.
  - En el navegador (servidor de desarrollo del puerto 5173, `/es/python/proyecto-crear-pedido`): sin pestañas; "Temas que reúne este proyecto" lista siete enlaces, los dos últimos de `/es/rest/`; la nota de la parte 3 conserva el enlace a `errores-problem-details`; sin errores en la consola. Captura fuera del repositorio: `/Users/yotfil/.claude/projects/-Users-yotfil-Documents-Yotfil-TechForge-Learning-ai-engineer-ai-engineer-path/1bfa5dfd-184e-4dd3-a661-f49c25ead249/tool-results/mcp-Claude_Browser-blob-1794887248798-v659du.jpg`.
- **Observación.** Al abrir la vista previa, la herramienta arrancó un segundo servidor en el puerto 5174 en lugar de usar el abierto. Se paró enseguida, sin compilar a mano, y la comprobación se hizo en el del 5173.
- **Cómo deshacerlo.** Volver a añadir el tema a `covers` y restaurar las dos pruebas desde Git.

### 4.15 Verificación de las correcciones

**Pregunta 14, ejercicio por ejercicio** (design.md decisión 11). Para cada uno: dónde explica el tema en prosa lo que pregunta y dónde presenta los nombres de su enunciado y sus opciones, y qué se cambió. Vale para los dos idiomas: `exercises.ts` encuentra los mismos nombres en las mismas secciones en español y en inglés. `closures-y-lambdas`, `cache-http` y `proyecto-crear-pedido` no tienen ejercicios.

- `funciones-y-parametros`
  1. "¿Qué imprime?" (lista como valor por defecto, `[1, 2]`): `problem`, paso 2, nota de `bad` y malentendido 1. Las opciones son salidas. Sin cambios.
  2. "¿Qué imprime?" (`*a` y `**k`, `(1, 2) {'x': 3}`): `definition` (segundo párrafo), títulos de los pasos 3 y 4, y malentendidos 2 (es una tupla) y 3 (el nombre es una costumbre). Sin cambios.
- `codigos-de-estado`
  1. Token válido, pedido de otro cliente (403): momento 3 (título y frase: 403, o 404 para ocultarlo) y malentendido 1. Opciones: 401 (momento 2, malentendido 1), 404 (momento 3, `good`), 400 (malentendido 2). Sin cambios.
  2. JSON válido con cantidad -3 (422): momento 4 y malentendido 2. Opciones: 409 (malentendido 2, desde la 4.11), 500 (malentendido 4). Sin cambios en el ejercicio.
  3. Email que ya existe (409): malentendido 2, frase nueva de la 4.11. Se amplió el tema.
  4. El balanceador no recibe respuesta en 60 s (504): malentendido 4. **Se cambió en esta tarea.** El malentendido nombraba juntos el 502 y el 504 ("cuando tu aplicación le responde algo inválido o no le responde a tiempo") sin decir cuál era cuál, y el ejercicio pregunta justo esa diferencia. Ahora la misma frase dice "el 502 cuando tu aplicación le responde algo inválido, y el 504 cuando no le responde a tiempo", en los dos idiomas (RFC 9110, 15.6.3 y 15.6.5). "Balanceador" ya estaba explicado ahí.
  5. `POST /v1/pedidos` creó el pedido (201): momento 1 (frase nueva de la 4.11, que nombra la ruta) y malentendido 3. Opciones: 200 (`problem`), 202 y 204 (malentendido 3).
  6. Sin cabecera `Authorization` (401): momento 2 (frase nueva de la 4.11, que presenta la cabecera) y malentendido 1. Se amplió el tema.
  7. Reporte pesado en cola (202): malentendido 3, frase nueva de la 4.11. Se amplió el tema.
- `decoradores`
  1. "¿En qué orden se imprime?" (`A B hola C`): malentendido 1 (el decorador se ejecuta una sola vez, cuando Python lee el `def`, y en cada llamada se ejecuta la envoltura) y paso 2 (la envoltura llama por dentro a la original). Las opciones son salidas. Sin cambios.
  2. "¿A qué equivale `@registrar` encima de `def calcular_total`?": paso 3 (la arroba es un atajo de esa asignación) y frase del paso 5 (presenta `registrar` y `calcular_total`). Se reescribió el enunciado (4.12).
- `inyeccion-con-depends`
  1. Cuántas veces corre `get_session` si dos dependencias piden `SessionDep` (una): malentendido 2 (una vez por petición, y una dependencia también puede pedir otras), con `get_session` presentado en el paso 2 y `SessionDep` en el paso 3. Se amplió el tema y el enunciado recuerda qué es cada nombre (4.13).
  2. Qué está mal en `Depends(get_session())`: malentendido 1. Nombres: `Session` (paso 3), `Depends` (`definition`) y `get_session` (paso 2). Opciones: "Falta async" (malentendido 3, desde la 4.13) y "Depends solo acepta clases" (malentendido 3 y `bridge:typescript`: la dependencia es una función). Se amplió el tema (4.13).

**Lista de comprobación de lo añadido.** Cada frase nueva está confirmada en su fuente (preguntas 12 y 14; fuentes en 4.11, 4.13 y aquí). Ningún bloque cambió: `python-blocks.py` sobre las siete piezas, en los dos idiomas, da "TODO OK". Las extensiones de la guía se mantienen: cuatro momentos y cuatro malentendidos en `codigos-de-estado`, tres malentendidos en `inyeccion-con-depends`, y dos frases en el paso 2.

**"Detalles ya fijados por el contenido publicado"** (`proyecto-tienda.md`). Las siete piezas coinciden con las siete filas: `calcular_total` y `registrar` en `app/pedidos/service.py`; `crear_descuento(porcentaje: int)` con `//`; `GET /v1/productos` en `app/productos/router.py` con `pagina: int = 1`, `tamano: int = 20` y `repository.listar(pagina, tamano)`; `router = APIRouter()` sin prefijo y la ruta completa en cada decorador; `ClienteActual` responde 401 y `get_cliente_actual` vive en `app/core/security.py`; `creado_en` lo pone el modelo y `PedidoPublico` lleva `id`, `estado` y `creado_en`; los errores salen con `HTTPException` y `{"detail": …}`, y Problem Details solo se enlaza. **Ninguna diferencia: no hay preguntas para Fable.** Dos observaciones, sin cambios:
- El paso 5 de `decoradores` dice cuándo se ejecuta `calcular_total` ("cada vez que la tienda calcula el total de un pedido"), que la regla 6 admite, pero no nombra `POST /v1/pagos`, que es quien la llama según la tabla. No la contradice. Si se quiere nombrar, es una frase.
- En `inyeccion-con-depends`, los pasos 1 a 3, `bad` y `good` son ejemplos aislados con `app = FastAPI()` y `@app.get("/v1/productos")`, no el archivo de la tienda. Los valores de paginación del paso 1 coinciden con la tabla, y el paso de proyecto, el 5, usa `@router.get`.

**Comprobaciones del proyecto.** `typecheck`, en verde después de un arreglo: la prueba adaptada en la 4.11 contaba los ejercicios con `flatMap` sobre una unión de tipos, que `tsc` rechaza, y ahora suma sus longitudes. `test`, 327 pruebas en 16 archivos; `lint`, 0 errores y los mismos 14 avisos; `build` en verde (`[content] 43 temas, 158 nodos, 237 enlaces → 89 archivos`). Después del build, el servidor de desarrollo del 5173 siguió mostrando los temas, y Practicar de `codigos-de-estado` lista siete ejercicios, sin los dos quitados. `exercises.ts` sobre las siete piezas: "TODO OK".
