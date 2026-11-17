Este prompt es para **Opus 5.5**. El cambio de OpenSpec en curso es `contenido-claro`, en la rama `feature/contenido-claro`. Te toca terminar el **grupo 4**: las tareas 4.10 a 4.16 de `tasks.md`, que corrigen el piloto. No empieces el grupo 5. Respóndeme en español.

**Reglas que te aplican.** Antes de actuar, lee en la memoria del proyecto `reglas-fable-specs-opus-implementa.md`. En resumen:

- Eres Opus 5.5: implementas. Haces las tareas `[opus]`; en esta sesión no hay tareas `[sonnet]`.
- Las decisiones no críticas las anotas en `openspec/changes/contenido-claro/decisiones.md` y sigues.
- Ante una decisión crítica te detienes en esa tarea, la dejas en este archivo como pregunta para Fable 5.2 y sigues con las que no dependan de ella.
- `openspec/guia-de-contenido.md`, `design.md`, `content-map.md` y `proyecto-tienda.md` son vinculantes y no los modificas.
- La regla "no se inventa información" del inicio de `tasks.md` vale para cada frase que añadas.
- Commits, push y pull requests, solo cuando el usuario te los pida.

**Antes de escribir nada.**

1. `git branch --show-current` debe dar `feature/contenido-claro`.
2. `git status --short` debe mostrar **o bien** estos archivos sin commit, todos bajo `openspec/`, **o bien** el árbol limpio con un commit del usuario encima de `c1ebf73`:
   - `openspec/guia-de-contenido.md`
   - `openspec/handoff-prompt.md`
   - en `openspec/changes/contenido-claro/`: `content-map.md`, `decisiones.md`, `design.md`, `proposal.md`, `proyecto-tienda.md`, `tasks.md` y los tres `spec.md` de `specs/` (`app-shell`, `concept-graph`, `content-model`)

   Cualquier otra cosa: detente y dímelo.
3. Ejecuta `npm run typecheck`, `npm test`, `npm run lint` y `npm run build`. Última ejecución, del 2026-11-14: typecheck en verde; 327 pruebas en 16 archivos; lint con 0 errores y 14 avisos; build con 43 temas.
4. Hay un servidor de desarrollo de este proyecto abierto en el puerto 5173: no lances `npm run content` a mano mientras esté abierto.

**Qué pasó desde tu última sesión.** El usuario leyó el piloto: 10 de 11 respuestas como se esperaba. Falló la 1, por los ejercicios de Practicar ("pregunta cosas que no se explicaron"). Fable 5.2 lo resolvió con él el 2026-11-14. Lo que cambió en los documentos vinculantes:

- **Guía.**
  - Sección nueva "Los ejercicios" y pregunta 14 de la lista de comprobación: un ejercicio solo pregunta lo que su tema explica en prosa, y todo nombre que usan su enunciado y sus opciones se presenta antes en una frase del tema. La respuesta de entrevista y el interior de un bloque de código no cuentan.
  - Cómo se cumple: si falta materia del tema, se amplía el tema; si es un nombre accesorio, se reescribe el enunciado. La respuesta correcta no cambia.
  - Corregidos los datos que encontraste mal en los modelos 1, 3 y 4. Si un modelo y su tema publicado difieren, vale el tema publicado.
- **`design.md`.**
  - Decisión 17, nueva: la regla de los ejercicios.
  - Decisión 11: la lista tiene 14 preguntas; la verificación de cada grupo deja un registro por ejercicio; los scripts de verificación se guardan en el repositorio.
  - Decisión 12: resultado del guion y segunda parada.
- **`content-map.md`.**
  - Sección 7, nueva: qué campos de un ejercicio pueden cambiar y las correcciones concretas de las piezas del piloto.
  - Sección 3: `errores-problem-details` pasa de los `covers` de `proyecto-crear-pedido` a los de `proyecto-api-completa`.
- **`proyecto-tienda.md`.**
  - Dominio `api.tienda.co`, y convención 8: la cabecera `Host` solo en los temas que la explican o la necesitan.
  - Sección nueva "Detalles ya fijados por el contenido publicado": lo que tú marcaste "para que Fable lo revise" queda fijado como lo escribiste. `calcular_total` lo llama `POST /v1/pagos`.
- **Specs.** El escenario "Ejercicios trasladados" de content-model dice ahora siete ejercicios sin repetir; tres escenarios de la entrada "crear un pedido" dicen siete temas reunidos, dos de HTTP y REST.
- **`tasks.md`.** Tareas 4.10 a 4.16 nuevas; cambian las definiciones de "Reescribir un tema" y de "Verificación del grupo"; las tareas 5.4, 9.4, 10.4 y 14.3 llevan una frase más. Total: 21 de 93.

**Qué hacer, en orden.** Las tareas 4.10 a 4.16, tal como están en `tasks.md`. Lo que conviene saber:

- **4.10.** Tus scripts siguen en `/private/tmp/claude-501/-Users-yotfil--claude-spares-spare-QTpqJO/f3e5da49-0ef9-411b-bf0b-1fb84992f1fe/scratchpad/` (comprobado el 2026-11-14): `check-python.py`, `check-content.mts`, `check-content-es.mts`, `check-entry.mts` y `check-48.mts`. Dónde se guardan y cómo se llaman lo decides tú y lo anotas.
- **4.11.** El 202 y el 409 se explican en prosa dentro de las extensiones de la guía (los cuatro momentos y los cuatro malentendidos ya están al máximo). Si no caben, es una pregunta para Fable.
- **4.12 a 4.14.** Son cambios de pocas líneas, en `es.md` y `en.md`.
- **4.15.** Si una pieza del piloto no coincide con "Detalles ya fijados por el contenido publicado", no la corrijas: anótalo como pregunta para Fable.
- **4.16.** Segunda parada: el usuario publica la rama (o te pide el push), relee Practicar de las tres piezas y responde una pregunta. Con un "sí", el relevo es para Opus, grupo 5. Con otra respuesta, para Fable.

Al terminar, muestra el resumen de cierre y haz `/relevo`.

**Preguntas abiertas para Fable 5.2.** Ninguna.

**Entradas de `decisiones.md` sin revisar** (las revisa Fable antes de archivar; el usuario, después). Las marcadas "para que Fable lo revise" del grupo 4 ya están resueltas: ver la sección "Resoluciones de Fable 5.2 con el usuario (2026-11-14)" al final de ese archivo. Siguen pendientes de la revisión final:

- Confirmaciones: los cinco detalles del diseño, confirmados al empezar el grupo 1.
- Grupo 1: 1.2 (título de paso como `<h4>` y qué se reconoce como paso), 1.3 (aspecto), 1.4 (paridad), 1.2 a 1.4 (dónde van las pruebas).
- Grupo 2:
  - 2.1 y 2.2: `kind`/`covers` y `freq` opcional, también en el nodo del grafo. Marcada para Fable.
  - 2.1: reglas de validación y mensajes.
  - 2.2: las conexiones de las entradas se crean antes que las demás.
  - 2.2 y 2.4: relacionados y vecinos. Marcada para Fable: un tema reunido muestra la entrada que lo reúne.
  - 2.3: aspecto del lector de una entrada.
  - 2.4: sin refuerzo visual. Marcada para Fable: el tamaño del nodo sin frecuencia.
  - 2.1 a 2.4: dónde van las pruebas.
- Grupo 3: 3.1 (la prueba fija el orden de `content-map.md`).
- Grupo 4: todas las de 4.1 a 4.9, salvo los puntos ya resueltos.

**Recordatorios.**

- Los merges a `develop` van con squash; los de `develop` a `main`, con merge commit (`openspec/git-workflow.md`). El pull request a `develop` va al final, con el cambio archivado.
- Al terminar todo el cambio, la tabla de versiones de ese archivo debe apuntar `v0.2.3`.

**Pendiente fuera de este cambio.** Después de archivar `contenido-claro`, Fable define la pista SQL (punto 3 del plan), redactada directamente con la guía, con la regla "no se inventa información" y con la sección "Los ejercicios". Sus compromisos (N+1, inyección SQL, transacciones) están en la memoria `plan-de-cambios`.
