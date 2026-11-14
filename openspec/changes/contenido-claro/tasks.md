# Tasks

Cada grupo (`## N.`) es una sesión de Opus. Documentos vinculantes: `design.md`, `content-map.md` y `proyecto-tienda.md` de este cambio, y `openspec/guia-de-contenido.md`.

## Regla sin excepciones: no se inventa información

Pedida por el usuario el 2026-11-13. Vale para toda tarea que escriba o traduzca contenido, la haga Opus o un subagente; Opus la copia en cada encargo a Sonnet.

1. **Bajo ninguna circunstancia se inventa información.** Ni un dato, ni el nombre de una función, un parámetro, una cabecera o un comando, ni un código de estado, ni un número de versión, ni la salida de un programa, ni un comportamiento "que seguramente es así".
2. **Toda la información se confirma antes de escribirla.** El código ejecutable se ejecuta y se pega su salida real. Lo que no se puede ejecutar (FastAPI, SQLModel, Alembic, HTTP, Docker, uv) se comprueba en su fuente: la documentación oficial de la librería o la especificación (RFC, MDN).
3. **Si hay cualquier duda, se busca en internet y se confirma** en una fuente oficial y actual, antes de escribir. Recordar algo no es confirmarlo: las librerías cambian de una versión a otra.
4. **Lo que no se pueda confirmar no se escribe.** Se deja fuera, se anota en `decisiones.md` qué faltó y dónde se buscó, y es una pregunta para Fable 5.2.
5. El texto que ya está en `content/` y los modelos de la guía tampoco se dan por buenos: si se conservan, se confirman igual. Un error encontrado en el contenido antiguo se corrige y se anota en `decisiones.md` con la fuente.
6. Cada tarea de verificación de grupo deja en `decisiones.md`, por tema, las fuentes consultadas (dirección y fecha) para lo que no se pudo ejecutar.

"Reescribir un tema" significa siempre: escribir su `es.md` completo según la guía (reglas, tabla por sección y modelo de su tipo), con el proyecto de `proyecto-tienda.md`; ejecutar cada bloque de Python ejecutable y pegar la salida real (design.md decisión 11); confirmar en su fuente todo lo que no se pueda ejecutar, según la regla anterior; y pasar la lista de comprobación de la guía. La tarea se verifica mostrando que las 13 preguntas de la lista son "sí", la salida de los bloques ejecutados y las fuentes consultadas.

"Traducir un tema" significa: escribir su `en.md` como traducción del `es.md` ya terminado, con la misma estructura, los mismos bloques y pasos, los comentarios y los textos impresos en inglés y los nombres del código sin tocar (design.md decisiones 4 y 10). La traducción no añade, quita ni cambia información respecto al español. Se verifica con `npm run content` en verde para ese tema y revisando el diff.

## 1. Formato: pasos y paridad de código

- [x] 1.1 [opus] Comprobar que la rama es `feature/contenido-claro` y que `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` están en verde antes de tocar nada; verificar anotando el número de pruebas que pasan
- [x] 1.2 [opus] Admitir títulos de paso (`###`) y texto en `code:example`, `code:wire` y `code:server`, y rechazarlos en las demás secciones de un tema (design.md decisión 2); verificar con pruebas los escenarios "Ejemplo principal con pasos", "Conversación por la red con momentos" y "Título de paso en una sección que no lo admite" de specs/content-model, y los cinco escenarios de "Ejemplo principal opcional"
- [x] 1.3 [opus] Mostrar en el lector los títulos de paso como subtítulo encima de su contenido, con el mismo estilo en las tres secciones, y anotar en `decisiones.md` el aspecto elegido (design.md decisión 2); verificar con pruebas los escenarios "Tema con pasos" y "Texto entre bloques" de specs/app-shell usando un tema de prueba, y en el navegador a 390 px de ancho el escenario "Teléfono"
- [x] 1.4 [opus] Añadir la comprobación de paridad de código entre idiomas (design.md decisión 4); verificar con pruebas los cuatro escenarios de "Paridad de código entre idiomas" y que el contenido actual completo sigue compilando
- [x] 1.5 [opus] Cambiar el rótulo de `code:example` a "Paso a paso" y "Step by step" en `src/locales/es.json` y `en.json` (design.md decisión 5); verificar que la prueba de paridad de textos de interfaz sigue en verde
- [x] 1.6 [opus] Ejecutar `npm run typecheck`, `npm test`, `npm run lint` y `npm run build`; verificar que los cuatro terminan en verde y anotar el número de pruebas

## 2. Modelo: entradas de proyecto

- [x] 2.1 [opus] Admitir `kind: project` y `covers` en `meta.yaml`, con las secciones `context` y `walkthrough` y todas las reglas de design.md decisión 6 (qué puede y qué no puede declarar, temas reunidos válidos, cada uno enlazado en el recorrido en ambos idiomas); verificar con pruebas los nueve escenarios de "Entradas de proyecto" de specs/content-model, usando entradas de prueba
- [x] 2.2 [opus] Generar la salida de una entrada de proyecto (tema con `kind` y `covers`, sin `freq`), indexarla en el buscador como un tema y conectarla en el grafo con cada tema de `covers` (design.md decisión 6); verificar con pruebas el escenario "Aparece sin cambios de código" y los escenarios "Vecinos de una entrada de proyecto" y "Más conexiones entre pistas" de specs/concept-graph sobre datos de prueba
- [x] 2.3 [opus] Mostrar una entrada de proyecto en el lector: sin pestañas ni frecuencia, con `context`, `walkthrough` y la lista de temas reunidos, y con los rótulos de design.md decisión 6 en ambos idiomas; verificar con pruebas los seis escenarios de "Lectura de una entrada de proyecto" de specs/app-shell
- [x] 2.4 [opus] Mostrar las entradas de proyecto en el sidebar y en la hoja de temas del teléfono, sin marca de frecuencia, y en el panel de relacionados sus temas reunidos (design.md decisión 6); verificar con pruebas los tres escenarios de "Entradas de proyecto en las listas de temas"
- [x] 2.5 [opus] Ejecutar `npm run typecheck`, `npm test`, `npm run lint` y `npm run build`; verificar que los cuatro terminan en verde, anotar el número de pruebas y comprobar en el navegador que un tema existente se ve y se navega igual que antes

## 3. Orden de la pista Python y FastAPI

- [x] 3.1 [opus] Dar a cada tema actual de Python su orden final o provisional de `content-map.md` sección 2 y adaptar la prueba de `pista-python.test.ts` que exige 21 órdenes consecutivos para que compruebe el orden relativo de los temas (design.md decisión 9); verificar que la lista de la pista en el sidebar conserva el mismo orden de temas que antes y que `npm test` y `npm run build` terminan en verde

## 4. Piloto

- [ ] 4.1 [opus] Reescribir `decoradores` partiendo del Modelo 1 de la guía y traducirlo; es el primer tema y fija el patrón de reescritura y de traducción
- [ ] 4.2 [opus] Partir `funciones-y-closures` en `funciones-y-parametros` y `closures-y-lambdas` según `content-map.md` sección 1 (conceptos, títulos, ejercicios, relaciones, órdenes 5 y 6) y reescribir ambos, `closures-y-lambdas` partiendo del Modelo 2; es la primera partición y fija su patrón; verificar además que la carpeta antigua ya no existe y que ningún `related` ni enlace `[[...]]` apunta a ella
- [ ] 4.3 [opus] Reescribir `cache-http` partiendo del Modelo 3 de la guía
- [ ] 4.4 [opus] Reescribir `codigos-de-estado` con el Modelo 3 como referencia
- [ ] 4.5 [opus] Reescribir `inyeccion-con-depends` partiendo del Modelo 4 de la guía
- [ ] 4.6 [opus] Escribir la entrada `proyecto-crear-pedido` en español y traducirla, con el alcance, los archivos y los `covers` de `content-map.md` sección 3 y el formato de design.md decisión 6; es la primera entrada de proyecto y fija su patrón; verificar los escenarios "Entrada de proyecto válida" de specs/content-model y "Abrir una entrada de proyecto" de specs/app-shell con el contenido real
- [ ] 4.7 [sonnet: como 4.1] Traducir `funciones-y-parametros`, `closures-y-lambdas`, `cache-http`, `codigos-de-estado` e `inyeccion-con-depends`; un subagente por tema, en paralelo
- [ ] 4.8 [opus] Verificación del grupo (design.md decisión 11): ejecutar el código de los ejercicios "¿Qué imprime?" de las piezas del piloto y comprobar su respuesta; dejar en `decisiones.md` una línea por pieza; ejecutar `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` y anotar el resultado
- [ ] 4.9 [opus] Parada del piloto (design.md decisión 12): pedir al usuario que publique la rama y lea las siete piezas en la vista previa; leerle el guion de 11 preguntas, una a una, y registrar sus respuestas en `decisiones.md`; verificar que las once coinciden con lo esperado. Si alguna no coincide, anotar el detalle que dé el usuario, dejarlo en el relevo como pregunta para Fable 5.2 y no empezar el grupo 5

## 5. Python: datos, comprehensions y primer proyecto

- [ ] 5.1 [opus] Reescribir `tipado-y-type-hints`
- [ ] 5.2 [opus] Reescribir `estructuras-de-datos`
- [ ] 5.3 [opus] Partir `comprehensions-y-generadores` en `comprehensions` y `generadores` (como 4.2) y reescribir ambos
- [ ] 5.4 [opus] Escribir la entrada `proyecto-total-del-pedido` en español (como 4.6); al ser Python puro, ejecutar su código completo y pegar la salida real
- [ ] 5.5 [sonnet: como 4.1] Traducir las cinco piezas del grupo; un subagente por pieza, en paralelo
- [ ] 5.6 [opus] Verificación del grupo, como 4.8

## 6. Python: errores, módulos y entornos

- [ ] 6.1 [opus] Partir `errores-y-context-managers` en `excepciones` y `context-managers` (como 4.2) y reescribir ambos
- [ ] 6.2 [opus] Partir `modulos-y-entornos` en `modulos-y-paquetes` y `entornos-y-dependencias` (como 4.2) y reescribir ambos; actualizar el `related` de `estructura-del-proyecto` según `content-map.md`
- [ ] 6.3 [sonnet: como 4.1] Traducir las cuatro piezas del grupo; un subagente por pieza, en paralelo
- [ ] 6.4 [opus] Verificación del grupo, como 4.8

## 7. Python: concurrencia, modelos de datos y segundo proyecto

- [ ] 7.1 [opus] Partir `concurrencia` en `async-y-event-loop` y `hilos-procesos-y-gil` (como 4.2) y reescribir ambos
- [ ] 7.2 [opus] Reescribir `dataclasses-y-pydantic`
- [ ] 7.3 [opus] Reescribir `identidad-copias-mutabilidad`
- [ ] 7.4 [opus] Escribir la entrada `proyecto-importar-catalogo` en español (como 4.6)
- [ ] 7.5 [sonnet: como 4.1] Traducir las cinco piezas del grupo; un subagente por pieza, en paralelo
- [ ] 7.6 [opus] Verificación del grupo, como 4.8

## 8. FastAPI: rutas, modelos y errores

- [ ] 8.1 [opus] Reescribir `rutas-y-parametros`
- [ ] 8.2 [opus] Reescribir `modelos-y-response-model`
- [ ] 8.3 [opus] Reescribir `errores-y-httpexception`
- [ ] 8.4 [opus] Reescribir `endpoints-async-vs-sync`
- [ ] 8.5 [sonnet: como 4.1] Traducir las cuatro piezas del grupo; un subagente por pieza, en paralelo
- [ ] 8.6 [opus] Verificación del grupo, como 4.8; comprobar además que `proyecto-crear-pedido` sigue siendo coherente con los cuatro temas reescritos (mismos nombres y mismas rutas)

## 9. FastAPI: base de datos, login y tercer proyecto

- [ ] 9.1 [opus] Partir `base-de-datos` en `orm-y-sesiones` y `migraciones-con-alembic` (como 4.2) y reescribir ambos; actualizar el `related` de `inyeccion-con-depends` según `content-map.md`
- [ ] 9.2 [opus] Reescribir `autenticacion-en-fastapi`
- [ ] 9.3 [opus] Partir `middleware-cors-background` en `middleware-y-cors` y `tareas-en-segundo-plano` (como 4.2) y reescribir ambos
- [ ] 9.4 [opus] Escribir la entrada `proyecto-pedidos-con-login` en español (como 4.6)
- [ ] 9.5 [sonnet: como 4.1] Traducir las seis piezas del grupo; un subagente por pieza, en paralelo
- [ ] 9.6 [opus] Verificación del grupo, como 4.8

## 10. FastAPI: estructura, pruebas, despliegue y cuarto proyecto

- [ ] 10.1 [opus] Reescribir `estructura-del-proyecto`; su árbol de carpetas es el de `proyecto-tienda.md`
- [ ] 10.2 [opus] Reescribir `pytest-y-testclient`
- [ ] 10.3 [opus] Partir `openapi-y-despliegue` en `openapi-automatico` y `despliegue-uvicorn-docker` (como 4.2) y reescribir ambos
- [ ] 10.4 [opus] Escribir la entrada `proyecto-api-completa` en español (como 4.6)
- [ ] 10.5 [sonnet: como 4.1] Traducir las cinco piezas del grupo; un subagente por pieza, en paralelo
- [ ] 10.6 [opus] Verificación del grupo, como 4.8

## 11. HTTP y REST: de la URL a las cabeceras

- [ ] 11.1 [opus] Reescribir `url-a-respuesta`
- [ ] 11.2 [opus] Reescribir `anatomia-peticion-respuesta`
- [ ] 11.3 [opus] Reescribir `anatomia-url`
- [ ] 11.4 [opus] Reescribir `metodos-http`
- [ ] 11.5 [opus] Reescribir `metodos-seguros-idempotentes`
- [ ] 11.6 [opus] Reescribir `cabeceras`
- [ ] 11.7 [sonnet: como 4.1] Traducir las seis piezas del grupo; un subagente por pieza, en paralelo
- [ ] 11.8 [opus] Verificación del grupo, como 4.8

## 12. HTTP y REST: estado, seguridad del transporte y REST

- [ ] 12.1 [opus] Reescribir `http-sin-estado`
- [ ] 12.2 [opus] Reescribir `autenticacion-autorizacion`
- [ ] 12.3 [opus] Reescribir `cors`
- [ ] 12.4 [opus] Reescribir `https-tls`
- [ ] 12.5 [opus] Reescribir `versiones-http`
- [ ] 12.6 [opus] Reescribir `rest-richardson`
- [ ] 12.7 [sonnet: como 4.1] Traducir las seis piezas del grupo; un subagente por pieza, en paralelo
- [ ] 12.8 [opus] Verificación del grupo, como 4.8

## 13. HTTP y REST: diseño y operación de una API

- [ ] 13.1 [opus] Reescribir `diseno-api-rest`
- [ ] 13.2 [opus] Reescribir `errores-problem-details`
- [ ] 13.3 [opus] Reescribir `idempotencia-en-la-practica`
- [ ] 13.4 [opus] Reescribir `rate-limiting`
- [ ] 13.5 [opus] Reescribir `rest-vs-alternativas`
- [ ] 13.6 [opus] Reescribir `seguridad-api`
- [ ] 13.7 [sonnet: como 4.1] Traducir las seis piezas del grupo; un subagente por pieza, en paralelo
- [ ] 13.8 [opus] Verificación del grupo, como 4.8

## 14. Cierre

- [ ] 14.1 [opus] Comprobar contra `content-map.md` el estado final: 34 entradas en Python con orden consecutivo de 1 a 34 y el reparto por grupos de la sección 2, 20 temas en REST, los mismos conceptos que antes del cambio con su hogar de la sección 1, y ninguna de las ocho carpetas antiguas; dejar la prueba de `pista-python.test.ts` con esas cifras; verificar con pruebas los diez escenarios de "Pista Python y FastAPI completa" de specs/content-model
- [ ] 14.2 [opus] Activar la validación de mínimo dos pasos en `code:example` (design.md decisión 3); verificar con pruebas los dos escenarios de "Mínimo de pasos en el ejemplo principal" y que el contenido completo compila
- [ ] 14.3 [opus] Borrar `scripts/migrate/` y lo que dependa solo de él (design.md decisiones 13 y 14); verificar que `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` terminan en verde
- [ ] 14.4 [opus] Actualizar `content/README.md` (design.md decisión 15): pasos con título, paridad de código, `kind: project` con `covers` y sus dos secciones, y el enlace a la guía; verificar que ya no contiene la frase "El código de los ejemplos es idéntico en ambos idiomas" ni la restricción "sin texto entre ellos" de `code:example`
- [ ] 14.5 [opus] Comprobar en el navegador, en español e inglés, los escenarios de specs/app-shell y specs/concept-graph que dependen del contenido real: "Idioma inglés" y "Momentos en un tema de HTTP y REST" de "Pasos visibles en la pestaña En código"; "Ir de una parte a su tema", "Tema de otra pista" y "Siguiente desde una entrada de proyecto" de "Lectura de una entrada de proyecto"; "Sidebar"; y "Vecinos de una entrada de proyecto"
- [ ] 14.6 [opus] Comprobar con una búsqueda en `content/` que ningún texto fuera de los bloques de código menciona Angular, NestJS ni RxJS, y que ningún comentario de un `en.md` está en español en una muestra de diez temas; verificar anotando los temas revisados
- [ ] 14.7 [opus] Ejecutar `npm run typecheck`, `npm test`, `npm run lint`, `npm run build` y `openspec validate contenido-claro --strict`; verificar que todo termina en verde y anotar el número de pruebas
