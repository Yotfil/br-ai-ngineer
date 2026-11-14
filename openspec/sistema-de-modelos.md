# Sistema de modelos: quién decide, quién implementa y cómo se releva

Guía de consulta. Las reglas que obedecen los modelos están en la memoria del proyecto (`reglas-fable-specs-opus-implementa`); este documento las explica. Acordado el 2026-11-13. Es un experimento solo para este proyecto, a evaluar después de la pista SQL.

## En una frase

Fable decide contigo, Opus implementa y coordina, Sonnet copia patrones; el estado vive en archivos, y tú cambias de sesión con `/relevo` y `/retomar`.

## Chuleta: qué hago yo

| Quiero… | Abro | Escribo |
|---|---|---|
| Definir un cambio nuevo | Fable | `/retomar` o `/opsx:propose` |
| Implementar el siguiente grupo de tareas | Opus, sesión nueva | `/retomar` |
| Resolver una pregunta que dejó Opus | Fable, sesión nueva | `/retomar` |
| Cerrar una sesión | — | `/relevo` |
| Arreglar un bug que incumple una spec | Opus | lo pido directamente |
| Revisar decisiones antes de archivar | Fable, sesión nueva | `/retomar` |

Nunca cambio de modelo con el selector dentro de una sesión: se conserva la conversación pero se pierde la caché y el turno siguiente se paga completo.

## Quién hace qué

| Modelo | Hace | Decide | Cómo se usa |
|---|---|---|---|
| **Fable 5.2** | Specs, diseño, resolver vacíos, revisar `decisiones.md` | Lo crítico, siempre conmigo | Sesión propia |
| **Opus 5.5** | Código nuevo; coordina a Sonnet; revisa su trabajo | Lo no crítico, y lo anota | Sesión propia, una por grupo de tareas |
| **Sonnet 5.5** | Código que repite un patrón ya hecho | Nada | Subagente `repetidor`, lo lanza Opus |

Fable no escribe código de la aplicación ni coordina la implementación. Sonnet nunca se abre como sesión.

## Qué es una decisión crítica

Lo es si cumple cualquiera de estas. En la duda, es crítica.

1. Cambia lo que veo o estudio: producto, contenido, textos, comportamiento visible.
2. Toca el modelo de contenido o un contrato entre módulos.
3. Añade o cambia una dependencia, o afecta despliegue, seguridad o costo.
4. Contradice una spec, o la spec es ambigua o tiene un vacío ahí.
5. No se deshace con un solo commit.

| Si la decisión es… | Opus hace |
|---|---|
| **No crítica** | La toma, la anota en `openspec/changes/<cambio>/decisiones.md` (tarea, qué, por qué, cómo deshacerla) y sigue. |
| **Crítica** | Se detiene en esa tarea, deja la pregunta exacta en `openspec/handoff-prompt.md` y sigue con las tareas que no dependan de ella. |

## Etiquetas en `tasks.md`

Fable las pone al definir el cambio:

```
- [ ] 3.1 [opus] Migrar el tema "SELECT y filtros"
- [ ] 3.2 [sonnet: como 3.1] Migrar el tema "JOINs"
```

- `[opus]`: es la primera vez que se hace algo así.
- `[sonnet: como N.M]`: repite el patrón de esa tarea.
- Sin etiqueta: cuenta como `[opus]`.

Opus puede corregir la etiqueta en los dos sentidos:

- Una `[sonnet]` que no resulta ser un patrón limpio la hace él.
- En una `[opus]` con parte repetitiva, hace él el primer caso y delega las copias.

## Sesiones de Opus

Una sesión por grupo de `tasks.md` (cada encabezado `## N.`), siempre. Así el contexto no crece, que es donde está el costo. Al terminar el grupo, Opus muestra el resumen de cierre y hace el relevo:

- tareas hechas y por quién, y las que Sonnet devolvió;
- tareas bloqueadas, con la pregunta para Fable;
- decisiones nuevas en `decisiones.md`;
- resultado de las pruebas.

## Dónde está mi control

- Confirmo cada `/retomar` antes de que el modelo empiece.
- Leo el resumen de cierre de cada grupo.
- Fable revisa `decisiones.md` antes de archivar y me señala las que debieron escalarse; después la leo yo.
- Los commits, push y pull requests solo se hacen cuando los pido.
- No apruebo cada delegación a Sonnet: Opus revisa el diff y ejecuta la verificación antes de marcar la tarea.

## Bugs

- **Durante una tarea:** Opus arregla un bug ajeno solo si el arreglo no es crítico y está en archivos que su tarea ya toca, y lo anota. Si no, lo deja pendiente en el handoff.
- **Fuera de un cambio:** si el código incumple una spec existente, Opus lo arregla directamente. Si la spec no lo cubre, es un vacío y va a Fable.

## Los dos comandos

**`/relevo`** — al cerrar una sesión. El modelo comprueba el estado real, actualiza la memoria, sobrescribe `openspec/handoff-prompt.md` con el prompt para la sesión siguiente y me dice qué modelo abrir.

**`/retomar`** — al abrir una sesión. El modelo se identifica, lee reglas, plan, handoff y `tasks.md`, me dice qué le toca y espera mi confirmación. Si el handoff es para otro modelo, me avisa y no sigue.

Los dos aceptan una indicación: `/relevo me voy, sigo mañana con el grupo 4`.

## Ejemplo completo: la pista SQL

**Lunes, sesión con Fable.** Defino con Fable el cambio `pista-sql`. Queda un `tasks.md` con seis grupos. El grupo 3:

```
## 3. Migración de temas
- [ ] 3.1 [opus] Migrar el tema "SELECT y filtros"
- [ ] 3.2 [sonnet: como 3.1] Migrar el tema "JOINs"
- [ ] 3.3 [sonnet: como 3.1] Migrar el tema "Agregaciones"
- [ ] 3.4 [opus] Migrar "El problema N+1" (declara un concepto nuevo)
```

Escribo `/relevo`. Fable responde: *"Listo. Abre una sesión con Opus. Pendiente: los seis grupos, empezando por el 1."*

**Martes, sesión nueva con Opus.** Escribo `/retomar`:

> Soy Opus 5.5: implemento y decido solo lo no crítico. Rama `feature/pista-sql`, limpia. Me toca el grupo 1 (dos tareas, las dos mías). ¿Empiezo?

Digo que sí. Termina, muestra el resumen, hace el relevo. Sesión nueva, `/retomar`, grupo 2.

**Miércoles, grupo 3.** `/retomar`:

> Me toca el grupo 3. Haré yo la 3.1 y la 3.4. Delegaré a Sonnet la 3.2 y la 3.3, en paralelo, cuando la 3.1 esté hecha. ¿Empiezo?

Durante el trabajo pasan tres cosas:

1. **Decisión no crítica.** En la 3.1 Opus crea un helper para convertir las tablas de ejemplo. Lo anota en `decisiones.md` y sigue.
2. **Sonnet devuelve una tarea.** La 3.2 sale bien. En la 3.3 Sonnet informa que el tema tiene un ejercicio de tipo "ordenar pasos" que la referencia no tiene. Opus la hace él mismo.
3. **Decisión crítica.** En la 3.4 la spec no dice si el concepto N+1 se muestra con nombre en español o en inglés. Cambia lo que veo, así que Opus no decide y deja la 3.4 sin terminar.

Resumen de cierre:

> **Grupo 3**
> - 3.1 hecha por mí. 3.2 hecha por Sonnet, revisada. 3.3 la hice yo: Sonnet la devolvió.
> - 3.4 **bloqueada**: falta decidir el nombre visible del concepto N+1 (`specs/content/spec.md`, requisito "Conceptos con hogar").
> - Una decisión nueva en `decisiones.md` (helper de tablas).
> - Pruebas en verde.

Y tras el relevo: *"Hay una pregunta para Fable. Puedes abrir Fable ahora, o seguir con Opus en el grupo 4, que no depende de la 3.4."*

**Abro Fable.** `/retomar`:

> Soy Fable 5.2: solo specs y decisiones. Hay una pregunta abierta: nombre visible del concepto N+1. Recomiendo "El problema N+1", igual que el título del tema. ¿Lo dejamos así?

Respondo, Fable corrige la spec, `/relevo`, y vuelvo a Opus, que al retomar ve la 3.4 desbloqueada.

**Al final del cambio.** Una sesión corta de Fable lee `decisiones.md` y me señala si alguna debió escalarse. Después se archiva.

## Archivos del sistema

| Archivo | Para qué |
|---|---|
| `openspec/changes/<cambio>/tasks.md` | Qué falta y de quién es cada tarea |
| `openspec/changes/<cambio>/decisiones.md` | Decisiones no críticas de Opus |
| `openspec/handoff-prompt.md` | Prompt de arranque de la sesión siguiente; se sobrescribe |
| `.claude/commands/relevo.md`, `retomar.md` | Los dos comandos |
| `.claude/agents/repetidor.md` | Sonnet con sus reglas fijas |
| Memoria del proyecto | Reglas, plan de cambios, estado |

## Por qué está hecho así

- **Prioridad: reducir costos**, automatizando lo posible sin perder control.
- **Fable no coordina** porque arrastraría toda la conversación de specs, a su precio, durante la implementación.
- **Sonnet es subagente** porque lo que lee y prueba no entra al contexto de Opus: Opus solo paga el encargo, el informe y revisar el diff.
- **Sesiones cortas** porque en una sesión larga cada turno relee toda la conversación.
- **Las reglas de Sonnet van en su propio archivo** porque los subagentes no ven la memoria del proyecto.

## Qué evaluar después de la pista SQL

- ¿Cortar siempre por grupo fue demasiado rígido?
- ¿Cuántas tareas `[sonnet]` devolvió Sonnet? Si son muchas, Fable está etiquetando mal.
- ¿Fable encontró decisiones mal clasificadas en `decisiones.md`?
- ¿Se nota el ahorro frente a hacerlo todo con Opus?
