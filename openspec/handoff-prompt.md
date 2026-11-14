Este prompt es para **Opus 5.5**. Vas a implementar conmigo el **grupo 2** del cambio de OpenSpec `contenido-claro` ("Modelo: entradas de proyecto"). Respóndeme en español.

**Reglas insaltables de este proyecto.** Antes de actuar, lee en la memoria del proyecto `reglas-fable-specs-opus-implementa.md`. Resumen de lo que te aplica:

- Eres Opus 5.5: implementas y orquestas. Haces las tareas `[opus]` y delegas las `[sonnet]` en el subagente `repetidor`. En el grupo 2 no hay tareas `[sonnet]`.
- Puedes tomar decisiones **no críticas** y debes anotarlas en `openspec/changes/contenido-claro/decisiones.md` (tarea, qué decidiste, por qué, cómo deshacerlo), en una sección nueva "Grupo 2". Ante una decisión **crítica** (la lista de cinco puntos está en la memoria; en la duda, es crítica) no decides: te detienes en esa tarea, me dices qué falta, lo dejas escrito en este archivo como pregunta para Fable 5.2 y sigues con lo que no dependa de ella.
- Una sesión cubre un solo grupo de `tasks.md`. Al terminar el grupo 2, muéstrame el resumen de cierre y haz `/relevo`; no sigas con el grupo 3.
- No modificas `openspec/specs/`, los cambios archivados, ni `openspec/guia-de-contenido.md`, `content-map.md`, `proyecto-tienda.md`, `design.md` o las specs de este cambio.
- Commits, push y pull requests, solo cuando yo te los pida en esta sesión. Nunca push a `main` ni a `develop`. Los merges los hago yo en GitHub; al integrar en `develop` uso squash.
- Si una tarea deja algo fuera del repositorio (capturas, mediciones), anota su ruta en `decisiones.md`, no solo en la conversación.

**Antes de escribir nada:**

1. Lee `openspec/git-workflow.md` y, del cambio `openspec/changes/contenido-claro/`: `design.md` (sobre todo la decisión 6; también la 2 y la 4, ya implementadas), `tasks.md`, `decisiones.md` y las tres specs (`content-model`, `app-shell`, `concept-graph`). Para el grupo 2 no necesitas `content-map.md`, `proyecto-tienda.md` ni la guía: las pruebas usan entradas de prueba, no contenido real.
2. Comprueba la rama con `git branch --show-current` y `git status --short`. Lo esperado: rama `feature/contenido-claro`. Si no hice yo el commit del grupo 1, verás sin commit estos archivos y ninguno más: `openspec/handoff-prompt.md`, `openspec/changes/contenido-claro/tasks.md`, `scripts/content/markdown.ts`, `scripts/content/sections.ts`, `scripts/content/validate.ts`, `scripts/content/pista-python.test.ts`, `src/locales/es.json`, `src/locales/en.json`, `src/shell/Reader.tsx`, `src/shell/Reader.module.css`, `src/test/pista-python.test.tsx` y los nuevos `openspec/changes/contenido-claro/decisiones.md`, `scripts/content/contenido-claro.test.ts` y `src/test/contenido-claro.test.tsx`. Si hay algo más, detente y dímelo.
3. `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` en verde antes de tocar nada (última ejecución: 289 pruebas en 16 archivos; lint con 0 errores y 14 avisos que ya estaban).

**Estado al 2026-11-13.**

- `contenido-claro`: 6 de 86 tareas. Grupo 1 hecho y verificado por Opus en la sesión anterior (1.1 a 1.6).
- Lo que dejó el grupo 1 y te sirve:
  - `scripts/content/sections.ts`: `STEP_SECTIONS` (secciones que admiten `###`; hoy `code:example`, `code:wire` y `code:server`) y `scanSection(md)`, que devuelve los bloques de código y los títulos de paso de una sección. Una sección fuera de `STEP_SECTIONS` con un `###` es un error.
  - `scripts/content/validate.ts`: `checkCodeParity`, que compara entre idiomas, en cada clave de `SECTION_KEYS`, el número de bloques, su lenguaje resuelto y el número de títulos de paso.
  - `scripts/content/markdown.ts`: un `###` se genera como `<h4>`.
  - `src/shell/Reader.tsx` y `Reader.module.css`: la clase `.steps` da el aspecto de los pasos; la llevan las tres secciones de código.
  - Pruebas del cambio en `scripts/content/contenido-claro.test.ts` y `src/test/contenido-claro.test.tsx`. Las del grupo 2 pueden ir ahí.
- La decisión 6 pide que las dos secciones de una entrada de proyecto (`context`, `walkthrough`) admitan títulos de paso y cumplan la paridad: hay que añadirlas a `STEP_SECTIONS` y asegurarse de que `checkCodeParity` también las recorre (hoy solo recorre `SECTION_KEYS`).
- El rótulo de `code:example` ya es "Paso a paso" / "Step by step".
- El usuario confirmó los cinco detalles del diseño que estaban pendientes (rótulo, direcciones de los temas partidos sin redirección, entrada de proyecto como nodo igual que un tema, borrar `scripts/migrate/`, sin ejercicios nuevos). No hay que volver a preguntarlos.
- Commit del grupo 1: hecho solo si yo lo pedí al cerrar aquella sesión; compruébalo con `git status`. Sin push nuevo ni pull request. El PR a `develop` va al final, con el cambio archivado.
- El contenido real no ha cambiado: 41 temas, sin pasos todavía.

**Qué hacer: grupo 2, tareas 2.1 a 2.5, en orden.**

- 2.1 Modelo y validación de `kind: project` y `covers` con las secciones `context` y `walkthrough` (nueve escenarios de "Entradas de proyecto" en specs/content-model).
- 2.2 Salida generada, buscador y grafo (escenario "Aparece sin cambios de código" de content-model; "Vecinos de una entrada de proyecto" y "Más conexiones entre pistas" de specs/concept-graph, sobre datos de prueba).
- 2.3 Lector de una entrada de proyecto: sin pestañas ni frecuencia, con los rótulos de la decisión 6 en ambos idiomas (seis escenarios de "Lectura de una entrada de proyecto"). Los rótulos nuevos van en `src/locales/es.json` y `en.json`; la prueba de paridad de textos de interfaz debe seguir en verde.
- 2.4 Sidebar, hoja de temas del teléfono y panel de relacionados (tres escenarios de "Entradas de proyecto en las listas de temas").
- 2.5 Comprobaciones completas, anotando el número de pruebas, y en el navegador que un tema existente se ve y se navega igual que antes.

Ojo: hoy `freq` es obligatorio en `meta.yaml` y en `TopicContent` (`src/content/model.ts`), y el lector pinta siempre la etiqueta de frecuencia. Una entrada de proyecto no lleva `freq`. Los rótulos, el orden de las secciones del lector y qué se muestra en cada sitio están fijados en la decisión 6: no son decisiones tuyas. Lo único que la decisión 6 te deja elegir es un refuerzo visual opcional de la entrada en las listas, que se anota en `decisiones.md`.

**Lo que viene después (no en esta sesión).** Grupo 3: orden de la pista Python. Grupo 4: piloto de siete piezas, que termina con una parada obligatoria en la que yo leo el piloto en la vista previa y respondo un guion de 11 preguntas (design.md decisión 12). Grupos 5 a 13: resto del contenido. Grupo 14: cierre.

**Preguntas abiertas para Fable.** Ninguna.

**Entradas de `decisiones.md` sin revisar.** Todas las del grupo 1 (Fable las revisa antes de archivar; yo después):

- confirmación de los cinco detalles;
- 1.2: el paso se genera como `<h4>`, saneado aparte;
- 1.2: qué se reconoce como título de paso;
- 1.3: aspecto de los títulos de paso, con las medidas a 390 px y la ruta de la captura;
- 1.4: paridad de código, alcance y mensajes;
- 1.2 a 1.4: dónde van las pruebas.

**Pendiente con Fable, fuera de este cambio.** Después de archivar `contenido-claro`, Fable define la pista SQL (punto 3 del plan), redactada directamente con la guía. Sus compromisos (N+1, inyección SQL, transacciones) están en la memoria `plan-de-cambios`.
