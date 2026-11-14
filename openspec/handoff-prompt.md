Este prompt es para **Opus 5.5**. Vas a implementar conmigo el **grupo 1** del cambio de OpenSpec `contenido-claro` ("Formato: pasos y paridad de código"). Respóndeme en español.

**Reglas insaltables de este proyecto.** Antes de actuar, lee en la memoria del proyecto `reglas-fable-specs-opus-implementa.md`. Resumen de lo que te aplica:

- Eres Opus 5.5: implementas y orquestas. Haces las tareas `[opus]` y delegas las `[sonnet]` en el subagente `repetidor`. En el grupo 1 no hay tareas `[sonnet]`.
- Puedes tomar decisiones **no críticas** y debes anotarlas en `openspec/changes/contenido-claro/decisiones.md` (tarea, qué decidiste, por qué, cómo deshacerlo). Ante una decisión **crítica** (la lista de cinco puntos está en la memoria; en la duda, es crítica) no decides: te detienes en esa tarea, me dices qué falta, lo dejas escrito en este archivo como pregunta para Fable 5.2 y sigues con lo que no dependa de ella.
- Una sesión cubre un solo grupo de `tasks.md`. Al terminar el grupo 1, muéstrame el resumen de cierre y haz `/relevo`; no sigas con el grupo 2.
- No modificas `openspec/specs/`, los cambios archivados, ni `openspec/guia-de-contenido.md`, `content-map.md`, `proyecto-tienda.md`, `design.md` o las specs de este cambio.
- Commits, push y pull requests, solo cuando yo te los pida en esta sesión. Nunca push a `main` ni a `develop`. Los merges los hago yo en GitHub; al integrar en `develop` uso squash.
- Si una tarea deja algo fuera del repositorio (capturas, mediciones), anota su ruta en `decisiones.md`, no solo en la conversación.

**Antes de escribir nada:**

1. Lee `openspec/git-workflow.md` y, del cambio `openspec/changes/contenido-claro/`: `proposal.md`, `design.md`, `tasks.md` y las tres specs. Para el grupo 1 no necesitas leer `content-map.md` ni `proyecto-tienda.md`; de `openspec/guia-de-contenido.md` te basta la sección "Cómo se escriben los pasos en el archivo".
2. Comprueba la rama con `git branch --show-current` y `git status --short`. Lo esperado: rama `feature/contenido-claro`. Si los artefactos del cambio aparecen sin commit, dímelo y pregúntame si hago yo el commit `docs` o lo haces tú; no empieces a tocar código hasta que estén en un commit.
3. Tarea 1.1: `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` en verde (última ejecución conocida: 264 pruebas en 14 archivos).

**Estado al 2026-11-13.**

- `contenido-claro` está definido y valida en estricto (`openspec validate contenido-claro --strict`). 0 de 86 tareas hechas. Lo definió Fable conmigo; todas las decisiones de producto están tomadas y escritas en `design.md`.
- Qué es: reescribir los 41 temas publicados para que se entiendan "casi como para un junior", con paso a paso, código comentado y un proyecto de ejemplo único (una tienda en línea); partir en dos ocho temas de Python; y añadir cinco "entradas de proyecto". La norma de redacción es `openspec/guia-de-contenido.md`.
- `rendimiento-movil` y `despliegue-automatico` están archivados, integrados y etiquetados (`v0.2.1` en `423d794`, `v0.2.2` en `bd3e7a2`). `develop` y `main` tienen el mismo contenido. La tabla de versiones de `openspec/git-workflow.md` ya está actualizada en esta rama.
- Sin commit en el árbol de trabajo (todo documentación, escrito por Fable): `openspec/changes/contenido-claro/`, `openspec/guia-de-contenido.md`, `openspec/git-workflow.md` y este archivo.

**Qué hacer: grupo 1, tareas 1.1 a 1.6, en orden.**

- 1.2 y 1.4 tocan `scripts/content/sections.ts`, `scripts/content/markdown.ts` y `scripts/content/validate.ts`. Hoy `checkExample` rechaza cualquier texto en `code:example`, y el saneado de HTML no admite encabezados: un `###` se pierde.
- La validación de "mínimo dos pasos" (design.md decisión 3) **no** se activa en este grupo: es la tarea 14.2.
- Tras este grupo el contenido no ha cambiado y la app debe verse igual, salvo el rótulo "Paso a paso".

**Lo que viene después (no en esta sesión).** Grupo 2: modelo de entradas de proyecto. Grupo 3: orden. Grupo 4: piloto de siete piezas, que termina con una parada obligatoria en la que yo leo el piloto en la vista previa y respondo un guion de 11 preguntas (design.md decisión 12). Grupos 5 a 13: resto del contenido. Grupo 14: cierre.

**Preguntas abiertas para Fable.** Ninguna.

**Entradas de `decisiones.md` sin revisar.** Ninguna; el archivo aún no existe.

**Pendiente con Fable, fuera de este cambio.** Después de archivar `contenido-claro`, Fable define la pista SQL (punto 3 del plan), redactada directamente con la guía. Sus compromisos (N+1, inyección SQL, transacciones) están en la memoria `plan-de-cambios`.
