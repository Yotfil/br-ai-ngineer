# Tasks

## 1. Modelo y compilación de contenido

- [x] 1.1 Añadir al esquema los grupos de pista (`groups` en `tracks.yaml`, `group` en `meta.yaml`) con las validaciones de design.md decisión 5; verificar con una prueba por cada caso de fallo (grupo inexistente, tema sin grupo, tema con grupo en pista sin grupos, grupo partido, grupos fuera de orden) que el mensaje nombra el tema o el grupo, y que la pista REST sigue validando sin grupos
- [x] 1.2 Añadir el campo opcional `short` al frontmatter (máximo 32 caracteres, sin HTML, paridad entre idiomas) y llevarlo a los datos generados de cada tema; verificar con pruebas los escenarios de "Título corto opcional" de specs/content-model
- [x] 1.3 Registrar la sección `code:example` (opcional, primera de la pestaña En código, valla con lenguaje obligatorio, uno o más bloques) y su rótulo en `src/locales/es.json` y `en.json` con los textos de design.md decisión 2; verificar con pruebas los escenarios de "Ejemplo principal opcional"
- [x] 1.4 Aplicar la regla de lenguaje de design.md decisión 2 (la valla con lenguaje manda; sin lenguaje, regla vigente) y añadir el lenguaje `text` con alias `txt`; antes de tocar nada, guardar una copia de `src/generated/topics/` de REST, y después verificar con una comparación que la salida generada de los 20 temas de REST es idéntica, además de las pruebas de "Lenguaje declarado por bloque de código"; si la salida de REST cambia, detenerse y reportar qué bloques
- [x] 1.5 Ampliar los ejercicios: campo opcional `code` en los ítems de `choice` y nuevo tipo `classify` con sus validaciones y su regla de paridad (design.md decisión 6); verificar con pruebas los escenarios "Opción múltiple con código", "Ejercicio de clasificación" y "Categoría inexistente"
- [x] 1.6 Actualizar `content/README.md` con los grupos, el título corto, `code:example`, las notas en `bad` y `good`, la regla de lenguaje, `text`, `code` en `choice` y el tipo `classify`; verificar siguiéndolo para crear un tema de prueba con todo ello en una pista de prueba con grupos, comprobar que compila, y eliminarlo

## 2. Interfaz

- [x] 2.1 Mostrar los subtítulos de grupo en el sidebar expandido y en la hoja de temas de teléfono, con el estilo indicado en design.md decisión 5; verificar con pruebas los escenarios de "Subtítulos de grupo en las listas de temas" usando una pista de prueba con grupos y otra sin ellos
- [x] 2.2 Usar el título corto en las filas del sidebar y de la hoja de temas, con el título completo como ayuda al pasar el cursor, y mantener el título completo en lector, buscador, relacionados, enlaces y botones anterior y siguiente; verificar con pruebas los escenarios de "Título corto en las listas de temas"
- [x] 2.3 Usar el título corto como nombre del nodo de tema en el cerebro, pasando por el contrato de `src/graph/types.ts` sin exponer detalles del renderizador; verificar con una prueba los escenarios de "Título corto en los nombres del cerebro"
- [x] 2.4 Mostrar en la pestaña En código el ejemplo principal en primer lugar y la nota bajo el código del ejemplo riesgoso y del correcto; verificar con pruebas los escenarios de "Ejemplo principal en la pestaña En código" y "Nota bajo el ejemplo riesgoso y el correcto"
- [x] 2.5 Mostrar el bloque de código de un ítem de opción múltiple entre el enunciado y las opciones, e implementar la presentación del ejercicio de clasificación; verificar con pruebas los escenarios de "Presentación del ejercicio de clasificación" y "Opción múltiple con código"

## 3. Pista Python y FastAPI

- [x] 3.1 Añadir a la pista `python` de `tracks.yaml` los dos grupos de `content-map.md`; verificar que `npm run content` valida
- [x] 3.2 Escribir `scripts/migrate/migrate-python.ts` y `python-map.ts` para extraer del arreglo `TOPICS` de `legacy/Python y FastAPI para entrevistas.html` los 21 temas (todos menos el `id` 11) a `content/python/`, con los ids, orden, grupo y frecuencia de `content-map.md`, la correspondencia de campos de design.md decisión 1, las vallas de la decisión 2 y la conversión de ejercicios de la decisión 6; verificar que se crean 21 carpetas con los ids del mapa, que ninguna corresponde al tema 11, que ningún `meta.yaml` tiene `demo`, que los temas 20 y 22 de la guía tienen un bloque `text`, y que `npm run content` valida salvo por el inglés ausente
- [x] 3.3 Añadir en `python-es.ts` el `summary` de cada tema (regla de design.md decisión 1) y el título corto de `content-map.md`, y renombrar el tema de autenticación; verificar que ningún resumen supera 140 caracteres ni contiene HTML, que ningún título corto supera 32 caracteres y, abriendo los 21 temas en el navegador, que el contenido coincide con la guía original
- [x] 3.4 Aplicar literalmente los textos de `rewrites.md` (puentes, frases fuera del puente y el ejercicio reescrito); verificar con una búsqueda, excluyendo los bloques de código, que ningún `es.md` de `content/python/` contiene "Angular", "NestJS", "RxJS", "HttpClient", "interceptor", "TestBed", "ng serve" ni "proxy.conf", y detenerse y reportar cualquier coincidencia
- [x] 3.5 Declarar en cada tema los conceptos, alias y relaciones exactamente como figuran en `content-map.md`, omitiendo y anotando para el resumen final los conceptos que el texto del tema no mencione; verificar que `npm run content` pasa las validaciones cruzadas, que ningún concepto de REST se declara de nuevo y que en el cerebro el tema de autenticación de Python queda conectado con el concepto JWT de REST
- [x] 3.6 Traducir los 21 temas a `en.md` con las mismas secciones, conceptos, grupos de ejercicios y títulos cortos, usando los nombres en inglés de `content-map.md` y traduciendo de forma directa los textos de `rewrites.md`; verificar que `npm run content` pasa la validación de paridad, que buscar "decorator" con la interfaz en español encuentra el tema "Decoradores", y con la misma búsqueda del punto 3.4 que ningún `en.md` menciona esos frameworks

## 4. Ejercicios trasladados a REST

- [x] 4.1 Añadir a `content/rest/metodos-seguros-idempotentes` el grupo de clasificación y a `content/rest/codigos-de-estado` los dos ítems de códigos de estado, como indica `content-map.md`, en `es.md` y `en.md`; verificar que `npm run content` pasa la paridad y, en el navegador, que ambos temas muestran los ejercicios nuevos y los responden bien

## 6. Ajustes definidos el 2026-11-13 (hacer antes del grupo 5)

- [x] 6.1 Rellenar en `scripts/migrate/python-map.ts` los nombres y alias de `try-except` y `async-await` y restablecer el `related` hacia `async-await` de `endpoints-async-vs-sync`, según `content-map.md`; fijar el `summary` de `estructuras-de-datos` con el texto de `rewrites.md` en ambos idiomas; volver a ejecutar la migración; verificar que los dos conceptos aparecen en el buscador en ambos idiomas, que buscar "async await" los encuentra y que el resumen del tema es el fijado
- [x] 6.2 Hacer que una valla con un lenguaje no admitido sea un error de validación (design.md decisión 11); verificar con una prueba el escenario "Lenguaje no admitido" y que `npm run content` sigue pasando con el contenido actual
- [x] 6.3 Presentar las categorías del ejercicio de clasificación en fila, como botones compactos que pasan de línea (design.md decisión 11), sin cambiar las opciones de opción múltiple ni de veredicto; verificar con una prueba el escenario "Categorías en fila" y, en el navegador a 1280 px y a 375 px, que se ven en fila y que no hay desplazamiento horizontal
- [x] 6.4 Hacer totalmente opaca la hoja de temas de teléfono sin modificar `--glass-strong` (design.md decisión 12); verificar en el navegador a 375 px, con un tema abierto y el lector en cada uno de los tres modos, que nada se transparenta bajo la hoja, y con una prueba el escenario "Hoja sobre un tema abierto"

## 5. Integración

- [x] 5.1 Recorrer en el navegador, en español e inglés: desplegar la pista Python con sus dos subtítulos, abrir un tema de cada grupo, comprobar las cuatro pestañas, responder un ejercicio de cada tipo, saltar a un tema de REST desde el panel de relacionados y volver; repetir a 375 px con la hoja de temas; verificar que la consola no muestra errores
- [x] 5.2 Comprobar en el cerebro que la pista Python aparece con su color pleno y sus temas, que SQL, Git y POO siguen como "Próximamente" y que los nombres de tema usan el título corto; verificar con una captura
- [x] 5.3 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin errores
