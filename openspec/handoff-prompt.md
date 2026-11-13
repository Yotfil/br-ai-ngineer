Vas a integrar conmigo el cambio de OpenSpec `despliegue-automatico`, ya archivado. Respóndeme en español.

**Reglas insaltables de este proyecto** (también están en la memoria del proyecto; léela antes de actuar):

- Eres Opus 5.5: implementas. No modificas las specs de `openspec/specs/` ni el cambio archivado.
- Ante un vacío, una ambigüedad o una contradicción, no decides: te detienes, me dices exactamente qué falta y lo dejamos para una sesión con Fable 5.2.
- Commits, push, pull requests y tags, solo cuando yo te los pida en esta sesión. Nunca push a `main` ni a `develop`. Los merges los hago yo en GitHub.
- No ejecutas `wrangler deploy`, `wrangler preview` ni `wrangler login`, y no tocas `wrangler.jsonc`.
- Si la sesión se va a retomar en otro contexto, actualiza la memoria y sobrescribe este archivo (`openspec/handoff-prompt.md`) con el prompt siguiente. Nunca en un `CLAUDE.md`.

**Antes de escribir nada:**

1. Comprueba la rama con `git branch --show-current`. Debe ser `feature/despliegue-automatico`. Si no lo es, detente y avísame.
2. Lee `openspec/git-workflow.md` y la decisión 10 de `openspec/changes/archive/2026-11-13-despliegue-automatico/design.md`.

**Estado.** El código del cambio ya está en `develop`, en `main` (PR #4 y #5) y en producción. El cambio está archivado en `openspec/changes/archive/2026-11-13-despliegue-automatico/` con 18 de 18 tareas; `openspec/specs/deployment/` es nueva y Fable ya escribió su `## Purpose`. `openspec validate --specs --strict` pasa entero. Sin commit en esta rama quedan solo archivos de `openspec/`: el archivado, las specs principales (deployment, app-shell, localization) y este archivo.

**Qué hacer, en este orden:**

1. Comprueba que `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` siguen en verde (última ejecución: 264 pruebas en 14 archivos) y que `openspec validate --specs --strict` pasa.
2. Cuando yo te lo pida: un commit de tipo `docs` con todo lo pendiente de `openspec/`; push de `feature/despliegue-automatico` (si GitHub borró la rama remota, el push la vuelve a crear); pull request a `develop`, que integro yo con squash.
3. Cuando yo confirme ese merge: pull request de `develop` a `main`, que integro yo con merge commit.
4. Cuando yo confirme el merge en `main`: comprueba con `curl` que producción (`https://br-ai-ngineer.jefryeguevarav.workers.dev`) sigue respondiendo 200 con el script `/assets/index-Bg0ZR7OL.js` (no cambia ningún archivo de la app). Si cambió o no responde, detente: es para Fable.
5. El tag `v0.2.2` va sobre el merge commit de `main` que incluya el archivado, no sobre `f664cce`. Créalo y súbelo solo cuando yo te lo pida, y apunta su commit en la tabla de versiones de `openspec/git-workflow.md` solo si te lo pido también (eso va por rama `chore/*` y pull request, no directo a `develop`).

**Pendientes que no cambian.** `rendimiento-movil` sigue integrado sin archivar y ya está en producción: faltan mi comparación visual (5.6) y mi prueba en iPhone (6.4), que puedo hacer en producción o en la vista previa; un "no" va a Fable. Después: la pista SQL, que define Fable en `feature/pista-sql`.
