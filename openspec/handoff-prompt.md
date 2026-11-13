# Prompt de arranque — puesta en marcha del flujo de Git

> Escrito por Fable 5.2 el 2026-11-13, tras definir con el usuario la estrategia de ramas. Pega el bloque de abajo como primer mensaje de una sesión nueva con **Opus 5.5**, abierta en `/Users/yotfil/Documents/Yotfil/TechForge/Learning/ai_engineer/ai-engineer-path`.

---

Vas a poner en marcha el flujo de Git del proyecto. No hay ningún cambio de OpenSpec en curso: esto es mantenimiento del repositorio. Respóndeme en español.

**Reglas insaltables de este proyecto** (también están en la memoria del proyecto):

1. Implementas tú, Opus 5.5. Las decisiones las toma Fable 5.2 conmigo en otra sesión.
2. Si encuentras un vacío, una ambigüedad o una contradicción, **no decidas**. Detente, dime exactamente qué falta y espera.
3. Si te digo que se retoma en otro contexto, actualiza la memoria del proyecto y sobrescribe este archivo con un prompt de arranque nuevo; dime la ruta. Nunca lo pongas en un `CLAUDE.md`.

**Lee primero** `openspec/git-workflow.md` completo. Es vinculante. No lo modifiques.

**Estado de partida** (compruébalo con `git status` y `git branch -a` antes de empezar):

- Solo existe `main`, con dos commits (`7a4cb0d`, `664e2b7`), sincronizada con `origin` (`https://github.com/Yotfil/br-ai-ngineer.git`).
- Hay tres cambios sin commit en el árbol de trabajo, hechos por Fable: `openspec/git-workflow.md` (nuevo), `openspec/config.yaml` (bloque `context`) y este archivo.
- `src/generated/` está versionado (3 archivos) y no figura en `.gitignore`.
- La CLI `gh` no está instalada.

**Qué hacer**, con mi autorización expresa para estos comandos de Git, siguiendo la sección "Puesta en marcha" del documento:

1. Crea `develop` desde `main` y súbela (`git push -u origin develop`). Los cambios sin commit no deben quedar en `develop`.
2. Crea `chore/flujo-git` desde `develop`. Añade `src/generated` a `.gitignore` y retíralo del índice con `git rm -r --cached src/generated` (los archivos se quedan en disco). Haz un commit `chore: flujo de Git y salida generada fuera del repositorio` con eso y los tres archivos de Fable. Sube la rama.
3. Comprueba que `npm run typecheck`, `npm test` y `npm run build` siguen en verde.
4. Dame la URL para abrir el pull request de `chore/flujo-git` a `develop`. Yo lo abro y hago el merge con squash en GitHub. Después abro el de `develop` a `main` con merge commit.
5. Cuando te confirme que ambos están integrados: actualiza `main` y `develop` en local, crea los tags anotados `v0.1.0` sobre `7a4cb0d` y `v0.2.0` sobre `664e2b7`, y súbelos.
6. Recuérdame la lista de la sección "Configuración en GitHub" del documento; la aplico yo a mano en la web.

**Límites:**

- No hagas push a `main`. A `develop` solo el push inicial del paso 1.
- No hagas merges locales entre ramas: los merges son los de los pull requests.
- No toques código de la app, `content/`, `legacy/` ni las specs de `openspec/specs/`.
- No instales `gh` ni ninguna otra herramienta.

**Al terminar o al detenerte**, dame un resumen con: ramas y tags creados, resultado de typecheck, test y build, y lo que quede pendiente de mi parte en GitHub.

**Qué sigue después:** la definición de la pista SQL, con Fable 5.2, en la rama `feature/pista-sql` creada desde `develop`. Esa rama la creo yo o te la pido a ti antes de abrir la sesión de Fable.
