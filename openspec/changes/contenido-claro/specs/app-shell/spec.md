# Spec Delta

## ADDED Requirements

### Requirement: Pasos visibles en la pestaña En código
Cuando una sección de código de un tema está dividida en pasos, la pestaña En código SHALL mostrar cada título de paso como un subtítulo encima de su texto y de sus bloques de código, en el orden del contenido. Un paso avanzado SHALL mostrarse como un paso más, siempre visible.

#### Scenario: Tema con pasos
- **WHEN** el usuario abre la pestaña En código del tema "Decoradores"
- **THEN** bajo el rótulo "Paso a paso" ve los títulos "Paso 1" a "Paso 4" y, al final, un paso cuyo título empieza por "Avanzado", cada uno seguido de su explicación y su código

#### Scenario: Texto entre bloques
- **WHEN** un paso tiene una frase entre dos bloques de código
- **THEN** la frase se muestra entre ambos bloques, como texto normal y no como código

#### Scenario: Momentos en un tema de HTTP y REST
- **WHEN** el usuario abre la pestaña En código del tema "Caché HTTP: Cache-Control, ETag y 304"
- **THEN** bajo "Así viaja por la red" ve tres momentos con su título, y el segundo muestra solo texto

#### Scenario: Idioma inglés
- **WHEN** el usuario abre en inglés la pestaña En código del tema "Decoradores"
- **THEN** el rótulo es "Step by step", los títulos de paso están en inglés y los comentarios del código también

#### Scenario: Teléfono
- **WHEN** el usuario lee un tema con pasos en un teléfono
- **THEN** los títulos de paso se leen completos, sin recortarse, y los bloques de código anchos se desplazan en horizontal dentro de su propio bloque

### Requirement: Lectura de una entrada de proyecto
Al abrir una entrada de proyecto, el sistema SHALL mostrarla en el lector con su pista, su título y su resumen, sin frecuencia y sin pestañas, en una sola columna con este orden: qué se construye, el código parte por parte y la lista de los temas que reúne. Cada tema de esa lista y cada enlace del texto SHALL abrir su tema. Cerrar, anterior y siguiente SHALL funcionar como en un tema.

#### Scenario: Abrir una entrada de proyecto
- **WHEN** el usuario abre "Proyecto: el endpoint de crear un pedido"
- **THEN** ve, sin pestañas, el bloque "Qué vamos a construir", después "El código, parte por parte" con sus partes tituladas y, al final, "Temas que reúne este proyecto" con ocho temas

#### Scenario: Ir de una parte a su tema
- **WHEN** el usuario pulsa en la nota de una parte el enlace al tema "Inyección de dependencias con Depends"
- **THEN** el lector muestra ese tema

#### Scenario: Tema de otra pista
- **WHEN** el usuario pulsa en la lista de temas reunidos "Códigos de estado y sus confusiones clásicas"
- **THEN** el lector muestra ese tema de la pista HTTP y REST, con el acento de color de esa pista

#### Scenario: Siguiente desde una entrada de proyecto
- **WHEN** el usuario pulsa "Siguiente tema" en "Proyecto: el endpoint de crear un pedido"
- **THEN** el lector muestra el tema "Base de datos: ORM, SQLModel y sesiones"

#### Scenario: Dirección compartible
- **WHEN** el usuario abre directamente la dirección de una entrada de proyecto
- **THEN** la aplicación carga con esa entrada abierta en el lector

#### Scenario: Idioma inglés
- **WHEN** el usuario abre en inglés una entrada de proyecto
- **THEN** los rótulos son "What we're building", "The code, part by part" y "Topics this project brings together"

### Requirement: Entradas de proyecto en las listas de temas
Las entradas de proyecto SHALL aparecer en el sidebar expandido y en la hoja de temas del teléfono, dentro de su grupo y en la posición de su orden, con su título corto y sin marca de frecuencia.

#### Scenario: Sidebar
- **WHEN** el usuario expande la pista Python y FastAPI en el sidebar
- **THEN** bajo el subtítulo "Python" ve "Proyecto: total del pedido" justo después de "Decoradores"

#### Scenario: Hoja de temas del teléfono
- **WHEN** el usuario abre la hoja de temas de la pista Python y FastAPI en un teléfono
- **THEN** las cinco entradas de proyecto aparecen en sus posiciones, entre los temas

#### Scenario: Abrir desde la lista
- **WHEN** el usuario pulsa una entrada de proyecto en la lista
- **THEN** se abre en el lector
