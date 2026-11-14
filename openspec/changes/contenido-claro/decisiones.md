# Decisiones no críticas de la implementación

Bitácora de Opus 5.5 (regla "Anotar y seguir"). Una entrada por decisión: tarea, qué se decidió, por qué y cómo deshacerlo. Antes de archivar, Fable 5.2 la revisa y señala las que debieron escalarse.

## Confirmaciones del usuario

- **2026-11-13, al empezar el grupo 1.** El usuario confirmó los cinco detalles del diseño que Fable escribió por recomendación: rótulo "Paso a paso" / "Step by step" (decisión 5); direcciones de los ocho temas partidos sin redirección (decisión 8); entrada de proyecto como nodo igual que un tema en el cerebro (decisión 6); borrar `scripts/migrate/` (decisión 13); sin ejercicios nuevos para `closures-y-lambdas` y `openapi-automatico` (`content-map.md`, sección 1). Respuesta: "Sí, confirmo".

## Grupo 1. Formato: pasos y paridad de código

**Comprobaciones.** 1.1, antes de tocar nada: `typecheck`, `test` (264 pruebas en 14 archivos), `lint` (0 errores, 14 avisos) y `build` en verde. 1.6, al cerrar el grupo: `typecheck`, `test` (289 pruebas en 16 archivos), `lint` (0 errores, los mismos 14 avisos) y `build` en verde. `npm run content`: 41 temas, 156 nodos, 215 enlaces; el contenido actual cumple la paridad de la 1.4 sin tocarlo. En el navegador, el rótulo se ve como "Paso a paso" en `/es/python/decoradores` y "Step by step" en `/en/python/decoradores`, sin errores en la consola.

### 1.2 El título de paso se genera como `<h4>`, saneado aparte

- **Qué.** En `scripts/content/markdown.ts`, un encabezado `###` se genera como `<h4>`. Su texto inline se sanea por separado y el `<h4>` se inserta después del saneado general, igual que ya se hacía con el código resaltado (el marcador interno pasa de `data-code` a `data-raw`, porque ahora guarda las dos cosas). Los encabezados de otros niveles no cambian: el saneado general sigue sin admitir encabezados y los quita, como antes.
- **Por qué.** El lector ya usa `<h3>` para el rótulo de cada sección ("Paso a paso", "Así viaja por la red"…): el paso va un nivel por debajo. Si se añadiera `h4` a la lista general de etiquetas, un `####` escrito por error en cualquier sección aparecería con aspecto de paso.
- **Cómo deshacerlo.** Revertir el cambio de `renderMarkdown` y de `SANITIZE` en `markdown.ts`.

### 1.2 Qué se reconoce como título de paso

- **Qué.** `scanSection` (en `scripts/content/sections.ts`) reconoce `###` como lo hace marked: hasta tres espacios delante, `###` seguido de espacio o solo. `####` no es un paso y lo que va dentro de un bloque de código no cuenta. Error en una sección que no lo admite: `<archivo>: la sección "<clave>" no admite títulos de paso (###)`. La misma función sirve para `checkExample` y para la paridad (1.4).
- **Por qué.** Validación y render deben estar de acuerdo sobre qué es un paso; una sola función evita que se separen.
- **Cómo deshacerlo.** Revertir `sections.ts`.

### 1.3 Aspecto de los títulos de paso

- **Qué.** En `src/shell/Reader.module.css`, clase `.steps`, la misma en las tres secciones (`code:example`, `code:wire`, `code:server`); sustituye a `.example`. El título de paso: 16 px, peso 700, blanco, línea vertical de 2 px a la izquierda con el color de la pista al 70 %, 22 px de margen arriba (2 px si es lo primero de la sección) y 8 px abajo, y `overflow-wrap: anywhere` para que nunca se recorte. Entre un bloque de código y lo que le sigue (y entre lo que precede a un bloque y el bloque) quedan 10 px, la misma separación que ya había entre bloques consecutivos. `code:wire` y `code:server` reciben también `data-section` en el lector.
- **Por qué.** El rótulo de sección es mayúscula pequeña en monoespaciada y color de pista; el paso debía distinguirse de él y del texto sin salirse de la estética: tamaño y peso de subtítulo, y la línea de color como único acento. Ningún tema actual tiene texto junto al código en estas tres secciones (comprobado en los 41 temas), así que la separación nueva no cambia nada de lo publicado.
- **Comprobación a 390 px** (escenario "Teléfono"). Se añadieron pasos de prueba a `content/python/decoradores/es.md` solo en local; después se restauró con `git checkout`. Medidas en el navegador: ancho de página 390 px sin desplazamiento horizontal (`scrollWidth` 390); cada título de paso ocupa 326 px y su contenido no desborda (`scrollWidth` = `clientWidth`), el más largo pasa a tres líneas; los bloques anchos se desplazan dentro de su recuadro (contenido de 735 y 796 px en 326 px, `overflow-x: auto`). Captura fuera del repositorio: `/Users/yotfil/.claude/projects/-Users-yotfil-Documents-Yotfil-TechForge-Learning-ai-engineer-ai-engineer-path/159158de-9577-4108-96de-cabe20f65413/tool-results/mcp-Claude_Browser-blob-1794626986332-qhhecv.jpg`.
- **Cómo deshacerlo.** Revertir el bloque `.steps` de `Reader.module.css` y las tres clases de `Reader.tsx`.

### 1.4 Paridad de código: alcance y mensajes

- **Qué.** `checkCodeParity` (en `scripts/content/validate.ts`) se aplica a todas las secciones presentes en los dos idiomas, no solo a las de código, y compara el lenguaje resuelto con la misma regla del render (`codeLanguage`): en `code:wire`, `bad` y `good`, un bloque sin lenguaje declarado se compara por el lenguaje que se le deduce. Mensajes: `tema "<id>": la sección "<clave>" tiene N bloques de código en "es" y M en "en"`, `… el bloque N es <lenguaje> en "es" y <lenguaje> en "en"` y `… tiene N títulos de paso en "es" y M en "en"`.
- **Por qué.** La spec dice "en cada sección". Comparar el lenguaje resuelto, y no el texto de la valla, deja pasar `py` frente a `python`, que se ven igual, y detecta lo que el lector mostraría distinto.
- **Cómo deshacerlo.** Quitar la llamada a `checkCodeParity` en `validateContent`.

### 1.2 a 1.4 Dónde van las pruebas

- **Qué.** Archivos nuevos `scripts/content/contenido-claro.test.ts` (pasos y paridad) y `src/test/contenido-claro.test.tsx` (lector), como ya se hizo con un archivo por cambio en `pista-python` y `rendimiento-movil`. La prueba de `pista-python.test.ts` que exigía "solo bloques de código" se adaptó a la regla nueva (design.md decisión 14), y a su lado se añadió el escenario "Ejemplo principal sin código": así los cinco escenarios de "Ejemplo principal opcional" quedan juntos en el `describe('1.3 ejemplo principal opcional')` de ese archivo. Las pruebas que comprobaban el rótulo antiguo ("Ejemplo: la API de la tienda") pasan a comprobar "Paso a paso" / "Step by step".
- **Por qué.** Mantener la trazabilidad por cambio sin duplicar los escenarios que ya estaban probados.
- **Cómo deshacerlo.** Mover o borrar los archivos nuevos; restaurar la prueba adaptada desde Git.
