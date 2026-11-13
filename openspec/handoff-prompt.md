# Prompt de arranque — implementar `rendimiento-movil`

> Escrito por Fable 5.2 el 2026-11-13, tras definir el cambio con el usuario. Pega el bloque de abajo como primer mensaje de una sesión nueva con **Opus 5.5**, abierta en `/Users/yotfil/Documents/Yotfil/TechForge/Learning/ai_engineer/ai-engineer-path`.

---

Vas a implementar el cambio de OpenSpec `rendimiento-movil` con `/opsx:apply`. Respóndeme en español.

**Reglas insaltables de este proyecto** (también están en la memoria del proyecto; léela antes de actuar):

1. Implementas tú, Opus 5.5. Las decisiones las toma Fable 5.2 conmigo en otra sesión.
2. Si encuentras un vacío, una ambigüedad o una contradicción en los artefactos, **no decidas**. Detente, dime exactamente qué falta (archivo y requisito, decisión o tarea) y espera. No rellenes el hueco con un supuesto razonable.
3. No modifiques `proposal.md`, `design.md` ni los archivos de `specs/` del cambio. En `tasks.md` solo marcas casillas.
4. Si te digo que se retoma en otro contexto, actualiza la memoria del proyecto y sobrescribe este archivo con un prompt de arranque nuevo; dime la ruta. Nunca lo pongas en un `CLAUDE.md`.

**Antes de escribir nada:**

- Comprueba la rama con `git branch --show-current`. Debe ser `feature/rendimiento-movil`. Si no lo es, detente y avísame. El flujo de Git es el de `openspec/git-workflow.md`, que es vinculante: no haces commits, push ni pull requests salvo que te lo pida en esta sesión.
- Lee completos, en este orden: `openspec/changes/rendimiento-movil/proposal.md`, `design.md`, `specs/app-shell/spec.md`, `specs/concept-graph/spec.md` y `tasks.md`.
- En el árbol de trabajo encontrarás sin commit los artefactos de este cambio y este archivo, escritos por Fable. Es lo esperado.

**De qué va el cambio:** en iPhone el lector no se desplaza con el dedo, el teléfono se calienta y la app va a tirones. El cambio da al lector desplazamiento propio en tableta y teléfono, reduce los modos de fondo del lector de tres a dos, deja el teléfono sin desenfoques y con el fondo completamente quieto mientras se lee, y abarata el dibujo del cerebro sin cambiar su aspecto.

**Puntos donde es fácil equivocarse:**

- La causa del desplazamiento roto no se ha reproducido en un simulador: no hay ninguno en esta máquina. No intentes instalar uno ni des por comprobado en iPhone nada que solo hayas visto en el navegador de escritorio.
- Los tramos de ancho son los de design.md: teléfono hasta 760 px, tableta de 761 a 1080 px, escritorio a partir de ahí. Tableta y teléfono tienen disposiciones distintas del lector (decisiones 4 y 5).
- El modo `solid` guardado antes de este cambio no significa lo mismo que el `solid` nuevo. La conversión es la de la decisión 3, con el campo `v: 2`.
- En teléfono el modo efectivo es Sólido, pero la preferencia guardada no se toca (decisión 2).
- Con `paused`, el cerebro no programa ningún cuadro; la única excepción es un cuadro al cambiar de tamaño (decisión 6).
- El token `--glass-strong` no se modifica: lo comprueba una prueba existente de la hoja de temas.
- La tarea 1.2 (capturas de referencia) va antes de tocar el cerebro o los modos. Sin ellas no se puede hacer la comparación de la tarea 5.6.
- Los valores marcados en design.md como "de implementación" son los únicos que eliges tú. El resto está fijado.

**Lo que hago yo, no tú:**

- Tarea 5.6: te confirmo si el cerebro se ve equivalente y si me convencen Cristal y Sólido. Si pido ajustes, te detienes: se deciden con Fable.
- Tareas 6.3 y 6.4: ejecuto en mi iPhone el guion de 12 puntos de la decisión 15 y te doy las respuestas. Cualquier "no" en los puntos 1 a 11 lo anotas con lo que observé y te detienes; no improvises una corrección fuera de las decisiones del diseño.

**Al terminar o al detenerte**, dame un resumen con: tareas hechas y pendientes, resultado de `npm run typecheck`, `npm test`, `npm run lint` y `npm run build`, y lo que quede de mi parte. No archives el cambio hasta que las 25 tareas estén marcadas, incluidas las dos que dependen de mi prueba en iPhone.

**Versión:** este cambio lleva el tag `v0.2.1` (design.md decisión 16 y `openspec/git-workflow.md`). No crees el tag salvo que te lo pida.

**Qué sigue después:** la definición de la pista SQL, con Fable 5.2, en la rama `feature/pista-sql`.
