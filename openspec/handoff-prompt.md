Este prompt es para **Opus 5.5**. El cambio de OpenSpec en curso es `contenido-claro`, en la rama `feature/contenido-claro`. Te toca **el grupo 6** de `tasks.md` ("Python: errores, módulos y entornos", tareas 6.1 a 6.4), sin empezar el 7. Respóndeme en español.

**Reglas que te aplican.** Antes de actuar, lee en la memoria del proyecto `reglas-fable-specs-opus-implementa.md`, `plan-de-cambios.md` y `explicaciones-sin-numeros-de-tarea.md`. En resumen:

- Eres Opus 5.5: orquestas e implementas. Haces las tareas `[opus]` y delegas las `[sonnet]` al subagente `repetidor`.
- Las decisiones no críticas las anotas en `decisiones.md` y sigues. Ante una crítica te detienes en esa tarea, la dejas en este archivo como pregunta para Fable 5.2 y sigues con lo que no dependa de ella.
- La regla "no se inventa información" del inicio de `tasks.md` vale para todo lo que escribas o traduzcas; cópiala entera en cada encargo a Sonnet.
- Una sesión, un grupo. Al terminar, resumen de cierre y `/relevo`.
- Commits, push y pull requests, solo cuando el usuario los pida.
- Al usuario, el estado se le explica con palabras: qué se hizo, qué debe revisar y qué sigue, sin citar números de tarea. Los números van en los archivos.

**Antes de escribir nada.**

1. `git branch --show-current` debe dar `feature/contenido-claro`.
2. `git status --short` debe mostrar, sin commit sobre `52244bd`, exactamente esto (o el árbol limpio con un commit del usuario encima). Cualquier otra cosa: detente y díselo al usuario.
   - Borrados: `content/python/comprehensions-y-generadores/` (`en.md`, `es.md`, `meta.yaml`).
   - Modificados: `content/python/estructuras-de-datos/` y `content/python/tipado-y-type-hints/` (`en.md` y `es.md`), `scripts/check/exercises.ts`, `scripts/check/python-blocks.py`, `openspec/handoff-prompt.md` y, en `openspec/changes/contenido-claro/`, `content-map.md`, `decisiones.md`, `proyecto-tienda.md` y `tasks.md`.
   - Nuevos: `content/python/comprehensions/`, `content/python/generadores/` y `content/python/proyecto-total-del-pedido/`.
3. `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` en verde. Última ejecución, del 2026-11-17: 327 pruebas en 16 archivos; lint con 0 errores y 14 avisos; build con 45 temas, 160 nodos y 250 enlaces.

**Estado.** El grupo 5 está terminado y verificado (34 de 93 tareas): `tipado-y-type-hints`, `estructuras-de-datos`, `comprehensions`, `generadores` y la entrada `proyecto-total-del-pedido`, en español e inglés. Pasaron `scripts/check/`, las cuatro comprobaciones y la revisión en el navegador (`decisiones.md`, sección 5.6). Todo el grupo 5 sigue sin commit. No queda nada sin verificar.

**Lo que haces en esta sesión.**

1. **6.1 [opus].** Partir `errores-y-context-managers` en `excepciones` (orden 9) y `context-managers` (orden 10), como la 4.2 y la 5.3, y reescribir ambos.
   - Todo lo de la partición está en `content-map.md` sección 1: conceptos (`try-except` y `eafp` van a `excepciones`; `context-manager`, a `context-managers`), títulos ("Títulos de los temas nuevos"), ejercicios (el grupo "¿Qué imprime este código?" va a `excepciones`; la "Pregunta rápida" de `with open(...)`, a `context-managers`) y `related`.
   - El enlace `[[context-manager]]` de `inyeccion-con-depends` sigue valiendo: es un concepto y cambia de hogar.
   - `proyecto-importar-catalogo` (grupo 7) reunirá `excepciones`, `context-managers` y `modulos-y-paquetes`: los pasos de proyecto deben coincidir con `proyecto-tienda.md`.
2. **6.2 [opus].** Partir `modulos-y-entornos` en `modulos-y-paquetes` (orden 11) y `entornos-y-dependencias` (orden 12), y reescribir ambos.
   - Conceptos: `modulo` y `paquete` frente a `entorno-virtual` y `uv`. Ejercicios: el de `if __name__ == "__main__":` va a `modulos-y-paquetes`; el del archivo de bloqueo de uv, a `entornos-y-dependencias`.
   - Actualiza el `related` de `content/python/estructura-del-proyecto/meta.yaml`, que hoy apunta a `modulos-y-entornos`, según `content-map.md`.
   - `entornos-y-dependencias` no lleva paso de proyecto (`proyecto-tienda.md`, convención 5); anótalo en `decisiones.md`.
   - Lo de uv y venv no se puede ejecutar como Python: confírmalo en la documentación oficial de uv y de Python antes de escribirlo, y deja las fuentes en `decisiones.md`.
3. **6.3 [sonnet: como 4.1].** Traducir las cuatro piezas, un subagente `repetidor` por pieza, en paralelo. Lanza cada encargo en cuanto termines el español de esa pieza, mientras sigues con la otra partición. El encargo es como el de la 5.5 (`decisiones.md`): la definición de "traducir", una mitad ya traducida como referencia, qué se conserva del `en.md` antiguo (sacado de `52244bd`), la regla "no se inventa información" entera y cómo verificar con `python-blocks.py` y `content-es.ts`. Revisa cada diff tú.
4. **6.4 [opus].** Verificación del grupo, como la 4.8 y la 5.6:
   - una línea por pieza y la pregunta 14 ejercicio por ejercicio;
   - `scripts/check/` en los dos idiomas, con `exercises.ts <tema>=<origen>` en las mitades;
   - las cuatro comprobaciones;
   - el navegador. Si `scripts/content/pista-python.test.ts` nombra los temas antiguos, adáptalo (design.md decisión 14) y anótalo.
5. Marca 6.1 a 6.4 en `tasks.md`, da el resumen de cierre y haz `/relevo`. El siguiente relevo es para Opus 5.5 (grupo 7), salvo que quede una pregunta para Fable.

**Navegador.** Pídele al usuario que levante su servidor de desarrollo en el puerto 5173. Ábrelo con `preview_start` con `url` (`http://localhost:5173/...`), que solo abre una pestaña; nunca `preview_start` con `name`, que arranca un segundo servidor.

**Herramientas y patrones.** `scripts/check/` (tabla en `decisiones.md`, sección 4.10). Partición: 4.2 y 5.3. Reescritura: 4.1. Traducción: 4.1, 4.7 y 5.5. Pregunta 14: 4.15 y 5.6.

**Preguntas abiertas para Fable 5.2.** Ninguna te bloquea. Quedan dos marcas, para revisar antes de archivar, en `decisiones.md`, "5.4 `proyecto-total-del-pedido`: cómo se escribió":

- La parte 4 de la entrada no empieza por la ruta de un archivo, como pide la sección "Entradas de proyecto" de `openspec/guia-de-contenido.md`. Empieza por `# en la consola de Python, abierta en la carpeta tienda-api/`, porque ningún archivo de la tienda ejecuta los pedidos de ejemplo. ¿Se acepta, se quita la parte o se fija un archivo?
- Ids de ejemplo nuevos en esa parte: taza 43, molinillo 44, pedidos 1201 y 1202 (café 42 ya estaba en `cache-http`). ¿Se fijan en "Detalles ya fijados" de `proyecto-tienda.md` o se cambian?

**Entradas de `decisiones.md` sin revisar por Fable** (no te bloquean; se revisan antes de archivar):

- Confirmaciones del grupo 1 y grupo 1: 1.2 a 1.4.
- Grupo 2: 2.1 a 2.4. Tres marcadas para Fable: `kind`/`covers` en el nodo del grafo; una entrada aparece en los relacionados de sus temas; el tamaño del nodo sin frecuencia.
- Grupo 3: 3.1.
- Grupo 4: 4.1 a 4.9, salvo lo resuelto el 2026-11-14, y 4.10 a 4.16. La 4.11 está marcada para Fable: el email repetido como ejemplo del 409.
- Grupo 5: 5.1, 5.3, 5.4 ("cómo se escribió", con las dos marcas de arriba, y sus fuentes), 5.5 y 5.6 (con la verificación de la entrada y el navegador). La 5.2 y la pregunta de la 5.4 quedaron resueltas el 2026-11-17.

**Recordatorios.**

- Los merges a `develop` van con squash; los de `develop` a `main`, con merge commit (`openspec/git-workflow.md`). El pull request a `develop` va al final, con el cambio archivado.
- Al terminar todo el cambio, la tabla de versiones de ese archivo debe apuntar `v0.2.3`.

**Pendiente fuera de este cambio.** Después de archivar `contenido-claro`, Fable define la pista SQL (punto 3 del plan), redactada directamente con la guía, con la regla "no se inventa información" y con la sección "Los ejercicios". Sus compromisos (N+1, inyección SQL, transacciones) están en la memoria `plan-de-cambios`.
