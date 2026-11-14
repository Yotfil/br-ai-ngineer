Este prompt es para **Opus 5.5**. Vas a cerrar conmigo tres cabos sueltos de integración; no hay código de la aplicación que escribir. Respóndeme en español y guíame un paso a la vez: después de cada paso dime qué hiciste y qué tengo que hacer yo, en pocas líneas.

Cambio de OpenSpec en curso: `rendimiento-movil` (23 de 25 tareas, sin archivar). `despliegue-automatico` ya está archivado y solo le falta integrarse en `main`.

**Reglas insaltables de este proyecto.** Lee antes de actuar, en la memoria del proyecto, `reglas-fable-specs-opus-implementa.md`; el 2026-11-13 cambiaron. Resumen de lo que te aplica:

- Eres Opus 5.5: implementas y orquestas. Puedes tomar decisiones **no críticas** y debes anotarlas en `openspec/changes/<cambio>/decisiones.md`. Ante una decisión **crítica** (la lista de cinco puntos está en la memoria; en la duda, es crítica) no decides: te detienes en esa tarea, me dices exactamente qué falta, lo dejas escrito aquí como pregunta para Fable 5.2 y sigues con lo que no dependa de ella.
- En esta sesión no hay tareas `[sonnet]`: no necesitas delegar en el subagente `repetidor`.
- No modificas `openspec/specs/` ni los cambios archivados.
- Commits, push, pull requests y tags, solo cuando yo te los pida en esta sesión. Nunca push a `main` ni a `develop`. Los merges los hago yo en GitHub. En esta máquina no está instalado `gh`: los pull requests los abro yo desde el enlace que da el push, salvo que encuentres otra vía y me la propongas.
- No ejecutas `wrangler deploy`, `wrangler preview` ni `wrangler login`, y no tocas `wrangler.jsonc`.
- Al terminar, muéstrame el resumen de cierre y haz `/relevo` (sobrescribe este archivo). Nunca en un `CLAUDE.md`.

**Antes de escribir nada:**

1. Lee `openspec/git-workflow.md` y `openspec/sistema-de-modelos.md`.
2. Comprueba la rama con `git branch --show-current` y `git status --short`. Lo esperado: rama `feature/despliegue-automatico`, y sin commit solo estos archivos: `.claude/agents/repetidor.md`, `.claude/commands/relevo.md`, `.claude/commands/retomar.md`, `openspec/sistema-de-modelos.md` y este `openspec/handoff-prompt.md` modificado. Si hay algo más, detente y dímelo.
3. Comprueba que `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` están en verde (última ejecución: 264 pruebas en 14 archivos) y que `openspec validate --specs --strict` pasa.

**Estado al 2026-11-13.**

- `despliegue-automatico`: código en `develop`, en `main` y en producción. Archivado en `openspec/changes/archive/2026-11-13-despliegue-automatico/`. El archivado está en `develop` (commit `bdfadfe`, PR #6) pero **no en `main`**: `origin/develop` va 2 commits por delante de `origin/main`. El tag `v0.2.2` no existe; existen `v0.1.0` y `v0.2.0`.
- Sistema de modelos: definido por Fable conmigo en la sesión anterior. Sus cinco archivos están sin commit, sueltos en la rama `feature/despliegue-automatico`, que ya está integrada. Ninguno es código de la app. No se ha probado todavía en un cambio real; `/retomar` y `/relevo` se usan por primera vez en esta sesión, así que si alguno de los dos comandos te resultó confuso o incompleto, dímelo al cierre.
- `rendimiento-movil`: integrado en `develop` (PR #3), en `main` y en producción, sin archivar. Faltan dos tareas que solo puedo hacer yo.

**Qué hacer, en este orden. Cada paso que toca Git, solo cuando yo te lo pida.**

1. **Guardar el sistema de modelos.** Crea `chore/sistema-de-modelos` desde `develop` actualizado, llevando los cinco archivos sin commit. Un commit de tipo `chore`. Push de esa rama. Yo abro e integro el pull request a `develop` con squash.
2. **Llevar `develop` a `main`.** Cuando yo confirme el merge anterior: pull request de `develop` a `main`, que integro yo con merge commit. Incluye el archivado de `despliegue-automatico` y el sistema de modelos.
3. **Comprobar producción.** Cuando yo confirme el merge en `main`: comprueba con `curl` que `https://br-ai-ngineer.jefryeguevarav.workers.dev` responde 200 y sigue sirviendo `/assets/index-Bg0ZR7OL.js` (no cambia ningún archivo de la app). Envía la cabecera `Sec-Fetch-Mode: navigate`. Si el script cambió o no responde, detente: es para Fable.
4. **Tag `v0.2.2`.** Sobre ese merge commit de `main`, no sobre `f664cce`. Créalo y súbelo solo cuando yo te lo pida. Apunta su commit en la tabla de versiones de `openspec/git-workflow.md` solo si te lo pido también; eso va por otra rama `chore/*` y pull request.
5. **`rendimiento-movil`, tareas 5.6 y 6.4.** Las dos dependen de mí. Ayúdame a hacerlas, una a la vez:
   - **5.6:** enséñame las capturas de referencia de la tarea 1.2 junto a las nuevas y pregúntame si confirmo el escenario "Aspecto equivalente" y el aspecto de Cristal y Sólido.
   - **6.4:** léeme el guion de 12 puntos de `design.md` decisión 15, de uno en uno, para que lo responda con mi iPhone en producción; registra mis respuestas.
   - Si todas las respuestas son "sí", marca las dos tareas. Ante cualquier "no" o petición de ajuste, anota lo observado y detente en esa tarea: es para Fable.
6. **Archivar `rendimiento-movil`**, solo con 25 de 25. Según `openspec/git-workflow.md` el archivado va en la rama del cambio, `feature/rendimiento-movil`, que ya se integró y probablemente esté borrada: confírmame antes si la recreas desde `develop`. Tras `openspec archive`, ejecuta `openspec validate --specs --strict`; si falla (por ejemplo, un `## Purpose` de relleno), detente: lo redacta Fable. Después, cuando te lo pida: commit `docs`, push, pull request a `develop` (squash), pull request a `main` (merge commit) y tag `v0.2.1`.

Los pasos 1 a 4 no dependen de los pasos 5 y 6. Si no puedo hacer hoy la prueba de iPhone, cierra con los cuatro primeros y deja el 5 y el 6 en el relevo.

**Preguntas abiertas para Fable.** Ninguna.

**Entradas de `decisiones.md` sin revisar.** Ninguna; el archivo aún no existe en ningún cambio.

**Después de esta sesión.** Con `rendimiento-movil` archivado, sigue el punto 3 del plan: la pista SQL, que define Fable 5.2 en una sesión nueva sobre `feature/pista-sql`, etiquetando cada tarea con `[opus]` o `[sonnet: como N.M]`. Será la primera prueba real del sistema de modelos.
