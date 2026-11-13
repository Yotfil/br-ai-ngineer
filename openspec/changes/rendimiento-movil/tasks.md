# Tasks

## 1. Punto de partida

- [x] 1.1 Comprobar que la rama es `feature/rendimiento-movil` y que `npm run typecheck`, `npm test` y `npm run build` están en verde antes de tocar nada; verificar anotando el número de pruebas que pasan
- [x] 1.2 Antes de modificar el cerebro, guardar capturas de referencia en escritorio (1440 px de ancho) de la app actual: vista general sin tema abierto, cursor sobre un tema, una pista desplegada y un tema abierto en cada uno de los tres modos actuales; verificar que quedan guardadas fuera del repositorio y decirle al usuario la ruta

## 2. Modos del lector y preferencias

- [x] 2.1 Reducir los modos a `glass` y `solid` con los fondos, el desenfoque, el velo y los tokens de design.md decisión 1, y quitar la sombra de texto del lector; verificar con pruebas los escenarios "Cambiar de modo", "Volver a Cristal" y "Solo dos modos" de specs/app-shell, y leyendo las hojas de estilo que `solid` declara `backdrop-filter: none` y que no queda `text-shadow` en `.rhead` ni en `.rbody`
- [x] 2.2 Eliminar las claves `reader.mode.pure` de `src/locales/es.json` y `en.json`; verificar que la prueba de paridad de textos entre idiomas sigue en verde y que ninguna referencia a `pure` queda en `src/`
- [x] 2.3 Aplicar la conversión de preferencias guardadas de design.md decisión 3 (campo `v: 2`); verificar con pruebas el escenario "Preferencia guardada con los tres modos anteriores", un caso por cada modo antiguo, y que un valor guardado con `v: 2` y `readerMode: "solid"` se conserva
- [x] 2.4 En teléfono, usar `solid` como modo efectivo y no mostrar el control de modo, sin modificar la preferencia guardada (design.md decisión 2); verificar con pruebas los escenarios "Teléfono" y "Volver a un ancho mayor"
- [x] 2.5 Actualizar las pruebas existentes que nombran los tres modos (`src/test/app.test.tsx`, `src/shell/carousel.test.tsx`) para que reflejen los dos modos y el escenario "Hoja de temas legible" modificado; verificar que `npm test` pasa completo

## 3. Desplazamiento y disposición del lector

- [x] 3.1 Quitar el desplazamiento de `.stage` en todos los anchos y dar al lector altura acotada con zona desplazable interior en tableta y teléfono (design.md decisión 4), con `overscroll-behavior: contain`; verificar leyendo las hojas de estilo en una prueba que `.stage` no declara `overflow` desplazable y que la zona desplazable del lector no tiene `pointer-events: none`
- [x] 3.2 Tableta: cabecera y botones anterior y siguiente fijos, y relacionados al final de la zona desplazable como sección sin cristal (design.md decisión 4); verificar con una prueba el orden de los elementos y, en el navegador a 900 px de ancho, el escenario "Tema largo en tableta"
- [x] 3.3 Teléfono: desplazamiento único con el orden, las pestañas adhesivas y el botón de cerrar anclado de design.md decisión 5; verificar con una prueba el orden de los elementos dentro de la zona desplazable y, en el navegador a 375 px de ancho, los escenarios "Pestañas fijas al desplazar" y "Final del tema"
- [x] 3.4 Posición de desplazamiento al abrir otro tema y al cambiar de pestaña, según design.md decisiones 4 y 5; verificar con pruebas los escenarios "Abrir otro tema", "Cambiar de pestaña a mitad de lectura" y "Cambiar de pestaña sin haber desplazado"
- [x] 3.5 Comprobar en el navegador, a 375 px, 900 px y 1440 px de ancho, que no hay desplazamiento horizontal de la página en ninguna pestaña de un tema con bloques de código anchos y que el escritorio se ve como antes; verificar con una captura por ancho

## 4. Teléfono sin desenfoques, animaciones del lector y zonas seguras

- [x] 4.1 En teléfono, quitar `backdrop-filter` de todos los elementos, aplicar el token `--glass-phone` a los paneles de cristal y dejar las auroras estáticas (design.md decisión 7); verificar con pruebas que leen las hojas de estilo que dentro del tramo de teléfono no queda ningún `backdrop-filter` activo ni animación en las auroras, y con el escenario "Teléfono sin desenfoques"
- [x] 4.2 Quitar la animación del botón "Siguiente" (design.md decisión 9); verificar con una prueba que no queda ninguna animación `infinite` en las hojas de estilo fuera de las auroras, y en el navegador que el botón conserva el degradado
- [x] 4.3 Añadir `viewport-fit=cover`, las alturas con `dvh` y su respaldo, y los tokens de zona segura aplicados a todos los elementos fijos (design.md decisión 12); verificar con una prueba que lee `index.html` y las hojas de estilo, y en el navegador de escritorio que los márgenes de los paneles no cambian (escenario "Dispositivo sin zonas seguras")

## 5. Cerebro

- [x] 5.1 Añadir `paused` y `compact` al contrato del cerebro y hacer que `Shell` los calcule (design.md decisiones 6, 8 y 13); verificar con pruebas que el cerebro recibe `paused: true` solo en teléfono con un tema abierto y `compact: true` solo en teléfono
- [x] 5.2 Con `paused`, no programar cuadros, ignorar arrastre y pellizco, conservar el toque, dibujar un solo cuadro al cambiar de tamaño y reanudar al salir de la pausa (design.md decisión 6); verificar con pruebas del bucle los escenarios "Tema abierto en teléfono", "Cambiar de tema en teléfono", "Girar el teléfono con un tema abierto" y "Cerrar el tema en teléfono" de specs/concept-graph
- [x] 5.3 Limitar la densidad del canvas a `min(devicePixelRatio, 2)` (design.md decisión 10); verificar con pruebas los escenarios "Pantalla de densidad 3x" y "Pantalla de densidad 1x"
- [x] 5.4 Con `compact`, pulso en una de cada seis conexiones en reposo y en todas las resaltadas (design.md decisión 8); verificar con una prueba que cuenta los pulsos dibujados con `compact` y sin él
- [x] 5.5 Sustituir `shadowBlur` por imágenes de resplandor reutilizadas y contorno de texto (design.md decisión 11); verificar con una prueba que el dibujo de un cuadro no asigna `shadowBlur` ni crea degradados radiales, y que las imágenes de resplandor se generan una vez por color y no en cada cuadro
- [ ] 5.6 Repetir las capturas de la tarea 1.2 con el cerebro nuevo y los dos modos nuevos, y entregárselas al usuario junto a las de referencia; verificar que el usuario confirma el escenario "Aspecto equivalente" y el aspecto de Cristal y Sólido. Si pide ajustes, detenerse: es una decisión para Fable 5.2

## 6. Verificación de conjunto

- [x] 6.1 Ejecutar `npm run typecheck`, `npm test`, `npm run lint` y `npm run build`; verificar que los cuatro terminan en verde y anotar el número de pruebas
- [x] 6.2 Recorrer en el navegador de escritorio, con el tamaño de teléfono (375 × 812), el flujo completo: abrir un tema desde la barra inferior, las cuatro pestañas, tema siguiente, relacionados, cerrar; verificar que no hay errores en la consola y que con un tema abierto no se solicitan cuadros de animación
- [x] 6.3 Preparar la prueba en iPhone: indicarle al usuario cómo abrir la app desde su teléfono (servidor local en la misma red Wi-Fi o despliegue, lo que él elija) y entregarle el guion de 12 puntos de design.md decisión 15; verificar que el usuario tiene la dirección y el guion
- [ ] 6.4 Registrar las respuestas del usuario a los 12 puntos del guion; verificar que los puntos 1 a 11 son "sí". Ante cualquier "no", anotar lo observado, detenerse y dejar la decisión para una sesión con Fable 5.2
