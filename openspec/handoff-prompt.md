Este prompt es para **Opus 5.5**. Vas a implementar conmigo el **grupo 4** del cambio de OpenSpec `contenido-claro` ("Piloto"). Respóndeme en español.

**Reglas insaltables de este proyecto.** Antes de actuar, lee en la memoria del proyecto `reglas-fable-specs-opus-implementa.md` y `plan-de-cambios.md`. Resumen de lo que te aplica:

- Eres Opus 5.5: implementas y orquestas. Haces las tareas `[opus]` y delegas las `[sonnet]` en el subagente `repetidor` (comprueba que aparece como tipo de agente; si no, usa Agent con `model: sonnet` y copia las reglas de `.claude/agents/repetidor.md`). En el grupo 4, la 4.7 es `[sonnet]`: un subagente por tema, en paralelo. El encargo lleva la tarea, los archivos de referencia (la traducción que hiciste en la 4.1), los requisitos que le tocan, cómo verificar y la regla "no se inventa información" copiada entera. Revisa tú el diff de cada traducción y ejecuta la verificación; el informe del subagente no es prueba.
- Puedes tomar decisiones **no críticas** y debes anotarlas en `openspec/changes/contenido-claro/decisiones.md` (tarea, qué decidiste, por qué, cómo deshacerlo), en una sección nueva "Grupo 4". Ante una decisión **crítica** (la lista de cinco puntos está en la memoria; en la duda, es crítica) no decides: te detienes en esa tarea, me dices qué falta, lo dejas escrito en este archivo como pregunta para Fable 5.2 y sigues con lo que no dependa de ella. En este cambio son críticas, además (design.md, "Reglas de implementación"): cambiar un identificador, un título, el hogar de un concepto, la respuesta de un ejercicio o el alcance de una entrada de proyecto; añadir algo al proyecto de ejemplo; o saltarse una regla de la guía. Redactar textos y código dentro de la guía, `proyecto-tienda.md` y `content-map.md` sí te corresponde.
- Una sesión cubre un solo grupo de `tasks.md`. El grupo 4 termina en una **parada obligatoria** (4.9): no empieces el grupo 5 aunque yo responda todo "sí"; ese va en una sesión nueva. Al terminar, muéstrame el resumen de cierre y haz `/relevo`.
- No modificas `openspec/specs/`, los cambios archivados, ni `openspec/guia-de-contenido.md`, `content-map.md`, `proyecto-tienda.md`, `design.md` o las specs de este cambio.
- Commits, push y pull requests, solo cuando yo te los pida en esta sesión. Nunca push a `main` ni a `develop`. Los merges los hago yo en GitHub; al integrar en `develop` uso squash.
- **No se inventa información.** La regla sin excepciones está al inicio de `tasks.md` (pedida por mí el 2026-11-13). Este es el primer grupo que escribe contenido, así que te aplica entera: el código ejecutable se ejecuta con `python3` y se pega la salida real; lo no ejecutable (FastAPI, HTTP) se confirma en la documentación oficial actual o en la RFC/MDN, con dirección y fecha anotadas en `decisiones.md`; ante cualquier duda se busca en internet; lo que no se pueda confirmar no se escribe y va a Fable. El contenido que ya está en `content/` tampoco se da por bueno.
- Si una tarea deja algo fuera del repositorio (capturas, mediciones), anota su ruta en `decisiones.md`, no solo en la conversación.
- Con el servidor de desarrollo abierto, no lances `npm run content` a mano: su vigilante también compila y la app se queda sin datos hasta reiniciar el servidor. `npm test` y `npm run build` también compilan el contenido. En la sesión anterior había un servidor de este proyecto abierto en el puerto 5173 desde antes (por eso `preview_start` arrancó en el 5174); tras las pruebas siguió sirviendo bien, pero compruébalo si lo usas.

**Antes de escribir nada:**

1. Lee `openspec/git-workflow.md`, `openspec/guia-de-contenido.md` entera (seis reglas, tabla por sección, modelos 1 a 4, sección de entradas de proyecto y lista de 13 preguntas) y, del cambio `openspec/changes/contenido-claro/`: `design.md` (decisiones 1, 2, 6, 8, 10, 11 y 12, y "Reglas de implementación"), `content-map.md` (secciones 1, 3, 4 y 6), `proyecto-tienda.md`, `tasks.md` (con la regla del inicio y las definiciones de "reescribir" y "traducir") y `decisiones.md`.
2. Comprueba la rama con `git branch --show-current` y `git status -sb`. Lo esperado: rama `feature/contenido-claro`, y **o bien** 22 archivos sin commit (los 21 del grupo 3: 18 `content/python/*/meta.yaml`, `scripts/content/pista-python.test.ts`, `decisiones.md` y `tasks.md` del cambio; más este `openspec/handoff-prompt.md`), **o bien** un commit con todos ellos encima de `1b7be57` y el árbol limpio, si yo lo hice entre sesiones. Cualquier otra cosa: detente y dímelo.
3. `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` en verde antes de tocar nada (última ejecución: 327 pruebas en 16 archivos; lint con 0 errores y 14 avisos que ya estaban).

**Estado al 2026-11-14.**

- `contenido-claro`: 12 de 86 tareas. Grupos 1 (1.1–1.6), 2 (2.1–2.5) y 3 (3.1) hechos y verificados por Opus.
- Commits: grupo 1 en `6004c9a`, grupo 2 en `164a83f`, regla "no se inventa información" en `1b7be57` (`docs`); los tres ya están en `origin`. El grupo 3 queda sin commit. Sin pull request: el PR a `develop` va al final, con el cambio archivado.
- Lo que dejó el grupo 3 (detalle en `decisiones.md`, sección "Grupo 3"):
  - Los 21 temas de Python llevan el orden de `content-map.md` sección 2: final en 13 y provisional en los 8 aún sin partir (`funciones-y-closures` está en el 5). El orden tiene huecos; la lista y los botones anterior y siguiente siguen el orden creciente, verificado en el navegador.
  - La prueba "orden relativo" de `scripts/content/pista-python.test.ts` compara cada entrada de la pista con la tabla de `content-map.md` (copiada en la prueba como `FINAL_ORDER` y `SPLITS`). Te afecta en este grupo: al partir `funciones-y-closures` (4.2) deben existir `funciones-y-parametros` con orden 5 y `closures-y-lambdas` con orden 6, ambos en el grupo `lenguaje`, y no debe quedar la carpeta antigua (nunca a medias ni las tres a la vez). `proyecto-crear-pedido` (4.6) debe llevar orden 23 y grupo `fastapi`. No hay que tocar la prueba hasta la 14.1.
- Grupos 1 y 2 (detalle en `decisiones.md`): los pasos con título (`###`) se admiten en `code:example`, `code:wire` y `code:server`; la compilación valida la paridad de código entre idiomas; las entradas de proyecto (`kind: project`, `covers`, secciones `context` y `walkthrough`) compilan y se muestran, pero el contenido real aún no tiene ninguna.
- El contenido real no se ha reescrito: 41 temas, sin pasos ni entradas de proyecto todavía.

**Qué hacer: grupo 4, en este orden.** Las siete piezas están en `content-map.md` sección 4.

1. **4.1** Reescribir `decoradores` partiendo del Modelo 1 de la guía y traducirlo. Es el primer tema: fija el patrón de reescritura y de traducción que copiarán las demás sesiones y los subagentes, así que anota en `decisiones.md` lo que decidas sobre ese patrón.
2. **4.2** Partir `funciones-y-closures` en `funciones-y-parametros` y `closures-y-lambdas` según `content-map.md` sección 1 (conceptos, títulos, ejercicios, relaciones, órdenes 5 y 6) y reescribir ambos en español, `closures-y-lambdas` partiendo del Modelo 2. Es la primera partición y fija su patrón. Verifica también que la carpeta antigua ya no existe y que ningún `related` ni enlace `[[...]]` apunta a ella.
3. **4.3** Reescribir `cache-http` partiendo del Modelo 3.
4. **4.4** Reescribir `codigos-de-estado` con el Modelo 3 como referencia.
5. **4.5** Reescribir `inyeccion-con-depends` partiendo del Modelo 4.
6. **4.6** Escribir la entrada `proyecto-crear-pedido` en español y traducirla, con el alcance, los archivos y los `covers` de `content-map.md` sección 3 y el formato de design.md decisión 6. Es la primera entrada de proyecto y fija su patrón. Verifica los escenarios "Entrada de proyecto válida" de specs/content-model y "Abrir una entrada de proyecto" de specs/app-shell con el contenido real.
7. **4.7** `[sonnet: como 4.1]` Traducir `funciones-y-parametros`, `closures-y-lambdas`, `cache-http`, `codigos-de-estado` e `inyeccion-con-depends`: un subagente por tema, en paralelo.
8. **4.8** Verificación del grupo (design.md decisión 11): ejecutar el código de los ejercicios "¿Qué imprime?" de las siete piezas y comprobar su respuesta (una discrepancia no se corrige: se escala), dejar en `decisiones.md` una línea por pieza ("lista pasada" o la excepción, y las fuentes), y ejecutar `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` y anotar el resultado.
9. **4.9** Parada del piloto (design.md decisión 12): pídeme que publique la rama (el push lo hago yo o te lo pido) y que lea las siete piezas en la vista previa de la rama. Léeme el guion de 11 preguntas una a una y registra mis respuestas en `decisiones.md`. Las preguntas 2 y 8 esperan "no"; las demás, "sí". Si alguna no coincide, anota el detalle que te dé y déjalo en el relevo como pregunta para Fable 5.2.

Ojo:

- Entre que se escribe el español de un tema y se traduce, la paridad y la compilación pueden fallar para ese tema (design.md decisión 10). Lo que debe estar en verde es el final del grupo.
- Algunas pruebas leen el contenido real y pueden romperse al reescribir o partir. Según design.md decisión 14, se adaptan a las specs de este cambio y a `content-map.md`. Si una protege algo que el cambio no menciona, es una pregunta para Fable. Pruebas que nombran piezas del piloto: `src/test/app.test.tsx`, `src/search/searchIndex.test.ts` y `scripts/content/pista-python.test.ts`; las de `contenido-claro.test.ts` y `.tsx` usan sobre todo datos de prueba.
- `content-map.md` sección 6: no cambian identificadores, nombres ni alias de conceptos, `freq`, `demo`, `track`, respuestas correctas de los ejercicios, claves de sección ni orden de las pestañas, y no se menciona Angular, NestJS ni RxJS fuera de los bloques de código.

**Lo que viene después (no en esta sesión).** Si las 11 respuestas coinciden, Opus hace el grupo 5 en una sesión nueva; si no, va antes una sesión de Fable. Grupos 5 a 13: resto del contenido. Grupo 14: cierre.

**Preguntas abiertas para Fable.** Ninguna.

**Entradas de `decisiones.md` sin revisar** (Fable las revisa antes de archivar; yo después):

- Confirmaciones: los cinco detalles del diseño, confirmados al empezar el grupo 1.
- Grupo 1:
  - 1.2: el paso se genera como `<h4>`, saneado aparte.
  - 1.2: qué se reconoce como título de paso.
  - 1.3: aspecto de los títulos de paso, con las medidas a 390 px y la ruta de la captura.
  - 1.4: paridad de código, alcance y mensajes.
  - 1.2 a 1.4: dónde van las pruebas.
- Grupo 2:
  - 2.1 y 2.2: el modelo (`kind`, `covers` y `freq` opcional, **también en el nodo del grafo**). Marcada para Fable: toca el contrato entre la compilación y la app.
  - 2.1: reglas de validación y mensajes. Añade dos reglas que no están en la spec: `covers` sin repetidos y sin la propia entrada. Además, la compilación exige el lenguaje de cada bloque de `walkthrough`; Opus lo anunció al empezar el grupo 2.
  - 2.2: las conexiones de las entradas se crean antes que las demás.
  - 2.2 y 2.4: relacionados y vecinos de una entrada. Marcada para Fable: un tema reunido muestra entre sus relacionados la entrada que lo reúne.
  - 2.3: aspecto del lector de una entrada.
  - 2.4: sin refuerzo visual en las listas. Marcada para Fable: el nodo de una entrada tiene en el cerebro el tamaño de un tema "a veces".
  - 2.1 a 2.4: dónde van las pruebas.
- Grupo 3:
  - 3.1: la prueba fija el orden y el grupo de cada entrada según la tabla de `content-map.md` (final o provisional), no solo la secuencia. Es más estricta que lo que pide la decisión 9, pero usa los números del documento vinculante.

**Pendiente con Fable, fuera de este cambio.** Después de archivar `contenido-claro`, Fable define la pista SQL (punto 3 del plan), redactada directamente con la guía y con la regla "no se inventa información". Sus compromisos (N+1, inyección SQL, transacciones) están en la memoria `plan-de-cambios`.
