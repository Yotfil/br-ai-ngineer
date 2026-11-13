# Proposal

## Why

El usuario desplegó la app por adelantado en Cloudflare conectando el repositorio de GitHub desde el panel. Funciona, pero toda la configuración vive solo en el panel: en el repositorio no hay ningún archivo que diga cómo se publica, los archivos con huella se revalidan en cada visita, y las ramas que no son `main` no se pueden probar en un teléfono antes de integrarlas. Además, al publicarse sola cada versión, quien tenga la app abierta durante una publicación no podrá abrir temas hasta recargar a mano.

Este cambio deja el despliegue reproducible desde el repositorio y cubre ese caso. No es el despliegue final del plan (punto 10, `v1.0.0`): el nombre del producto, el dominio y una posible función de servidor para la IA siguen para entonces.

## What Changes

- **Configuración del despliegue en el repositorio.** Archivo de configuración de Wrangler con el nombre del Worker, la carpeta de salida y el modo de aplicación de una sola página; versión de Wrangler fijada en el proyecto; versión de Node declarada.
- **Publicación automática.** Cada push a `main` publica producción. Cada push a cualquier otra rama genera una vista previa con dirección propia, que no afecta a producción.
- **Caché de archivos con huella.** Los archivos de `/assets/` se sirven con caché de larga duración e inmutable. La página principal se sigue revalidando en cada visita.
- **Recuperación ante una versión nueva.** Si un tema o una demo no se pueden cargar porque se publicó una versión nueva mientras la app estaba abierta, la app se recarga sola una vez y abre ese mismo tema. Si no se pueden cargar por otra causa (por ejemplo, sin conexión), el lector muestra un aviso con un botón para reintentar; hoy se queda vacío sin explicación.
- **Documentación.** El `README.md` explica cómo se publica y qué ajustes del panel de Cloudflare hay que mantener.

Fuera de este cambio: nombre del producto, dominio propio, `release/*` y `hotfix/*`, funciones de servidor, protección de las vistas previas con acceso restringido, y cualquier cambio de contenido.

## Capabilities

### New Capabilities

- `deployment`: cómo se publica la aplicación: producción desde `main`, vistas previas del resto de ramas, direcciones compartibles servidas por el hosting y caché de los archivos estáticos.

### Modified Capabilities

- `app-shell`: el lector se recupera solo cuando hay una versión nueva publicada y, si un tema o una demo no cargan por otra causa, lo dice y ofrece reintentar.
- `localization`: los textos de la interfaz tienen las mismas claves, no vacías y con los mismos marcadores, en ambos idiomas, y una prueba lo comprueba. Añadido el 2026-11-13: este cambio incorpora textos nuevos y esa comprobación no existía.

## Impact

- Archivos nuevos en la raíz: configuración de Wrangler, `.nvmrc`; en `public/`: `_headers`.
- `package.json`: Wrangler como dependencia de desarrollo. Es la única dependencia nueva.
- Código: `src/data/content.ts`, `src/demos/registry.ts`, `src/shell/Reader.tsx` y sus estilos, `src/locales/es.json` y `en.json`.
- `.gitignore` y `README.md`.
- Panel de Cloudflare (Worker `br-ai-ngineer`): rama de producción, comandos y vistas previas. Lo ajusta el usuario; nadie más tiene acceso.
- Las vistas previas son públicas para quien tenga la dirección.
- Verificación: la publicación real solo puede comprobarse con un push; las tareas indican qué comprueba quien implementa y qué confirma el usuario en el panel.
