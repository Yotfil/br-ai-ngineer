# Spec Delta

## ADDED Requirements

### Requirement: Entradas de proyecto en el cerebro
Cada entrada de proyecto SHALL aparecer en el cerebro como un nodo de su pista, con su título corto como nombre, conectado con cada uno de los temas que reúne, sean de su pista o de otra. No SHALL tener conceptos propios.

#### Scenario: Vecinos de una entrada de proyecto
- **WHEN** el usuario pasa el cursor sobre el nodo "Proyecto: crear un pedido"
- **THEN** entre sus vecinos resaltados están los ocho temas que reúne, y los tres de HTTP y REST aparecen con el color de esa pista

#### Scenario: Abrir desde el cerebro
- **WHEN** el usuario pulsa el nodo de una entrada de proyecto
- **THEN** la entrada se abre en el lector

#### Scenario: Más conexiones entre pistas
- **WHEN** se compila el contenido completo
- **THEN** las pistas Python y FastAPI y HTTP y REST quedan unidas, además de por sus conceptos compartidos, por las conexiones de las tres entradas de proyecto del grupo "FastAPI"
