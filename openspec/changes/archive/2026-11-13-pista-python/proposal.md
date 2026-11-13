# Proposal

## Why

La pista "Python y FastAPI" aparece hoy en la app como "Próximamente". Su guía original (`legacy/Python y FastAPI para entrevistas.html`) tiene 22 temas con una estructura distinta a la de REST: un ejemplo principal por tema, notas en el ejemplo riesgoso y el correcto, título corto, dos bloques de temas y ejercicios de clasificación y con código. Este cambio migra la pista y amplía el modelo de contenido lo justo para representarla, de forma que las pistas siguientes reutilicen esas capacidades.

## What Changes

- Migración de **21 temas** de la guía de Python a español e inglés. El tema 11 de la guía ("HTTP por dentro y principios REST") no se migra, porque su contenido ya vive en la pista REST (regla de concepto único).
- Los 3 ejercicios de ese tema se trasladan a la pista REST: el de clasificar métodos a "Métodos seguros e idempotentes" y los dos de códigos de estado a "Códigos de estado y sus confusiones clásicas".
- El tema de autenticación se renombra a "Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas"; los conceptos JWT y OAuth2 siguen siendo de REST y el tema los enlaza.
- Subtítulos de grupo dentro de una pista: los temas de Python aparecen bajo "Python" y "FastAPI" en el sidebar y en la hoja de temas de teléfono.
- Título corto opcional por tema, usado en el sidebar, la hoja de temas y los nombres del cerebro.
- Nueva sección opcional de ejemplo principal en la pestaña En código, y notas explicativas bajo el ejemplo riesgoso y el correcto.
- Ejercicios: nuevo tipo de clasificación, y preguntas de opción múltiple que pueden llevar un bloque de código.
- El lenguaje de resaltado de un bloque de código puede declararse en el propio bloque; se añade el lenguaje "texto sin resaltar".
- Los puentes y otras frases que mencionaban Angular, NestJS o RxJS se reescriben con textos fijados en este cambio. Se conservan las comparaciones con JavaScript, TypeScript, Node y librerías del ecosistema.
- "Errores típicos de quien viene de JavaScript" pasa a mostrarse como "Malentendidos comunes".

Fuera de este cambio: las demos de la guía de Python (cinco tipos genéricos; llegan rediseñadas en el cambio de demos), el simulacro final de la guía, y los conceptos cuyo hogar será otra pista aún no migrada (N+1 en SQL, inyección de dependencias en POO).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `content-model`: grupos de temas, título corto, ejemplo principal, notas en riesgoso y correcto, lenguaje declarado por bloque, ejercicio de clasificación, código en opción múltiple, y la pista Python y FastAPI completa.
- `app-shell`: subtítulos de grupo y título corto en sidebar y hoja de temas; ejemplo principal en la pestaña En código; presentación del ejercicio de clasificación.
- `concept-graph`: los nombres de los temas en el cerebro usan el título corto cuando existe.

## Impact

- **Contenido:** nueva carpeta `content/python/` con 21 temas; `tracks.yaml` gana los grupos de la pista Python; dos temas de REST ganan ejercicios.
- **Código:** esquema y compilación de contenido (`scripts/content/`), modelo (`src/content/model.ts`), sidebar, hoja de temas, lector, ejercicios y etiquetas del cerebro. Un script de migración de un solo uso para la guía de Python.
- **Sin dependencias nuevas.**
- **Fuente:** `legacy/Python y FastAPI para entrevistas.html` no se modifica.
