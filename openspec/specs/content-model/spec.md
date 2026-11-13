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
Un tema SHALL poder tener cero o más grupos de ejercicios, cada grupo con un enunciado. Los ejercicios SHALL ser de dos tipos: de opción múltiple, y de veredicto, donde el usuario juzga si una afirmación o un diseño está bien o tiene un error. En ambos, el sistema SHALL indicar si la respuesta elegida es correcta y mostrar la explicación, sin guardar el resultado.

#### Scenario: Respuesta incorrecta en opción múltiple
- **WHEN** el usuario elige una opción incorrecta en un ejercicio de opción múltiple
- **THEN** la opción se marca como incorrecta y se muestra la explicación

#### Scenario: Ejercicio de veredicto
- **WHEN** en el tema "Diseño de una API REST" el usuario marca "Está bien" en un endpoint que tiene un error
- **THEN** la respuesta se marca como incorrecta y se muestra la explicación del error

#### Scenario: Enunciado del grupo
- **WHEN** el usuario ve un grupo de ejercicios
- **THEN** el grupo aparece encabezado por su enunciado

#### Scenario: Tema sin ejercicios
- **WHEN** se compila un tema que no tiene ningún grupo de ejercicios
- **THEN** la compilación termina bien

#### Scenario: Volver al tema
- **WHEN** el usuario responde un ejercicio, sale del tema y vuelve a abrirlo
- **THEN** el ejercicio aparece sin responder
