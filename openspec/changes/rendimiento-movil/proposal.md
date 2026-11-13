# Proposal

## Why

La app está desplegada y en escritorio funciona bien, pero en iPhone no se puede usar: el lector no se desplaza con el dedo salvo empezando el gesto sobre un bloque de código, el teléfono se recalienta, la app tarda en mostrarse y responde a tirones. Hay que resolverlo antes de migrar la pista SQL, porque cada pista nueva añade nodos al cerebro y texto al lector.

De paso se simplifican los modos de fondo del lector: el modo "Sin fondo" quita legibilidad y el "Cristal" actual también; el usuario decidió dejar solo dos.

## What Changes

- **Desplazamiento del lector.** En tableta y teléfono el lector pasa a tener altura acotada y desplazamiento propio, como ya ocurre en escritorio. El texto se desplaza con el dedo desde cualquier punto del lector.
- **Lector en teléfono.** Un solo desplazamiento que lleva pista, título, resumen, contenido, botones anterior y siguiente y relacionados. Las pestañas quedan fijas arriba al desplazar y el botón de cerrar está siempre visible.
- **BREAKING — Modos de fondo del lector: de tres a dos.** Desaparecen "Sin fondo" y el "Cristal" actual. El nuevo "Cristal" es translúcido casi opaco (85 %) con desenfoque leve; el nuevo "Sólido" es totalmente opaco y sin desenfoque. Cristal sigue siendo el modo por defecto. Quien tuviera guardado cualquier modo anterior pasa a Cristal.
- **Teléfono siempre en Sólido.** En teléfono el lector es siempre opaco y el control de modo no se muestra.
- **Fondo quieto al leer en teléfono.** Con un tema abierto en teléfono, el cerebro y todo el fondo dejan de animarse y de redibujarse. Se reanudan al cerrar el tema.
- **Teléfono sin desenfoques.** La barra superior, la barra inferior, los resultados de búsqueda y los avisos pasan a un fondo casi opaco sin desenfoque. Las auroras del fondo quedan estáticas.
- **Cerebro más barato de dibujar**, en todos los tamaños: densidad de píxeles limitada a 2x, halos y sombras de nombres sin desenfoque calculado en cada cuadro. En teléfono, además, menos pulsos simultáneos. El aspecto debe ser equivalente al actual.
- **Sin animaciones perpetuas en el lector.** El botón "Siguiente" conserva su degradado, sin movimiento. El texto del lector pierde la sombra que solo servía para leer sobre el cerebro.
- **iOS.** La interfaz usa la altura visible real de la pantalla y respeta las zonas seguras (muesca, esquinas e indicador de inicio).

Fuera de este cambio: la configuración del hosting (se comprobó que el despliegue sirve los archivos comprimidos y desde caché; las cabeceras de caché de los archivos con huella se dejan para el cambio de despliegue), el peso de la descarga inicial (unos 140 KB de JavaScript comprimido; no explica la lentitud) y cualquier cambio de contenido.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `app-shell`: modos de fondo del lector (dos en lugar de tres, y siempre Sólido en teléfono), preferencias recordadas, desplazamiento táctil del lector, disposición del lector en teléfono, paneles sin desenfoque en teléfono, fondo quieto al leer en teléfono, altura visible y zonas seguras, y fin de las animaciones perpetuas del lector.
- `concept-graph`: el cerebro se detiene por completo con un tema abierto en teléfono, lleva menos pulsos en teléfono y limita su coste de dibujo sin cambiar de aspecto.

## Impact

- Código: `src/shell/` (Shell, Reader, Related, TopBar, BottomBar y sus estilos), `src/styles/` (tokens y global), `src/prefs/store.ts`, `src/graph/types.ts` y `src/graph/canvas-renderer/` (bucle, escena y componente), `src/locales/es.json` y `en.json`, `index.html`.
- Pruebas: las que nombran los tres modos (`src/test/app.test.tsx`, `src/shell/carousel.test.tsx`) cambian con el requisito.
- Preferencias guardadas en el navegador: cambia el conjunto de modos válidos; las guardadas con el formato anterior se convierten al cargar.
- Sin dependencias nuevas. Sin cambios en `content/` ni en los scripts de contenido.
- Verificación: parte del resultado solo puede comprobarse en un iPhone real; las tareas incluyen el guion de esa prueba, que ejecuta el usuario.
