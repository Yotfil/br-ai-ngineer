# concept-graph Specification

## Purpose
Ofrece un mapa visual tridimensional de pistas, temas y conceptos, siempre presente de fondo, para explorar cómo se relacionan y abrir cualquiera de ellos.

## Requirements

### Requirement: Cerebro siempre de fondo
El sistema SHALL mostrar el grafo de pistas, temas y conceptos detrás de todos los paneles en todo momento. Cada nodo SHALL llevar el color de su pista, y los temas más frecuentes en entrevistas SHALL verse más grandes. En teléfono, mientras hay un tema abierto, el grafo SHALL permanecer detrás del lector como imagen fija.

#### Scenario: Carga inicial
- **WHEN** el usuario abre la aplicación
- **THEN** el grafo aparece ya asentado, sin nodos reacomodándose

#### Scenario: Tema abierto
- **WHEN** hay un tema abierto en el lector
- **THEN** el grafo sigue visible detrás de los paneles

#### Scenario: Pista sin contenido
- **WHEN** una pista está declarada sin temas
- **THEN** su nodo aparece en el grafo, atenuado y sin nodos hijos

#### Scenario: Tema abierto en teléfono
- **WHEN** en teléfono hay un tema abierto
- **THEN** el grafo se ve inmóvil en los márgenes que deja el lector

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
Las conexiones SHALL mostrar pulsos pequeños que las recorren, con una cabeza brillante y una cola que se desvanece. Las conexiones resaltadas SHALL llevar pulso siempre. En teléfono, con nada resaltado, SHALL llevar pulso la mitad de conexiones que en tableta y escritorio.

#### Scenario: Conexiones en reposo
- **WHEN** nada está resaltado
- **THEN** una parte de las conexiones muestra pulsos que avanzan de un nodo a otro

#### Scenario: Reposo en teléfono
- **WHEN** en teléfono no hay tema abierto y nada está resaltado
- **THEN** llevan pulso una de cada seis conexiones, frente a una de cada tres en escritorio

#### Scenario: Resaltado en teléfono
- **WHEN** en teléfono el usuario selecciona una pista en la barra inferior
- **THEN** todas las conexiones resaltadas llevan pulso

### Requirement: Movimiento en reposo y pausa
El grafo SHALL girar por sí solo, muy lentamente, cuando el usuario no interactúa. La rotación SHALL detenerse mientras hay un tema abierto, mientras el cursor está sobre un nodo y mientras hay una búsqueda activa. Toda animación del grafo SHALL pausarse cuando la pestaña del navegador no está visible. En teléfono, mientras hay un tema abierto, el grafo SHALL dejar de redibujarse por completo: sin rotación, sin deriva, sin pulsos y sin transiciones de resaltado, y no SHALL girar ni acercarse con los dedos; SHALL redibujarse una sola vez si cambia el tamaño de la pantalla. Al cerrar el tema SHALL reanudarse con el estado vigente.

#### Scenario: Tema abierto
- **WHEN** el usuario abre un tema
- **THEN** el grafo deja de girar

#### Scenario: Después de interactuar
- **WHEN** el usuario suelta el grafo tras girarlo
- **THEN** la rotación automática se reanuda tras una pausa breve

#### Scenario: Tema abierto en teléfono
- **WHEN** en teléfono el usuario abre un tema con las animaciones activas
- **THEN** el grafo deja de redibujarse: no hay pulsos, rotación ni deriva

#### Scenario: Cambiar de tema en teléfono
- **WHEN** en teléfono, con un tema abierto, el usuario abre el tema siguiente
- **THEN** el grafo no se redibuja

#### Scenario: Girar el teléfono con un tema abierto
- **WHEN** en teléfono, con un tema abierto, el usuario gira el dispositivo
- **THEN** el grafo se dibuja una vez con el tamaño nuevo y vuelve a quedar inmóvil

#### Scenario: Cerrar el tema en teléfono
- **WHEN** en teléfono el usuario cierra el tema con las animaciones activas
- **THEN** vuelven los pulsos, la deriva y, tras una pausa breve, la rotación lenta, con el resaltado que corresponda al estado actual

#### Scenario: Tema abierto en escritorio
- **WHEN** en escritorio el usuario abre un tema con las animaciones activas
- **THEN** el grafo deja de girar y los pulsos continúan

### Requirement: Animaciones detenidas
Cuando las animaciones están detenidas, ya sea por el control de la aplicación o porque el sistema del usuario pide reducir el movimiento, el grafo SHALL mostrarse sin rotación automática, sin deriva y sin pulsos, SHALL dejar de redibujarse mientras nada cambie, y SHALL seguir siendo navegable.

#### Scenario: Preferencia de movimiento reducido
- **WHEN** el usuario tiene activa la preferencia de movimiento reducido y no ha elegido lo contrario
- **THEN** el grafo permanece quieto salvo cuando el usuario lo mueve

#### Scenario: Reanudar
- **WHEN** las animaciones están detenidas y el usuario pulsa "Reanudar animaciones"
- **THEN** vuelven la rotación lenta, la deriva y los pulsos

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

### Requirement: Coste de dibujo acotado
El grafo SHALL dibujarse con una densidad de píxeles de 2x como máximo, sea cual sea la del dispositivo. El resplandor de los nodos y de los pulsos y la legibilidad de los nombres sobre el fondo SHALL conservarse con un aspecto equivalente al anterior: mismos colores por pista, pistas con más resplandor que los temas, nodo señalado o seleccionado destacado y nombres legibles sobre nodos y conexiones.

#### Scenario: Pantalla de densidad 3x
- **WHEN** el usuario abre la aplicación en un dispositivo con densidad de píxeles 3x
- **THEN** el grafo se dibuja a densidad 2x y ocupa toda la pantalla

#### Scenario: Pantalla de densidad 1x
- **WHEN** el usuario abre la aplicación en una pantalla de densidad 1x
- **THEN** el grafo se dibuja a densidad 1x

#### Scenario: Aspecto equivalente
- **WHEN** se compara el grafo en escritorio antes y después de este requisito, con la misma vista
- **THEN** los nodos conservan su resplandor del color de su pista, el nodo bajo el cursor destaca y los nombres se leen sobre nodos y conexiones
