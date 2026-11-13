# Spec Delta

## ADDED Requirements

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
