# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
