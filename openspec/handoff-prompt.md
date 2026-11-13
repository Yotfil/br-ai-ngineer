# Prompt de arranque — retomar `despliegue-automatico` en las tareas 2.5 y 3.2

> Escrito por Fable 5.2 el 2026-11-13, tras resolver con el usuario el vacío de la tarea 3.2. Pega el bloque de abajo como primer mensaje de una sesión nueva con **Opus 5.5**, abierta en `/Users/yotfil/Documents/Yotfil/TechForge/Learning/ai_engineer/ai-engineer-path`.

---

Vas a retomar la implementación del cambio de OpenSpec `despliegue-automatico`. Respóndeme en español.

**Reglas insaltables de este proyecto** (también están en la memoria del proyecto; léela antes de actuar):

1. Eres Opus 5.5: implementas las specs ya definidas. No tomas decisiones de producto ni de diseño. Ante un vacío, una ambigüedad o una contradicción, te detienes, me dices exactamente qué falta (archivo y requisito o tarea) y lo dejas para una sesión con Fable 5.2.
2. No modificas `proposal.md`, `design.md` ni los archivos de `specs/`. En `tasks.md` solo marcas casillas.
3. Commits y push, solo cuando yo los pida en la sesión. Sin credenciales de Cloudflare: no ejecutas `wrangler deploy`, `wrangler preview` ni `wrangler login`.
4. Si te detienes o vamos a cambiar de contexto, actualiza la memoria y sobrescribe este archivo (`openspec/handoff-prompt.md`) con el prompt para la sesión siguiente. Nunca en un `CLAUDE.md`.

**Antes de escribir nada:**

- Comprueba la rama con `git branch --show-current`. Debe ser `feature/despliegue-automatico`. Si no lo es, detente y avísame.
- Lee `openspec/changes/despliegue-automatico/tasks.md`, `design.md` (decisiones 3, 8 y 11, que cambiaron) y `specs/localization/spec.md` (nuevo).
- En el árbol de trabajo están sin commit los cambios de tu sesión anterior (código, pruebas, configuración, README). Es lo esperado.

**Estado:** 12 de 18 tareas marcadas (1.1, 1.2, 2.1–2.4, 3.1, 3.3–3.5, 4.1, 4.6). El cambio valida con `openspec validate despliegue-automatico --strict`. En tu última ejecución: 258 pruebas en 13 archivos, typecheck, lint y build en verde.

**Qué decidió el usuario con Fable el 2026-11-13:**

- **Tarea 3.2 (el vacío).** La prueba de paridad de textos no existía: ahora hay que crearla. Exige mismas claves en `src/locales/es.json` y `en.json`, todo valor final cadena no vacía y mismos marcadores `{{nombre}}` por clave. El detalle está en design.md decisión 11 y el requisito con sus cuatro escenarios en `specs/localization/spec.md`. Hoy los dos archivos tienen 55 claves y cumplen: la prueba nace en verde. Si falla con los archivos reales, no corrijas el texto: anota la clave y detente. Las claves `reader.loadError` y `reader.retry` ya están añadidas.
- **Tarea 3.5.** Tu forma de cortar la red (detener el servidor de `npm run preview`) vale; la tarea sigue marcada y `ai-engineer-path-preview` en `.claude/launch.json` se conserva. No hay nada que hacer.
- **Tarea 2.5 (nueva).** En el `README.md`, el contenido de "Despliegue estático" pasa, con el texto tal cual, a una subsección `### Otro hosting` al final de "Despliegue" (design.md decisión 8).

**Orden de trabajo:** 2.5, 3.2, y después 4.2 a 4.5 (confirmación del panel por mi parte, push cuando yo lo pida, comprobaciones con `curl`). Tras la 3.2, repite typecheck, test y lint y anota el número de pruebas.

**Dato para la tarea 4.5:** antes de cualquier push, producción servía el script de entrada `/assets/index-DneNDzhk.js`.

**Pendientes que no cambian:** `rendimiento-movil` sigue integrado en `develop` sin archivar (faltan mi comparación visual y mi prueba en iPhone, que haré en la vista previa de esta rama). Tag de este cambio: `v0.2.2`. Después: la pista SQL en `feature/pista-sql`.
