# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
