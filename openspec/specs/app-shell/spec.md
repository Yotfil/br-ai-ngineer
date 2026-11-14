# app-shell Specification

## Purpose
Define la interfaz que rodea al cerebro: paneles flotantes de cristal para navegar por pistas, leer un tema y saltar a los relacionados, con un aspecto enérgico que no canse al leer.

## Requirements

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

### Requirement: Sidebar de pistas colapsable
El sidebar SHALL listar las pistas, cada una desplegable para mostrar sus temas. SHALL poder contraerse a una franja de solo iconos y volver a expandirse. El icono de una pista SHALL ser su abreviatura de dos letras sobre el color de la pista.

#### Scenario: Desplegar una pista
- **WHEN** el usuario hace clic en una pista
- **THEN** sus temas aparecen debajo con una transición, y un segundo clic los oculta

#### Scenario: Contraer el sidebar
- **WHEN** el usuario pulsa el botón de contraer
- **THEN** el sidebar muestra solo el icono de cada pista y el lector gana ese ancho

#### Scenario: Clic en un icono con el sidebar contraído
- **WHEN** el sidebar está contraído y el usuario hace clic en el icono de una pista
- **THEN** el sidebar se expande con esa pista desplegada

#### Scenario: Tema actual
- **WHEN** hay un tema abierto
- **THEN** su pista está desplegada y el tema aparece marcado en el sidebar

### Requirement: Lector central
Al abrir un tema, el sistema SHALL mostrarlo en un panel central con su pista, su frecuencia, título, resumen y las pestañas Entender, En código, Practicar y En la entrevista. La pestaña Practicar SHALL aparecer solo cuando el tema tiene ejercicios o una demo. El lector SHALL poder cerrarse.

#### Scenario: Abrir un tema
- **WHEN** el usuario abre un tema desde el sidebar, el buscador o el cerebro
- **THEN** el lector aparece con la pestaña Entender activa y el acento de color de la pista del tema

#### Scenario: Cambiar de pestaña
- **WHEN** el usuario elige la pestaña En código
- **THEN** ve, con resaltado de sintaxis y en este orden, los bloques que el tema tenga: la petición tal como viaja por la red, el ejemplo del lado del servidor, el ejemplo riesgoso junto al correcto y el puente con el frontend

#### Scenario: Tema sin práctica
- **WHEN** el usuario abre un tema que no tiene ejercicios ni demo
- **THEN** el lector muestra tres pestañas (Entender, En código y En la entrevista) y ninguna pestaña Practicar

#### Scenario: Entender
- **WHEN** el usuario abre la pestaña Entender
- **THEN** ve la definición, la analogía y el problema que resuelve

#### Scenario: Cerrar
- **WHEN** el usuario pulsa el botón de cerrar o la tecla Escape
- **THEN** el lector desaparece y queda el cerebro a la vista

#### Scenario: Tema anterior y siguiente
- **WHEN** el usuario pulsa "Siguiente tema"
- **THEN** el lector muestra el siguiente tema de la misma pista

### Requirement: Pestaña de entrevista en cada tema
Todo tema SHALL incluir la pestaña En la entrevista, con una respuesta modelo redactada para decirse en voz alta y los malentendidos comunes sobre el tema con su corrección, presentados como consejos para superar la entrevista.

#### Scenario: Preparar la respuesta
- **WHEN** el usuario abre la pestaña En la entrevista de un tema
- **THEN** ve primero la respuesta modelo destacada y, debajo, los malentendidos comunes con su corrección

#### Scenario: Todos los temas la tienen
- **WHEN** se recorren los 20 temas de HTTP y REST
- **THEN** cada uno ofrece la pestaña En la entrevista con contenido

### Requirement: Enlaces a otros temas dentro del texto
Cuando el texto de un tema remite a otro tema o concepto, la referencia SHALL mostrarse como un enlace con el título del tema o el nombre del concepto de destino en el idioma activo, y activarlo SHALL abrir ese tema. El contenido no SHALL referirse a otros temas por su número.

#### Scenario: Enlace en el texto
- **WHEN** el usuario lee la pestaña En código del tema "Métodos HTTP y PUT vs. PATCH" y activa el enlace "CORS y el preflight con OPTIONS" del puente
- **THEN** el lector muestra el tema "CORS y el preflight con OPTIONS"

#### Scenario: Enlace en inglés
- **WHEN** el usuario lee ese mismo puente con el idioma inglés activo
- **THEN** el enlace muestra el título en inglés del tema de destino

#### Scenario: Sin referencias por número
- **WHEN** se revisa el contenido de los 20 temas de HTTP y REST en ambos idiomas
- **THEN** ningún texto contiene una referencia del tipo "(tema 10)" o "(topic 10)"

### Requirement: Ayuda de gestos del cerebro
En escritorio, cuando no hay ningún tema abierto, el sistema SHALL mostrar en la parte inferior una línea discreta que explica cómo abrir, girar, mover y acercar el cerebro. La ayuda no SHALL interceptar la interacción con el cerebro, y no SHALL mostrarse en tableta ni en teléfono.

#### Scenario: Sin tema abierto en escritorio
- **WHEN** el usuario está en escritorio sin ningún tema abierto
- **THEN** ve la línea de ayuda de gestos en el idioma activo

#### Scenario: Tema abierto
- **WHEN** el usuario abre un tema
- **THEN** la ayuda de gestos desaparece con una transición

#### Scenario: Arrastrar sobre la ayuda
- **WHEN** el usuario inicia un arrastre con el cursor sobre la línea de ayuda
- **THEN** el cerebro gira como si la ayuda no estuviera

#### Scenario: Teléfono
- **WHEN** el usuario abre la aplicación en un teléfono
- **THEN** la ayuda de gestos no se muestra

### Requirement: Dirección compartible
Cada tema SHALL tener una dirección propia. Abrir esa dirección SHALL mostrar el tema directamente, y los botones atrás y adelante del navegador SHALL recorrer los temas visitados.

#### Scenario: Abrir un enlace a un tema
- **WHEN** el usuario abre la dirección de un tema en una pestaña nueva
- **THEN** la aplicación carga con ese tema abierto en el lector

#### Scenario: Dirección inexistente
- **WHEN** el usuario abre una dirección de tema que no existe
- **THEN** la aplicación muestra el cerebro sin lector y un aviso de que el tema no se encontró

### Requirement: Panel de relacionados
Con un tema abierto, el sistema SHALL mostrar junto al lector los conceptos de ese tema y los temas relacionados, indicando la pista de cada uno. Cada elemento SHALL abrir su tema.

#### Scenario: Saltar a un relacionado
- **WHEN** el usuario hace clic en un tema relacionado de otra pista
- **THEN** el lector muestra ese tema y el panel se actualiza con sus propios relacionados

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

### Requirement: Transiciones suaves
Los paneles y su contenido SHALL aparecer, desaparecer y cambiar con transiciones graduales. Con la preferencia de movimiento reducido activa, los cambios SHALL ser inmediatos.

#### Scenario: Abrir el lector
- **WHEN** el usuario abre un tema
- **THEN** el lector entra con una transición y su contenido aparece de forma escalonada

### Requirement: Contenido de la pestaña Practicar
La pestaña Practicar SHALL mostrar los grupos de ejercicios del tema, si los tiene, y la demo del tema, si la tiene, sin dejar un espacio vacío por lo que falte.

#### Scenario: Tema con ejercicios y demo
- **WHEN** el usuario abre Practicar en el tema "Métodos seguros e idempotentes"
- **THEN** ve sus ejercicios y una demo que permite enviar la misma petición varias veces y observar el resultado

#### Scenario: Tema con demo y sin ejercicios
- **WHEN** el usuario abre Practicar en el tema "Rate limiting, 429 y Retry-After"
- **THEN** ve solo la demo

#### Scenario: Tema con ejercicios y sin demo
- **WHEN** el usuario abre Practicar en el tema "Métodos HTTP y PUT vs. PATCH"
- **THEN** ve solo los ejercicios

### Requirement: Pistas próximamente
Las pistas declaradas sin temas SHALL mostrarse en el sidebar y en la barra inferior de teléfono, atenuadas y con la indicación "Próximamente", y no SHALL poder desplegarse ni abrir temas.

#### Scenario: Pista sin contenido en el sidebar
- **WHEN** el usuario hace clic en una pista marcada "Próximamente" en el sidebar
- **THEN** la pista no se despliega

#### Scenario: Pista sin contenido en el carrusel
- **WHEN** en teléfono el usuario toca una pista "Próximamente" que está en el centro del carrusel
- **THEN** la hoja se abre mostrando "Próximamente" en lugar de una lista de temas

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

### Requirement: Control de animaciones
La barra superior SHALL incluir un control para detener y reanudar las animaciones, disponible en teléfono y en escritorio. Con las animaciones detenidas no SHALL haber rotación automática del cerebro, deriva de nodos, pulsos ni movimiento de las auroras del fondo; el cerebro SHALL seguir siendo navegable y las transiciones de los paneles SHALL mantenerse. La elección SHALL recordarse en el navegador. Cuando el sistema del usuario pide movimiento reducido, las animaciones SHALL iniciar detenidas.

#### Scenario: Detener animaciones
- **WHEN** el usuario pulsa "Detener animaciones"
- **THEN** el cerebro y el fondo quedan quietos de inmediato y el control pasa a ofrecer "Reanudar animaciones"

#### Scenario: Navegar con animaciones detenidas
- **WHEN** las animaciones están detenidas y el usuario arrastra sobre el cerebro
- **THEN** el cerebro gira siguiendo el arrastre y vuelve a quedar quieto al soltar

#### Scenario: Preferencia recordada
- **WHEN** el usuario detiene las animaciones, cierra la aplicación y vuelve a abrirla
- **THEN** las animaciones siguen detenidas

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

### Requirement: Recuperación ante una versión nueva
Si el contenido de un tema o una demo no se pueden cargar porque se publicó una versión nueva de la aplicación mientras estaba abierta, la aplicación SHALL recargarse sola y mostrar el mismo tema con la versión nueva. La recarga automática SHALL ocurrir como máximo una vez por cada versión nueva: si tras recargar la carga sigue fallando, la aplicación no SHALL volver a recargarse y SHALL mostrar el aviso de error de carga.

#### Scenario: Abrir un tema tras una publicación
- **WHEN** el usuario tiene la aplicación abierta, se publica una versión nueva y abre un tema que aún no había abierto
- **THEN** la aplicación se recarga sola y muestra ese tema, sin que el usuario tenga que hacer nada

#### Scenario: Abrir una demo tras una publicación
- **WHEN** el usuario tiene un tema abierto, se publica una versión nueva y entra en la pestaña Practicar de un tema con demo
- **THEN** la aplicación se recarga sola y vuelve a mostrar ese tema

#### Scenario: Sin bucle de recargas
- **WHEN** la aplicación ya se recargó por una versión nueva y la carga del tema vuelve a fallar
- **THEN** la aplicación no se recarga otra vez y muestra el aviso de error de carga

#### Scenario: Sin versión nueva
- **WHEN** la carga de un tema falla y no se ha publicado ninguna versión nueva
- **THEN** la aplicación no se recarga

### Requirement: Aviso de error de carga
Cuando el contenido de un tema o una demo no se pueden cargar y no procede la recarga automática, el sistema SHALL mostrar en su lugar un mensaje que lo explica, en el idioma activo, y un botón para reintentar. El botón de cerrar del lector SHALL seguir disponible. Mientras se determina si hay una versión nueva, SHALL mostrarse el estado de carga.

#### Scenario: Sin conexión
- **WHEN** el usuario abre un tema sin conexión a la red
- **THEN** el lector muestra "No se pudo cargar el contenido. Comprueba tu conexión." y el botón "Reintentar", y puede cerrarse

#### Scenario: Reintentar con éxito
- **WHEN** el usuario recupera la conexión y pulsa "Reintentar"
- **THEN** el lector muestra el contenido del tema

#### Scenario: Demo que no carga
- **WHEN** la demo de un tema no se puede cargar y no hay versión nueva
- **THEN** el bloque de la demo muestra el mensaje y el botón "Reintentar", y los ejercicios del tema siguen funcionando

#### Scenario: Idioma inglés
- **WHEN** el usuario tiene la aplicación en inglés y un tema no se puede cargar
- **THEN** el mensaje es "Couldn't load the content. Check your connection." y el botón "Retry"

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
