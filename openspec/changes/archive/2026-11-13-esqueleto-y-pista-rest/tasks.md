# Tasks

## 1. Base del proyecto

- [x] 1.1 Inicializar Git en la raíz (el usuario ya lo autorizó; no hacer commits sin que los pida) con un `.gitignore` (node_modules, dist, `ai-engineer-path/src/generated`, `.DS_Store`); verificar que `git status` lista los HTML originales y `mockups/` como sin seguimiento y nada dentro de las rutas ignoradas
- [x] 1.2 Crear `ai-engineer-path/` con Vite + React + TypeScript en modo estricto; verificar que `npm run dev` sirve la página inicial y `npm run build` termina sin errores
- [x] 1.3 Instalar dependencias (react-router-dom, react-i18next, i18next, minisearch, zod, gray-matter, yaml, d3-force-3d, shiki, un conversor de Markdown, @fontsource/inter, @fontsource/jetbrains-mono, vitest, @testing-library/react, jsdom); verificar que `npm ls` no reporta dependencias faltantes
- [x] 1.4 Configurar Vitest con jsdom y los scripts `test`, `content` y `typecheck`; verificar que `npm test` ejecuta una prueba de humo y `npm run typecheck` pasa

## 2. Modelo y compilación de contenido

- [x] 2.1 Definir los esquemas Zod de `tracks.yaml`, `meta.yaml` y del archivo por idioma (frontmatter y secciones obligatorias) según design.md decisión 2; incluyendo `abbr` de pista, pistas sin temas y grupos de ejercicios `choice` y `verdict`; verificar con pruebas que un tema válido pasa, que un tema sin ejercicios pasa, que una pista sin temas pasa y que cada campo obligatorio ausente produce un error que nombra el archivo
- [x] 2.2 Implementar el lector de contenido que recorre `ai-engineer-path/content/` y separa el cuerpo Markdown en secciones por clave; verificar con pruebas sobre contenido de ejemplo que devuelve las cinco secciones obligatorias, que acepta como opcionales `code:wire`, `code:server`, el par `bad`/`good` y `bridge:typescript`, y que rechaza `bad` sin `good` y un `code:<tipo>` no registrado
- [x] 2.3 Implementar las validaciones cruzadas: concepto único, relaciones existentes (metadatos y enlaces `[[id]]`), y paridad de secciones y conceptos entre idiomas; verificar con una prueba por cada caso de fallo que el mensaje nombra tema e identificador
- [x] 2.4 Convertir Markdown a HTML con resaltado de Shiki para python, http, json, bash y typescript, eligiendo el lenguaje de cada bloque con la regla de design.md decisión 2; verificar con una prueba que un bloque de código sale con marcas de resaltado y que el HTML del texto queda saneado
- [x] 2.5 Generar `graph.json` con nodos, enlaces de las tres fuentes y posiciones calculadas con d3-force-3d con semilla fija; incluyendo como nodos sin hijos las pistas sin temas; verificar con pruebas que dos ejecuciones producen el mismo archivo, que un concepto relacionado desde dos temas aparece como un solo nodo y que una pista sin temas produce un nodo marcado como vacío
- [x] 2.6 Generar `search.<locale>.json` y `topics/<locale>/<id>.json` en `ai-engineer-path/src/generated/`; verificar que `npm run content` crea los archivos esperados para el contenido de ejemplo
- [x] 2.7 Encadenar `content` antes de `dev` y `build`, con relanzado al cambiar archivos de contenido en desarrollo; verificar que editar un `es.md` con el servidor en marcha actualiza el tema en el navegador
- [x] 2.8 Escribir `ai-engineer-path/content/README.md` con el formato de un tema, las claves de sección y los pasos para añadir un tema o una pista; verificar siguiéndolo al pie de la letra para crear un tema de prueba que aparece en cerebro, buscador y sidebar, y luego eliminarlo

## 3. Estilos base e internacionalización

- [x] 3.1 Pasar los valores de `mockups/ui-v2.html` a `src/styles/tokens.css` (colores por pista, receta de cristal, radios, curvas, tipografías autoalojadas) y los estilos globales con auroras de fondo; verificar en el navegador que el fondo coincide con la maqueta y que no se pide nada a Google Fonts
- [x] 3.2 Configurar react-i18next con `src/locales/es.json` y `en.json` y el idioma tomado de la ruta; verificar con una prueba que un componente muestra el rótulo correcto en cada idioma
- [x] 3.3 Implementar las rutas `/:locale` y `/:locale/:track/:topic`, y la redirección de `/` según preferencia guardada, idioma del navegador o español; verificar con pruebas los escenarios de "Idioma inicial" de specs/localization
- [x] 3.4 Implementar el almacén de preferencias (idioma, modo del lector, sidebar, animaciones) sobre `localStorage` con acceso protegido; verificar con pruebas que persiste los cuatro valores y que devuelve los valores por defecto cuando `localStorage` lanza un error

## 4. Cerebro

- [x] 4.0 Definir en `src/graph/types.ts` el contrato del cerebro (datos, foco, estado de animaciones, eventos `onNodeHover`, `onNodeOpen`, `onBackgroundClick`) y el punto de montaje `src/graph/Brain.tsx` según design.md decisión 4, con una regla de lint que prohíba importar `src/graph/canvas-renderer/` desde fuera de `src/graph/`; verificar que una importación de prueba desde otra carpeta hace fallar el lint y que el contrato no menciona canvas, cámara ni coordenadas
- [x] 4.1 Portar a `src/graph/canvas-renderer/` la cámara y la proyección de la maqueta como funciones puras tipadas; verificar con pruebas que un nodo más lejano se proyecta más pequeño y que rotar 360° devuelve las posiciones iniciales
- [x] 4.2 Implementar la selección del nodo bajo el cursor, prefiriendo el más cercano a la cámara; verificar con pruebas sobre dos nodos superpuestos
- [x] 4.3 Implementar el dibujo en canvas (conexiones, nodos con halo, anillo de pistas, nombres según cercanía) leyendo `graph.json`; verificar en el navegador contra la maqueta que colores, tamaños por frecuencia y nombres de pista coinciden
- [x] 4.4 Implementar los pulsos con cabeza, halo y cola en una de cada tres conexiones y en todas las resaltadas; verificar en el navegador que se ven como en la maqueta
- [x] 4.5 Implementar la interacción (arrastrar para girar, Mayús + arrastrar para desplazar, rueda con límites, distinción entre clic y arrastre); verificar a mano cada gesto de specs/concept-graph "Navegación en tres dimensiones"
- [x] 4.6 Implementar fuera del renderizador el cálculo del conjunto resaltado a partir del foco (cursor, selección, resultados de búsqueda, cursor sobre el sidebar) y, dentro del renderizador, su transición gradual; verificar con una prueba que el conjunto resaltado de un tema incluye sus conceptos y relacionados, y en el navegador que la transición es gradual
- [x] 4.7 Implementar rotación automática lenta con sus pausas, la pausa total con la pestaña oculta y el estado de animaciones detenidas con dibujo bajo demanda; verificar con una prueba que con animaciones detenidas no se programa un nuevo cuadro sin interacción, y en el navegador que el grafo queda quieto, sigue siendo navegable y con un tema abierto no gira
- [x] 4.9 Implementar los gestos táctiles (un dedo gira, dos dedos pellizcan y desplazan, toque abre) sin que la página se desplace; verificar con pruebas el cálculo de zoom a partir de dos punteros y en el navegador con emulación táctil los escenarios de "Navegación táctil"
- [x] 4.8 Montar el cerebro como componente de fondo persistente y conectar los eventos del contrato con la navegación (tema, concepto → tema hogar, pista → sidebar, vacío → cerrar); verificar a mano los escenarios de "Abrir desde el grafo" y, con una prueba, que la aplicación funciona con un renderizador falso que cumple el contrato

## 5. Paneles

- [x] 5.1 Construir la barra superior de cristal con botón de contraer, marca, espacio del buscador y selector de idioma; verificar en el navegador contra la maqueta, sin controles de modos de estudio ni de progreso
- [x] 5.2 Construir el sidebar con pistas desplegables animadas, estado contraído a iconos y marca del tema actual; con la abreviatura de la pista como icono y las pistas sin temas atenuadas y no desplegables; verificar con pruebas los escenarios de "Sidebar de pistas colapsable" y el de sidebar de "Pistas próximamente"
- [x] 5.3 Construir el lector con cabecera, pestañas (Practicar solo si el tema tiene ejercicios o demo), bloques de cada pestaña en el orden de design.md decisión 2, carga bajo demanda del tema, botones anterior y siguiente, y cierre por botón y Escape; verificar con pruebas los escenarios de "Lector central"
- [x] 5.4 Implementar el aviso de tema no encontrado para direcciones inexistentes; verificar con una prueba que una ruta inválida muestra el aviso sin lector
- [x] 5.5 Construir el panel de relacionados con conceptos del tema y temas relacionados; verificar con una prueba que hacer clic en un relacionado cambia el tema y actualiza el panel
- [x] 5.6 Implementar el selector de tres modos del lector (Cristal por defecto, Sin fondo, Sólido) con el velo sobre el cerebro y persistencia; verificar con una prueba que el modo elegido se conserva al recargar y en el navegador que los bloques de código mantienen su fondo en los tres
- [x] 5.7 Implementar los grupos de ejercicios con su enunciado, de tipo opción múltiple y de tipo veredicto, con respuesta inmediata y sin guardar; verificar con pruebas los escenarios de "Ejercicios con respuesta inmediata" y de "Contenido de la pestaña Practicar"
- [x] 5.8 Añadir las transiciones de entrada, salida y cambio de contenido, y anularlas con movimiento reducido; verificar en el navegador en ambos modos
- [x] 5.9 Implementar los tres tramos de diseño adaptable (escritorio, tableta, teléfono) con transición entre ellos; verificar a 375, 820 y 1280 px de ancho que no hay desplazamiento horizontal, que los relacionados quedan debajo del lector en los dos primeros y que estrechar la ventana no pierde el tema abierto
- [x] 5.10 Construir la barra inferior de teléfono con el carrusel circular de pistas (desplazamiento nativo con ajuste al centro, tres copias con reubicación al asentarse, escala interpolada por distancia al centro); verificar con pruebas el cálculo de la pista centrada y la reubicación, y en el navegador a 375 px que se puede dar la vuelta completa en ambos sentidos sin salto
- [x] 5.11 Conectar el carrusel con la selección: centrar resalta la pista en el cerebro, tocar una lateral la centra, tocar la centrada abre la hoja de temas (o "Próximamente" si la pista no tiene temas) y un tema abierto centra su pista; verificar con pruebas los escenarios de "Barra inferior de pistas en teléfono" y el de carrusel de "Pistas próximamente"
- [x] 5.12 Implementar el control "Detener animaciones" en la barra superior, con su estado global persistido y su valor inicial según la preferencia de movimiento reducido, y pausar las auroras con él; verificar con pruebas los escenarios de "Control de animaciones" y en el navegador que el fondo queda quieto

## 6. Buscador

- [x] 6.1 Construir el índice MiniSearch por idioma con pesos, prefijo, tolerancia y normalización de tildes, incluyendo los alias del otro idioma; verificar con pruebas los escenarios de "Búsqueda tolerante" y "Resultados instantáneos"
- [x] 6.2 Construir el campo con lista de resultados, navegación con flechas, Enter y Escape, y el atajo Ctrl/Cmd+K; verificar con pruebas los escenarios de "Abrir un resultado" y "Atajo de teclado"
- [x] 6.3 Conectar los resultados visibles con el resaltado del cerebro; verificar en el navegador que al escribir se iluminan los nodos y al borrar vuelve al estado anterior

## 7. Pista HTTP y REST

- [x] 7.1 Crear `ai-engineer-path/content/tracks.yaml` con las cinco pistas de `content-map.md` (id, abbr, color, orden, nombres); verificar que `npm run content` las valida y que las cuatro sin temas quedan marcadas como vacías en `graph.json`
- [x] 7.2 Escribir un script de un solo uso que extraiga los 20 temas del arreglo `T` de `API Rest/Guía HTTP y REST.html` a carpetas de tema, usando los ids, el orden, la frecuencia y la demo de `content-map.md` y la correspondencia de campos de design.md decisión 2 (incluidos `raw` → `code:wire`, `py` → `code:server`, `ex` → grupo `choice` con su enunciado y `review` → grupo `verdict`), convirtiendo el HTML incrustado a Markdown; verificar que se crean 20 carpetas con los ids del mapa, que los temas 1, 2, 7, 12, 13 y 19 no tienen `bad`/`good`, que solo los temas 4, 5, 6, 9 y 15 tienen ejercicios, y que `npm run content` las valida salvo por el inglés ausente
- [x] 7.3 Redactar el `summary` de cada tema con la regla de design.md decisión 2 y revisar a mano que cada sección quedó en su clave; verificar que ningún resumen supera 140 caracteres ni contiene HTML y, abriendo los 20 temas en el navegador, que el contenido coincide con la guía original
- [x] 7.4 Reescribir los 20 puentes con la tabla de design.md decisión 14 y, en los temas 2, 6, 7 y 20, usar literalmente los textos fijados al final de esa decisión, en español e inglés; verificar con una búsqueda que ningún `es.md` ni `en.md` contiene "Angular", "RxJS", "HttpClient", "interceptor", "MatPaginator", "ng serve", "DomSanitizer", "subscribe" ni "PENDIENTE", y que `scripts/migrate/rest-es.ts` ya no tiene marcas `PENDIENTE`
- [x] 7.5 Declarar en cada tema los conceptos, alias y relaciones exactamente como figuran en `content-map.md`, omitiendo y anotando para el resumen final los conceptos que el texto del tema no mencione; verificar que `npm run content` pasa las validaciones cruzadas y que el cerebro muestra conexiones entre temas de REST
- [x] 7.6 Traducir los 20 temas a `en.md` con las mismas secciones, conceptos y ejercicios, usando los nombres en inglés de `content-map.md`; verificar que `npm run content` pasa la validación de paridad y que se cumplen los escenarios de "Búsqueda tolerante" de specs/concept-search
- [x] 7.7 Portar a React las demos `idempotency-retry`, `status-explorer` y `token-bucket` (originales `idem`, `status` y `ratelimit`), registradas por id y cargadas bajo demanda, en ambos idiomas; verificar en el navegador que cada una funciona como en la guía original, que los temas 5, 6 y 18 las muestran y que un tema sin ejercicios ni demo no muestra la pestaña Practicar

## 8. Integración y entrega

- [x] 8.1 Recorrer en el navegador el flujo completo en español e inglés (buscar, abrir desde resultado, saltar por relacionados, cambiar de idioma con un tema abierto, atrás y adelante, abrir un enlace directo); verificar que la consola no muestra errores
- [x] 8.2 Comparar la aplicación con `mockups/ui-v2.html` lado a lado y corregir diferencias visibles de cristal, tipografía, halos y movimiento; verificar con capturas de ambas
- [x] 8.3 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin errores y que `npm run preview` sirve la versión compilada con rutas directas funcionando
- [x] 8.4 Escribir `ai-engineer-path/README.md` con los comandos de desarrollo, compilación y los requisitos de despliegue estático (redirección de rutas a `index.html`); verificar que los comandos documentados funcionan tal como están escritos

## 9. Cierre de vacíos (definidos el 2026-11-13)

- [x] 9.1 Presentar los enlaces `[[id]]` del texto como enlaces con el título o nombre del destino en el idioma activo, que abren su tema, según design.md decisión 16; verificar con pruebas los escenarios de "Enlaces a otros temas dentro del texto" de specs/app-shell y el escenario "Enlace en el texto crea conexión" de specs/content-model
- [x] 9.2 Sustituir en el contenido las dos referencias por número ("(tema 10)" en el puente de `metodos-http` y "(tema 17)" en `problem` de `metodos-seguros-idempotentes`) por los enlaces indicados en design.md decisión 16, en `es.md` y `en.md`; verificar con una búsqueda que ningún archivo de `content/` contiene "(tema " ni "(topic " seguido de un número y que `npm run content` pasa
- [x] 9.3 Añadir al índice de búsqueda de cada idioma, como alias de cada tema, su título en el otro idioma, según design.md decisión 17; verificar con una prueba el escenario "Título de un tema en el otro idioma" de specs/concept-search
- [x] 9.4 Implementar la línea de ayuda de gestos según design.md decisión 18, con sus textos en los archivos de traducción; verificar con pruebas los escenarios de "Ayuda de gestos del cerebro" y, en el navegador a 1280 px y a 375 px, que se ve en el primero y no en el segundo
- [x] 9.5 Quitar el efecto de cristal de la hoja de temas de teléfono y darle el fondo casi opaco de design.md decisión 19, sin tocar la barra inferior; verificar en el navegador a 375 px, con el lector en cada uno de los tres modos, que la hoja es opaca y los temas se leen, y con una prueba el escenario "Hoja de temas legible"
- [x] 9.6 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin errores
