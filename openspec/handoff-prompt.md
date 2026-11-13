# Prompt de arranque — implementar `despliegue-automatico`

> Escrito por Fable 5.2 el 2026-11-13, tras definir el cambio con el usuario. Pega el bloque de abajo como primer mensaje de una sesión nueva con **Opus 5.5**, abierta en `/Users/yotfil/Documents/Yotfil/TechForge/Learning/ai_engineer/ai-engineer-path`.

---

Vas a implementar el cambio de OpenSpec `despliegue-automatico` con `/opsx:apply`. Respóndeme en español.

**Reglas insaltables de este proyecto** (también están en la memoria del proyecto; léela antes de actuar):

1. Implementas tú, Opus 5.5. Las decisiones las toma Fable 5.2 conmigo en otra sesión.
2. Si encuentras un vacío, una ambigüedad o una contradicción en los artefactos, **no decidas**. Detente, dime exactamente qué falta (archivo y requisito, decisión o tarea) y espera. No rellenes el hueco con un supuesto razonable.
3. No modifiques `proposal.md`, `design.md` ni los archivos de `specs/` del cambio. En `tasks.md` solo marcas casillas.
4. Si te digo que se retoma en otro contexto, actualiza la memoria del proyecto y sobrescribe este archivo con un prompt de arranque nuevo; dime la ruta. Nunca lo pongas en un `CLAUDE.md`.

**Antes de escribir nada:**

- Comprueba la rama con `git branch --show-current`. Debe ser `feature/despliegue-automatico`. Si no lo es, detente y avísame. El flujo de Git es el de `openspec/git-workflow.md`, que es vinculante: no haces commits, push ni pull requests salvo que te lo pida en esta sesión.
- Lee completos, en este orden: `openspec/changes/despliegue-automatico/proposal.md`, `design.md`, `specs/deployment/spec.md`, `specs/app-shell/spec.md` y `tasks.md`.
- En el árbol de trabajo encontrarás sin commit los artefactos de este cambio, `openspec/git-workflow.md` (una fila nueva en la tabla de versiones) y este archivo, escritos por Fable. Es lo esperado.

**De qué va el cambio:** la app ya está publicada en Cloudflare (Worker `br-ai-ngineer`, conectado a GitHub desde el panel), pero la configuración vive solo en el panel. El cambio la lleva al repositorio (`wrangler.jsonc`, `.nvmrc`, `public/_headers`), documenta los ajustes del panel y hace que la app se recupere sola cuando se publica una versión nueva mientras está abierta: se recarga una vez; si la carga falla por otra causa, muestra un aviso con botón de reintentar.

**Puntos donde es fácil equivocarse:**

- No tienes acceso al panel de Cloudflare ni credenciales, y no las pidas. No ejecutes `wrangler deploy`, `wrangler preview` ni `wrangler login`. Lo único permitido de Wrangler es `npx wrangler deploy --dry-run` (tarea 2.1). Lo único que publica algo es el push que yo te pida en la tarea 4.3.
- El `name` de `wrangler.jsonc` debe ser exactamente `br-ai-ngineer`; con otro nombre la compilación de Cloudflare falla.
- La tarea 1.2 va antes de tocar nada: yo te leo los ajustes actuales del panel. Si no encajan con la tabla de la decisión 7 de un modo que la tabla no prevé, te detienes.
- La recarga automática ocurre como máximo una vez por versión nueva (decisión 2). Sin `sessionStorage` no se recarga. Mientras se comprueba si hay versión nueva se muestra el estado de carga, no el de error.
- En el modo de aplicación de una sola página, un archivo inexistente de `/assets/` devuelve la página principal con estado 200. Por eso la detección compara el script de entrada y no mira códigos de estado.
- La regla de caché es solo para `/assets/*`. La página principal no se toca.
- `rendimiento-movil` está integrado en `develop` pero sigue sin archivar, con dos tareas pendientes que son mías (comparación visual y prueba en iPhone). No lo archives ni marques esas tareas en esta sesión.

**Lo que hago yo, no tú:**

- Tareas 1.2 y 4.2: leer y ajustar el panel de Cloudflare.
- Tarea 4.3: te pido el commit y el push, y te doy la dirección de la vista previa cuando Cloudflare la genere.
- Después de integrar en `main`: comprobar que producción muestra la versión nueva (me dejas las instrucciones en la tarea 4.6).

**Al terminar o al detenerte**, dame un resumen con: tareas hechas y pendientes, resultado de `npm run typecheck`, `npm test`, `npm run lint` y `npm run build`, las cabeceras que obtuviste en la tarea 4.4 y lo que quede de mi parte. No archives el cambio hasta que las 17 tareas estén marcadas.

**Versión:** este cambio lleva el tag `v0.2.2` (design.md decisión 9). No crees el tag salvo que te lo pida.

**Qué sigue después:** cerrar `rendimiento-movil` (mi prueba en iPhone, que haré en la vista previa de esta rama, y su archivado) y, después, la definición de la pista SQL con Fable 5.2 en la rama `feature/pista-sql`.
