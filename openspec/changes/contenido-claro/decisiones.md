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
