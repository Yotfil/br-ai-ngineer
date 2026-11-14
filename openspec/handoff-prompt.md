Este prompt es para **Opus 5.5**. Vas a implementar conmigo el **grupo 3** del cambio de OpenSpec `contenido-claro` ("Orden de la pista Python y FastAPI"). Respóndeme en español.

**Reglas insaltables de este proyecto.** Antes de actuar, lee en la memoria del proyecto `reglas-fable-specs-opus-implementa.md` y `plan-de-cambios.md`. Resumen de lo que te aplica:

- Eres Opus 5.5: implementas y orquestas. Haces las tareas `[opus]` y delegas las `[sonnet]` en el subagente `repetidor`. En el grupo 3 no hay tareas `[sonnet]`.
- Puedes tomar decisiones **no críticas** y debes anotarlas en `openspec/changes/contenido-claro/decisiones.md` (tarea, qué decidiste, por qué, cómo deshacerlo), en una sección nueva "Grupo 3". Ante una decisión **crítica** (la lista de cinco puntos está en la memoria; en la duda, es crítica) no decides: te detienes en esa tarea, me dices qué falta, lo dejas escrito en este archivo como pregunta para Fable 5.2 y sigues con lo que no dependa de ella.
- Una sesión cubre un solo grupo de `tasks.md`. Al terminar el grupo 3, muéstrame el resumen de cierre y haz `/relevo`; no sigas con el grupo 4, aunque el grupo 3 sea corto.
- No modificas `openspec/specs/`, los cambios archivados, ni `openspec/guia-de-contenido.md`, `content-map.md`, `proyecto-tienda.md`, `design.md` o las specs de este cambio.
- Commits, push y pull requests, solo cuando yo te los pida en esta sesión. Nunca push a `main` ni a `develop`. Los merges los hago yo en GitHub; al integrar en `develop` uso squash.
- **No se inventa información**: lee la regla sin excepciones del inicio de `tasks.md` (pedida por mí el 2026-11-13). Aplica a todo lo que escriba o traduzca contenido, desde el grupo 4, y la copias en cada encargo a Sonnet.
- Si una tarea deja algo fuera del repositorio (capturas, mediciones), anota su ruta en `decisiones.md`, no solo en la conversación.
- Con el servidor de desarrollo abierto, no lances `npm run content` a mano: su vigilante también compila y la app se queda sin datos hasta reiniciar el servidor.

**Antes de escribir nada:**

1. Lee `openspec/git-workflow.md` y, del cambio `openspec/changes/contenido-claro/`: `design.md` (decisión 9; también la 8, temas partidos, para entender el orden provisional), `content-map.md` sección 2 (orden final y provisional de la pista Python), `tasks.md` y `decisiones.md`. Lee también `scripts/content/pista-python.test.ts`: tiene la prueba de los 21 órdenes consecutivos que hay que adaptar.
2. Comprueba la rama con `git branch --show-current` y `git status --short`. Lo esperado: rama `feature/contenido-claro`, con el grupo 2 ya en el último commit (`feat: entradas de proyecto…`). Si no hice yo el commit de la regla "no se inventa información" (la escribió otra sesión mientras Opus hacía el grupo 2 y quedó fuera de ese commit), verás sin commit estos tres archivos y ninguno más: `openspec/guia-de-contenido.md`, `openspec/changes/contenido-claro/design.md` y `openspec/changes/contenido-claro/tasks.md` (en este, solo la sección "Regla sin excepciones" del inicio). Si hay algo más, detente y dímelo.
3. `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` en verde antes de tocar nada (última ejecución: 327 pruebas en 16 archivos; lint con 0 errores y 14 avisos que ya estaban).

**Estado al 2026-11-13.**

- `contenido-claro`: 11 de 86 tareas. Grupos 1 (1.1–1.6) y 2 (2.1–2.5) hechos y verificados por Opus.
- Commits: grupo 1 en `6004c9a` y grupo 2 en el commit siguiente, los dos sin push (compruébalo con `git status -sb`). La regla "no se inventa información" sigue sin commit. Sin pull request: el PR a `develop` va al final, con el cambio archivado.
- Lo que dejó el grupo 2 (detalle en `decisiones.md`, sección "Grupo 2"):
  - El modelo admite entradas de proyecto: `kind: project` y `covers` en `meta.yaml`, secciones `context` y `walkthrough`, sin `freq`, conceptos, `related`, demo ni ejercicios. La compilación lo valida todo (decisión 6) y la paridad de código entre idiomas también recorre esas dos secciones.
  - Una entrada sale en el buscador como un tema, en el cerebro como un nodo de tema conectado con cada tema de `covers`, en el sidebar y en la hoja del teléfono en la posición de su `order`, y en el lector sin pestañas ni frecuencia, con "Qué vamos a construir", "El código, parte por parte" y "Temas que reúne este proyecto".
  - El contenido real aún no tiene ninguna entrada (la primera es la tarea 4.6). Su salida generada es idéntica byte a byte a la de antes del grupo 2.
  - Verificado en el navegador: los temas existentes se ven y se navegan igual que antes. Una entrada temporal, ya borrada, se vio bien a 1280 y a 375 px. Las capturas tienen su ruta en `decisiones.md`.
- El contenido real no ha cambiado: 41 temas, sin pasos ni entradas de proyecto todavía.

**Qué hacer: grupo 3, una sola tarea.**

- 3.1 Dar a cada tema actual de Python su orden final o provisional de `content-map.md` sección 2 (en `content/python/*/meta.yaml`), y adaptar la prueba de `pista-python.test.ts` que exige 21 órdenes consecutivos para que compruebe el **orden relativo** de los temas (design.md decisión 9). Verifica que la lista de la pista en el sidebar conserva el mismo orden de temas que antes y que `npm test` y `npm run build` terminan en verde. Al cerrar el grupo, ejecuta también `npm run typecheck` y `npm run lint` y anota el número de pruebas.

Ojo: los grupos de temas (`lenguaje`, `fastapi`) deben seguir siendo consecutivos según `order` (lo valida la compilación). Los números de orden son los que fija `content-map.md`: no son decisión tuya. Si algún tema actual no aparece allí, o su número rompe el orden o los grupos, es un vacío y va a Fable.

**Lo que viene después (no en esta sesión).** Grupo 4: piloto de siete piezas, el primer grupo que escribe contenido. Le aplica la regla "no se inventa información" y termina con una parada obligatoria en la que yo leo el piloto en la vista previa y respondo un guion de 11 preguntas (design.md decisión 12). Grupos 5 a 13: resto del contenido. Grupo 14: cierre.

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

**Pendiente con Fable, fuera de este cambio.** Después de archivar `contenido-claro`, Fable define la pista SQL (punto 3 del plan), redactada directamente con la guía y con la regla "no se inventa información". Sus compromisos (N+1, inyección SQL, transacciones) están en la memoria `plan-de-cambios`.
