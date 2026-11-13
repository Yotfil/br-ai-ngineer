# Proposal

## Why

El material de estudio vive en cinco HTML sueltos (Python/FastAPI, HTTP/REST, SQL, Git, POO), cada uno con su propio diseño, solo en español, sin buscador común y con conceptos repetidos entre guías. Para preparar entrevistas hace falta escribir un concepto y llegar a él de inmediato, y entender cómo se relaciona con los demás. Este cambio construye el esqueleto de la aplicación unificada y migra una primera pista completa para validar el diseño antes de migrar las otras cuatro.

## What Changes

- Nueva aplicación web estática en `ai-engineer-path/`, de una sola página, con tema oscuro, paneles flotantes de cristal y un "cerebro" 3D de conceptos siempre de fondo (referencia visual aprobada: `mockups/ui-v2.html`).
- Cerebro navegable: nodos por pista, tema y concepto; se gira, se desplaza y se acerca; resalta vecinos; pulsos de energía tipo meteorito en las conexiones.
- Barra superior con buscador de conceptos (atajo de teclado, tolerante a errores, bilingüe) y selector de idioma.
- Sidebar colapsable a solo iconos, con pistas desplegables y sus temas.
- Lector central que se puede cerrar, con pestañas (Entender, En código, En la entrevista y, donde el tema tiene ejercicios o demo, Practicar), panel de relacionados y tres modos de fondo elegibles por el usuario (Cristal, Sin fondo, Sólido).
- Diseño adaptable de teléfono a escritorio. En teléfono las pistas pasan a una barra inferior con carrusel circular, donde la pista del centro queda seleccionada y más grande; el cerebro 3D se mantiene, con gestos táctiles.
- Control "Detener animaciones" en la barra superior, en teléfono y escritorio, que deja quietos el cerebro y el fondo y se recuerda entre visitas.
- Modelo de contenido en archivos: un tema por carpeta, con metadatos compartidos y un archivo por idioma. El grafo y el índice de búsqueda se generan al compilar, de modo que añadir un tema nuevo lo hace aparecer en cerebro, buscador y sidebar sin tocar código.
- Regla de concepto único: cada concepto tiene un solo tema "hogar"; el resto lo enlaza. La compilación falla si hay duplicados o enlaces rotos.
- Internacionalización desde el inicio: interfaz y contenido en español e inglés, con rutas por idioma.
- Migración completa de la pista **HTTP y REST** (20 temas) a ES y EN, con los ejercicios que trae la guía. Los puentes se reescriben sin Angular ni RxJS, como "Puente con el frontend (TypeScript)".
- Las otras cuatro pistas aparecen ya en la interfaz y en el cerebro como "Próximamente", sin temas.
- Tres demos interactivas de REST portadas como patrón (idempotencia, códigos de estado, rate limiting).

Fuera de este cambio: las otras cuatro pistas, la sección "Casos" (fintech y logística), el rediseño de las demos restantes, los modos Repasar y Simulacro, el seguimiento de progreso, la conexión por semejanza con embeddings, la IA y el tema claro. Los HTML originales no se modifican.

## Capabilities

### New Capabilities

- `content-model`: estructura de pistas, temas y conceptos en archivos; validación; regla de concepto único; generación del grafo y de los datos por tema.
- `concept-graph`: el cerebro 3D de fondo, su navegación, resaltado, pulsos y comportamiento cuando hay un tema abierto.
- `app-shell`: barra superior, sidebar colapsable, lector central con pestañas, panel de relacionados, modos de cristal, transiciones y preferencias guardadas en el navegador.
- `concept-search`: búsqueda de temas y conceptos desde la barra superior, con resultados instantáneos y resaltado en el cerebro.
- `localization`: interfaz y contenido en español e inglés, cambio de idioma y rutas por idioma.

### Modified Capabilities

Ninguna. No existen especificaciones previas en el proyecto.

## Impact

- **Código nuevo:** carpeta `ai-engineer-path/` (Vite + React + TypeScript) con `content/`, `scripts/` de compilación de contenido y `src/`.
- **Dependencias nuevas:** React, React Router, react-i18next, MiniSearch, d3-force-3d (solo en compilación), Shiki (solo en compilación), Zod, gray-matter, Vitest.
- **Sin backend ni base de datos.** El resultado es una carpeta estática desplegable en cualquier hosting de archivos.
- **Repositorio:** la carpeta aún no es un repositorio Git; el despliegue lo requiere.
- **Archivos existentes:** los cinco HTML y `mockups/` quedan intactos como fuente y referencia.
