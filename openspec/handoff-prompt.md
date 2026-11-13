# Prompt de arranque — retomar `pista-python` desde la tarea 3.5

> Escrito por Fable 5.2 el 2026-11-13, tras resolver el vacío que detuvo la implementación. Pega el bloque de abajo como primer mensaje de una sesión nueva con **Opus 5.5**, abierta en `/Users/yotfil/Documents/Yotfil/TechForge/Learning/ai_engineer/ai-engineer-path`.

---

Vas a terminar de implementar el cambio de OpenSpec `pista-python`. Hay 16 tareas hechas y quedan 9. El vacío que te detuvo está resuelto y las decisiones que tomaste fueron revisadas con el usuario. Respóndeme en español.

**Reglas insaltables de este proyecto** (también están en la memoria del proyecto y en `design.md`):

1. Implementas tú, Opus 5.5. Las specs las define Fable 5.2 en otra sesión.
2. Si encuentras un vacío, una ambigüedad o una contradicción en los artefactos, **no decidas**. Detente, dime exactamente qué falta (archivo y requisito o tarea) y espera: lo resolveré en otra sesión con Fable 5.2. No rellenes el hueco con un supuesto razonable, por pequeño que parezca.
3. No modifiques `proposal.md`, `design.md`, `content-map.md`, `rewrites.md` ni los archivos de `specs/`. En `tasks.md` solo marcas casillas.
4. Si te digo que se retoma en otro contexto, actualiza la memoria del proyecto y sobrescribe este archivo (`openspec/handoff-prompt.md`) con un prompt de arranque nuevo; dime la ruta. Nunca lo pongas en un `CLAUDE.md`.

**Antes de tocar código, vuelve a leer lo que cambió:**

1. `openspec/changes/pista-python/content-map.md`: filas 6 y 8 de la tabla "Temas" (nombres corregidos), la nota de formato sobre el separador, la sección "Alias" (dos conceptos nuevos y la regla de los dos idiomas) y la sección nueva "Títulos cortos en inglés".
2. `openspec/changes/pista-python/rewrites.md`: sección nueva "Resumen fijado".
3. `openspec/changes/pista-python/design.md`: decisiones nuevas 11 y 12.
4. `openspec/changes/pista-python/specs/app-shell/spec.md`: escenario "Categorías en fila" y el requisito modificado "Barra inferior de pistas en teléfono".
5. `openspec/changes/pista-python/specs/content-model/spec.md`: escenario "Lenguaje no admitido".
6. `openspec/changes/pista-python/tasks.md`: grupo 6 nuevo.

**Qué se decidió sobre lo que reportaste:**

- **Vacío de la tarea 3.5:** `try-except` se llama "try/except/finally" y `async-await` se llama "async/await", iguales en español e inglés. Alias: `try except`, `try except finally` y `async await`. Se restablece el `related` hacia `async-await` de `endpoints-async-vs-sync`.
- **Confirmado tal como lo hiciste:** alias adicionales en los dos idiomas; el texto `<coroutine object …>` escapado y literal; la ayuda al pasar el cursor solo cuando hay título corto distinto; `code:example` sin texto entre bloques; los 21 títulos cortos en inglés y el cambio de comillas.
- **A corregir:**
  - Resumen de `estructuras-de-datos`: usa el texto fijado en `rewrites.md`.
  - Ejercicio de clasificación: las categorías van **en fila**, como botones compactos que pasan de línea. Opción múltiple y veredicto no cambian.
  - Valla con lenguaje no admitido: ahora es un **error de validación**, no se trata como "sin lenguaje".
- **Fuera del alcance original, añadido a este cambio:** la hoja de temas de teléfono pasa a ser 100 % opaca, sin tocar `--glass-strong`.

**Orden de trabajo** (ejecuta `/opsx:apply pista-python`):

1. Grupo 6 (6.1 a 6.4). La tarea 6.1 rellena los dos conceptos y el resumen, y vuelve a ejecutar `npx tsx scripts/migrate/migrate-python.ts`.
2. Tareas 3.5 y 3.6, que quedaron bloqueadas.
3. Grupo 5 (5.1 a 5.3), repitiéndolo completo con el contenido ya terminado.

**Límites:**

- No hagas commits ni push salvo que te lo pida. `src/generated/` es salida de compilación; no la incluyas en commits.
- No toques los archivos de `legacy/`.
- Sigue fuera de este cambio: el tema 11 de la guía, las demos de Python, el simulacro final, el soporte para tablas, los conceptos N+1 e inyección de dependencias, los títulos cortos de REST y el contenido de SQL, POO y Git.

**Al terminar o al detenerte**, dame un resumen con: tareas completadas, tareas pendientes, resultado de `npm run typecheck`, `npm test` y `npm run build`, los conceptos de `content-map.md` que omitiste por no aparecer en el texto, y cualquier vacío que hayas encontrado.
