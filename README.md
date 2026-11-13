# AI Engineer Path

Aplicación web estática de estudio para entrevistas: un "cerebro" 3D de conceptos de fondo, paneles de cristal y el contenido de las pistas (hoy, HTTP y REST) en español e inglés. Es una SPA hecha con Vite, React y TypeScript; no tiene backend ni base de datos.

## Requisitos

- Node.js 22.12 o superior (lo exige Vitest; Vite admite 20.19+) y npm.

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

## Despliegue estático

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
