# Spec Delta

## ADDED Requirements

### Requirement: Paridad de textos de interfaz
Los textos de la interfaz SHALL tener las mismas claves en español y en inglés. Todo texto SHALL ser no vacío en ambos idiomas, y un texto con marcadores de sustitución (`{{nombre}}`) SHALL usar los mismos marcadores en ambos idiomas. Una prueba automática SHALL comprobarlo.

#### Scenario: Clave ausente en un idioma
- **WHEN** se ejecutan las pruebas y una clave de texto existe en español pero no en inglés, o al revés
- **THEN** la prueba de paridad falla y el mensaje nombra la clave y el idioma en el que falta

#### Scenario: Texto vacío
- **WHEN** se ejecutan las pruebas y el texto de una clave está vacío o solo tiene espacios en uno de los idiomas
- **THEN** la prueba de paridad falla y el mensaje nombra la clave y el idioma

#### Scenario: Marcadores distintos
- **WHEN** se ejecutan las pruebas y el texto en español de una clave usa el marcador `{{topic}}` y el texto en inglés de esa clave no lo usa
- **THEN** la prueba de paridad falla y el mensaje nombra la clave

#### Scenario: Textos en paridad
- **WHEN** se ejecutan las pruebas con los textos actuales de ambos idiomas
- **THEN** la prueba de paridad pasa
