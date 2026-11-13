# localization Specification

## Purpose
Permite estudiar todo el material en español o en inglés, cambiando de idioma en cualquier momento, y deja la base lista para añadir más idiomas.

## Requirements

### Requirement: Interfaz y contenido en dos idiomas
El sistema SHALL ofrecer toda la interfaz y todo el contenido de los temas en español e inglés. El código de los ejemplos SHALL ser el mismo en ambos idiomas.

#### Scenario: Tema en inglés
- **WHEN** el usuario lee un tema con el idioma inglés activo
- **THEN** el título, el resumen, las secciones, los ejercicios, los rótulos de la interfaz y los nombres en el cerebro y el sidebar están en inglés

### Requirement: Cambio de idioma sin perder el lugar
La barra superior SHALL incluir un selector de idioma. Cambiar de idioma SHALL conservar el tema abierto y la pestaña activa.

#### Scenario: Cambiar con un tema abierto
- **WHEN** el usuario lee la pestaña En código de un tema en español y elige inglés
- **THEN** ve el mismo tema, en la misma pestaña, en inglés

### Requirement: Idioma en la dirección
El idioma SHALL formar parte de la dirección de cada vista, de modo que un enlace compartido abra en el idioma en que se copió.

#### Scenario: Enlace en inglés
- **WHEN** el usuario abre un enlace a un tema copiado con el idioma inglés activo
- **THEN** el tema se muestra en inglés aunque su preferencia guardada sea español

### Requirement: Idioma inicial
Al entrar sin idioma en la dirección, el sistema SHALL usar el idioma guardado como preferencia; si no hay, el idioma del navegador cuando sea español o inglés; en cualquier otro caso, español.

#### Scenario: Primera visita con navegador en inglés
- **WHEN** un usuario sin preferencia guardada y con el navegador en inglés abre la dirección raíz
- **THEN** la aplicación se muestra en inglés

#### Scenario: Navegador en otro idioma
- **WHEN** un usuario sin preferencia guardada y con el navegador en francés abre la dirección raíz
- **THEN** la aplicación se muestra en español

### Requirement: Paridad entre idiomas
Todo tema SHALL existir en ambos idiomas con las mismas secciones y los mismos conceptos.

#### Scenario: Falta una traducción
- **WHEN** se compila el contenido y un tema existe en español pero no en inglés
- **THEN** la compilación falla y el mensaje nombra el tema y el idioma ausente

#### Scenario: Secciones distintas entre idiomas
- **WHEN** se compila el contenido y la versión en inglés de un tema omite una sección que la versión en español sí tiene
- **THEN** la compilación falla y el mensaje nombra el tema y la sección
