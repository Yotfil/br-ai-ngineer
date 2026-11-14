---
name: "Retomar"
description: "Arranca una sesión: el modelo se identifica, lee reglas y estado, y dice qué le toca"
---

Retoma el trabajo de este proyecto. Respóndeme en español. No escribas ni ejecutes nada que cambie archivos hasta terminar el paso 4.

Indicación mía, si la hay: $ARGUMENTS

1. **Identifícate.** Di qué modelo eres, según tu prompt del sistema.

2. **Lee**, en este orden:
   - En la memoria del proyecto: `reglas-fable-specs-opus-implementa.md` y `plan-de-cambios.md`.
   - `openspec/handoff-prompt.md`.
   - `openspec/git-workflow.md`.
   - Del cambio en curso (`openspec list --json`): `tasks.md` y, si existe, `decisiones.md`.

3. **Comprueba** la rama (`git branch --show-current`) y `git status --short`. Si no coinciden con lo que dice el handoff, detente y dímelo.

4. **Dime qué te toca**, en pocas líneas:
   - Qué modelo eres y qué puedes y no puedes hacer aquí según las reglas.
   - Si el handoff está escrito para otro modelo, dilo y no sigas: indícame qué modelo abrir.
   - Si eres Fable: las preguntas abiertas que hay que resolver, cada una con tu recomendación; o la revisión de `decisiones.md` si el cambio está listo para archivar; o qué cambio toca definir según el plan.
   - Si eres Opus: el grupo de `tasks.md` que te toca en esta sesión (uno solo), qué tareas harás tú (`[opus]`), cuáles delegarás al subagente `repetidor` (`[sonnet]`) y cuáles están bloqueadas por una pregunta para Fable. Comprueba que el tipo de agente `repetidor` te aparece disponible; si no, dímelo y usa Agent con `model: sonnet` copiando las reglas de `.claude/agents/repetidor.md`.

5. **Espera mi confirmación** antes de empezar.
