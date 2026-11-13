# Design

## Context

Motivación y alcance: ver `proposal.md`. Requisitos observables: ver `specs/`.

Estado de partida, verificado el 2026-11-13 (rama `feature/despliegue-automatico`, creada desde `develop`):

- **Despliegue actual.** El usuario conectó el repositorio `Yotfil/br-ai-ngineer` desde el panel de Cloudflare (Workers Builds). El Worker se llama `br-ai-ngineer` y responde en `https://br-ai-ngineer.jefryeguevarav.workers.dev`. Fable no tiene acceso al panel; los ajustes los leyó el usuario el 2026-11-13 con capturas y están en la decisión 7.
- **Qué sirve hoy.** La versión de `main` (anterior a `rendimiento-movil`). El push de `rendimiento-movil` a `develop` no cambió producción, lo que es coherente con que la rama de producción sea `main`. Las direcciones de la app (`/es/rest/…`) devuelven la página principal con estado 200, es decir, el modo de aplicación de una sola página ya está activo por algún ajuste que no está en el repositorio.
- **Cabeceras.** Todos los archivos, también los de `/assets/` con huella en el nombre, llegan con `Cache-Control: public, max-age=0, must-revalidate`. Llegan comprimidos.
- **Archivo inexistente.** Pedir un archivo de `/assets/` que no existe devuelve la página principal con estado 200, no un 404. Es el comportamiento documentado del modo de aplicación de una sola página.
- **Panel, leído el 2026-11-13.** El Worker usa el modelo actual de vistas previas de Cloudflare (Worker Previews). En Settings, la sección Builds tiene dos pestañas, **Production** y **Previews Base**; los ajustes de vista previa están en la segunda, por eso no aparecían en la primera. Las compilaciones de vista previa ya están activadas con el comando `npx wrangler preview`, y en Domains → Worker URL están activadas la dirección de producción y la de vistas previas (`*-br-ai-ngineer.jefryeguevarav.workers.dev`). Todos los valores coinciden ya con la decisión 7: no hay nada que cambiar en el panel.
- **Repositorio.** No hay configuración de Wrangler, ni `public/_headers`, ni `.nvmrc`. `wrangler` no está en `package.json`. Node local: 24.17. El `README.md` pide Node 22.12 o superior.
- **Rama por defecto en GitHub.** `openspec/git-workflow.md` fija `develop` como rama por defecto. Según la documentación de Cloudflare, Workers Builds toma por defecto la rama por defecto del repositorio como rama de producción, así que el ajuste del panel debe decir `main` de forma explícita.
- **Carga de temas y demos.** Los temas se cargan bajo demanda (`loadTopic` en `src/data/content.ts`, con `import.meta.glob` diferido) y las tres demos con `lazy` (`src/demos/registry.ts`). `src/shell/Reader.tsx` no trata el fallo de carga de un tema: el lector se queda con el título y el contenido vacíos. Una demo que falla al cargar no tiene quien recoja el error.
- **`rendimiento-movil`.** Está integrado en `develop` con 23 de 25 tareas y sin archivar: faltan la comparación visual y la prueba en iPhone, que hace el usuario. Esta rama nace de `develop`, así que lo incluye.

Documentación de Cloudflare consultada el 2026-11-13: Workers Builds (configuración, ramas, rutas vigiladas, caché e imagen de compilación), recursos estáticos (cabeceras, aplicación de una sola página) y Worker Previews (introducción, primeros pasos, configuración y dominios).

## Reglas de implementación

Fijadas por el usuario y no negociables:

- Estas especificaciones las define Fable 5.2; las implementa Opus 5.5.
- Quien implementa no toma decisiones de producto ni de diseño. Ante un vacío, una ambigüedad o una contradicción en estos artefactos, se detiene, informa exactamente qué falta (archivo y requisito o tarea) y deja la decisión para una sesión de definición con Fable 5.2. No rellena el hueco con un supuesto.
- No modifica `proposal.md`, `design.md` ni los archivos de `specs/`. En `tasks.md` solo marca casillas.
- Flujo de Git: `openspec/git-workflow.md`. Todo el cambio vive en `feature/despliegue-automatico`. Commits y push, solo cuando el usuario los pida en la sesión.
- Quien implementa no tiene acceso al panel de Cloudflare ni credenciales de Cloudflare, y no las pide. No ejecuta `wrangler deploy`, `wrangler preview` ni `wrangler login`. Lo único que publica es el push que el usuario le pida.
- Al retomar en otro contexto, el prompt de arranque está en `openspec/handoff-prompt.md`.

Margen de quien implementa: nombres de funciones, variables y clases, y lo que este documento marca como "de implementación".

## Goals / Non-Goals

**Goals:**

- Que la configuración del despliegue esté en el repositorio y un push la reproduzca.
- Vista previa de cada rama que no sea `main`, para probar en un teléfono antes de integrar.
- Que los archivos con huella no se revaliden en cada visita.
- Que una publicación no deje a medias a quien tiene la app abierta.

**Non-Goals:**

- El despliegue final del plan (punto 10): nombre del producto, dominio, `v1.0.0`, `release/*` y `hotfix/*`.
- Funciones de servidor o código de Worker. El Worker solo sirve archivos estáticos.
- Restringir el acceso a las vistas previas.
- Funcionamiento sin conexión o instalación como aplicación.
- GitHub Actions: la compilación la hace Cloudflare.

## Decisions

Las decisiones 1 a 3 las tomó el usuario el 2026-11-13. Ese mismo día, tras leer el panel, eligió también el mecanismo de vista previa (decisión 1), fijar las direcciones `workers.dev` en la configuración de Wrangler (decisión 4) y documentar todos los ajustes del panel con su valor actual (decisión 7). En una sesión posterior del mismo día, con la implementación en 12 de 17 tareas, decidió la prueba de paridad de textos (decisión 11), las dos formas válidas de cortar la red en la tarea 3.5 (decisión 3) y el destino de la sección "Despliegue estático" del `README.md` (decisión 8). Las demás son técnicas o propuestas de Fable derivadas de ellas.

### 1. Producción desde `main`, vista previa del resto de ramas

Cada push a `main` publica producción. Cada push a cualquier otra rama (`develop`, `feature/*`, `chore/*`) genera una vista previa con dirección propia en `workers.dev`, sin tocar producción. Alternativas descartadas por el usuario: vista previa solo de `develop`, y ninguna vista previa.

Mecanismo, elegido por el usuario el 2026-11-13: Worker Previews, con el comando `npx wrangler preview`, que es el que el panel ya tiene. Cada rama tiene una vista previa propia cuya dirección no cambia entre un push y el siguiente: `<nombre>-br-ai-ngineer.jefryeguevarav.workers.dev`, donde `<nombre>` lo deriva Cloudflare del nombre de la rama. El nombre exacto no se fija aquí: el usuario lo lee en el panel o en el comentario que Cloudflare deja en el pull request. Alternativas descartadas por el usuario: `npx wrangler versions upload` (una dirección distinta por cada compilación) y renunciar a las vistas previas.

Worker Previews impone dos condiciones al repositorio, recogidas en la decisión 4: un bloque `previews` en la configuración de Wrangler y Wrangler 4.135.0 o superior. Sin ellas, la compilación de una rama que no es `main` falla o no entrega dirección.

Las vistas previas son públicas para quien tenga la dirección. Se acepta: el contenido es material de estudio sin datos personales.

### 2. Recuperación ante una versión nueva: recarga automática, una vez

Si la carga de un tema o de una demo falla y hay una versión nueva publicada, la app se recarga sola y, como la dirección no cambia, vuelve a abrir el mismo tema. Alternativas descartadas por el usuario: mostrar un aviso con botón para recargar, y no cubrirlo.

Mecanismo, común a temas y demos:

1. Al fallar una carga diferida, pedir `/index.html` con `cache: 'no-store'` y extraer la dirección del script de entrada (el `<script type="module">` cuyo `src` empieza por `/assets/`).
2. Compararla con la del script de entrada de la página en ejecución.
3. Si son distintas, hay versión nueva: guardar en `sessionStorage`, bajo la clave `ai-engineer-path:reloaded-for`, la dirección nueva y llamar a `location.reload()`.
4. Si son iguales, si la petición falla, si no se encuentra el script en la respuesta, o si la clave de `sessionStorage` ya contiene esa misma dirección nueva (ya se recargó por esta versión y sigue fallando): no recargar y mostrar el estado de error de la decisión 3.

Tras la recarga se abre el mismo tema en la pestaña Entender; no se conserva la pestaña ni la posición de lectura. Si `sessionStorage` no está disponible, no se recarga y se muestra el estado de error.

### 3. Estado de error del lector y de la demo

Hoy un tema que no carga deja el lector vacío. Con este cambio:

- **Tema.** El lector conserva la cabecera (pista y botón de cerrar) y muestra en la zona de contenido el mensaje y un botón de reintentar. Reintentar vuelve a pedir el tema y repite la comprobación de la decisión 2.
- **Demo.** El bloque de la demo muestra el mismo mensaje y el mismo botón en lugar de la demo; el resto de la pestaña Practicar sigue funcionando.
- Mientras se comprueba si hay versión nueva se sigue mostrando el estado de carga actual, no el de error.

Comprobación en el navegador (tarea 3.5). Para la app, "sin red" es que la petición del tema no llega. Valen dos formas de provocarlo con la versión compilada servida en local, aceptadas por el usuario el 2026-11-13: el modo sin conexión de las herramientas del navegador, o detener el servidor de `npm run preview` con la app ya abierta y volver a arrancarlo antes de pulsar "Reintentar". La configuración `ai-engineer-path-preview` de `.claude/launch.json` sirve a la segunda y se conserva.

Textos, claves nuevas en `src/locales/es.json` y `en.json`:

| Clave | ES | EN |
|---|---|---|
| `reader.loadError` | `No se pudo cargar el contenido. Comprueba tu conexión.` | `Couldn't load the content. Check your connection.` |
| `reader.retry` | `Reintentar` | `Retry` |

El mensaje usa el color `var(--muted)` y el botón el estilo de los botones secundarios del lector (`.btn`). El mensaje se anuncia a lectores de pantalla con `role="alert"`.

### 4. Configuración de Wrangler

Archivo `wrangler.jsonc` en la raíz, con exactamente este contenido funcional:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "br-ai-ngineer",
  "compatibility_date": "2026-11-13",
  "workers_dev": true,
  "preview_urls": true,
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "previews": {}
}
```

- `name` debe coincidir con el Worker del panel; si no coincide, la compilación de Cloudflare falla.
- Sin `main`: no hay código de Worker.
- `previews` es obligatorio para `npx wrangler preview` y va vacío: las vistas previas no necesitan variables ni recursos propios. `assets` y `compatibility_date` se quedan en el nivel superior; la vista previa los toma de ahí.
- `workers_dev` y `preview_urls` fijan en el repositorio los dos interruptores de Domains → Worker URL (producción y vistas previas en `workers.dev`), hoy activados. Cada publicación de producción los reafirma.
- `wrangler` se añade a `devDependencies` con la última versión estable de la serie 4, que debe ser 4.135.0 o superior (la mínima para Worker Previews; el 2026-11-13 la última era 4.162.0), fijada a una versión exacta (sin `^`). Workers Builds usa la versión de Wrangler del `package.json`.
- `.wrangler` se añade a `.gitignore`.

### 5. Versión de Node

Archivo `.nvmrc` en la raíz con el contenido `24`. La imagen de compilación de Cloudflare lo respeta. El requisito mínimo del `README.md` (22.12) no cambia.

### 6. Caché

Archivo `public/_headers` (Vite lo copia a `dist/`) con una sola regla:

```txt
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

El resto de archivos, incluida la página principal y `favicon.svg`, conservan la cabecera por defecto de Cloudflare (`max-age=0, must-revalidate`), que es lo que permite que una versión nueva se vea en la siguiente visita.

Consecuencia conocida: en el modo de aplicación de una sola página, pedir un archivo inexistente de `/assets/` devuelve la página principal. La decisión 2 no depende del código de estado, sino de comparar el script de entrada, así que funciona igual.

### 7. Ajustes del panel de Cloudflare

Leídos por el usuario el 2026-11-13 en el Worker `br-ai-ngineer`. **Todos tienen ya el valor de estas tablas**: no hay que cambiar ninguno. Por decisión del usuario se documentan todos los ajustes de compilación, también los que están en su valor por defecto, para que el `README.md` (decisión 8) permita reconstruir el panel.

Settings → Builds, pestaña **Production**:

| Ajuste | Valor |
|---|---|
| Git repository | `Yotfil/br-ai-ngineer` |
| Production branch | `main` |
| Disable builds | desactivado |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Build watch paths | Include paths: `*`. Exclude paths: como lo muestra el panel, `node_modules/**, .git/` |
| API token | `br-ai-ngineer build token`, el que generó Cloudflare. Solo se documenta el nombre, nunca el valor |
| Variables and secrets | ninguno |
| Deploy Hooks | ninguno |
| Build cache | activado |

Settings → Builds, pestaña **Previews Base**:

| Ajuste | Valor |
|---|---|
| Builds for Preview branches | activado |
| Build command | `npm run build` |
| Preview command | `npx wrangler preview` |
| Root directory | `/` |
| Build watch paths | igual que en Production |
| API token | `br-ai-ngineer build token` |
| Variables and secrets | ninguno |
| Build cache | activado |

Domains → Worker URL. Estos dos también están en `wrangler.jsonc` (decisión 4), que es quien manda:

| Ajuste | Valor |
|---|---|
| Production, `br-ai-ngineer.jefryeguevarav.workers.dev` | activado |
| Preview, `*-br-ai-ngineer.jefryeguevarav.workers.dev` | activado |

Sin dominios propios ni rutas. Los ajustes de Settings → Runtime (Placement, Compatibility date, Compatibility flags, Cache) no se documentan en el `README.md`: la fecha de compatibilidad la fija `wrangler.jsonc` y los demás están en su valor por defecto.

Si en una comprobación posterior el panel muestra un valor distinto del de estas tablas, o una opción que no figura en ellas, quien implementa no decide: se anota lo que se ve y se lleva a Fable.

### 8. Documentación

El `README.md` gana una sección "Despliegue" con: dónde está publicada la app, qué rama publica producción y cuáles generan vista previa, los archivos del repositorio que lo configuran, las tres tablas de ajustes del panel de la decisión 7 con la nota de dónde está cada una (pestañas Production y Previews Base de Settings → Builds, y Domains → Worker URL), y cómo encontrar la dirección de una vista previa (forma de la dirección según la decisión 1, panel del Worker, y comentario en el pull request si Cloudflare lo publica). La línea de requisitos del `README.md` menciona `.nvmrc`.

La sección anterior "Despliegue estático" deja de ser una sección aparte (decidido por el usuario el 2026-11-13): su contenido pasa a una subsección `### Otro hosting`, la última de "Despliegue", después de "Dirección de una vista previa". El texto se conserva tal cual (los tres párrafos: qué deja `npm run build`, el requisito de redirigir a `index.html` y que no hacen falta variables de entorno); solo cambia el encabezado. En el `README.md` no queda ningún encabezado "Despliegue estático".

### 9. Versión

Este cambio lleva el tag `v0.2.2` (decidido por el usuario el 2026-11-13), con la misma regla que `rendimiento-movil`: no figura en el plan numerado y no consume número. Está recogido en `openspec/git-workflow.md`.

### 10. Qué se comprueba antes y después de integrar

El flujo de Git pide archivar el cambio antes del pull request, pero la publicación de producción solo ocurre al llegar a `main`. Se resuelve así:

- **Antes de archivar**, con el push de `feature/despliegue-automatico` que pida el usuario: la vista previa de esa rama demuestra que la configuración de Wrangler compila y publica, que las direcciones de la app funcionan, y que `/assets/` lleva la caché nueva. Son tareas del cambio.
- **Después de integrar en `main`**, fuera de las tareas: el usuario comprueba que producción muestra la versión nueva. Si no ocurre, se abre una sesión con Fable.

La vista previa de esta rama incluye `rendimiento-movil`, así que el usuario puede usarla para la prueba en iPhone que ese cambio tiene pendiente.

### 11. Pruebas automáticas

- La lógica de la decisión 2 se prueba con la petición, `location.reload` y `sessionStorage` simulados: versión nueva, misma versión, petición fallida, respuesta sin script, segunda vez con la misma versión y almacenamiento no disponible.
- El estado de error del lector y de la demo, y el reintento, con pruebas de componente.
- Paridad de textos de interfaz (decidida por el usuario el 2026-11-13; requisito en specs/localization). Una prueba lee `src/locales/es.json` y `src/locales/en.json` y exige tres cosas:
  1. **Mismas claves.** Una clave es la ruta completa hasta un valor final, con los niveles unidos por punto (`reader.retry`). Los dos archivos tienen exactamente el mismo conjunto de claves.
  2. **Valores de texto no vacíos.** Todo valor final es una cadena que, sin espacios al principio y al final, no queda vacía. Los objetos solo agrupan claves; un valor final que no sea cadena (número, booleano, `null`, lista) es un fallo.
  3. **Mismos marcadores.** Para cada clave, el conjunto de nombres de marcador `{{nombre}}` del texto en español es igual al del texto en inglés. Se comparan los nombres, no el orden ni cuántas veces aparecen.

  El mensaje de fallo nombra la clave y, en los puntos 1 y 2, el idioma. El 2026-11-13 los dos archivos tienen 55 claves cada uno y cumplen los tres puntos: la prueba nace en verde sin tocar ningún texto. Si al escribirla falla, no se corrige el texto: se anota la clave y se lleva a Fable. Nombre y ubicación del archivo de prueba: de implementación.
- Una prueba lee `wrangler.jsonc`, `public/_headers` y `.nvmrc` y comprueba los valores de las decisiones 4, 5 y 6 (en `wrangler.jsonc`: `name`, `workers_dev`, `preview_urls`, `assets.directory`, `assets.not_found_handling`, que `previews` existe y está vacío, y que no hay `main`; en `package.json`: que `wrangler` tiene versión exacta, 4.135.0 o superior), y que `dist/_headers` existe tras compilar se comprueba en la tarea de compilación.

## Risks / Trade-offs

- **El panel puede cambiar sin que el repositorio lo note.** Los ajustes se leyeron el 2026-11-13 y coinciden con la decisión 7. → La tarea 1.2 pide al usuario confirmar que siguen igual antes de tocar nada; una discrepancia se lleva a Fable.
- **El nombre del Worker debe coincidir.** Un `name` distinto rompe la compilación en Cloudflare. → Se comprueba con la vista previa de la rama antes de integrar.
- **Worker Previews es reciente.** La documentación da la forma de la dirección, pero no cómo se convierte un nombre de rama con barra (`feature/…`) en el nombre de la vista previa. → Los requisitos no fijan la dirección exacta; el usuario la lee en el panel o en el pull request.
- **La primera vista previa depende de dos cosas nuevas a la vez**, el bloque `previews` y la versión de Wrangler. → Si la compilación de la rama falla, la tarea 4.3 manda anotar el error y detenerse.
- **Recarga automática sin aviso.** Quien esté a mitad de un ejercicio en otra pestaña del tema pierde ese estado al recargar. Solo ocurre al abrir un tema o una demo nuevos tras una publicación, y la app no guarda progreso. Aceptado por el usuario.
- **Caché inmutable de un año.** Segura porque los nombres llevan huella del contenido; un archivo que cambia, cambia de nombre.
- **Publicar `rendimiento-movil` sin su prueba en iPhone.** Si este cambio llega a `main` antes de esa prueba, la versión no probada llega a producción. → El usuario hace la prueba en la vista previa (decisión 10) antes de integrar en `main`.

## Open Questions

Ninguna que cambie lo que se construye.
