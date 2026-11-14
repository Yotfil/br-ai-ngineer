# Spec Delta

## ADDED Requirements

### Requirement: Pasos con título en las secciones de código
Las secciones de código de un tema (el ejemplo principal, la petición tal como viaja por la red y el ejemplo del lado del servidor) SHALL poder dividirse en pasos, cada uno con un título y, debajo, texto y bloques de código en cualquier orden. Un título de paso SHALL admitirse solo en esas secciones y en las de una entrada de proyecto.

#### Scenario: Ejemplo principal con pasos
- **WHEN** se compila el tema "Decoradores", cuyo ejemplo principal tiene cuatro pasos numerados y un paso avanzado, cada uno con su título, una frase y un bloque de Python
- **THEN** el tema conserva los cinco títulos, los textos y los bloques, en ese orden

#### Scenario: Conversación por la red con momentos
- **WHEN** se compila el tema "Caché HTTP: Cache-Control, ETag y 304", cuya petición por la red tiene tres momentos y el segundo no lleva bloque de código
- **THEN** el tema conserva los tres títulos y el texto del segundo momento

#### Scenario: Título de paso en una sección que no lo admite
- **WHEN** se compila el contenido y la definición de un tema contiene un título de paso
- **THEN** la compilación falla y el mensaje nombra el archivo y la sección

### Requirement: Mínimo de pasos en el ejemplo principal
Cuando un tema tiene ejemplo principal, este SHALL estar dividido en al menos dos pasos con título.

#### Scenario: Ejemplo principal sin pasos
- **WHEN** se compila el contenido y el ejemplo principal de un tema es un único bloque de código sin títulos de paso
- **THEN** la compilación falla y el mensaje nombra el tema

#### Scenario: Todos los temas con ejemplo principal lo cumplen
- **WHEN** se compila el contenido completo
- **THEN** la compilación termina bien y cada ejemplo principal tiene dos pasos o más

### Requirement: Paridad de código entre idiomas
En cada sección de un tema o de una entrada de proyecto, las versiones en español y en inglés SHALL tener el mismo número de bloques de código, en el mismo orden y con el mismo lenguaje, y el mismo número de títulos de paso. El texto de los comentarios del código SHALL poder ser distinto en cada idioma.

#### Scenario: Comentarios traducidos
- **WHEN** se compila un tema cuyo ejemplo principal tiene en español y en inglés los mismos tres bloques de Python, con los comentarios en el idioma de cada versión
- **THEN** la compilación termina bien

#### Scenario: Falta un bloque en un idioma
- **WHEN** se compila el contenido y el ejemplo principal de un tema tiene cuatro bloques de código en español y tres en inglés
- **THEN** la compilación falla y el mensaje nombra el tema y la sección

#### Scenario: Lenguaje distinto
- **WHEN** se compila el contenido y el segundo bloque de una sección es Python en español y texto sin resaltar en inglés
- **THEN** la compilación falla y el mensaje nombra el tema y la sección

#### Scenario: Falta un paso en un idioma
- **WHEN** se compila el contenido y una sección tiene cinco títulos de paso en español y cuatro en inglés
- **THEN** la compilación falla y el mensaje nombra el tema y la sección

### Requirement: Entradas de proyecto
El contenido SHALL poder incluir, dentro de una pista, entradas de proyecto: entradas que muestran una funcionalidad del proyecto de ejemplo y declaran los temas que reúnen, de la misma pista o de otra. Una entrada de proyecto SHALL tener título y resumen por idioma, una sección que explica qué se construye y una sección con el código dividido en partes con título. No SHALL declarar conceptos, frecuencia, ejercicios ni demo. Cada tema que reúne SHALL existir, no SHALL ser otra entrada de proyecto y SHALL estar enlazado desde el texto del recorrido en ambos idiomas.

#### Scenario: Entrada de proyecto válida
- **WHEN** se compila la entrada "Proyecto: el endpoint de crear un pedido", que reúne cinco temas de Python y FastAPI y tres de HTTP y REST
- **THEN** la compilación termina bien y la entrada queda disponible con su contexto, su recorrido y la lista de los ocho temas en el orden declarado

#### Scenario: Aparece sin cambios de código
- **WHEN** se añade una entrada de proyecto válida a una pista y se recompila
- **THEN** aparece en el cerebro, en el buscador y en la lista de temas de su pista, en la posición de su orden

#### Scenario: Tema reunido inexistente
- **WHEN** se compila el contenido y una entrada de proyecto declara que reúne un identificador que no corresponde a ningún tema
- **THEN** la compilación falla y el mensaje nombra la entrada y el identificador

#### Scenario: Reúne un concepto
- **WHEN** se compila el contenido y una entrada de proyecto declara que reúne un identificador que es un concepto
- **THEN** la compilación falla y el mensaje nombra la entrada y el identificador

#### Scenario: Tema reunido sin enlazar
- **WHEN** se compila el contenido y el recorrido de una entrada de proyecto no enlaza uno de los temas que declara reunir
- **THEN** la compilación falla y el mensaje nombra la entrada, el idioma y el tema

#### Scenario: Entrada de proyecto con conceptos
- **WHEN** se compila el contenido y una entrada de proyecto declara un concepto propio
- **THEN** la compilación falla y el mensaje nombra la entrada

#### Scenario: Falta una sección
- **WHEN** se compila el contenido y a una entrada de proyecto le falta la sección que explica qué se construye
- **THEN** la compilación falla y el mensaje nombra la entrada y la sección ausente

#### Scenario: Sección de tema en una entrada de proyecto
- **WHEN** se compila el contenido y una entrada de proyecto incluye una sección de analogía
- **THEN** la compilación falla y el mensaje nombra el archivo y la sección

#### Scenario: Un tema normal no cambia
- **WHEN** se compila un tema que no se declara entrada de proyecto
- **THEN** se le exigen las secciones de siempre y no puede declarar temas reunidos

## MODIFIED Requirements

### Requirement: Ejemplo principal opcional
Un tema SHALL poder ofrecer un ejemplo principal de código, formado por uno o más bloques, cada uno con su lenguaje declarado, que pueden ir acompañados de texto y de títulos de paso.

#### Scenario: Ejemplo con dos bloques
- **WHEN** se compila un tema cuyo ejemplo principal tiene un bloque de texto sin resaltar seguido de un bloque de Python
- **THEN** el tema conserva ambos bloques, en ese orden y cada uno con su lenguaje

#### Scenario: Texto entre los bloques
- **WHEN** se compila un tema cuyo ejemplo principal tiene una frase entre dos bloques de código
- **THEN** la compilación termina bien y el tema conserva la frase entre ambos bloques

#### Scenario: Ejemplo principal sin código
- **WHEN** se compila el contenido y el ejemplo principal de un tema solo tiene texto
- **THEN** la compilación falla y el mensaje nombra el tema

#### Scenario: Bloque sin lenguaje en el ejemplo principal
- **WHEN** se compila el contenido y un bloque del ejemplo principal no declara lenguaje
- **THEN** la compilación falla y el mensaje nombra el tema

#### Scenario: Tema sin ejemplo principal
- **WHEN** se compila un tema de HTTP y REST, que no tiene ejemplo principal
- **THEN** la compilación termina bien

### Requirement: Pista Python y FastAPI completa
El sistema SHALL incluir la pista Python y FastAPI con 29 temas y 5 entradas de proyecto, en español e inglés, organizados en los grupos "Python" (15 temas y 2 entradas de proyecto) y "FastAPI" (14 temas y 3 entradas de proyecto). El tema de la guía original "HTTP por dentro y principios REST" no SHALL formar parte de esta pista, porque su contenido pertenece a la pista HTTP y REST. Los conceptos cuyo hogar es un tema de HTTP y REST no SHALL declararse de nuevo en esta pista. Los conceptos de la pista SHALL ser los mismos que antes de repartir sus temas, cada uno con un único tema hogar.

#### Scenario: Cobertura de la guía
- **WHEN** se lista la pista Python y FastAPI
- **THEN** aparecen 34 entradas con orden consecutivo de 1 a 34: 17 en el grupo "Python" y 17 en el grupo "FastAPI"

#### Scenario: Temas repartidos
- **WHEN** se busca en la pista el tema "Funciones: *args, **kwargs, defaults, lambdas y closures"
- **THEN** no existe, y en su lugar están los temas "Funciones: parámetros, *args, **kwargs y valores por defecto" y "Closures y lambdas"

#### Scenario: Los conceptos se conservan
- **WHEN** se compara la lista de conceptos de la pista antes y después de repartir sus temas
- **THEN** contiene los mismos identificadores, con los mismos nombres y alias, y el concepto "closure" tiene como hogar el tema "Closures y lambdas"

#### Scenario: Entradas de proyecto de la pista
- **WHEN** se lista la pista Python y FastAPI
- **THEN** la entrada "Proyecto: calcular el total de un pedido" aparece justo después del tema "Decoradores", y la entrada "Proyecto: la API completa, de las carpetas al contenedor" es la última de la pista

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

#### Scenario: La pista HTTP y REST no lleva entradas de proyecto
- **WHEN** se lista la pista HTTP y REST
- **THEN** aparecen sus 20 temas y ninguna entrada de proyecto

#### Scenario: Sin menciones a frameworks de frontend
- **WHEN** se revisa el texto de los 29 temas y las 5 entradas de proyecto en ambos idiomas
- **THEN** ningún texto fuera de los bloques de código menciona Angular, NestJS ni RxJS
