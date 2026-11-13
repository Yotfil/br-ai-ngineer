# Design

## Context

Motivación y alcance: ver `proposal.md`. Requisitos observables: ver `specs/`.

Estado actual relevante:

- `API Rest/Guía HTTP y REST.html` contiene 20 temas en un arreglo JS (`T`), cada uno con los campos `t` (título), `f` (frecuencia: `casi`, `seguido`, `aveces`), `def`, `ana`, `raw`, `py`, `prob`, `bad`, `good`, `bridge`, `myths[]`, `ans`, `demo` y `ex[]`. Los valores son cadenas con HTML incrustado.
- Las demos son funciones que escriben `innerHTML`; no son reutilizables tal cual en React.
- `mockups/ui-v2.html` es la referencia visual aprobada: paleta, cristal, tipografías (Inter y JetBrains Mono), cerebro 3D en canvas 2D con proyección en perspectiva, pulsos con cola y los tres modos del lector.
- No hay repositorio Git, ni `package.json`, ni especificaciones previas.
- El usuario domina React y TypeScript. Hay poco tiempo: se prioriza ver algo funcionando.

## Reglas de implementación

Fijadas por el usuario y no negociables:

- Estas especificaciones las define Fable 5.2; las implementa Opus 5.5.
- Quien implementa no toma decisiones de producto ni de diseño. Ante un vacío, una ambigüedad o una contradicción en estos artefactos, se detiene, informa exactamente qué falta (archivo y requisito o tarea) y deja la decisión para una sesión de definición con Fable 5.2. No rellena el hueco con un supuesto.
- Al retomar en otro contexto, el prompt de arranque está en `openspec/handoff-prompt.md`.

## Goals / Non-Goals

**Goals:**

- Un esqueleto que soporte las cinco pistas sin rediseño, validado con una pista real.
- Añadir contenido sin tocar código: un tema nuevo aparece solo en cerebro, buscador y sidebar.
- Reproducir fielmente la estética aprobada en la maqueta.
- Todo estático: sin servidor, sin base de datos.

**Non-Goals:**

- Portar las 20 demos de REST. Solo tres, para fijar el patrón.
- Conexiones por semejanza semántica (embeddings), IA, progreso, tema claro.
- El "Simulacro de entrevista" final de la guía original (arreglos `OPEN` y `MCQ`: preguntas abiertas y test de opción múltiple). Decidido por el usuario: se migra más adelante, con el modo Simulacro. En este cambio no se migra ni se le crea pantalla; los ejercicios por tema (`ex`) y las respuestas modelo (`ans`) sí entran.
- Navegación del cerebro por teclado. Todo lo alcanzable en el cerebro también lo es por sidebar y buscador.

## Decisions

### 1. Aplicación de una sola página con Vite + React + TypeScript, en `ai-engineer-path/`

El cerebro vive siempre de fondo y los paneles flotan encima; el lienzo debe persistir entre vistas. Eso es una SPA.

- *Alternativa:* Astro. Mejor para sitios de lectura, pero mantener un canvas vivo entre páginas exige trucos de persistencia.
- *Alternativa:* Next.js. Aporta servidor y SSR que no se necesitan.
- La app va en la carpeta `ai-engineer-path/` (nombre elegido por el usuario) para no mezclar `package.json` y `node_modules` con las carpetas de estudio existentes.

### 2. Contenido: una carpeta por tema, metadatos compartidos y un archivo por idioma

```
ai-engineer-path/content/
  tracks.yaml                     # id, color, orden, nombre por idioma
  rest/
    idempotencia/
      meta.yaml                   # lo que NO se traduce
      es.md                       # lo que se traduce
      en.md
```

`tracks.yaml`: por pista, `id`, `abbr` (dos letras mayúsculas; es el "icono" de la pista en el sidebar contraído, el carrusel y los resultados), `color`, `order` y `name` por idioma. Los valores de las cinco pistas están en `content-map.md`. Una pista declarada sin temas es una pista "Próximamente" (decisión 15).

`meta.yaml` (compartido entre idiomas): `id`, `track`, `order`, `freq` (`always` | `often` | `sometimes`), `concepts[]` (ids de los conceptos cuyo hogar es este tema), `related[]` (ids de temas o conceptos), `demo` (id opcional).

`es.md` / `en.md`: frontmatter con `title`, `summary`, `concepts` (por id: `name` y `aliases[]`) y `exercises[]` (puede faltar o ir vacío); cuerpo en Markdown con secciones delimitadas por encabezados de nivel 2 con claves fijas en inglés. Los rótulos visibles salen de los archivos de traducción, no del contenido.

| Clave de sección | Obligatoria | Origen en la guía REST | Rótulo ES | Pestaña |
|---|---|---|---|---|
| `definition` | sí | `def` | (sin rótulo; párrafo inicial) | Entender |
| `analogy` | sí | `ana` | Analogía | Entender |
| `problem` | sí | `prob` | Qué problema resuelve | Entender |
| `code:wire` | no | `raw` | Así viaja por la red | En código |
| `code:server` | no | `py` | Del lado del servidor (FastAPI) | En código |
| `bad` y `good` | no, pero van juntas | `bad`, `good` | Riesgoso / Correcto | En código |
| `bridge:typescript` | no | `bridge`, reescrito (decisión 14) | Puente con el frontend (TypeScript) | En código |
| `interview` | sí | `ans` | Para decir en la entrevista | En la entrevista |
| `myths` | sí | `myths[]` | Malentendidos comunes | En la entrevista |

Reglas:

- El orden dentro de cada pestaña es el de la tabla.
- `bad` sin `good`, o al revés, es un error de validación.
- `code:<tipo>` es extensible: otras pistas podrán registrar tipos nuevos añadiendo su rótulo a las traducciones. En este cambio solo existen `wire` y `server`; cualquier otro es un error de validación.
- `code:server` muestra FastAPI como ilustración dentro de REST. No convierte a estos temas en hogar de conceptos de FastAPI.
- Lenguaje de resaltado: `code:server` es `python`. En `code:wire`, `bad` y `good`, el bloque es `python` si contiene `def `, `@app.` o `import `, y `http` en caso contrario.
- `summary` no existe en la guía; se redacta al migrar: una sola oración, sin HTML, de 140 caracteres como máximo, condensando la primera oración de `def` sin añadir información.
- `bridge:<tecnología>` hoy solo admite `typescript`.

Ejercicios. `exercises[]` es una lista de grupos; cada grupo tiene `type`, `prompt` (enunciado del grupo) e `items[]`:

- `type: choice` — cada ítem: `q`, `options[]`, `answer` (índice) y `why`. Origen: campo `ex`. El `prompt` es el que usa la guía: "¿Qué código de estado devuelve este caso?" si la primera opción de todos los ítems es un número de tres cifras; "¿Qué método o respuesta corresponde?" en caso contrario.
- `type: verdict` — cada ítem: `statement`, `ok` (booleano) y `why`. El usuario elige entre "Está bien" y "Tiene un error" (rótulos de interfaz). Origen: campo `review` del tema 15, con el `prompt` "Revisa este diseño: ¿cada endpoint está bien o tiene un error?".

La pestaña Practicar existe solo si el tema tiene al menos un grupo de ejercicios o una demo registrada; si no, el lector muestra tres pestañas.

Los identificadores de temas y conceptos, las relaciones, los alias y la correspondencia de demos de la pista REST están fijados en `content-map.md`.

- *Por qué metadatos separados:* la estructura del grafo no puede divergir entre idiomas.
- *Por qué claves fijas en los encabezados:* el analizador no depende del idioma y la validación puede exigir secciones.
- *Por qué `bad`/`good` opcionales (decidido por el usuario):* seis temas descriptivos de la guía no los tienen y forzarlos daría ejemplos artificiales.
- *Alternativa:* un JSON por tema con cadenas Markdown. Más fácil de analizar, incómodo de escribir y revisar.
- *Alternativa:* MDX. Permite componentes dentro del texto, pero abre la puerta a contenido no estructurado y complica la traducción.

### 3. Paso de compilación de contenido

Un script de Node (`ai-engineer-path/scripts/build-content.ts`), ejecutado antes de `vite dev` y `vite build`, que:

1. Lee y valida todo con Zod. Falla con un mensaje que nombra el archivo si: falta un idioma, falta una sección obligatoria, un `related` apunta a un id inexistente, o un id de concepto aparece en `concepts` de más de un tema.
2. Resalta el código con Shiki y convierte el Markdown a HTML en tiempo de compilación.
3. Genera en `ai-engineer-path/src/generated/` (ignorado por Git):
   - `graph.json`: nodos (`id`, `type`, `track`, `parent`, `freq`, posición `x,y,z`) y enlaces (`source`, `target`, `kind`).
   - `search.<locale>.json`: documentos para el índice.
   - `topics/<locale>/<id>.json`: contenido de cada tema, cargado bajo demanda.

Enlaces del grafo, de tres fuentes: jerarquía (pista → tema → concepto), `related` explícito, y enlaces `[[id]]` dentro del texto. Las posiciones se calculan aquí con `d3-force-3d`, con semilla fija para que el resultado sea estable entre compilaciones.

- *Por qué en compilación:* el navegador no tiene que simular nada; el cerebro aparece ya asentado.
- *Alternativa:* un plugin de Vite. Más integrado, pero un script aparte es más simple de probar; en desarrollo se relanza con un observador de archivos.

### 4. Cerebro: renderizador propio en canvas 2D con proyección 3D

Se porta el renderizador de `mockups/ui-v2.html` a un módulo tipado (`src/graph/`), separado en: estado de cámara (rotación, desplazamiento, zoom), proyección, dibujo y selección de nodo bajo el cursor. React solo lo monta y le pasa el foco actual.

**Desacople obligatorio.** El renderizador debe poder retirarse y sustituirse por una librería sin tocar el resto de la aplicación:

- Todo su código vive en una sola carpeta (`src/graph/canvas-renderer/`) y nada fuera de ella importa sus archivos internos.
- El resto de la aplicación solo conoce un contrato (`src/graph/types.ts`): recibe los datos del grafo (`graph.json`), el foco actual (nodo señalado, nodo seleccionado, conjunto de coincidencias de búsqueda) y el estado de animaciones; emite eventos de alto nivel (`onNodeHover`, `onNodeOpen`, `onBackgroundClick`). El contrato no expone canvas, cámara ni coordenadas.
- Un único punto de montaje (`src/graph/Brain.tsx`) elige la implementación. Sustituirla es escribir otro adaptador que cumpla el contrato y cambiar esa importación.
- Las posiciones precalculadas en `graph.json` son una sugerencia que el adaptador puede ignorar (una librería con simulación propia no las necesita).
- El resaltado de vecinos se calcula fuera del renderizador, a partir del grafo, para que no haya que reescribirlo.

- *Por qué no `react-force-graph-3d`* (lo conversado antes): la maqueta aprobada ya define exactamente el aspecto, incluidos los pulsos con cola, que la librería no trae. Reproducirlo sobre three.js costaría más que portar ~200 líneas, y añade cerca de 600 KB al paquete. Con unos cientos de nodos, canvas 2D sobra.
- *Cuándo reconsiderar:* si al migrar las cinco pistas el grafo supera ~1500 nodos o se quiere vuelo de cámara libre.
- Movimiento: rotación automática muy lenta cuando no hay interacción; se detiene con un tema abierto, con el cursor sobre un nodo o durante una búsqueda. El bucle de dibujo se pausa cuando la pestaña no está visible. Con preferencia de movimiento reducido no hay rotación, deriva ni pulsos.

### 5. Estado de navegación en la URL

Rutas: `/:locale` (cerebro solo) y `/:locale/:track/:topic` (lector abierto), con `#concept-id` opcional para un concepto. React Router. Abrir un nodo, un resultado o un ítem del sidebar es navegar; cerrar el lector es volver a `/:locale`.

- *Por qué:* cada tema es enlazable y los botones atrás/adelante funcionan sin lógica adicional.
- El hosting necesita redirigir rutas desconocidas a `index.html`.

### 6. Internacionalización con react-i18next

Textos de interfaz en `src/locales/<locale>.json`. El idioma sale de la ruta; `/` redirige según la preferencia guardada o el idioma del navegador, con `es` por defecto. Cambiar de idioma conserva el tema abierto, porque los ids son independientes del idioma.

- *Alternativa:* un diccionario propio. Suficiente hoy, pero el usuario pidió una base que escale.

### 7. Búsqueda con MiniSearch en el navegador

Un índice por idioma, construido al cargar a partir de `search.<locale>.json`. Campos: nombre, alias y resumen, con más peso en nombre y alias. Prefijo y tolerancia a errores activados; se ignoran tildes y mayúsculas. Los alias incluyen el término en el otro idioma, de modo que "idempotency" encuentra el tema con la interfaz en español.

- *Alternativa:* Pagefind. Excelente para sitios de páginas estáticas, pero indexa HTML ya generado y aquí el contenido se carga bajo demanda.

### 8. Estilos: CSS con variables, sin framework

Los valores de la maqueta pasan a variables en `src/styles/tokens.css` (color por pista, receta de cristal, radios, curvas de transición). CSS Modules por componente. Fuentes autoalojadas con `@fontsource` para no depender de Google Fonts.

Los tres modos del lector son una clase en el elemento raíz que cambia el fondo del panel y la opacidad del velo; se guardan en `localStorage` junto con el idioma y el estado del sidebar. Todo acceso a `localStorage` va envuelto para que la app funcione si no está disponible.

- *Alternativa:* Tailwind. La estética depende de degradados, sombras y `backdrop-filter` muy específicos; con utilidades quedaría más verboso que con CSS directo.

### 9. Diseño adaptable y barra inferior en teléfono

Tres tramos: escritorio (sidebar lateral, lector y relacionados en paralelo), tableta (relacionados debajo del lector) y teléfono, por debajo de 760 px (sin sidebar; barra inferior con carrusel de pistas; lector a todo el ancho entre ambas barras). El cerebro 3D se mantiene en todos.

Carrusel circular de la barra inferior:

- Contenedor con desplazamiento horizontal nativo y `scroll-snap` al centro, para heredar la inercia táctil del sistema.
- La lista de pistas se renderiza tres veces seguidas; al asentarse el desplazamiento en una copia lateral, se reubica sin animación en la posición equivalente de la copia central. Así el bucle no tiene tope ni salto visible.
- La pista centrada se determina por la distancia de cada icono al centro del contenedor; la escala de cada icono se interpola con esa distancia, de modo que crecen y decrecen de forma continua al deslizar.
- Centrar una pista la selecciona (resalta sus nodos en el cerebro). Tocar la pista centrada abre una hoja con sus temas sobre la barra; tocar una lateral la centra. (Confirmado por el usuario.)
- *Alternativa:* una librería de carrusel (Embla, Swiper). Resuelven el bucle, pero para cinco iconos añaden más peso y estilos que el problema.
- *Alternativa:* bucle por transformaciones con gestos propios. Control total, pero hay que reimplementar la inercia y se siente menos nativo.

Con solo cinco pistas las copias son baratas. El lector de pantalla ve una sola lista: las copias llevan `aria-hidden` y no reciben foco.

### 13. Control de animaciones

Un único estado global `motion: on | off`, guardado con las demás preferencias. Su valor inicial es `off` si el sistema pide movimiento reducido y `on` en otro caso; la elección explícita del usuario prevalece.

En `off`: el cerebro no rota, no deriva ni dibuja pulsos, y su bucle de dibujo pasa de continuo a bajo demanda (solo redibuja ante interacción, cambio de foco o de tamaño); las auroras quedan pausadas mediante un atributo en el elemento raíz. Las transiciones de paneles se conservan, porque son breves y responden a una acción del usuario; solo se anulan cuando el sistema pide movimiento reducido. (Confirmado por el usuario: el control quita solo los efectos fuertes.)

- *Por qué bajo demanda y no solo "sin movimiento":* es lo que realmente ahorra batería y evita recalcular el desenfoque de los paneles en teléfonos.
- *Alternativa:* detectar equipos lentos y apagar solo. Las heurísticas de rendimiento fallan a menudo; un control visible es predecible. Queda como mejora posible.

Gestos táctiles del cerebro: un dedo gira, dos dedos pellizcan y desplazan; el lienzo declara `touch-action: none` para que la página no se desplace.

### 10. Demos como componentes de React registrados por id

`meta.yaml` nombra una demo (`demo: idempotency-retry`); un registro en `src/demos/` asocia el id con un componente cargado bajo demanda. Un id de demo sin componente registrado es un error de compilación. Se portan tres, con los ids nuevos de `content-map.md`: `idempotency-retry` (original `idem`, tema 5), `status-explorer` (original `status`, tema 6) y `token-bucket` (original `ratelimit`, tema 18).

### 11. Regla de concepto único entre pistas

Decisiones ya tomadas con el usuario, que las pistas siguientes deben respetar:

| Concepto | Tema hogar | En las demás pistas |
|---|---|---|
| HTTP por dentro, principios REST, idempotencia | REST | FastAPI enlaza |
| CORS (concepto) | REST | FastAPI conserva solo la configuración |
| JWT y dónde guardar el token | REST | FastAPI conserva solo la implementación |
| N+1 | SQL | FastAPI conserva solo la carga con el ORM |
| Dataclasses y Pydantic | Python | POO enlaza |
| Inyección de dependencias | POO | FastAPI conserva `Depends` como tema corto |
| Mutabilidad, copias, `is` vs `==` | Python | POO conserva la inmutabilidad como decisión de diseño |

En este cambio solo se materializa la parte de REST. Los `related` hacia temas de pistas aún no migradas se omiten y se añaden al migrar cada pista.

### 12. Pruebas

Vitest para la lógica pura: validación y generación de contenido (incluidos los casos de fallo), construcción del índice y consultas de búsqueda, proyección y selección de nodos del grafo. React Testing Library para el lector, el sidebar y el cambio de idioma. La estética y el movimiento se verifican a mano en el navegador contra la maqueta.

### 14. Puentes reescritos sin framework

Decidido por el usuario: los 20 puentes de la guía se conservan, reescritos para que no dependan de Angular ni de RxJS. Criterio de reescritura, que se aplica frase por frase sin añadir ideas nuevas:

| En la guía | En el puente migrado |
|---|---|
| `HttpClient`, `this.http.get/post/put` | `fetch` |
| interceptor | una función propia que envuelve `fetch` |
| `HttpErrorResponse`, `catchError`, callback de error | `response.ok` y `response.status` tras `await fetch(...)` |
| operadores de RxJS (`retry`, `exhaustMap`, `debounceTime`) | la misma idea en TypeScript plano: bucle de reintento, ignorar clics mientras hay una petición en curso, esperar antes de enviar |
| `withCredentials: true` | `credentials: "include"` |
| `MatPaginator`, tablas de Angular Material | una tabla paginada |
| `PathLocationStrategy`, router de Angular | el router de una SPA |
| `proxy.conf.json`, `ng serve --ssl` | el proxy o el certificado autofirmado del servidor de desarrollo |
| servicio o `resource` de Angular | un módulo cliente de la API |
| Apollo, `new WebSocket()`, `new EventSource()` | se quedan igual: no son de Angular |
| DevTools, pestaña Network, mensajes del navegador | se quedan igual: no dependen del framework |

Si una frase no encaja en ninguna fila, quien implementa se detiene y la reporta.

**Frases con texto fijado por el usuario (2026-11-13).** Cuatro frases no admitían la tabla sin volverse falsas. Su texto final es el siguiente y se usa literalmente; el resto de cada puente no cambia.

Tema 2, `anatomia-peticion-respuesta`. Sustituye la oración que empieza por "Cuando escribes `this.http.post(...)`":

- ES: Cuando escribes `fetch(url, { method: "POST", headers, body: JSON.stringify(datos) })`, armas exactamente esta estructura: el método y la URL van a la línea inicial, los parámetros que agregues a la URL con `URLSearchParams` van a la query string, `headers` al bloque de headers y el body viaja como el texto JSON que serializaste.
- EN: When you write `fetch(url, { method: "POST", headers, body: JSON.stringify(data) })`, you build exactly this structure: the method and the URL go in the start line, the parameters you add to the URL with `URLSearchParams` go in the query string, `headers` go in the header block, and the body travels as the JSON text you serialized.

Tema 6, `codigos-de-estado`. Sustituye la oración que empieza por "Cuando un backend responde 200 con un error dentro":

- ES: Cuando un backend responde 200 con un error dentro, tienes que revisar un campo del body (por ejemplo `ok: false`) después de cada petición: eso es síntoma de una API mal diseñada.
- EN: When a backend answers 200 with an error inside, you have to check a field in the body (for example `ok: false`) after every request: that is a symptom of a poorly designed API.

Tema 7, `cabeceras`. Sustituye la oración que empieza por "`Content-Type` de la petición lo pone Angular":

- ES: `Content-Type` de la petición lo pones tú: con `fetch`, si envías JSON debes declarar `application/json`; si envías `FormData`, el navegador lo arma con su `boundary`, y si lo fijas a mano rompes la subida de archivos.
- EN: The request's `Content-Type` is set by you: with `fetch`, if you send JSON you must declare `application/json`; if you send `FormData`, the browser builds it with its `boundary`, and if you set it by hand you break file uploads.

Tema 20, `seguridad-api`. Sustituye solo la cláusula "El `DomSanitizer` de Angular te protege del XSS en el render"; lo que sigue tras el punto y coma no cambia:

- ES: Los frameworks de frontend escapan por defecto lo que renderizan y eso te protege del XSS, salvo cuando insertas HTML sin escapar (por ejemplo con `innerHTML`)
- EN: Frontend frameworks escape what they render by default, and that protects you from XSS, except when you insert unescaped HTML (for example with `innerHTML`)

### 15. Pistas "Próximamente"

Decidido por el usuario: las cinco pistas aparecen desde este cambio. Una pista sin temas:

- En el sidebar: su fila aparece atenuada, con la etiqueta "Próximamente" en lugar del número de temas, y no se despliega.
- En el carrusel de teléfono: su icono aparece atenuado y participa del bucle; al centrarse queda seleccionada, y tocarla abre la hoja con el texto "Próximamente" en lugar de la lista.
- En el cerebro: su nodo de pista aparece, atenuado y sin hijos; hacer clic en él no abre nada.
- En el buscador: no produce resultados.
- No tiene rutas; una dirección hacia un tema suyo cae en "tema no encontrado".

### 16. Enlaces dentro del texto

Decidido por el usuario: las referencias de la guía a otro tema por su número se sustituyen por enlaces.

- Sintaxis en el contenido: `[[id]]`, donde `id` es un tema o un concepto. Ya contaba como conexión del grafo (decisión 3) y un id inexistente ya era error de compilación.
- Presentación: se muestra como un enlace cuyo texto es el título del tema o el nombre del concepto de destino, en el idioma activo. Al activarlo abre el tema (o el tema hogar del concepto), igual que un elemento del panel de relacionados.
- El texto que rodea al enlace lo escribe el contenido. Para las dos referencias existentes:
  - Tema 4 (`metodos-http`), puente: `(tema 10)` pasa a `(ver [[cors]])` en ES y `(see [[cors]])` en EN.
  - Tema 5 (`metodos-seguros-idempotentes`), sección `problem`: `(tema 17)` pasa a `(ver [[idempotencia-en-la-practica]])` en ES y `(see [[idempotencia-en-la-practica]])` en EN.
- No se añaden más enlaces `[[id]]` al contenido en este cambio.
- Tras la migración no debe quedar ninguna referencia del tipo "(tema N)" ni "(topic N)" en el contenido.

### 17. Títulos de tema buscables en el otro idioma

Decidido por el usuario: al generar `search.<locale>.json`, el compilador añade automáticamente a cada tema, como alias, su título en el otro idioma. No existe un campo `aliases` para temas en el frontmatter; los alias escritos a mano siguen siendo solo de conceptos.

- *Alternativa descartada:* un campo de alias por tema. Obligaría a escribir y mantener el título traducido dos veces.

### 18. Ayuda de gestos

Decidido por el usuario: de la leyenda de la maqueta se conserva solo la ayuda de gestos; los colores de las pistas no se repiten porque ya se ven en el sidebar.

- Una sola línea de texto, centrada en la parte inferior de la zona del cerebro, con la tipografía monoespaciada y el color atenuado de la maqueta. No es interactiva y no intercepta clics ni arrastres.
- Texto, en los archivos de traducción. ES: `clic: abrir · arrastrar: girar · Mayús + arrastrar: mover · rueda: acercar`. EN: `click: open · drag: rotate · Shift + drag: pan · wheel: zoom`.
- Visible solo cuando no hay tema abierto y solo en el tramo de escritorio (decisión 9). En tableta y teléfono no se muestra.
- Aparece y desaparece con la misma transición que los paneles.

### 19. La hoja de temas de teléfono no es de cristal

Pedido por el usuario tras probar la implementación: sobre el cerebro, la hoja de temas que se despliega desde la barra inferior pierde legibilidad con el fondo translúcido.

- La hoja usa siempre el fondo casi opaco del modo Sólido del lector (`--glass-strong` de la maqueta, 90 % de opacidad), con el mismo borde, radio y sombra que el resto de paneles.
- Es independiente del modo de fondo del lector que haya elegido el usuario: aunque el lector esté en Cristal o Sin fondo, la hoja sigue siendo sólida.
- Aplica también cuando la hoja muestra "Próximamente".
- La barra inferior con el carrusel no cambia: sigue siendo de cristal.

## Risks / Trade-offs

- **Desenfoque sobre fondo animado en equipos lentos y teléfonos** → la rotación se detiene con el lector abierto, y el control "Detener animaciones" deja el cerebro sin redibujar (decisión 13). El modo Sólido sirve de salida adicional.
- **Bucle del carrusel con desplazamiento nativo** → la reubicación entre copias puede notarse si ocurre a mitad de un gesto; se hace solo al terminar el desplazamiento y se prueba en Safari de iOS y Chrome de Android.
- **Legibilidad en modo Sin fondo sobre zonas densas del cerebro** → sombra de texto, bloques de código con fondo propio y el modo elegible por el usuario. Cristal es el modo por defecto.
- **Renderizador propio en vez de librería** → más código nuestro que mantener. Se mitiga con módulos pequeños y pruebas de la proyección y la selección; la decisión 4 fija cuándo reconsiderar.
- **El cerebro con una sola pista poblada** → cuatro nodos de pista quedan sueltos y atenuados hasta que se migren. Aceptado por el usuario para validar el carrusel y el sidebar con cinco elementos.
- **Traducción de 20 temas con HTML incrustado** → se convierte a Markdown al migrar; el validador exige que ES y EN tengan las mismas secciones y los mismos ids de concepto.
- **Solo tres demos portadas** → 17 temas de REST quedan sin demo en este corte. Decidido por el usuario: las 17 restantes se definen en un cambio aparte, junto con su rediseño. Quien implemente este cambio no porta ninguna demo adicional.
- **Contenido de las otras pistas ausente** → el cerebro se verá con una sola pista. Suficiente para validar el esqueleto, no representa la densidad final.

## Migration Plan

1. Inicializar Git en la raíz (ya autorizado por el usuario) y crear `ai-engineer-path/`.
2. Construir contenido y esqueleto; los HTML originales no se tocan.
3. `npm run build` produce `ai-engineer-path/dist/`, desplegable en cualquier hosting estático con redirección de rutas a `index.html`.
4. Sin vuelta atrás que planear: los HTML originales siguen funcionando.

## Open Questions

- **Hosting** (Cloudflare Pages o Vercel): no cambia el código; se decide al desplegar.
- **Nombre del producto**: la maqueta usa "CEREBRO" como marcador; es una cadena en los archivos de traducción.
