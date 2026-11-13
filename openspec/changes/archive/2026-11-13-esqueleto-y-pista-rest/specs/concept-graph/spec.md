# Spec Delta

## Purpose

Ofrece un mapa visual tridimensional de pistas, temas y conceptos, siempre presente de fondo, para explorar cómo se relacionan y abrir cualquiera de ellos.

## ADDED Requirements

### Requirement: Cerebro siempre de fondo
El sistema SHALL mostrar el grafo de pistas, temas y conceptos detrás de todos los paneles en todo momento. Cada nodo SHALL llevar el color de su pista, y los temas más frecuentes en entrevistas SHALL verse más grandes.

#### Scenario: Carga inicial
- **WHEN** el usuario abre la aplicación
- **THEN** el grafo aparece ya asentado, sin nodos reacomodándose

#### Scenario: Tema abierto
- **WHEN** hay un tema abierto en el lector
- **THEN** el grafo sigue visible detrás de los paneles

#### Scenario: Pista sin contenido
- **WHEN** una pista está declarada sin temas
- **THEN** su nodo aparece en el grafo, atenuado y sin nodos hijos

### Requirement: Navegación en tres dimensiones
El usuario SHALL poder girar, desplazar y acercar el grafo. Los nodos más lejanos SHALL verse más pequeños y tenues que los cercanos.

#### Scenario: Girar
- **WHEN** el usuario arrastra sobre el grafo
- **THEN** el grafo gira siguiendo el arrastre

#### Scenario: Desplazar
- **WHEN** el usuario arrastra con la tecla Mayús presionada
- **THEN** el grafo se desplaza sin girar

#### Scenario: Acercar
- **WHEN** el usuario usa la rueda sobre el grafo
- **THEN** el grafo se acerca o aleja en torno al cursor, dentro de un mínimo y un máximo

### Requirement: Navegación táctil
En pantallas táctiles el cerebro SHALL conservar la vista tridimensional y SHALL poder girarse con un dedo, y acercarse y desplazarse con dos dedos. Un toque sobre un nodo SHALL abrirlo.

#### Scenario: Girar con un dedo
- **WHEN** el usuario arrastra un dedo sobre el cerebro
- **THEN** el cerebro gira siguiendo el dedo y la página no se desplaza

#### Scenario: Pellizcar
- **WHEN** el usuario separa o junta dos dedos sobre el cerebro
- **THEN** el cerebro se acerca o aleja, dentro de un mínimo y un máximo

#### Scenario: Tocar un nodo
- **WHEN** el usuario toca un nodo de tema sin arrastrar
- **THEN** se abre ese tema en el lector

### Requirement: Nombres legibles según cercanía
Los nombres de las pistas SHALL estar siempre visibles. Los nombres de temas y conceptos SHALL aparecer al acercarse o cuando el nodo está resaltado.

#### Scenario: Vista general
- **WHEN** el grafo está en su zoom inicial y nada está resaltado
- **THEN** solo se leen los nombres de las pistas

### Requirement: Resaltado de vecinos
Al señalar o seleccionar un nodo, el sistema SHALL resaltar ese nodo, sus conexiones y sus vecinos, y atenuar el resto con una transición gradual.

#### Scenario: Cursor sobre un tema
- **WHEN** el usuario pasa el cursor sobre un nodo de tema
- **THEN** ese nodo, sus conceptos y sus temas relacionados se destacan con sus nombres, y los demás nodos se atenúan

#### Scenario: Cursor sobre un ítem del sidebar
- **WHEN** el usuario pasa el cursor sobre un tema en el sidebar
- **THEN** el nodo correspondiente se resalta en el grafo

### Requirement: Abrir desde el grafo
Al hacer clic en un nodo de tema, el sistema SHALL abrir ese tema en el lector. Al hacer clic en un nodo de concepto, SHALL abrir su tema hogar. Al hacer clic en un nodo de pista, SHALL desplegar esa pista en el sidebar. Un arrastre no SHALL contar como clic.

#### Scenario: Clic en un concepto
- **WHEN** el usuario hace clic en el nodo de un concepto
- **THEN** se abre el tema hogar de ese concepto

#### Scenario: Clic en una pista sin contenido
- **WHEN** el usuario hace clic en el nodo de una pista marcada "Próximamente"
- **THEN** no se abre nada

#### Scenario: Clic en el vacío
- **WHEN** el usuario hace clic en una zona del grafo sin nodos
- **THEN** el lector se cierra si estaba abierto

### Requirement: Pulsos de energía
Las conexiones SHALL mostrar pulsos pequeños que las recorren, con una cabeza brillante y una cola que se desvanece. Las conexiones resaltadas SHALL llevar pulso siempre.

#### Scenario: Conexiones en reposo
- **WHEN** nada está resaltado
- **THEN** una parte de las conexiones muestra pulsos que avanzan de un nodo a otro

### Requirement: Movimiento en reposo y pausa
El grafo SHALL girar por sí solo, muy lentamente, cuando el usuario no interactúa. La rotación SHALL detenerse mientras hay un tema abierto, mientras el cursor está sobre un nodo y mientras hay una búsqueda activa. Toda animación del grafo SHALL pausarse cuando la pestaña del navegador no está visible.

#### Scenario: Tema abierto
- **WHEN** el usuario abre un tema
- **THEN** el grafo deja de girar

#### Scenario: Después de interactuar
- **WHEN** el usuario suelta el grafo tras girarlo
- **THEN** la rotación automática se reanuda tras una pausa breve

### Requirement: Animaciones detenidas
Cuando las animaciones están detenidas, ya sea por el control de la aplicación o porque el sistema del usuario pide reducir el movimiento, el grafo SHALL mostrarse sin rotación automática, sin deriva y sin pulsos, SHALL dejar de redibujarse mientras nada cambie, y SHALL seguir siendo navegable.

#### Scenario: Preferencia de movimiento reducido
- **WHEN** el usuario tiene activa la preferencia de movimiento reducido y no ha elegido lo contrario
- **THEN** el grafo permanece quieto salvo cuando el usuario lo mueve

#### Scenario: Reanudar
- **WHEN** las animaciones están detenidas y el usuario pulsa "Reanudar animaciones"
- **THEN** vuelven la rotación lenta, la deriva y los pulsos
