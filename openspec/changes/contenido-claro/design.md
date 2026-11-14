# Design

## Context

La app tiene 41 temas publicados (20 de HTTP y REST, 21 de Python y FastAPI), migrados tal cual de dos guías HTML. El usuario los leyó y no entiende varios. El diagnóstico, las reglas de redacción y cuatro temas modelo están en `openspec/guia-de-contenido.md`.

Documentos vinculantes de este cambio, además de este:

- `openspec/guia-de-contenido.md`: cómo se escribe cada tema. Reglas, tabla por sección, modelos y lista de comprobación.
- `proyecto-tienda.md`: el proyecto de ejemplo que usa todo el código.
- `content-map.md`: identificadores, títulos, orden, reparto de conceptos y ejercicios, entradas de proyecto, piloto y reparto por grupos.

Estado del código que condiciona el diseño:

- `scripts/content/sections.ts` parte el cuerpo de cada tema por encabezados `## clave` y, en `code:example`, rechaza cualquier línea de texto fuera de un bloque de código (`checkExample`). `code:wire` y `code:server` ya admiten texto.
- `scripts/content/markdown.ts` sanea el HTML con una lista de etiquetas que no incluye encabezados: hoy un `###` dentro de una sección se pierde.
- La regla "el código es idéntico en ambos idiomas" solo está escrita en `content/README.md`; la compilación no la comprueba.
- `scripts/content/pista-python.test.ts` fija 21 temas con orden consecutivo de 1 a 21.
- `scripts/migrate/` regenera `content/` desde las guías originales. Tras este cambio dejaría de coincidir con el contenido.

## Reglas de implementación

- Rama `feature/contenido-claro`. Una sesión de Opus por grupo de `tasks.md`.
- El grupo 4 (piloto) termina con una parada obligatoria: no se empieza el grupo 5 hasta que el usuario haya respondido el guion de la decisión 12 con todo "sí".
- La redacción de textos y código de ejemplo dentro de las reglas de la guía, de `proyecto-tienda.md` y de `content-map.md` está delegada a Opus: no es una decisión crítica mientras siga esos tres documentos. Sí son críticas, y van a Fable 5.2: cambiar un identificador, un título, el hogar de un concepto, la respuesta de un ejercicio, el alcance de una entrada de proyecto, añadir algo al proyecto de ejemplo, o saltarse una regla de la guía.
- Ningún bloque de código se da por bueno sin ejecutarlo cuando es ejecutable (decisión 11).

## Goals / Non-Goals

**Goals:**

- Que cada tema se entienda leyéndolo una vez de arriba abajo, sin conocer el tema de antemano.
- Que el código de ejemplo pertenezca a un proyecto reconocible y que, cada cierto número de temas, una entrada de proyecto muestre esos temas trabajando juntos.
- Que el usuario valide el nivel con un piloto antes de reescribir el resto.
- Que las pistas siguientes puedan escribirse directamente con este formato.

**Non-Goals:**

- Ejercicios nuevos y demos.
- Cambiar el aspecto general del lector, las pestañas o el cerebro.
- Reordenar temas, salvo lo que impone partir ocho de ellos e intercalar las entradas de proyecto.
- Títulos cortos para la pista HTTP y REST.
- Ejecutar de forma automática el código de los ejemplos en las pruebas.

## Decisions

### 1. La guía de redacción es la norma

Todo tema reescrito cumple `openspec/guia-de-contenido.md`: sus seis reglas, la tabla "Cómo se escribe cada sección" y la lista de comprobación. Cada tema se escribe imitando el modelo de su tipo.

Decidido por el usuario el 2026-11-13: el nivel ("casi como si fueran para un junior"), que no sea extenso, y el ejemplo de Decoradores como referencia de tono.

### 2. Pasos con título en las secciones de código

En `code:example`, `code:wire` y `code:server`, un encabezado de nivel 3 (`### Título`) es el título de un paso. Debajo puede llevar texto, uno o más bloques de código y más texto.

````markdown
## code:example

### Paso 1. Una función se puede pasar a otra función

Texto opcional antes del bloque.

```python
def saludar():
    print("hola")
```

Texto opcional después del bloque.

### Paso 2. Un decorador hecho a mano
````

- `code:example` deja de exigir "solo bloques de código": admite texto y pasos. Sigue exigiendo al menos un bloque, y que cada bloque declare su lenguaje.
- El encabezado `###` solo se admite en esas tres secciones y en las dos de una entrada de proyecto (decisión 6). En cualquier otra sección es un error de compilación que nombra el archivo y la sección.
- El título lo escribe el autor completo, con su número: `Paso 1.`, `Paso 2.` en español y `Step 1.`, `Step 2.` en inglés. En la conversación por la red de un tema de HTTP y REST se usa `Momento 1.` y `Moment 1.`. La compilación no numera ni comprueba la numeración.
- El lector muestra cada título de paso como un subtítulo encima de su contenido, con el mismo estilo en las tres secciones. El aspecto concreto (tamaño, color, separación) lo decide Opus dentro de la estética actual y lo anota en `decisiones.md`.
- **Paso de proyecto** (regla 6 de la guía): es el último paso numerado y su título lleva "En el proyecto:" tras el número (`### Paso 5. En el proyecto: …`; en inglés, "In the project:").
- **Paso avanzado** (decidido por el usuario): es un paso más, al final, siempre visible. Su título empieza por `Avanzado.` en español y `Advanced.` en inglés, en lugar del número, y va después del paso de proyecto. No hay componente plegable.

### 3. Mínimo de pasos en el ejemplo principal

Al terminar el cambio, todo `code:example` tiene al menos dos pasos con título. La compilación lo exige.

Esta validación se activa en el grupo de cierre (tarea 14.2), no antes: mientras queden temas sin reescribir, la app debe seguir compilando para poder publicar la vista previa del piloto.

`code:wire` y `code:server` no tienen mínimo: un intercambio simple puede no necesitar pasos.

### 4. Paridad de código entre idiomas

Decidido por el usuario: los comentarios del código se traducen.

- En cada sección, `es.md` y `en.md` tienen el mismo número de bloques de código, en el mismo orden y con el mismo lenguaje resuelto, y el mismo número de títulos de paso. La compilación lo comprueba y, si falla, nombra el tema y la sección.
- No se comprueba que el código sea idéntico. Por convención (`proyecto-tienda.md`), entre idiomas solo cambian los comentarios y los textos que el código imprime o devuelve al usuario; los nombres de variables, funciones, clases y rutas son los mismos.
- Esta comprobación se activa desde el grupo 1: el contenido actual ya la cumple, porque hoy el código es idéntico en ambos idiomas.
- `content/README.md` sustituye la frase "El código de los ejemplos es idéntico en ambos idiomas" por esta regla.

### 5. Rótulo del ejemplo principal

El rótulo de `code:example` pasa de "Ejemplo: la API de la tienda" a **"Paso a paso"** (inglés: **"Step by step"**), porque los primeros pasos ya no son código de la tienda. Los demás rótulos no cambian.

### 6. Entradas de proyecto

Decidido por el usuario: entrada propia en la lista de temas, dentro de este cambio, cinco en la pista Python y FastAPI (`content-map.md`, sección 3).

**Modelo.** Una entrada de proyecto es una carpeta de tema cuyo `meta.yaml` declara `kind: project`:

```yaml
id: proyecto-crear-pedido
track: python
order: 23
group: fastapi
kind: project
covers:                 # temas que reúne, de cualquier pista
  - rutas-y-parametros
  - modelos-y-response-model
  - codigos-de-estado
```

- `kind` es opcional; sin él, la entrada es un tema normal. Único valor admitido: `project`.
- `covers` es obligatorio en una entrada de proyecto, con al menos dos identificadores. Cada uno debe ser un tema existente que no sea a su vez una entrada de proyecto. No admite conceptos.
- Una entrada de proyecto no puede declarar `freq`, `concepts`, `related` ni `demo`. Sus archivos `es.md` y `en.md` no llevan `concepts` ni `exercises`. Llevan `title`, `summary` y, como en los temas, `short` opcional.
- Su cuerpo tiene exactamente dos secciones, ambas obligatorias, y ninguna de las de un tema:

| Clave | Rótulo (es) | Rótulo (en) | Contenido |
|---|---|---|---|
| `context` | Qué vamos a construir | What we're building | Qué funcionalidad es, quién la usa y qué archivos se van a ver. 3 a 5 frases. Sin código. |
| `walkthrough` | El código, parte por parte | The code, part by part | Entre 3 y 6 partes. Cada parte es un título `### Parte N. …` (`### Part N. …`), un bloque de código cuyo primer renglón es un comentario con la ruta del archivo, y una nota de 1 a 3 frases que explica qué hace esa parte y enlaza con `[[id]]` el tema donde se estudia. |

- Cada identificador de `covers` debe aparecer enlazado con `[[id]]` al menos una vez en `walkthrough`, en ambos idiomas. Si falta alguno, la compilación falla y lo nombra.
- Cada bloque de `walkthrough` declara su lenguaje y tiene 25 líneas como máximo (límite de redacción, no de compilación). El código es de la tienda de principio a fin: aquí no hay pasos con código aislado.
- La paridad entre idiomas de la decisión 4 se aplica igual.
- En la salida generada, una entrada de proyecto es un tema con `kind: 'project'` y la lista `covers`; no lleva `freq`.

**Lector.** Una entrada de proyecto se abre en el mismo panel que un tema, con su pista, título y resumen, sin indicador de frecuencia y **sin pestañas**. En una sola columna desplazable muestra, en este orden:

1. `context`, bajo su rótulo.
2. `walkthrough`, bajo su rótulo, con sus partes.
3. La lista "Temas que reúne este proyecto" (inglés: "Topics this project brings together"), generada a partir de `covers` en su orden: el título de cada tema, como enlace que lo abre.

Cerrar, anterior, siguiente, enlaces dentro del texto, dirección compartible y modos de fondo funcionan como en un tema. El panel de relacionados muestra los temas de `covers` como relacionados y ningún concepto.

**Listas de temas.** Aparece en el sidebar y en la hoja de temas del teléfono en la posición de su `order`, dentro de su grupo, con su título corto, igual que un tema. No lleva marca de frecuencia. El prefijo "Proyecto:" del título es lo que la distingue; cualquier refuerzo visual adicional es opcional, no crítico, y se anota en `decisiones.md`.

**Cerebro.** Es un nodo de tipo tema de su pista, con el nombre de su título corto, conectado con cada tema de `covers` mediante una conexión de tipo relación, aunque sea de otra pista. Los enlaces `[[id]]` de su texto crean conexiones como en cualquier tema. No tiene conceptos colgando.

**Buscador.** Se indexa como un tema: por título, alias del título en el otro idioma y resumen.

### 7. Proyecto de ejemplo único

Decidido por el usuario: una tienda en línea con pedidos. Fintech y logística quedan reservadas para la sección "Casos".

`proyecto-tienda.md` fija entidades, rutas, carpetas, datos de ejemplo y convenciones. La regla 6 de la guía ("el último paso lo sitúa en el proyecto") se aplica según sus convenciones 2 a 5.

### 8. Temas partidos

Decidido por el usuario: los ocho de `content-map.md`, sección 1.

- La carpeta del tema de origen se borra y se crean las dos nuevas. No se conserva redirección: la dirección antigua muestra el mensaje existente "No se encontró el tema". La app solo la usa el propio usuario y aún no hay enlaces externos.
- Cada mitad es un tema completo, con sus cinco secciones obligatorias y su propio paso a paso.
- El reparto de conceptos, ejercicios y relaciones es el de `content-map.md`. Ningún concepto se redefine: se mueve.
- La mención a otra mitad se hace con `[[id]]`, no repitiendo la explicación.

### 9. Orden y estado intermedio

`content-map.md`, sección 2, fija el orden final (1 a 34 en Python) y el provisional. La validación de contenido no exige hoy órdenes consecutivos; solo la prueba de `pista-python.test.ts`, que se adapta en la tarea 3.1 para comprobar el orden relativo y se deja con las cifras finales en el cierre.

Al final de cada grupo de tareas, `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` terminan en verde.

### 10. Inglés

Cada tema se reescribe primero en español. La versión inglesa es la traducción de la española ya terminada: misma estructura, mismos bloques, comentarios y textos impresos traducidos, nombres del código sin tocar. La traducción es el trabajo repetitivo de este cambio y se etiqueta `[sonnet]`, salvo la primera, que fija el patrón.

Entre que se escribe el español de un tema y se traduce, la paridad de la decisión 4 falla para ese tema: es lo esperado dentro de un grupo. Lo que debe estar en verde es el final del grupo.

### 11. Verificación del contenido

Decidido por el usuario: Opus verifica; el usuario solo lee el piloto.

- **No se inventa información** (pedido por el usuario el 2026-11-13; regla completa al inicio de `tasks.md`). Nada se escribe de memoria o por suposición: se ejecuta o se confirma en su fuente oficial, y ante cualquier duda se busca en internet. Lo que no se pueda confirmar no se escribe y va a Fable 5.2.
- **Código ejecutable.** Todo bloque de Python que no dependa de un servidor, una base de datos o un paquete externo se ejecuta con el `python3` de la máquina, y la salida escrita en los comentarios es la salida real. Se ejecuta la versión española; la inglesa solo difiere en textos.
- **Código no ejecutable** (FastAPI, SQLModel, HTTP): no se instala nada para ejecutarlo. Cada nombre, firma, parámetro, cabecera, código de estado y comando se confirma en la documentación oficial actual o en la especificación, y un comentario del bloque dice qué se da por hecho. Las fuentes consultadas se anotan en `decisiones.md`.
- **Lista de comprobación.** Cada tema pasa las 13 preguntas de la guía antes de marcarse hecho. La tarea de verificación de cada grupo deja en `decisiones.md` una línea por tema: "lista pasada", y cualquier excepción con su motivo.
- **Ejercicios.** Se ejecuta el código de cada ejercicio "¿Qué imprime?" de los temas del grupo y se comprueba que la respuesta marcada es la real. Una discrepancia no se corrige: se escala.
- No se añaden pruebas automáticas que ejecuten el contenido.

### 12. Piloto y guion de revisión

El grupo 4 produce las siete piezas de `content-map.md`, sección 4, en ambos idiomas, con la app en verde. Después Opus se detiene y pide al usuario que publique la rama (el push lo hace el usuario o se lo pide a Opus) y lea el piloto en la vista previa.

Guion que el usuario responde con sí o no, leyendo las siete piezas en español:

1. ¿Entendiste cada tema leyéndolo una sola vez, sin buscar nada fuera?
2. ¿Apareció alguna palabra técnica sin explicar? (Si sí, cuál y en qué tema.)
3. ¿Los pasos van de lo simple a lo real, sin saltos?
4. ¿Los comentarios del código te ayudaron a entenderlo?
5. ¿El último paso de cada tema te dejó claro dónde se usa eso en un proyecto real?
6. ¿La entrada "Proyecto: el endpoint de crear un pedido" te ayudó a ver los temas trabajando juntos?
7. ¿Los enlaces de la entrada de proyecto te llevan al tema que esperabas?
8. ¿Algún tema se te hizo demasiado largo o aburrido? (Si sí, cuál.)
9. ¿Los dos temas que salieron de "Funciones" se entienden mejor separados?
10. En inglés, abriendo un tema cualquiera del piloto: ¿los comentarios del código están en inglés?
11. En el teléfono: ¿los títulos de los pasos y los bloques de código se leen bien?

Las preguntas 2 y 8 esperan "no"; las demás, "sí". Con todas las respuestas esperadas, Opus sigue con el grupo 5 en una sesión nueva. Cualquier otra respuesta se anota con el detalle que dé el usuario y vuelve a Fable 5.2, que ajusta la guía antes de continuar.

### 13. Scripts de migración

Se borra `scripts/migrate/` completo en el grupo de cierre. Desde este cambio `content/` es la única fuente y se edita a mano. Las guías originales siguen en `legacy/` sin tocar. Si alguna prueba o script de `package.json` depende de `scripts/migrate/`, se retira con él.

### 14. Pruebas que fijan contenido antiguo

Las pruebas que comprueban textos, títulos, número de temas o estructura del contenido antiguo se actualizan a lo que dicen las specs de este cambio y `content-map.md`. Una prueba que proteja un requisito vigente no se borra: se adapta. Si una prueba protege algo que este cambio no menciona y la reescritura la rompe, es una pregunta para Fable 5.2.

### 15. Documentación

- `content/README.md`: pasos con título, paridad de código, `kind: project` con `covers` y sus dos secciones, y un enlace a `openspec/guia-de-contenido.md` como norma de redacción.
- `openspec/guia-de-contenido.md`: ya actualizada por Fable con las decisiones de este cambio. Opus no la modifica.

### 16. Versión

`v0.2.3`, según la regla de los cambios intercalados de `openspec/git-workflow.md`.

## Risks / Trade-offs

- **El cambio es grande** (46 piezas en dos idiomas) → va por grupos de 4 a 6 piezas, una sesión de Opus por grupo, con la app en verde al final de cada uno, y con el piloto como freno antes del grueso.
- **Errores de contenido al reescribir** (una explicación incorrecta estudia mal al usuario) → ejecución real del código ejecutable, comprobación de las respuestas de los ejercicios y lista de comprobación por tema. Queda riesgo en el código no ejecutable.
- **Temas más largos** → el límite es la tabla de extensión de la guía; la pregunta 8 del guion lo mide en el piloto.
- **Direcciones antiguas rotas** en los ocho temas partidos → aceptado: sin usuarios externos.
- **Traducción delegada a Sonnet** → Opus revisa el diff de cada traducción y la paridad la comprueba la compilación.
- **Estado intermedio largo**: durante varios grupos conviven temas reescritos y sin reescribir → no se integra en `develop` hasta el cierre; la vista previa de la rama es solo para el piloto.

## Temas que se retoman en cambios posteriores

- **Pista SQL (siguiente):** se redacta directamente con la guía y con la tienda como proyecto; sus entradas de proyecto se deciden al definirla. Los compromisos sobre N+1, inyección SQL y transacciones apuntan ahora a `orm-y-sesiones`, no a `base-de-datos`.
- **Pistas POO y Git:** igual.
- **Ejercicios nuevos** para los temas que quedan sin ninguno tras partirse (`closures-y-lambdas`, `openapi-automatico`).
- **Demos y Casos** (punto 6 del plan), sin cambios.

## Migration Plan

1. Grupos 1 y 2: formato y modelo, sin tocar el contenido. La app se comporta igual.
2. Grupo 3: renumeración.
3. Grupo 4: piloto, y parada para la revisión del usuario en la vista previa.
4. Grupos 5 a 13: resto del contenido.
5. Grupo 14: cierre, validaciones finales y borrado de `scripts/migrate/`.
6. Archivado e integración según `openspec/git-workflow.md`. Deshacer el cambio es revertir el commit de squash en `develop`.
