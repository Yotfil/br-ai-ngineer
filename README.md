# AI Engineer Path

Aplicación web estática de estudio para entrevistas: un "cerebro" 3D de conceptos de fondo, paneles de cristal y el contenido de las pistas (hoy, HTTP y REST) en español e inglés. Es una SPA hecha con Vite, React y TypeScript; no tiene backend ni base de datos.

## Requisitos

- Node.js 22.12 o superior (lo exige Vitest; Vite admite 20.19+) y npm. La versión con la que se compila al publicar está en `.nvmrc` (24).

## Comandos

Todos se ejecutan dentro de esta carpeta (`ai-engineer-path/`).

```bash
npm install
```

Instala las dependencias.

```bash
npm run dev
```

Compila el contenido y arranca el servidor de desarrollo en `http://localhost:5173` (si el puerto está ocupado, Vite usa el siguiente libre y lo indica en la consola). Mientras está en marcha, cualquier cambio en `content/` vuelve a compilar el contenido y recarga la página.

```bash
npm run content
```

Valida `content/` y genera `src/generated/` (grafo, índices de búsqueda y temas). Falla con un mensaje que nombra el archivo o el tema si algo no cuadra. `dev`, `build` y `test` lo ejecutan solos.

```bash
npm run build
```

Compila el contenido, comprueba los tipos y genera la versión estática en `dist/`.

```bash
npm run preview
```

Sirve `dist/` en `http://localhost:4173` (o el siguiente puerto libre que indique la consola) para revisar la versión compilada, incluidas las rutas directas como `/es/rest/cors`.

```bash
npm test
```

Ejecuta todas las pruebas (Vitest con jsdom).

```bash
npm run typecheck
```

Comprueba los tipos de la aplicación y de los scripts.

```bash
npm run lint
```

Ejecuta oxlint. Incluye la regla que impide importar `src/graph/canvas-renderer/` desde fuera de `src/graph/`.

## Contenido

Cómo está organizado el contenido y cómo añadir un tema o una pista: [`content/README.md`](content/README.md).

## Despliegue

La app está publicada en Cloudflare Workers, en el Worker `br-ai-ngineer`, conectado al repositorio `Yotfil/br-ai-ngineer` de GitHub (Workers Builds). Producción: <https://br-ai-ngineer.jefryeguevarav.workers.dev>. Cloudflare compila y publica solo con cada push; no hay que ejecutar nada a mano.

### Qué rama publica qué

- **`main` publica producción.** Cada push a `main` compila y publica la versión de producción. Si la compilación falla, producción sigue sirviendo la última versión publicada.
- **El resto de ramas generan una vista previa** (`develop`, `feature/*`, `chore/*`): cada push compila la rama y la publica en una dirección propia de `workers.dev`, sin tocar producción. Las vistas previas son públicas para quien tenga la dirección.

### Archivos que lo configuran

| Archivo | Qué fija |
|---|---|
| `wrangler.jsonc` | Nombre del Worker (`br-ai-ngineer`, debe coincidir con el del panel), carpeta publicada (`dist/`), modo de aplicación de una sola página (toda ruta que no es un archivo devuelve `index.html` con estado 200), direcciones `workers.dev` de producción y de vistas previas, y el bloque `previews` que exige `npx wrangler preview` |
| `package.json` | Versión exacta de Wrangler (4.135.0 o superior, necesaria para las vistas previas); Workers Builds usa esa versión |
| `.nvmrc` | Versión de Node de la compilación (24) |
| `public/_headers` | Caché de un año e inmutable para `/assets/*` (archivos con huella en el nombre). La página principal y el resto de archivos conservan la cabecera por defecto de Cloudflare (`max-age=0, must-revalidate`), para que una versión nueva se vea en la siguiente visita |

### Ajustes del panel de Cloudflare

No pueden versionarse: hay que mantenerlos en el panel del Worker `br-ai-ngineer` con estos valores.

Settings → Builds, pestaña **Production**:

| Ajuste | Valor |
|---|---|
| Git repository | `Yotfil/br-ai-ngineer` |
| Production branch | `main` |
| Disable builds | desactivado |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Build watch paths | Include paths: `*`. Exclude paths: `node_modules/**, .git/` |
| API token | `br-ai-ngineer build token` (el que generó Cloudflare; aquí solo se anota el nombre, nunca el valor) |
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

Domains → **Worker URL** (estos dos también los fija `wrangler.jsonc`, que es quien manda):

| Ajuste | Valor |
|---|---|
| Production, `br-ai-ngineer.jefryeguevarav.workers.dev` | activado |
| Preview, `*-br-ai-ngineer.jefryeguevarav.workers.dev` | activado |

Sin dominios propios ni rutas.

### Dirección de una vista previa

Cada rama tiene una vista previa propia cuya dirección no cambia entre un push y el siguiente. Tiene la forma `<nombre>-br-ai-ngineer.jefryeguevarav.workers.dev`, donde Cloudflare deriva `<nombre>` del nombre de la rama. La dirección exacta se lee en el panel del Worker (la compilación de la rama la muestra al terminar) y, si Cloudflare lo publica, en el comentario que deja en el pull request.

### Otro hosting

`npm run build` deja en `dist/` todo lo necesario; se puede subir a cualquier hosting de archivos estáticos. Hay un único requisito:

- **Redirigir a `index.html` toda ruta que no sea un archivo existente** (respondiendo con estado 200). La aplicación usa rutas propias como `/es/rest/cors`; sin esa redirección, abrir un enlace directo o recargar la página en un tema devuelve 404.

No hace falta ninguna variable de entorno ni servidor de aplicación.

## Estructura

```
content/            # pistas y temas en Markdown y YAML (ver content/README.md)
scripts/            # compilación de contenido (build-content.ts) y migración de un solo uso
src/
  content/model.ts  # tipos compartidos entre la compilación y la app
  data/             # acceso a los datos generados
  graph/            # cerebro: contrato (types.ts), punto de montaje (Brain.tsx) y renderizador en canvas
  search/           # índice MiniSearch y buscador
  shell/            # barra superior, sidebar, lector, relacionados, barra inferior
  demos/            # demos interactivas registradas por id
  locales/          # textos de interfaz en es y en
  styles/           # tokens y estilos globales
  generated/        # salida de `npm run content` (no se versiona)
```
