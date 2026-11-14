# Proposal

## Why

El usuario revisó el 2026-11-13 los 41 temas ya publicados (HTTP y REST, Python y FastAPI) y varias explicaciones no las entiende, aun siendo desarrollador. El contenido heredado de las guías originales es una chuleta: usa palabras que no explica, junta varias ideas en un solo bloque de código, no muestra qué imprime el código y sus ejemplos son líneas sueltas sin contexto de proyecto. Con sus palabras: "las explicaciones deben ser casi como si fueran para un junior" y "quiero que hayan ejemplos de la vida real en un proyecto, no solo líneas de código suelto que no se entienden sin contexto".

Este cambio reescribe ese contenido según `openspec/guia-de-contenido.md`, acordada con él, y amplía el modelo de contenido lo justo para que el paso a paso y los ejemplos de proyecto se puedan escribir. Va antes de la pista SQL para que las pistas siguientes nazcan ya con este nivel.

## What Changes

- **Paso a paso en el código.** Las secciones de código de un tema admiten pasos con título y texto entre los bloques. Hoy el ejemplo principal solo admite bloques de código seguidos.
- **Reescritura de los temas** de HTTP y REST y de Python y FastAPI, en español e inglés, con las seis reglas de la guía: una idea por paso, cada término explicado, código corto con su salida, comentarios que explican el porqué, malentendidos con su explicación y un último paso que sitúa el concepto en el proyecto de ejemplo.
- **Un solo proyecto de ejemplo** para todo el contenido: la API de una tienda en línea con productos, clientes, pedidos y pagos, descrita en `proyecto-tienda.md`.
- **Ocho temas de Python se parten en dos**, porque juntaban conceptos independientes. La pista pasa de 21 a 29 temas. Ningún concepto cambia de nombre ni se duplica.
- **Entradas de proyecto**: un tipo nuevo de entrada en la lista de temas ("Proyecto: …") que muestra una funcionalidad real de la tienda, parte por parte, y enlaza cada parte al tema donde se estudia. Se añaden cinco, todas en la pista Python y FastAPI; las tres del grupo FastAPI enlazan a temas de HTTP y REST. La pista HTTP y REST no lleva ninguna.
- **Comentarios del código en el idioma de la página.** La versión inglesa deja de mostrar comentarios en español. La compilación comprueba que ambos idiomas tienen los mismos bloques de código.
- El rótulo del ejemplo principal pasa de "Ejemplo: la API de la tienda" a "Paso a paso".
- **Piloto antes del resto:** primero se reescriben seis temas y una entrada de proyecto; el usuario los lee en la vista previa y, solo si el nivel es el correcto, se sigue con los demás.
- Se retiran los scripts de migración de un solo uso (`scripts/migrate/`): desde este cambio, `content/` se mantiene a mano y es la única fuente.

Fuera de este cambio: ejercicios nuevos, demos, títulos cortos para REST, las pistas SQL, POO y Git (que se redactarán directamente con la guía, con sus propias entradas de proyecto) y la sección "Casos" de fintech y logística.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `content-model`: pasos con título en las secciones de código, paridad de bloques de código entre idiomas, entradas de proyecto, y la pista Python y FastAPI con 29 temas y 5 entradas de proyecto.
- `app-shell`: pasos visibles en la pestaña En código, lectura de una entrada de proyecto y su aparición en las listas de temas.
- `concept-graph`: las entradas de proyecto aparecen en el cerebro conectadas con los temas que reúnen.

## Impact

- **Contenido:** se reescriben los 41 temas de `content/` en ambos idiomas; 8 carpetas de temas de Python se sustituyen por 16; 5 carpetas nuevas de entradas de proyecto. Los identificadores de esos 8 temas desaparecen: sus direcciones antiguas muestran "No se encontró el tema".
- **Código:** esquema, validación y compilación de contenido (`scripts/content/`), modelo (`src/content/model.ts`), lector, sidebar, hoja de temas, grafo y textos de interfaz. Se borra `scripts/migrate/`.
- **Documentación:** `content/README.md` y `openspec/guia-de-contenido.md`.
- **Sin dependencias nuevas.**
- **Versión:** `v0.2.3` (cambio intercalado fuera del plan numerado).
