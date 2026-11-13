# Flujo de Git del proyecto

> Decidido con el usuario el 2026-11-13. Es vinculante para todas las sesiones (Fable 5.2 y Opus 5.5). Si un caso no está cubierto aquí, no se improvisa: se le pregunta al usuario.

## Modelo: GitFlow adaptado

| Rama | Para qué | Nace de | Se integra en |
|---|---|---|---|
| `main` | Último cambio de OpenSpec completo y archivado. Siempre en verde. | — | — |
| `develop` | Integración. Base de todo trabajo nuevo. | `main` | `main` |
| `feature/<nombre-del-cambio>` | Un cambio de OpenSpec completo: specs, implementación y archivado. | `develop` | `develop` |
| `chore/<descripción>` | Mantenimiento que no es un cambio de OpenSpec (configuración del repositorio, `.gitignore`, este documento). | `develop` | `develop` |

- El nombre de la rama es el nombre del cambio de OpenSpec: el cambio `pista-sql` vive en `feature/pista-sql`.
- Nadie hace commits directos en `main` ni en `develop`. Todo entra por pull request.
- Las ramas `release/*` y `hotfix/*` no se usan todavía. Se definen en el cambio de despliegue (punto 10 del plan), que es cuando hay una producción que proteger.

## Ciclo de un cambio

1. **Crear la rama.** Desde `develop` actualizado: `feature/<nombre-del-cambio>`.
2. **Specs (Fable 5.2).** Los artefactos de `openspec/changes/<nombre>/` se escriben en esa rama. Commits con tipo `docs`.
3. **Implementación (Opus 5.5).** En la misma rama. Si Opus se detiene por un vacío, Fable lo resuelve en esa misma rama.
4. **Archivado.** `openspec archive` en la misma rama, con typecheck, test y build en verde.
5. **PR a `develop`, con squash.** Un solo commit por cambio en `develop`, con el formato de los ya existentes: `feat: pista SQL (14 temas, ES/EN)`. La rama `feature/*` se borra después del merge.
6. **PR de `develop` a `main`, con merge commit** (no squash). Se hace tras cada cambio archivado.
7. **Tag en `main`.** Versión `v0.N.0`, donde N es el número del cambio en el plan.

El paso 6 usa merge commit y no squash por una razón técnica: un squash de `develop` a `main` crea en `main` un commit que `develop` no tiene, y las dos ramas divergen en cada ciclo. El squash se aplica solo de `feature/*` a `develop`.

## Versiones

| Tag | Cambio | Commit |
|---|---|---|
| `v0.1.0` | `esqueleto-y-pista-rest` | `7a4cb0d` |
| `v0.2.0` | `pista-python` | `664e2b7` |
| `v0.2.1` | `rendimiento-movil` | — |
| `v0.2.2` | `despliegue-automatico` | — |
| `v0.3.0` | pista SQL | — |

Los dos primeros tags son retroactivos y aún no existen. La versión `v1.0.0` se reserva para el despliegue.

Un cambio que corrige lo ya publicado y no figura en el plan numerado no consume número: lleva la versión del último cambio del plan con el tercer dígito incrementado (decidido con el usuario el 2026-11-13 para `rendimiento-movil`).

## Commits

- Conventional Commits con descripción en español: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- `src/generated/` y `dist/` son salida de compilación y no se versionan. Hoy `src/generated/` sí está versionado (3 archivos) y no figura en `.gitignore`; se corrige en la puesta en marcha.

## Puesta en marcha (una sola vez)

1. Crear `develop` desde `main` y subirla.
2. Crear `chore/flujo-git` desde `develop` con: este documento, el cambio de `openspec/config.yaml`, `openspec/handoff-prompt.md`, `src/generated/` añadido a `.gitignore` y retirado del índice (`git rm -r --cached src/generated`).
3. PR a `develop` con squash; después PR de `develop` a `main` con merge commit.
4. Crear y subir los tags `v0.1.0` y `v0.2.0` sobre los commits de la tabla de versiones.
5. Aplicar la configuración de GitHub de la última sección.

## Qué hace cada sesión

- **Antes de la primera escritura**, la sesión comprueba la rama actual (`git branch --show-current`). Si no es la `feature/*` del cambio en curso, se detiene y avisa al usuario. No se escribe en `main` ni en `develop`.
- **Fable 5.2** no ejecuta comandos de Git que modifiquen el repositorio (ramas, commits, merges, push). Solo lee el estado.
- **Opus 5.5** crea ramas, hace commits y abre pull requests solo cuando el usuario se lo pide en esa sesión. Nunca hace push a `main` ni a `develop`.
- Los merges de los pull requests los hace el usuario en GitHub.

## Configuración en GitHub (una sola vez)

Repositorio: `Yotfil/br-ai-ngineer`.

- Rama por defecto: `develop`, para que los pull requests apunten ahí.
- Protección de `main` y `develop`: exigir pull request, impedir push directo y borrado.
- Métodos de merge permitidos: squash y merge commit. Borrado automático de la rama tras el merge.
