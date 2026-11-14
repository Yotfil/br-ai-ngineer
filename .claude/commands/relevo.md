---
name: "Relevo"
description: "Guarda el estado para retomar el trabajo en otro contexto o con otro modelo"
---

Voy a retomar este trabajo en otro contexto. Deja todo listo para que la sesión siguiente arranque sin esta conversación. Respóndeme en español.

Indicación mía sobre el relevo, si la hay: $ARGUMENTS

1. **Estado real.** Comprueba la rama (`git branch --show-current`), `git status --short` y `openspec list --json`. En el cambio en curso, marca en `tasks.md` solo las tareas hechas y verificadas.

2. **Memoria.** Actualiza la memoria del proyecto con lo que haya cambiado en esta sesión y deba durar: decisiones mías, cambios al plan, compromisos nuevos. No copies lo que ya dicen `tasks.md` o el historial de Git.

3. **Resumen de cierre** (si eres Opus y cierras un grupo de tareas). Muéstramelo antes de escribir el handoff:
   - tareas hechas y por quién (tú o Sonnet), y las que Sonnet devolvió;
   - tareas bloqueadas, con la pregunta exacta para Fable;
   - decisiones nuevas en `decisiones.md`;
   - resultado de las pruebas.

4. **Quién sigue.** Decide para qué modelo es la sesión siguiente según las reglas de la memoria (`reglas-fable-specs-opus-implementa`):
   - Hay una decisión crítica abierta, o toca definir un cambio: **Fable 5.2**.
   - Hay tareas por implementar sin bloqueo: **Opus 5.5**, en una sesión nueva para el grupo siguiente.
   - Todas las tareas están hechas: **Fable 5.2**, para revisar `decisiones.md` antes de archivar.
   - Si hay una pregunta para Fable y además grupos que no dependen de ella, dime las dos opciones.

5. **Prompt de arranque.** Sobrescribe `openspec/handoff-prompt.md`. Debe poder leerse sin esta conversación e incluir, en este orden:
   - Para qué modelo es y qué cambio de OpenSpec está en curso.
   - Las reglas que le aplican a ese modelo, resumidas, y que lea la memoria antes de actuar.
   - Qué comprobar antes de escribir nada (rama, pruebas en verde).
   - Estado: qué está hecho, qué queda sin commit, qué se verificó y qué no.
   - Qué hacer, en orden, con el número de cada tarea. Para Opus: un solo grupo de `tasks.md`.
   - Preguntas abiertas para Fable, cada una con archivo, requisito o tarea exactos.
   - Entradas de `decisiones.md` que aún no he revisado.

6. **Dime** la ruta del archivo, qué modelo debo abrir y, en dos o tres líneas, qué queda pendiente.

Nunca escribas el prompt de relevo en un `CLAUDE.md`. No hagas commits ni push por este comando.
