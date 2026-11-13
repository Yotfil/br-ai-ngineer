# Spec Delta

## ADDED Requirements

### Requirement: Subtítulos de grupo en las listas de temas
Cuando una pista tiene grupos, el sidebar expandido y la hoja de temas de teléfono SHALL mostrar el nombre de cada grupo, en el idioma activo, como subtítulo encima de sus temas. El subtítulo no SHALL ser interactivo. Las pistas sin grupos SHALL mostrarse sin subtítulos.

#### Scenario: Pista con grupos en el sidebar
- **WHEN** el usuario despliega la pista Python y FastAPI en el sidebar
- **THEN** ve el subtítulo "Python" seguido de sus 10 temas y el subtítulo "FastAPI" seguido de sus 11 temas

#### Scenario: Pista con grupos en teléfono
- **WHEN** en teléfono el usuario abre la hoja de temas de la pista Python y FastAPI
- **THEN** la lista muestra los mismos dos subtítulos, cada uno encima de sus temas

#### Scenario: Subtítulo no interactivo
- **WHEN** el usuario hace clic en el subtítulo "FastAPI"
- **THEN** no ocurre nada

#### Scenario: Pista sin grupos
- **WHEN** el usuario despliega la pista HTTP y REST
- **THEN** ve sus 20 temas seguidos, sin subtítulos

#### Scenario: Sidebar contraído
- **WHEN** el sidebar está contraído a iconos
- **THEN** no se muestra ningún subtítulo de grupo

### Requirement: Título corto en las listas de temas
El sidebar y la hoja de temas de teléfono SHALL mostrar el título corto de cada tema cuando lo tenga, y el título completo cuando no. El lector, el buscador, el panel de relacionados, los enlaces dentro del texto y los botones de tema anterior y siguiente SHALL mostrar siempre el título completo.

#### Scenario: Tema con título corto en el sidebar
- **WHEN** el usuario despliega la pista Python y FastAPI
- **THEN** el tema de concurrencia aparece como "async, hilos y GIL"

#### Scenario: Título completo al abrir
- **WHEN** el usuario abre ese tema
- **THEN** la cabecera del lector muestra "Concurrencia: async/await, event loop, hilos, procesos y GIL"

#### Scenario: Título completo al pasar el cursor
- **WHEN** el usuario pasa el cursor sobre la fila "async, hilos y GIL" del sidebar
- **THEN** el navegador muestra como ayuda el título completo del tema

#### Scenario: Tema sin título corto
- **WHEN** el usuario despliega la pista HTTP y REST
- **THEN** sus temas aparecen con el título completo, como antes

#### Scenario: Buscador
- **WHEN** el usuario busca "GIL"
- **THEN** el resultado del tema muestra su título completo

### Requirement: Ejemplo principal en la pestaña En código
Cuando un tema tiene ejemplo principal, la pestaña En código SHALL mostrarlo en primer lugar, antes de cualquier otro bloque, con todos sus bloques de código en orden.

#### Scenario: Tema de Python
- **WHEN** el usuario abre la pestaña En código del tema "Decoradores"
- **THEN** ve primero el ejemplo principal, después el ejemplo riesgoso junto al correcto y después el puente con el frontend

#### Scenario: Tema sin ejemplo principal
- **WHEN** el usuario abre la pestaña En código de un tema de HTTP y REST
- **THEN** la pestaña se muestra como antes, sin un bloque de ejemplo principal vacío

### Requirement: Nota bajo el ejemplo riesgoso y el correcto
Cuando el ejemplo riesgoso o el correcto llevan una nota, el lector SHALL mostrarla debajo de su código, dentro del mismo bloque "Riesgoso" o "Correcto".

#### Scenario: Ejemplos con nota
- **WHEN** el usuario abre la pestaña En código del tema "Tipado dinámico y type hints"
- **THEN** bajo el código del ejemplo riesgoso lee su nota, y bajo el del ejemplo correcto, la suya

### Requirement: Presentación del ejercicio de clasificación
Un ejercicio de clasificación SHALL mostrar cada caso con un botón por cada categoría del grupo, dispuestos en fila como botones compactos que pasan a la línea siguiente cuando no caben. Al elegir una, el sistema SHALL marcarla como correcta o incorrecta y mostrar la explicación de ese caso, sin afectar a los demás casos.

#### Scenario: Clasificar bien un caso
- **WHEN** el usuario asigna un caso a su categoría correcta
- **THEN** el botón elegido se marca como correcto y aparece la explicación del caso

#### Scenario: Categorías en fila
- **WHEN** el usuario ve en escritorio un caso del ejercicio de clasificación del tema "Estructuras de datos: list, tuple, dict y set"
- **THEN** las cuatro categorías aparecen una al lado de otra en una sola fila, cada una del ancho de su texto

#### Scenario: Casos independientes
- **WHEN** el usuario responde un caso de un grupo de clasificación
- **THEN** los demás casos del grupo siguen sin responder

## MODIFIED Requirements

### Requirement: Barra inferior de pistas en teléfono
En teléfono, las pistas SHALL presentarse en una barra flotante de cristal en la parte inferior, en lugar del sidebar lateral. Los iconos de las pistas SHALL desplazarse horizontalmente en un carrusel circular: al pasar la última pista vuelve a aparecer la primera, en ambos sentidos. La pista que queda en el centro SHALL ser la seleccionada y mostrarse más grande, con transición. La hoja de temas que se despliega desde la barra SHALL tener fondo totalmente opaco, sin efecto de cristal, sea cual sea el modo de fondo elegido para el lector.

#### Scenario: Deslizar el carrusel
- **WHEN** el usuario desliza la barra inferior hacia un lado y suelta
- **THEN** el carrusel se asienta con la pista más cercana en el centro, esa pista crece y queda seleccionada, y sus nodos se resaltan en el cerebro

#### Scenario: Vuelta completa
- **WHEN** el usuario sigue deslizando más allá de la última pista
- **THEN** aparece de nuevo la primera pista, sin saltos ni tope

#### Scenario: Tocar una pista lateral
- **WHEN** el usuario toca un icono que no está en el centro
- **THEN** el carrusel se desplaza hasta dejar esa pista en el centro y seleccionada

#### Scenario: Ver los temas de la pista seleccionada
- **WHEN** el usuario toca la pista que está en el centro
- **THEN** se despliega sobre la barra una lista con los temas de esa pista, y tocar un tema lo abre en el lector

#### Scenario: Hoja de temas legible
- **WHEN** en teléfono el usuario despliega la hoja de temas con el lector en modo Cristal o Sin fondo
- **THEN** la hoja se muestra con fondo totalmente opaco, sin efecto de cristal, y ni el cerebro ni el lector se transparentan detrás de los nombres de los temas

#### Scenario: Hoja sobre un tema abierto
- **WHEN** en teléfono hay un tema abierto y el usuario despliega la hoja de temas
- **THEN** el texto del lector que queda debajo de la hoja no se ve a través de ella

#### Scenario: Tema abierto
- **WHEN** hay un tema abierto
- **THEN** el carrusel muestra en el centro la pista de ese tema
