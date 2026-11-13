# Design

## Context

Motivación y alcance: ver `proposal.md`. Requisitos observables: ver `specs/`.

Estado de partida, verificado el 2026-11-13 (rama `feature/despliegue-automatico`, creada desde `develop`):

- **Despliegue actual.** El usuario conectó el repositorio `Yotfil/br-ai-ngineer` desde el panel de Cloudflare (Workers Builds). El Worker se llama `br-ai-ngineer` y responde en `https://br-ai-ngineer.jefryeguevarav.workers.dev`. Fable no tiene acceso al panel: los ajustes que hay allí no se han visto.
- **Qué sirve hoy.** La versión de `main` (anterior a `rendimiento-movil`). El push de `rendimiento-movil` a `develop` no cambió producción, lo que es coherente con que la rama de producción sea `main`. Las direcciones de la app (`/es/rest/…`) devuelven la página principal con estado 200, es decir, el modo de aplicación de una sola página ya está activo por algún ajuste que no está en el repositorio.
- **Cabeceras.** Todos los archivos, también los de `/assets/` con huella en el nombre, llegan con `Cache-Control: public, max-age=0, must-revalidate`. Llegan comprimidos.
- **Archivo inexistente.** Pedir un archivo de `/assets/` que no existe devuelve la página principal con estado 200, no un 404. Es el comportamiento documentado del modo de aplicación de una sola página.
- **Repositorio.** No hay configuración de Wrangler, ni `public/_headers`, ni `.nvmrc`. `wrangler` no está en `package.json`. Node local: 24.17. El `README.md` pide Node 22.12 o superior.
- **Rama por defecto en GitHub.** `openspec/git-workflow.md` fija `develop` como rama por defecto. Según la documentación de Cloudflare, Workers Builds toma por defecto la rama por defecto del repositorio como rama de producción, así que el ajuste del panel debe decir `main` de forma explícita.
- **Carga de temas y demos.** Los temas se cargan bajo demanda (`loadTopic` en `src/data/content.ts`, con `import.meta.glob` diferido) y las tres demos con `lazy` (`src/demos/registry.ts`). `src/shell/Reader.tsx` no trata el fallo de carga de un tema: el lector se queda con el título y el contenido vacíos. Una demo que falla al cargar no tiene quien recoja el error.
- **`rendimiento-movil`.** Está integrado en `develop` con 23 de 25 tareas y sin archivar: faltan la comparación visual y la prueba en iPhone, que hace el usuario. Esta rama nace de `develop`, así que lo incluye.

Documentación de Cloudflare consultada el 2026-11-13: Workers Builds (configuración, ramas, imagen de compilación), recursos estáticos (cabeceras, aplicación de una sola página) y vistas previas.

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

Las decisiones 1 a 3 las tomó el usuario el 2026-11-13. Las demás son técnicas o propuestas de Fable derivadas de ellas.

### 1. Producción desde `main`, vista previa del resto de ramas

Cada push a `main` publica producción. Cada push a cualquier otra rama (`develop`, `feature/*`, `chore/*`) genera una vista previa con dirección propia en `workers.dev`, sin tocar producción. Alternativas descartadas por el usuario: vista previa solo de `develop`, y ninguna vista previa.

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
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

- `name` debe coincidir con el Worker del panel; si no coincide, la compilación de Cloudflare falla.
- Sin `main`: no hay código de Worker.
- `wrangler` se añade a `devDependencies` con la última versión estable de la serie 4, fijada a una versión exacta (sin `^`). Workers Builds usa la versión de Wrangler del `package.json`.
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

Los aplica y confirma el usuario en el Worker `br-ai-ngineer`, sección Settings → Build:

| Ajuste | Valor |
|---|---|
| Rama de producción | `main` |
| Comando de compilación | `npm run build` |
| Comando de despliegue | `npx wrangler deploy` |
| Compilaciones de ramas que no son producción | activadas |
| Comando de vista previa | el que el panel proponga por defecto (`npx wrangler preview` o `npx wrangler versions upload`) |
| Directorio raíz | la raíz del repositorio |

Sin variables ni secretos de compilación. Estos ajustes se documentan en el `README.md` (decisión 8) porque no pueden versionarse.

Si el panel muestra opciones que no encajan con esta tabla, quien implementa no decide: se anota lo que se ve y se lleva a Fable.

### 8. Documentación

El `README.md` gana una sección "Despliegue" con: dónde está publicada la app, qué rama publica producción y cuáles generan vista previa, los archivos del repositorio que lo configuran, la tabla de ajustes del panel de la decisión 7, y cómo encontrar la dirección de una vista previa (panel del Worker, y comentario en el pull request si Cloudflare lo publica). La línea de requisitos del `README.md` menciona `.nvmrc`.

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
- Una prueba lee `wrangler.jsonc`, `public/_headers` y `.nvmrc` y comprueba los valores de las decisiones 4, 5 y 6, y que `dist/_headers` existe tras compilar se comprueba en la tarea de compilación.

## Risks / Trade-offs

- **Fable no ha visto el panel.** Los ajustes actuales se deducen del comportamiento del sitio. → La tarea 1.2 pide al usuario leerlos antes de cambiar nada; una discrepancia con la decisión 7 se lleva a Fable.
- **El nombre del Worker debe coincidir.** Un `name` distinto rompe la compilación en Cloudflare. → Se comprueba con la vista previa de la rama antes de integrar.
- **El comando de vista previa por defecto es reciente y su formato de dirección no está documentado con detalle.** → No se fija un formato de dirección en los requisitos; el usuario lee la dirección en el panel.
- **Recarga automática sin aviso.** Quien esté a mitad de un ejercicio en otra pestaña del tema pierde ese estado al recargar. Solo ocurre al abrir un tema o una demo nuevos tras una publicación, y la app no guarda progreso. Aceptado por el usuario.
- **Caché inmutable de un año.** Segura porque los nombres llevan huella del contenido; un archivo que cambia, cambia de nombre.
- **Publicar `rendimiento-movil` sin su prueba en iPhone.** Si este cambio llega a `main` antes de esa prueba, la versión no probada llega a producción. → El usuario hace la prueba en la vista previa (decisión 10) antes de integrar en `main`.

## Open Questions

Ninguna que cambie lo que se construye.
