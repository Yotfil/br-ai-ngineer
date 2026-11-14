# Spec Delta

## MODIFIED Requirements

### Requirement: Paneles flotantes de cristal
La barra superior, el sidebar, el lector y el panel de relacionados SHALL presentarse como paneles separados que flotan sobre el cerebro. En tableta y escritorio SHALL ser translúcidos y con el fondo desenfocado, salvo el lector en modo Sólido. En teléfono ningún panel SHALL desenfocar el fondo: la barra superior, la barra inferior, los resultados de búsqueda y los avisos SHALL tener un fondo casi opaco, y las auroras del fondo SHALL ser estáticas. Los relacionados que se muestran dentro del lector SHALL formar parte de él, sin fondo ni desenfoque propios. La interfaz SHALL usar tema oscuro.

#### Scenario: Vista sin tema abierto
- **WHEN** el usuario abre la aplicación
- **THEN** ve la barra superior y el sidebar flotando sobre el cerebro, y el centro libre

#### Scenario: Teléfono sin desenfoques
- **WHEN** el usuario abre la aplicación en una pantalla de 375 px de ancho
- **THEN** la barra superior y la barra inferior tienen fondo casi opaco, ningún elemento desenfoca lo que tiene detrás y las auroras del fondo no se mueven

#### Scenario: Relacionados dentro del lector
- **WHEN** el usuario abre un tema en teléfono o en tableta y llega al final del contenido
- **THEN** los relacionados aparecen como una sección del lector, separada por una línea, y no como un panel de cristal anidado

### Requirement: Modos de fondo del lector
El lector SHALL ofrecer dos modos elegibles por el usuario: Cristal (fondo translúcido casi opaco con desenfoque leve del cerebro) y Sólido (fondo totalmente opaco, sin desenfoque). Cristal SHALL ser el modo por defecto. El control de modo SHALL alternar entre los dos e indicar el modo activo. En teléfono el lector SHALL mostrarse siempre en modo Sólido y el control de modo no SHALL mostrarse; la preferencia guardada no SHALL modificarse por ello. Los bloques de código SHALL conservar un fondo propio en los dos modos.

#### Scenario: Cambiar de modo
- **WHEN** en escritorio el usuario pulsa el control de modo con el lector en Cristal
- **THEN** el lector cambia de inmediato a fondo totalmente opaco, sin desenfoque, y el control indica "Sólido"

#### Scenario: Volver a Cristal
- **WHEN** en escritorio el usuario pulsa el control de modo con el lector en Sólido
- **THEN** el lector vuelve a Cristal y el control indica "Cristal"

#### Scenario: Solo dos modos
- **WHEN** el usuario recorre los modos con el control
- **THEN** solo encuentra Cristal y Sólido; no existe el modo "Sin fondo"

#### Scenario: Teléfono
- **WHEN** el usuario abre un tema en una pantalla de 375 px de ancho con el modo Cristal guardado
- **THEN** el lector se muestra totalmente opaco y no hay control de modo

#### Scenario: Volver a un ancho mayor
- **WHEN** el usuario tiene guardado Cristal, estrecha la ventana hasta el ancho de un teléfono y la vuelve a ensanchar
- **THEN** el lector vuelve a mostrarse en Cristal y el control de modo reaparece

### Requirement: Preferencias recordadas
El sistema SHALL recordar en el navegador el idioma, el modo del lector, si el sidebar está contraído y si las animaciones están detenidas. No SHALL guardar progreso de estudio. Si el almacenamiento del navegador no está disponible, la aplicación SHALL funcionar con los valores por defecto. Un modo del lector guardado antes de que los modos pasaran a ser dos SHALL tratarse como Cristal, sin afectar al resto de preferencias guardadas.

#### Scenario: Volver a la aplicación
- **WHEN** el usuario elige el modo Sólido, cierra la aplicación y vuelve a abrirla
- **THEN** el lector usa el modo Sólido

#### Scenario: Almacenamiento no disponible
- **WHEN** el navegador bloquea el almacenamiento local
- **THEN** la aplicación carga y funciona con los valores por defecto

#### Scenario: Preferencia guardada con los tres modos anteriores
- **WHEN** el usuario tenía guardado, con la versión anterior de la aplicación, el modo Sin fondo, el modo Sólido o el modo Cristal, junto con el idioma inglés y las animaciones detenidas
- **THEN** al abrir la aplicación el lector usa Cristal, y el idioma inglés y las animaciones detenidas se conservan

### Requirement: Diseño adaptable
La interfaz SHALL adaptarse a cualquier ancho de pantalla, desde teléfono hasta escritorio, sin desplazamiento horizontal de la página y manteniendo el cerebro de fondo. En teléfono el lector SHALL ocupar el ancho disponible y los relacionados SHALL quedar accesibles debajo del contenido del lector. En todos los anchos el lector SHALL caber en el espacio entre las barras, y su contenido SHALL desplazarse dentro del propio lector.

#### Scenario: Teléfono con un tema abierto
- **WHEN** el usuario abre un tema en una pantalla de 375 px de ancho
- **THEN** el lector ocupa el ancho disponible entre la barra superior y la barra inferior, el texto y el código se leen sin desplazar la página en horizontal, y los relacionados aparecen al final del lector

#### Scenario: Cambio de tamaño
- **WHEN** el usuario estrecha la ventana de escritorio hasta el ancho de un teléfono
- **THEN** el sidebar lateral da paso a la barra inferior con una transición, sin recargar ni perder el tema abierto

#### Scenario: Tema largo en tableta
- **WHEN** el usuario abre en una pantalla de 900 px de ancho un tema cuyo contenido no cabe en la pantalla
- **THEN** el lector no sobrepasa el espacio entre la barra superior y el borde inferior, su cabecera y los botones anterior y siguiente permanecen visibles, y el contenido, seguido de los relacionados, se desplaza dentro del lector

### Requirement: Barra inferior de pistas en teléfono
En teléfono, las pistas SHALL presentarse en una barra flotante en la parte inferior, de fondo casi opaco y sin desenfoque, en lugar del sidebar lateral. Los iconos de las pistas SHALL desplazarse horizontalmente en un carrusel circular: al pasar la última pista vuelve a aparecer la primera, en ambos sentidos. La pista que queda en el centro SHALL ser la seleccionada y mostrarse más grande, con transición. La hoja de temas que se despliega desde la barra SHALL tener fondo totalmente opaco, sin efecto de cristal.

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
- **WHEN** en teléfono el usuario despliega la hoja de temas, con cualquiera de los dos modos del lector guardado
- **THEN** la hoja se muestra con fondo totalmente opaco, sin efecto de cristal, y ni el cerebro ni el lector se transparentan detrás de los nombres de los temas

#### Scenario: Hoja sobre un tema abierto
- **WHEN** en teléfono hay un tema abierto y el usuario despliega la hoja de temas
- **THEN** el texto del lector que queda debajo de la hoja no se ve a través de ella

#### Scenario: Tema abierto
- **WHEN** hay un tema abierto
- **THEN** el carrusel muestra en el centro la pista de ese tema

## ADDED Requirements

### Requirement: Desplazamiento táctil del lector
En pantallas táctiles, el contenido del lector SHALL desplazarse en vertical arrastrando con un dedo desde cualquier punto del lector: texto, recuadros, títulos y bloques de código. Un bloque de código más ancho que el lector SHALL desplazarse en horizontal por sí mismo, sin mover la página. Al llegar al principio o al final del contenido, el gesto no SHALL desplazar ni mover nada fuera del lector. Al abrir otro tema, el contenido SHALL mostrarse desde el inicio.

#### Scenario: Arrastrar desde un párrafo
- **WHEN** en un iPhone el usuario abre la pestaña Entender de un tema largo y arrastra hacia arriba con el dedo sobre un párrafo
- **THEN** el contenido se desplaza siguiendo el dedo

#### Scenario: Arrastrar desde un bloque de código
- **WHEN** en un iPhone el usuario abre la pestaña En código y arrastra en vertical con el dedo sobre un bloque de código
- **THEN** el contenido del lector se desplaza en vertical

#### Scenario: Bloque de código ancho
- **WHEN** el usuario arrastra en horizontal sobre un bloque de código más ancho que el lector
- **THEN** se desplaza el bloque de código y la página no se mueve en horizontal

#### Scenario: Todas las pestañas
- **WHEN** en un iPhone el usuario recorre las pestañas Entender, En código, Practicar y En la entrevista de un tema
- **THEN** el contenido de cada una se desplaza arrastrando desde cualquier punto

#### Scenario: Abrir otro tema
- **WHEN** el usuario ha desplazado el contenido hasta el final y abre el tema siguiente
- **THEN** el tema nuevo se muestra desde el inicio

### Requirement: Disposición del lector en teléfono
En teléfono, el lector SHALL tener un único desplazamiento que contiene, en este orden, la pista y la frecuencia, el título, el resumen, las pestañas, el contenido de la pestaña activa, los botones de tema anterior y siguiente y los relacionados. Al desplazar, las pestañas SHALL quedar fijas en el borde superior del lector. El botón de cerrar SHALL estar visible en todo momento, sin tapar las pestañas ni la pista. Al cambiar de pestaña con las pestañas fijas arriba, el contenido nuevo SHALL mostrarse desde su inicio.

#### Scenario: Pestañas fijas al desplazar
- **WHEN** en una pantalla de 375 px de ancho el usuario desplaza el contenido de un tema hasta que el título sale de la vista
- **THEN** las pestañas permanecen en el borde superior del lector y el botón de cerrar sigue visible a su derecha

#### Scenario: Cambiar de pestaña a mitad de lectura
- **WHEN** con las pestañas fijas arriba el usuario toca "En código"
- **THEN** el contenido de En código se muestra desde su inicio, justo debajo de las pestañas

#### Scenario: Cambiar de pestaña sin haber desplazado
- **WHEN** con el título a la vista el usuario toca "En código"
- **THEN** el título sigue a la vista y el contenido cambia debajo de las pestañas

#### Scenario: Final del tema
- **WHEN** el usuario desplaza hasta el final
- **THEN** encuentra los botones de tema anterior y siguiente y, después, los relacionados, sin que la barra inferior los tape

### Requirement: Fondo quieto al leer en teléfono
En teléfono, mientras hay un tema abierto, no SHALL haber ninguna animación en curso en el fondo de la interfaz: ni en el cerebro, ni en las auroras, ni en ningún otro elemento decorativo. Las transiciones breves de entrada y salida de los paneles y de su contenido SHALL mantenerse. Al cerrar el tema, el fondo SHALL volver al comportamiento que marque el control de animaciones.

#### Scenario: Leer un tema
- **WHEN** en teléfono el usuario abre un tema y lo lee durante varios minutos
- **THEN** una vez mostrado el lector, nada se mueve ni se redibuja en el fondo

#### Scenario: Cerrar el tema
- **WHEN** en teléfono el usuario cierra el tema con las animaciones activas
- **THEN** el cerebro vuelve a animarse

#### Scenario: Cerrar el tema con animaciones detenidas
- **WHEN** en teléfono el usuario cierra el tema con las animaciones detenidas
- **THEN** el cerebro sigue quieto y se puede navegar con el dedo

### Requirement: Sin animaciones perpetuas en el lector
El lector no SHALL contener animaciones que se repitan indefinidamente. El botón de tema siguiente SHALL conservar su degradado de color, sin movimiento. El texto del lector no SHALL llevar sombra.

#### Scenario: Botón de tema siguiente
- **WHEN** el usuario abre un tema que tiene tema siguiente, en cualquier tamaño de pantalla
- **THEN** el botón "Siguiente" muestra su degradado de color quieto

### Requirement: Altura visible y zonas seguras
La interfaz SHALL ajustarse a la altura visible real de la pantalla, también cuando el navegador muestra u oculta sus barras. Los paneles fijos SHALL respetar las zonas seguras del dispositivo: ningún control ni texto SHALL quedar bajo la muesca, las esquinas redondeadas o el indicador de inicio.

#### Scenario: iPhone en vertical
- **WHEN** el usuario abre un tema en un iPhone en vertical
- **THEN** la barra inferior queda entera por encima del indicador de inicio y el final del lector se ve completo

#### Scenario: iPhone en horizontal
- **WHEN** el usuario gira el iPhone a horizontal
- **THEN** la barra superior, el lector y la barra inferior quedan dentro de la zona segura, sin contenido bajo la muesca

#### Scenario: Dispositivo sin zonas seguras
- **WHEN** el usuario abre la aplicación en un ordenador
- **THEN** los márgenes de los paneles son los mismos que antes de este requisito
