# Prompt de arranque — cierre de `esqueleto-y-pista-rest`

> Escrito por Fable 5.2 el 2026-11-13, tras definir los vacíos que Opus reportó en su segunda sesión. Pega el bloque de abajo como primer mensaje de una sesión nueva con **Opus 5.5**, abierta en `/Users/yotfil/Documents/Yotfil/TechForge/Learning/ai_engineer`.

---

Vas a terminar de implementar el cambio de OpenSpec `esqueleto-y-pista-rest`. Quedan 8 tareas; el resto está hecho y verificado. Las decisiones ya están tomadas y escritas: tu trabajo es aplicarlas tal cual. Respóndeme en español.

**Reglas insaltables de este proyecto** (también están en la memoria del proyecto y en `design.md`):

1. Implementas tú, Opus 5.5. Las specs las define Fable 5.2 en otra sesión.
2. Si encuentras un vacío, una ambigüedad o una contradicción en los artefactos, **no decidas**. Detente, dime exactamente qué falta (archivo y requisito o tarea) y espera: lo resolveré en otra sesión con Fable 5.2. No rellenes el hueco con un supuesto razonable, por pequeño que parezca.
3. No modifiques `proposal.md`, `design.md`, `content-map.md` ni los archivos de `specs/`. En `tasks.md` solo marcas casillas.
4. Si te digo que se retoma en otro contexto, actualiza la memoria del proyecto y sobrescribe este archivo (`openspec/handoff-prompt.md`) con un prompt de arranque nuevo; dime la ruta. Nunca lo pongas en un `CLAUDE.md`.

**Antes de tocar código, lee:**

1. `openspec/changes/esqueleto-y-pista-rest/design.md`: el final de la decisión 14 (textos fijados de cuatro puentes) y las decisiones nuevas 16, 17, 18 y 19.
2. `openspec/changes/esqueleto-y-pista-rest/specs/app-shell/spec.md`: requisitos "Enlaces a otros temas dentro del texto", "Ayuda de gestos del cerebro" y el escenario "Hoja de temas legible".
3. `openspec/changes/esqueleto-y-pista-rest/specs/concept-search/spec.md`: escenario "Título de un tema en el otro idioma".
4. `openspec/changes/esqueleto-y-pista-rest/specs/content-model/spec.md`: escenario "Enlace en el texto crea conexión".
5. `openspec/changes/esqueleto-y-pista-rest/content-map.md`: sección "Alias", que cambió.
6. `openspec/changes/esqueleto-y-pista-rest/tasks.md`: las tareas sin marcar.

**Tareas pendientes** (ejecuta `/opsx:apply esqueleto-y-pista-rest`):

- **7.4** Puentes. Los temas 2, 6, 7 y 20 usan literalmente los textos de la decisión 14, en español e inglés. Al terminar no debe quedar ninguna marca `PENDIENTE` en `ai-engineer-path/scripts/migrate/rest-es.ts` ni en el contenido.
- **9.1** Los enlaces `[[id]]` del texto se muestran como enlaces con el título del destino y abren su tema (decisión 16).
- **9.2** Las dos referencias "(tema N)" del contenido pasan a enlaces: `(ver [[cors]])` y `(ver [[idempotencia-en-la-practica]])`, con `(see [[...]])` en inglés.
- **9.3** El título de cada tema en el otro idioma se añade solo al índice de búsqueda (decisión 17). No se crea ningún campo nuevo en el contenido.
- **9.4** Línea de ayuda de gestos, solo en escritorio y sin tema abierto (decisión 18). Los colores de las pistas no se incluyen.
- **9.5** La hoja de temas de teléfono deja de ser de cristal y pasa a fondo casi opaco, sea cual sea el modo del lector (decisión 19). La barra inferior no cambia.
- **9.6** `npm run typecheck`, `npm test` y `npm run build` en verde.
- **5.8** Está implementada. Solo falta que yo compruebe a mano las transiciones con "Reducir movimiento" activo en macOS; no la marques tú, espérame.

**Límites:**

- No hagas commits ni push salvo que te lo pida.
- No toques los cinco HTML originales ni la carpeta `mockups/`.
- No añadas enlaces `[[id]]` al contenido más allá de los dos indicados.
- Sigue fuera de este cambio: el contenido de las otras cuatro pistas, las 17 demos restantes de REST, el simulacro final, los modos Estudiar/Repasar/Simulacro, progreso, embeddings, IA, tema claro y el despliegue.

**Al terminar o al detenerte**, dame un resumen con: tareas completadas, tareas pendientes, resultado de `npm run typecheck`, `npm test` y `npm run build`, y cualquier vacío que hayas encontrado.
