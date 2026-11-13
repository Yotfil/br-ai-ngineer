# Spec Delta

## ADDED Requirements

### Requirement: Título corto en los nombres del cerebro
El nombre que el cerebro muestra junto al nodo de un tema SHALL ser su título corto cuando lo tenga, y su título completo cuando no. Los nombres de pistas y conceptos no cambian.

#### Scenario: Tema con título corto
- **WHEN** el usuario pasa el cursor sobre el nodo del tema de concurrencia de la pista Python y FastAPI
- **THEN** el nombre que aparece junto al nodo es "async, hilos y GIL"

#### Scenario: Tema sin título corto
- **WHEN** el usuario pasa el cursor sobre el nodo de un tema de HTTP y REST
- **THEN** el nombre que aparece junto al nodo es su título completo

### Requirement: Dos pistas con contenido conectadas
Cuando un tema de una pista se relaciona con un tema o concepto de otra, el cerebro SHALL mostrar la conexión entre ambos, de modo que las pistas con contenido queden unidas por sus conceptos compartidos.

#### Scenario: Enlace entre Python y REST
- **WHEN** el usuario pasa el cursor sobre el nodo del tema "Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas"
- **THEN** entre sus vecinos resaltados está el concepto JWT, con el color de la pista HTTP y REST

#### Scenario: La pista Python ya tiene contenido
- **WHEN** el usuario abre la aplicación
- **THEN** el nodo de la pista Python y FastAPI aparece con su color pleno y rodeado de sus temas, y las pistas SQL, Git y POO siguen atenuadas y sin hijos
