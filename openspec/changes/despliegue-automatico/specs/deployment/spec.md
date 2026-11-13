# Spec Delta

## ADDED Requirements

### Requirement: Publicación de producción desde main
La versión de producción de la aplicación SHALL publicarse sola con cada push a la rama `main`, sin pasos manuales, a partir de la configuración que está en el repositorio. Un push a cualquier otra rama no SHALL cambiar la versión de producción.

#### Scenario: Integrar en main
- **WHEN** se integra un cambio en `main`
- **THEN** al terminar la compilación, la dirección de producción sirve la versión nueva

#### Scenario: Push a otra rama
- **WHEN** se hace push a `develop` o a una rama `feature/*`
- **THEN** la dirección de producción sigue sirviendo la misma versión que antes

#### Scenario: Compilación fallida
- **WHEN** la compilación de un push a `main` falla
- **THEN** la dirección de producción sigue sirviendo la última versión publicada

### Requirement: Vista previa de las demás ramas
Cada push a una rama distinta de `main` SHALL generar una vista previa de la aplicación con dirección propia, accesible desde un teléfono, que no afecta a producción.

#### Scenario: Rama de un cambio
- **WHEN** se hace push a una rama `feature/*`
- **THEN** al terminar la compilación existe una dirección de vista previa que sirve la aplicación compilada desde esa rama

#### Scenario: Probar en un teléfono
- **WHEN** el usuario abre en su teléfono la dirección de vista previa de una rama
- **THEN** ve la aplicación de esa rama, con todas sus direcciones funcionando igual que en producción

### Requirement: Direcciones compartibles servidas por el hosting
Cualquier dirección de la aplicación SHALL poder abrirse directamente en producción y en las vistas previas: el hosting SHALL responder con la aplicación a las direcciones de idioma, pista y tema, y la aplicación SHALL mostrar lo que corresponda a esa dirección.

#### Scenario: Abrir un enlace a un tema
- **WHEN** alguien abre directamente la dirección de un tema en producción, sin pasar por la página inicial
- **THEN** la aplicación carga y muestra ese tema

#### Scenario: Recargar con un tema abierto
- **WHEN** el usuario recarga la página con un tema abierto
- **THEN** la aplicación vuelve a mostrar ese tema

### Requirement: Caché de los archivos estáticos
Los archivos cuyo nombre lleva una huella de su contenido SHALL servirse con caché de larga duración e inmutable, de modo que el navegador no los vuelva a pedir en visitas posteriores. La página principal SHALL revalidarse en cada visita, de modo que una versión nueva se vea en la siguiente carga. Los archivos de texto SHALL servirse comprimidos.

#### Scenario: Archivo con huella
- **WHEN** el navegador pide un archivo de `/assets/`
- **THEN** la respuesta lleva una cabecera de caché de un año e inmutable

#### Scenario: Página principal
- **WHEN** el navegador pide la página principal o la dirección de un tema
- **THEN** la respuesta indica que debe revalidarse antes de reutilizarse

#### Scenario: Segunda visita
- **WHEN** el usuario vuelve a abrir la aplicación sin que se haya publicado una versión nueva
- **THEN** el navegador reutiliza los archivos con huella sin pedirlos de nuevo

### Requirement: Despliegue documentado y reproducible
La configuración que determina qué se publica y cómo SHALL estar en el repositorio. Los ajustes que solo pueden hacerse en el panel del hosting SHALL estar documentados en el repositorio con sus valores.

#### Scenario: Consultar cómo se publica
- **WHEN** alguien lee la documentación del repositorio
- **THEN** encuentra qué rama publica producción, qué ramas generan vista previa, qué archivos lo configuran y qué ajustes del panel deben mantenerse
