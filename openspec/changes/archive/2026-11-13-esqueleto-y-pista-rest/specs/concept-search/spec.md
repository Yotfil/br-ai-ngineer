# Spec Delta

## Purpose

Permite llegar a cualquier tema o concepto escribiendo una palabra, de modo que repasar un término antes de una entrevista tome segundos.

## ADDED Requirements

### Requirement: Buscador siempre disponible
La barra superior SHALL contener un campo de búsqueda visible en todo momento, enfocable con Ctrl+K o Cmd+K desde cualquier parte de la aplicación.

#### Scenario: Atajo de teclado
- **WHEN** el usuario pulsa Ctrl+K con un tema abierto
- **THEN** el cursor pasa al campo de búsqueda

### Requirement: Resultados instantáneos de temas y conceptos
Al escribir, el sistema SHALL mostrar sin demora perceptible una lista de temas y conceptos que coinciden, cada uno con su nombre, su pista, su tipo y, en los temas, el resumen de una línea. Los conceptos SHALL indicar a qué tema pertenecen.

#### Scenario: Buscar un concepto
- **WHEN** el usuario escribe "idemp"
- **THEN** aparecen, entre los resultados, los temas "Métodos seguros e idempotentes" e "Idempotencia en la práctica: claves y pagos duplicados" con su resumen, y los conceptos "idempotencia" y "clave de idempotencia" con su tema

#### Scenario: Sin coincidencias
- **WHEN** el usuario escribe un texto que no coincide con nada
- **THEN** la lista indica que no hay resultados

### Requirement: Búsqueda tolerante
La búsqueda SHALL ignorar mayúsculas y tildes, coincidir por prefijo y tolerar errores de tipeo leves. SHALL encontrar un elemento por su nombre en cualquiera de los dos idiomas, sea cual sea el idioma activo.

#### Scenario: Sin tilde
- **WHEN** el usuario escribe "paginacion"
- **THEN** aparece el concepto "paginación", indicando que pertenece al tema "Diseño de una API REST"

#### Scenario: Error de tipeo
- **WHEN** el usuario escribe "idenpotencia"
- **THEN** aparece el concepto "idempotencia"

#### Scenario: Término en el otro idioma
- **WHEN** la interfaz está en español y el usuario escribe "idempotency"
- **THEN** aparece el concepto "idempotencia"

#### Scenario: Título de un tema en el otro idioma
- **WHEN** la interfaz está en español y el usuario escribe "status codes"
- **THEN** aparece el tema "Códigos de estado y sus confusiones clásicas"

#### Scenario: Pista sin contenido
- **WHEN** el usuario escribe el nombre de una pista marcada "Próximamente"
- **THEN** la búsqueda no devuelve esa pista ni temas de ella

### Requirement: Abrir un resultado
El usuario SHALL poder abrir un resultado con clic o con el teclado. Abrir un concepto SHALL abrir su tema hogar.

#### Scenario: Teclado
- **WHEN** el usuario recorre los resultados con las flechas y pulsa Enter
- **THEN** se abre el resultado seleccionado y la lista se cierra

#### Scenario: Escape
- **WHEN** el campo de búsqueda tiene el foco y el usuario pulsa Escape
- **THEN** la lista se cierra y el foco sale del campo, sin cerrar el lector

### Requirement: Resaltado en el cerebro
Mientras haya resultados visibles, el sistema SHALL resaltar en el cerebro los nodos que coinciden y atenuar los demás.

#### Scenario: Escribir en el buscador
- **WHEN** el usuario escribe un término con resultados
- **THEN** los nodos correspondientes se iluminan en el cerebro y el resto se atenúa

#### Scenario: Cerrar la búsqueda
- **WHEN** el usuario borra el texto o el campo pierde el foco
- **THEN** el cerebro vuelve a su estado anterior
