# content-model Specification

## Purpose
Define cómo se organiza el material de estudio en pistas, temas y conceptos, y garantiza que cada concepto exista una sola vez y que todo contenido nuevo aparezca automáticamente en la aplicación.

## Requirements

### Requirement: Jerarquía de pista, tema y concepto
El contenido SHALL organizarse en tres niveles: pistas, temas que pertenecen a una pista, y conceptos que pertenecen a un tema. Cada elemento SHALL tener un identificador estable e independiente del idioma.

#### Scenario: Tema con sus conceptos
- **WHEN** se consulta el tema "Idempotencia en la práctica: claves y pagos duplicados" de la pista HTTP y REST
- **THEN** el sistema lo presenta bajo esa pista, con sus conceptos asociados: la clave de idempotencia y los reintentos

### Requirement: Estructura fija de un tema
Cada tema SHALL ofrecer un título, un resumen de una línea, una frecuencia de aparición en entrevistas y las secciones definición, analogía, problema que resuelve, respuesta de entrevista y malentendidos. SHALL poder ofrecer además, de forma opcional: la petición tal como viaja por la red, el ejemplo del lado del servidor, el par de ejemplo riesgoso y ejemplo correcto, y el puente con otra tecnología. El ejemplo riesgoso y el correcto SHALL ir siempre juntos.

#### Scenario: Tema sin puente
- **WHEN** un tema no incluye puente con TypeScript
- **THEN** el tema se muestra completo y sin un bloque de puente vacío

#### Scenario: Tema descriptivo sin ejemplo riesgoso y correcto
- **WHEN** un tema no incluye el par de ejemplo riesgoso y correcto
- **THEN** el tema se compila y se muestra sin ese bloque

#### Scenario: Ejemplo riesgoso sin su par
- **WHEN** se compila el contenido y un tema tiene ejemplo riesgoso pero no ejemplo correcto
- **THEN** la compilación falla y el mensaje nombra el tema y la sección ausente

#### Scenario: Tema al que le falta una sección obligatoria
- **WHEN** se compila el contenido y a un tema le falta la definición
- **THEN** la compilación falla y el mensaje nombra el tema y la sección ausente

### Requirement: Pistas declaradas sin contenido
El contenido SHALL poder declarar una pista que todavía no tiene temas. Cada pista SHALL tener un nombre por idioma, un color y una abreviatura de dos letras que la identifica visualmente.

#### Scenario: Pista sin temas
- **WHEN** se compila el contenido con una pista declarada que no tiene temas
- **THEN** la compilación termina bien y la pista queda disponible para mostrarse como "Próximamente"

### Requirement: Concepto único
Cada concepto SHALL tener exactamente un tema hogar. Cuando otro tema necesite ese concepto, SHALL enlazarlo en lugar de volver a explicarlo.

#### Scenario: Concepto declarado en dos temas
- **WHEN** se compila el contenido y el mismo identificador de concepto aparece como propio de dos temas
- **THEN** la compilación falla y el mensaje nombra el concepto y ambos temas

#### Scenario: Concepto usado desde otro tema
- **WHEN** un tema declara como relacionado un concepto cuyo hogar es otro tema
- **THEN** ambos temas quedan conectados y el concepto sigue apareciendo una sola vez

### Requirement: Relaciones explícitas validadas
Los temas SHALL poder declarar relaciones con otros temas o conceptos, tanto en sus metadatos como mediante enlaces dentro del texto. Toda relación SHALL apuntar a un elemento existente. Un enlace dentro del texto SHALL crear además una conexión entre ambos en el cerebro.

#### Scenario: Relación rota
- **WHEN** se compila el contenido y un tema declara como relacionado un identificador que no existe
- **THEN** la compilación falla y el mensaje nombra el tema y el identificador

#### Scenario: Enlace en el texto crea conexión
- **WHEN** el texto de un tema enlaza a otro tema que no figura entre sus relacionados
- **THEN** ambos temas aparecen conectados en el cerebro

### Requirement: El contenido nuevo aparece sin cambios de código
Al añadir un tema válido al contenido, el sistema SHALL incluirlo en el cerebro, el buscador y el sidebar tras recompilar, sin modificar código de la aplicación.

#### Scenario: Tema añadido
- **WHEN** se añade un tema nuevo con sus dos idiomas y se recompila
- **THEN** el tema aparece como nodo en el cerebro, como resultado en el buscador y como ítem bajo su pista en el sidebar

### Requirement: Pista HTTP y REST completa
El sistema SHALL incluir los 20 temas de la guía original de HTTP y REST, cada uno con las secciones y los ejercicios que tenga en la guía, en español e inglés.

#### Scenario: Cobertura de la guía original
- **WHEN** se lista la pista HTTP y REST
- **THEN** aparecen 20 temas, en el mismo orden que en la guía original

### Requirement: Ejercicios con respuesta inmediata
Un tema SHALL poder tener cero o más grupos de ejercicios, cada grupo con un enunciado. Los ejercicios SHALL ser de tres tipos: de opción múltiple; de veredicto, donde el usuario juzga si una afirmación o un diseño está bien o tiene un error; y de clasificación, donde el usuario asigna cada caso a una de las categorías del grupo. Una pregunta de opción múltiple SHALL poder incluir un bloque de código. En los tres tipos, el sistema SHALL indicar si la respuesta elegida es correcta y mostrar la explicación, sin guardar el resultado.

#### Scenario: Respuesta incorrecta en opción múltiple
- **WHEN** el usuario elige una opción incorrecta en un ejercicio de opción múltiple
- **THEN** la opción se marca como incorrecta y se muestra la explicación

#### Scenario: Opción múltiple con código
- **WHEN** el usuario abre un ejercicio "¿Qué imprime este código?" del tema "Tipado dinámico y type hints"
- **THEN** ve el enunciado, el bloque de código resaltado y, debajo, las opciones

#### Scenario: Ejercicio de veredicto
- **WHEN** en el tema "Diseño de una API REST" el usuario marca "Está bien" en un endpoint que tiene un error
- **THEN** la respuesta se marca como incorrecta y se muestra la explicación del error

#### Scenario: Ejercicio de clasificación
- **WHEN** en el tema "Estructuras de datos: list, tuple, dict y set" el usuario asigna "Emails únicos que ya recibieron la promo" a la categoría "list"
- **THEN** la respuesta se marca como incorrecta y se muestra la explicación

#### Scenario: Categoría inexistente
- **WHEN** se compila el contenido y un caso de un ejercicio de clasificación tiene como respuesta una categoría que su grupo no lista
- **THEN** la compilación falla y el mensaje nombra el tema

#### Scenario: Enunciado del grupo
- **WHEN** el usuario ve un grupo de ejercicios
- **THEN** el grupo aparece encabezado por su enunciado

#### Scenario: Tema sin ejercicios
- **WHEN** se compila un tema que no tiene ningún grupo de ejercicios
- **THEN** la compilación termina bien

#### Scenario: Volver al tema
- **WHEN** el usuario responde un ejercicio, sale del tema y vuelve a abrirlo
- **THEN** el ejercicio aparece sin responder

### Requirement: Grupos de temas dentro de una pista
Una pista SHALL poder declarar grupos con nombre por idioma, y cada uno de sus temas SHALL pertenecer entonces a exactamente uno de ellos. Los temas de un grupo SHALL ser consecutivos en el orden de la pista, y los grupos SHALL seguir el orden en que la pista los declara. Una pista sin grupos SHALL seguir funcionando como una lista única.

#### Scenario: Pista con grupos
- **WHEN** se compila la pista Python y FastAPI, que declara los grupos "Python" y "FastAPI"
- **THEN** cada uno de sus temas queda asociado a uno de los dos grupos y la compilación termina bien

#### Scenario: Tema sin grupo en una pista con grupos
- **WHEN** se compila el contenido y un tema de una pista con grupos no indica su grupo
- **THEN** la compilación falla y el mensaje nombra el tema

#### Scenario: Grupo inexistente
- **WHEN** se compila el contenido y un tema indica un grupo que su pista no declara
- **THEN** la compilación falla y el mensaje nombra el tema y el grupo

#### Scenario: Grupo partido
- **WHEN** se compila el contenido y los temas de un mismo grupo no son consecutivos en el orden de la pista
- **THEN** la compilación falla y el mensaje nombra el grupo

#### Scenario: Pista sin grupos
- **WHEN** se compila la pista HTTP y REST, que no declara grupos
- **THEN** la compilación termina bien y sus temas no tienen grupo

### Requirement: Título corto opcional
Un tema SHALL poder declarar, además de su título, un título corto de 32 caracteres como máximo por idioma. Si lo declara en un idioma, SHALL declararlo en el otro.

#### Scenario: Tema con título corto
- **WHEN** se compila el tema "Concurrencia: async/await, event loop, hilos, procesos y GIL" con el título corto "async, hilos y GIL"
- **THEN** el tema queda disponible con ambos títulos

#### Scenario: Tema sin título corto
- **WHEN** se compila un tema que no declara título corto
- **THEN** la compilación termina bien

#### Scenario: Título corto en un solo idioma
- **WHEN** se compila el contenido y un tema tiene título corto en español pero no en inglés
- **THEN** la compilación falla y el mensaje nombra el tema y el idioma ausente

#### Scenario: Título corto demasiado largo
- **WHEN** se compila el contenido y el título corto de un tema supera 32 caracteres
- **THEN** la compilación falla y el mensaje nombra el tema

### Requirement: Ejemplo principal opcional
Un tema SHALL poder ofrecer un ejemplo principal de código, formado por uno o más bloques consecutivos, cada uno con su lenguaje declarado.

#### Scenario: Ejemplo con dos bloques
- **WHEN** se compila un tema cuyo ejemplo principal tiene un bloque de texto sin resaltar seguido de un bloque de Python
- **THEN** el tema conserva ambos bloques, en ese orden y cada uno con su lenguaje

#### Scenario: Bloque sin lenguaje en el ejemplo principal
- **WHEN** se compila el contenido y un bloque del ejemplo principal no declara lenguaje
- **THEN** la compilación falla y el mensaje nombra el tema

#### Scenario: Tema sin ejemplo principal
- **WHEN** se compila un tema de HTTP y REST, que no tiene ejemplo principal
- **THEN** la compilación termina bien

### Requirement: Lenguaje declarado por bloque de código
Cuando un bloque de código declara su lenguaje, el sistema SHALL resaltarlo con ese lenguaje en cualquier sección. El sistema SHALL admitir un lenguaje de texto sin resaltar. Los bloques que no declaran lenguaje SHALL conservar el resaltado que tenían.

#### Scenario: Python de una línea
- **WHEN** un ejemplo riesgoso contiene un bloque declarado como Python que no incluye `def`, `import` ni un decorador de ruta
- **THEN** el bloque se resalta como Python

#### Scenario: Texto sin resaltar
- **WHEN** un bloque se declara como texto
- **THEN** se muestra con la tipografía y el fondo de código, sin colores de resaltado

#### Scenario: Lenguaje no admitido
- **WHEN** se compila el contenido y un bloque de código declara un lenguaje que el sistema no admite
- **THEN** la compilación falla y el mensaje nombra el archivo y el lenguaje

#### Scenario: La pista REST no cambia
- **WHEN** se compila el contenido de HTTP y REST después de este cambio
- **THEN** cada bloque de código de sus temas se resalta con el mismo lenguaje que antes

### Requirement: Nota en el ejemplo riesgoso y en el correcto
El ejemplo riesgoso y el ejemplo correcto de un tema SHALL poder llevar, cada uno, una nota de texto que explica el código.

#### Scenario: Ejemplos con nota
- **WHEN** se compila un tema cuyo ejemplo riesgoso y cuyo ejemplo correcto llevan una nota
- **THEN** cada ejemplo conserva su código y su nota

### Requirement: Pista Python y FastAPI completa
El sistema SHALL incluir 21 temas de la guía original de Python y FastAPI, en español e inglés, organizados en los grupos "Python" (10 temas) y "FastAPI" (11 temas). El tema de la guía "HTTP por dentro y principios REST" no SHALL formar parte de esta pista, porque su contenido pertenece a la pista HTTP y REST. Los conceptos cuyo hogar es un tema de HTTP y REST no SHALL declararse de nuevo en esta pista.

#### Scenario: Cobertura de la guía
- **WHEN** se lista la pista Python y FastAPI
- **THEN** aparecen 21 temas, en el orden de la guía original, 10 en el grupo "Python" y 11 en el grupo "FastAPI"

#### Scenario: Tema duplicado no migrado
- **WHEN** se busca en la pista Python y FastAPI un tema titulado "HTTP por dentro y principios REST"
- **THEN** no existe

#### Scenario: Concepto compartido con REST
- **WHEN** se consulta el tema "Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas"
- **THEN** sus conceptos propios son el hashing de contraseñas y el flujo de contraseña de OAuth2, y aparece relacionado con el concepto JWT, cuyo hogar sigue siendo un tema de HTTP y REST

#### Scenario: Ejercicios trasladados
- **WHEN** se consulta el tema "Códigos de estado y sus confusiones clásicas" de HTTP y REST
- **THEN** incluye los dos ejercicios de códigos de estado que la guía de Python tenía en su tema de HTTP

#### Scenario: La pista deja de estar pendiente
- **WHEN** se compila el contenido
- **THEN** la pista Python y FastAPI ya no figura como pista sin temas

#### Scenario: Sin menciones a frameworks de frontend
- **WHEN** se revisa el texto de los 21 temas en ambos idiomas
- **THEN** ningún texto fuera de los bloques de código menciona Angular, NestJS ni RxJS
