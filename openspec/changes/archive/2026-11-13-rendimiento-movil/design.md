# Design

## Context

Motivación y alcance: ver `proposal.md`. Requisitos observables: ver `specs/`.

Estado de partida, verificado en el código el 2026-11-13 (rama `feature/rendimiento-movil`, creada desde `develop`):

- **Tramos de ancho.** Teléfono: 760 px o menos. Tableta: de 761 a 1080 px. Escritorio: más de 1080 px. Son los que ya usa `src/shell/Shell.tsx` (`isPhone`, `isDesktop`) y las hojas de estilo.
- **Desplazamiento.** En tableta y teléfono lo que se desplaza es `.stage` (`src/shell/Shell.module.css`), que tiene `pointer-events: none`; solo sus hijos aceptan toques. El lector y su zona `.scroll` pasan a `overflow: visible` (`src/shell/Reader.module.css`), de modo que el lector es tan alto como su contenido y se mueve entero.
- **Prueba del usuario en iPhone (2026-11-13).** En "Entender" el texto no se desplaza con el dedo; sí lo hace mientras se arrastra una selección de texto. En "En código" solo se desplaza si el gesto empieza sobre un bloque de código. Es coherente con la hipótesis: Safari de iOS no desplaza con el dedo un contenedor con `pointer-events: none`, y los `<pre>` funcionan porque tienen `overflow: auto` propio y encadenan el gesto. La hipótesis no se ha reproducido en un simulador (no hay ninguno en la máquina de trabajo).
- **Bucle del cerebro.** `src/graph/canvas-renderer/loop.ts` es continuo con las animaciones activas. Con un tema abierto se detienen la rotación y la deriva, pero los pulsos siguen (`CanvasRenderer.tsx`, `pulses: animate`), así que se dibuja un cuadro completo 60 veces por segundo aunque el lector tape el cerebro.
- **Coste del cuadro.** El canvas ocupa toda la pantalla a la densidad nativa del dispositivo (3x en iPhone). `scene.ts` usa `shadowBlur` en cada nodo de pista y de tema y en cada nombre, y crea un degradado lineal y otro radial por pulso y cuadro.
- **Desenfoques.** La clase `.glass` (`src/styles/global.css`) aplica `backdrop-filter` a la barra superior, el sidebar, la barra inferior, el lector, los relacionados, los resultados de búsqueda y el aviso. El lector lo mantiene en sus tres modos, también en el casi opaco. Las tres auroras del fondo llevan `filter: blur(110px)` y animación infinita.
- **Otros.** `text-shadow` de 10 px en todo el texto del lector; animación infinita `shimmer` en el botón "Siguiente"; `index.html` sin `viewport-fit`; alturas en `100%` y `vh`.
- **Despliegue.** Comprobado el 2026-11-13: los archivos se sirven comprimidos y desde la caché del CDN en unos 0,4 s. La lentitud en iPhone no es de red.

## Reglas de implementación

Fijadas por el usuario y no negociables:

- Estas especificaciones las define Fable 5.2; las implementa Opus 5.5.
- Quien implementa no toma decisiones de producto ni de diseño. Ante un vacío, una ambigüedad o una contradicción en estos artefactos, se detiene, informa exactamente qué falta (archivo y requisito o tarea) y deja la decisión para una sesión de definición con Fable 5.2. No rellena el hueco con un supuesto.
- No modifica `proposal.md`, `design.md` ni los archivos de `specs/`. En `tasks.md` solo marca casillas.
- Flujo de Git: `openspec/git-workflow.md`. Todo el cambio vive en `feature/rendimiento-movil`.
- Al retomar en otro contexto, el prompt de arranque está en `openspec/handoff-prompt.md`.

Margen de quien implementa: los nombres de clases, variables y funciones, y los valores numéricos internos que este documento marca expresamente como "de implementación". Todo lo demás está fijado aquí.

## Goals / Non-Goals

**Goals:**

- Que el lector se desplace con el dedo en iPhone y iPad desde cualquier punto de su contenido.
- Que leer un tema en teléfono no gaste procesador ni gráfica en el fondo.
- Que el cerebro, cuando se ve, cueste menos por cuadro en cualquier dispositivo, sin cambiar de aspecto.
- Dos modos de fondo del lector en lugar de tres.

**Non-Goals:**

- Reducir el peso de la descarga inicial o cambiar cómo se cargan las fuentes y el buscador.
- Configurar el hosting (cabeceras de caché); va en el cambio de despliegue.
- Cambiar el cerebro de canvas 2D a otra tecnología.
- Limitar los cuadros por segundo del cerebro cuando está a la vista.
- Tema claro, contenido o pistas nuevas.

## Decisions

Las decisiones 1 a 8 las tomó el usuario el 2026-11-13. Las decisiones 9 a 12 son propuestas de Fable que el usuario vio antes de crear la rama y no objetó. Las decisiones 13 a 15 son técnicas.

### 1. Dos modos de fondo del lector

Identificadores: `glass` y `solid`. El identificador `pure` desaparece.

| Modo | Nombre ES / EN | Fondo del lector | Desenfoque del fondo |
|---|---|---|---|
| `glass` | `◻ Cristal` / `◻ Glass` | `rgba(9, 10, 20, 0.85)` | `blur(14px)` |
| `solid` | `◼ Sólido` / `◼ Solid` | `rgb(9, 10, 20)` | ninguno (`backdrop-filter: none`) |

- `glass` es el modo por defecto.
- El control del lector alterna entre los dos y muestra el nombre del modo activo, como hoy.
- El velo sobre el cerebro con un tema abierto (`.scrim`) tiene opacidad `0.55` en los dos modos.
- La sombra de texto del lector (`text-shadow` en `.rhead` y `.rbody`) se elimina en los dos modos.
- En `src/styles/tokens.css`: `--glass-reader` pasa a `rgba(9, 10, 20, 0.85)`, `--glass-blur-reader` pasa a `blur(14px)` y `--glass-reader-none` se elimina. `--glass-strong` no se toca (lo usa una prueba de la hoja de temas); el lector deja de usarlo.
- En `src/locales/es.json` y `en.json` se eliminan las claves `reader.mode.pure`; el resto de textos del modo no cambia.

Alternativas descartadas por el usuario: conservar el Sólido de hoy tal cual (90 % con desenfoque de 36 px, que paga el desenfoque completo para un efecto que casi no se ve) y 90 % sin desenfoque.

### 2. En teléfono el lector es siempre Sólido

En teléfono el modo efectivo es `solid`, sea cual sea la preferencia guardada, y el control de modo no se muestra. La preferencia guardada no se modifica: al volver a un ancho mayor, el lector usa de nuevo el modo guardado. El atributo `data-reader-mode` de la raíz lleva el modo efectivo.

En tableta y escritorio el control se muestra y los dos modos están disponibles.

### 3. Preferencia de modo guardada con el formato anterior

Un valor guardado antes de este cambio no puede interpretarse por su nombre: el `solid` anterior tenía el aspecto del `glass` nuevo. Regla: lo guardado en `localStorage` lleva un campo `v` con valor `2`. Al cargar:

- Si lo guardado no tiene `v: 2`, el modo del lector es `glass`, valga lo que valga `readerMode`. El resto de preferencias (idioma, sidebar, animaciones) se leen como hoy.
- Si tiene `v: 2`, `readerMode` se acepta si es `glass` o `solid`; cualquier otro valor da `glass`.

Al guardar siempre se escribe `v: 2`. El campo `v` es del formato guardado, no forma parte del tipo `Prefs` que usa la aplicación.

### 4. El lector se desplaza por dentro en tableta y teléfono

`.stage` deja de ser un contenedor con desplazamiento en cualquier ancho. El lector tiene el alto de su contenido hasta, como máximo, el alto disponible del escenario, y lo que se desplaza es una zona interior del lector que sí acepta toques. Esa zona lleva `overscroll-behavior: contain`.

- **Escritorio:** sin cambios. Cabecera fija, contenido desplazable, botones anterior y siguiente fijos abajo, relacionados en panel lateral.
- **Tableta:** cabecera fija (pista, frecuencia, control de modo, cerrar, título, resumen y pestañas) y botones anterior y siguiente fijos abajo, como en escritorio. La zona desplazable contiene el contenido de la pestaña y, a continuación, los relacionados.
- **Teléfono:** decisión 5.

Los relacionados que van dentro del lector (tableta y teléfono) no son un panel de cristal: sin fondo propio, sin desenfoque y sin sombra, separados del contenido por una línea superior `1px solid var(--edge-soft)`.

Al abrir otro tema, la zona desplazable vuelve al inicio. En escritorio y tableta, al cambiar de pestaña también.

Alternativa descartada: quitar `pointer-events: none` de `.stage` y dejarlo como contenedor de desplazamiento. Bloquearía los toques sobre el cerebro en los márgenes y seguiría moviendo el panel entero, con su sombra, en cada cuadro del desplazamiento.

### 5. Disposición del lector en teléfono

Un único desplazamiento que contiene, en este orden: fila de pista y frecuencia, título, resumen, pestañas, contenido de la pestaña, botones anterior y siguiente, relacionados.

- Las pestañas son adhesivas: al desplazar quedan fijas en el borde superior del lector, con fondo `rgb(9, 10, 20)` y la línea inferior que ya tienen.
- El botón de cerrar está anclado a la esquina superior derecha del lector, fuera de la zona desplazable, y es visible en todo momento. La fila de pista y frecuencia y la fila de pestañas reservan a la derecha el espacio del botón (48 px) para no quedar debajo de él.
- Al cambiar de pestaña: si las pestañas están fijas arriba, el contenido nuevo se muestra desde su inicio, justo debajo de ellas; si no lo están, la posición de desplazamiento no cambia.

Alternativas descartadas por el usuario: toda la cabecera fija (ocupa cerca de un tercio de la pantalla) y nada fijo.

### 6. Fondo quieto con un tema abierto en teléfono

Con un tema abierto en teléfono no se dibuja ningún cuadro del cerebro y no corre ninguna animación del fondo. Palabras del usuario: "Toda animación del fondo debe detenerse completamente para evitar que haya re-renderizaciones".

- El contrato del cerebro (`src/graph/types.ts`, `BrainProps`) gana el campo `paused: boolean`. `Shell` lo pone a `true` cuando es teléfono y hay un tema abierto.
- Con `paused` a `true`, el renderizador no programa cuadros: ni pulsos, ni transiciones de resaltado, ni redibujos por cambio de foco, de nombres o de tema. El cerebro queda como imagen fija con el último cuadro dibujado. El arrastre y el pellizco sobre el cerebro no lo mueven; el toque sigue funcionando como hoy (abrir un nodo, cerrar el lector al tocar el vacío).
- Única excepción: si cambia el tamaño del canvas (giro del teléfono), se dibuja un solo cuadro para no dejarlo en blanco.
- Al pasar `paused` a `false`, el bucle se reanuda con el estado vigente (foco, resaltado y animaciones según el control de animaciones).
- Las transiciones de un solo uso de los paneles (entrada del lector, aparición escalonada del contenido) se mantienen; lo prohibido son las animaciones perpetuas y el redibujo continuo.

En escritorio y tableta, con un tema abierto el cerebro sigue como hoy: sin rotación ni deriva, con pulsos, en los dos modos de fondo.

Alternativa descartada por el usuario: seguir con pulsos a pocos cuadros por segundo.

### 7. Teléfono sin desenfoques

En teléfono ningún elemento usa `backdrop-filter`.

- Los paneles de cristal (clase `.glass`: barra superior, barra inferior, resultados de búsqueda, aviso) usan el fondo `rgba(9, 10, 20, 0.92)`, definido como token nuevo `--glass-phone` en `src/styles/tokens.css`. Borde, radio y sombra no cambian.
- El lector sigue la decisión 2 (opaco).
- Las tres auroras quedan estáticas: sin animación y sin `filter`. Su degradado ya se funde a transparente en el borde.

### 8. Menos pulsos en teléfono

En teléfono, con nada resaltado, llevan pulso una de cada seis conexiones (hoy, una de cada tres). Las conexiones resaltadas llevan pulso siempre, como hoy. En tableta y escritorio no cambia.

El contrato del cerebro gana el campo `compact: boolean`, que `Shell` pone a `true` en teléfono. El renderizador no consulta el ancho de la pantalla por su cuenta.

### 9. Botón "Siguiente" sin brillo animado

El botón conserva el degradado y la sombra actuales, sin animación, en todos los tamaños. Se eliminan la animación `shimmer` y su `@keyframes`; `background-size` vuelve a `100% 100%`.

### 10. Densidad del canvas limitada a 2x

El canvas del cerebro se dimensiona con `min(devicePixelRatio, 2)` en todos los dispositivos.

### 11. Halos y sombras de nombres sin `shadowBlur`

`scene.ts` deja de usar `shadowBlur`.

- **Halo de nodos** (pistas, temas y nodo enfocado): imagen de resplandor generada una vez por color en un canvas auxiliar y dibujada con `drawImage` bajo el nodo, escalada al radio que tenía el halo.
- **Halo de la cabeza del pulso:** la misma técnica, una imagen por color modulada con `globalAlpha`, en lugar de un degradado radial nuevo por pulso y cuadro. La cola del pulso conserva su degradado lineal.
- **Nombres:** contorno oscuro con `strokeText` (color `rgba(4, 5, 10, 0.85)`, grosor 3, uniones redondeadas) dibujado antes del relleno, en lugar de sombra.

Los tamaños y perfiles de las imágenes de resplandor son de implementación. El criterio de aceptación es que el cerebro se vea equivalente al actual: mismos colores, nodos más frecuentes más grandes, pistas con más resplandor que los temas, nodo enfocado destacado, nombres legibles sobre nodos y conexiones. Lo confirma el usuario en la tarea de comparación visual.

### 12. Altura visible y zonas seguras de iOS

- `index.html`: el `viewport` añade `viewport-fit=cover`.
- `html`, `body` y `#root` usan `100dvh` de alto, con `100%` como valor de respaldo para navegadores sin `dvh`. La hoja de temas de teléfono usa `52dvh` de alto máximo, con `52vh` de respaldo.
- Tokens nuevos en `src/styles/tokens.css`: `--safe-top`, `--safe-right`, `--safe-bottom` y `--safe-left`, cada uno con `env(safe-area-inset-…, 0px)`.
- Todo elemento fijo anclado a un borde de la pantalla suma al margen de ese borde su zona segura: barra superior (arriba, izquierda y derecha), sidebar (arriba, izquierda y abajo), escenario del lector (los cuatro bordes que use), barra inferior (abajo, izquierda y derecha), ayuda de gestos y aviso. El canvas del cerebro, las auroras y el velo siguen ocupando toda la pantalla.

### 13. El renderizador sigue detrás del contrato

`paused` y `compact` son parte de `BrainProps`; cualquier implementación futura del cerebro debe respetarlos. `Shell` es quien decide sus valores a partir del tramo de ancho y de si hay un tema abierto.

### 14. Pruebas automáticas y lo que no pueden cubrir

El entorno de pruebas (jsdom) no desplaza, no compone desenfoques y no mide rendimiento. Se cubre con pruebas automáticas: los modos y su alternancia, la conversión de preferencias guardadas, que el control de modo no exista en teléfono, el modo efectivo en teléfono, los valores `paused` y `compact` que recibe el cerebro, que el bucle no programe cuadros en pausa y sí uno al cambiar de tamaño, la densidad máxima, la proporción de pulsos, y, leyendo las hojas de estilo como ya hacen las pruebas existentes, que `.stage` no declare desplazamiento, que en teléfono no quede ningún `backdrop-filter` activo y que no queden animaciones `infinite` fuera de las auroras.

El desplazamiento táctil, el calor, la fluidez y la carga se comprueban en un iPhone real con el guion de la decisión 15.

### 15. Guion de prueba en iPhone

Lo ejecuta el usuario, con la app servida desde su ordenador en la misma red Wi-Fi o desde el despliegue; elige él. Cada punto se responde con sí o no.

1. **Carga.** Con la pestaña cerrada y abierta de nuevo, ¿la interfaz y el cerebro aparecen en menos de 2 segundos?
2. **Entender.** En un tema largo, ¿el texto se desplaza arrastrando desde un párrafo, desde un recuadro y desde el título?
3. **En código.** ¿Se desplaza arrastrando desde un párrafo y también desde un bloque de código? ¿Un bloque de código ancho se desplaza en horizontal sin mover la página?
4. **Practicar y En la entrevista.** ¿Se desplazan igual?
5. **Pestañas fijas.** Al bajar, ¿las pestañas quedan arriba y el botón de cerrar sigue visible? ¿Cambiar de pestaña estando abajo muestra el contenido nuevo desde su inicio?
6. **Final del tema.** ¿Se llega a los botones anterior y siguiente y a los relacionados, y nada queda tapado por la barra inferior ni por el indicador de inicio?
7. **Modo.** ¿El lector es opaco y no aparece el control Cristal / Sólido?
8. **Fondo quieto.** Con un tema abierto, ¿el cerebro de los márgenes está inmóvil? Al cerrar el tema, ¿vuelve a moverse?
9. **Fluidez.** Sin tema abierto, ¿el cerebro gira con el dedo y responde al pellizco sin tirones?
10. **Calor.** Tras 10 minutos leyendo y cambiando de tema, ¿el teléfono sigue sin calentarse de forma apreciable?
11. **Giro.** Al girar el teléfono con un tema abierto, ¿el lector se recoloca y el fondo no queda en blanco?
12. **iPad**, si hay uno a mano: ¿el lector se desplaza con el dedo, con la cabecera fija?

Un "no" en cualquiera de los puntos 1 a 11 se anota con lo observado y se lleva a una sesión de definición con Fable 5.2; quien implementa no improvisa una corrección fuera de estas decisiones.

### 16. Versión

Este cambio lleva el tag `v0.2.1` (decidido por el usuario el 2026-11-13): corrige lo ya publicado y no figura en el plan numerado, así que no consume número. La pista SQL conserva `v0.3.0`. Está recogido en `openspec/git-workflow.md`. El tag se crea en `main` tras integrar el cambio, cuando el usuario lo pida.

## Risks / Trade-offs

- **La causa del desplazamiento roto no se ha reproducido en un simulador.** La prueba del usuario es coherente con la hipótesis, y la solución (desplazamiento propio en un elemento que acepta toques) es la misma disposición que ya funciona en escritorio. → Se confirma en el punto 2 del guion; si falla, se detiene y se informa.
- **La pantalla negra al entrar no tiene causa confirmada.** No es de red. La explicación probable es el coste del primer cuadro del cerebro y de los desenfoques, que este cambio reduce. → Se mide en el punto 1 del guion; si persiste, se define aparte.
- **Equivalencia visual del cerebro.** Cambiar sombras calculadas por imágenes y contornos altera ligeramente el resplandor y el borde de los nombres. → Comparación visual con capturas antes y después, que aprueba el usuario.
- **Cristal al 85 % con 14 px no se ha visto todavía.** Lo eligió el usuario sobre la descripción. → Se muestra en la tarea de comparación visual; un ajuste de esos dos valores es una decisión de Fable con el usuario.
- **Imagen fija en los márgenes del teléfono.** Con un tema abierto, el cerebro visible en los 14 px de margen no refleja el tema recién abierto hasta cerrar el lector. Aceptado por el usuario a cambio de cero redibujos.
- **BREAKING para preferencias guardadas.** Quien tenía un modo elegido vuelve a Cristal una vez. Es deliberado (decisión 3).

## Open Questions

Ninguna que cambie lo que se construye.
