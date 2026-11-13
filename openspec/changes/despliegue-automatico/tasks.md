# Tasks

## 1. Punto de partida

- [ ] 1.1 Comprobar que la rama es `feature/despliegue-automatico` y que `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` están en verde antes de tocar nada; verificar anotando el número de pruebas que pasan
- [ ] 1.2 Pedir al usuario que lea en el panel de Cloudflare (Worker `br-ai-ngineer`, Settings → Build) la rama de producción, el comando de compilación, el comando de despliegue, el comando de vista previa y si las compilaciones de otras ramas están activadas; verificar que los valores quedan anotados en la conversación. Si alguno no encaja con la tabla de design.md decisión 7 de un modo que la tabla no prevé, detenerse: es una decisión para Fable 5.2

## 2. Configuración del despliegue

- [ ] 2.1 Añadir `wrangler` a `devDependencies` con versión exacta de la serie 4, crear `wrangler.jsonc` con el contenido de design.md decisión 4 y añadir `.wrangler` a `.gitignore`; verificar con una prueba que lee `wrangler.jsonc` y comprueba `name`, `assets.directory`, `assets.not_found_handling` y la ausencia de `main`, y con `npx wrangler deploy --dry-run` tras compilar, que termina sin errores y sin pedir credenciales
- [ ] 2.2 Crear `.nvmrc` con `24` (design.md decisión 5); verificar con una prueba que lee el archivo
- [ ] 2.3 Crear `public/_headers` con la regla de design.md decisión 6; verificar con una prueba que lee el archivo y, tras `npm run build`, que `dist/_headers` existe con el mismo contenido
- [ ] 2.4 Añadir la sección "Despliegue" al `README.md` y mencionar `.nvmrc` en los requisitos (design.md decisión 8); verificar que la sección contiene los cinco puntos de esa decisión y que la tabla de ajustes coincide con la de la decisión 7

## 3. Recuperación ante una versión nueva y error de carga

- [ ] 3.1 Implementar la comprobación de versión nueva y la recarga única de design.md decisión 2, como una función común a temas y demos; verificar con pruebas los seis casos de design.md decisión 11 (versión nueva, misma versión, petición fallida, respuesta sin script, segunda vez con la misma versión, almacenamiento no disponible)
- [ ] 3.2 Añadir los textos `reader.loadError` y `reader.retry` en `src/locales/es.json` y `en.json` con los valores de design.md decisión 3; verificar que la prueba de paridad de textos entre idiomas sigue en verde
- [ ] 3.3 Tratar el fallo de carga de un tema en el lector: recarga si procede y, si no, mensaje y botón de reintentar con el botón de cerrar disponible (design.md decisión 3); verificar con pruebas los escenarios "Abrir un tema tras una publicación", "Sin bucle de recargas", "Sin versión nueva", "Sin conexión", "Reintentar con éxito" e "Idioma inglés" de specs/app-shell
- [ ] 3.4 Tratar el fallo de carga de una demo del mismo modo dentro de su bloque (design.md decisión 3); verificar con pruebas los escenarios "Abrir una demo tras una publicación" y "Demo que no carga"
- [ ] 3.5 Comprobar en el navegador, con la versión compilada servida en local (`npm run preview`), el estado de error: abrir la app, cortar la red en las herramientas del navegador y abrir un tema; verificar que aparece el mensaje con el botón, que no hay recarga, y que al restablecer la red "Reintentar" muestra el tema

## 4. Publicación y verificación

- [ ] 4.1 Ejecutar `npm run typecheck`, `npm test`, `npm run lint` y `npm run build`; verificar que los cuatro terminan en verde y anotar el número de pruebas
- [ ] 4.2 Pedir al usuario que aplique en el panel los ajustes de design.md decisión 7 que no coincidan con los anotados en la tarea 1.2; verificar que el usuario confirma los seis valores de la tabla
- [ ] 4.3 Cuando el usuario lo pida, hacer commit y push de `feature/despliegue-automatico`, y pedirle la dirección de la vista previa que genere Cloudflare; verificar que el usuario confirma que la compilación terminó bien y entrega la dirección. Si la compilación falla, anotar el mensaje de error y detenerse
- [ ] 4.4 Comprobar la vista previa con `curl`: que la página inicial y la dirección de un tema responden 200 con la aplicación, que un archivo de `/assets/` lleva `Cache-Control: public, max-age=31536000, immutable` y llega comprimido, y que la página principal conserva `max-age=0, must-revalidate`; verificar anotando las cabeceras obtenidas
- [ ] 4.5 Comprobar con `curl` que la dirección de producción sigue sirviendo la versión anterior tras el push de la rama (escenario "Push a otra rama" de specs/deployment); verificar comparando el nombre del script de entrada antes y después del push
- [ ] 4.6 Entregar al usuario la comprobación posterior a la integración en `main` (design.md decisión 10): qué mirar en producción y qué hacer si no cambia; verificar que el usuario la tiene por escrito en la conversación
