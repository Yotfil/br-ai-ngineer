# Contenido de la aplicación

Todo lo que se estudia en la app vive en esta carpeta. Al compilar (`npm run content`, que también se ejecuta solo antes de `npm run dev` y `npm run build`), el contenido se valida y se genera en `src/generated/` el grafo del cerebro, el índice del buscador y un archivo por tema e idioma. **Añadir un tema no exige tocar código**: aparece solo en el cerebro, en el buscador y en el sidebar.

## Estructura

```
content/
  tracks.yaml                 # las pistas
  <pista>/
    <tema>/
      meta.yaml               # lo que NO se traduce
      es.md                   # español
      en.md                   # inglés
```

- La carpeta de la pista se llama igual que su `id` en `tracks.yaml`.
- La carpeta del tema se llama igual que su `id` en `meta.yaml`.
- Los identificadores (pistas, temas y conceptos) usan minúsculas, dígitos y guiones (`idempotencia-en-la-practica`), son estables y no dependen del idioma. Un mismo id no puede repetirse entre pistas, temas y conceptos.

## `tracks.yaml`

```yaml
- id: rest
  abbr: RE              # dos letras mayúsculas: es el icono de la pista
  color: "#22d3ee"
  order: 1
  name: { es: HTTP y REST, en: HTTP & REST }
```

Una pista declarada sin temas se muestra como "Próximamente".

### Grupos de temas (opcional)

Una pista puede repartir sus temas en grupos con nombre. En el sidebar expandido y en la hoja de temas del teléfono, cada grupo aparece como un subtítulo encima de sus temas. Los grupos no son nodos del cerebro, no aparecen en el buscador, no tienen dirección propia y no cambian los botones anterior y siguiente, que recorren la pista por `order`.

```yaml
- id: python
  abbr: PY
  color: "#4ade80"
  order: 2
  name: { es: Python y FastAPI, en: Python & FastAPI }
  groups:                     # en el orden en que se muestran
    - { id: lenguaje, name: { es: Python, en: Python } }
    - { id: fastapi, name: { es: FastAPI, en: FastAPI } }
```

Reglas (la compilación falla y nombra el tema o el grupo):

- Si la pista declara `groups`, cada tema indica el suyo con `group` en `meta.yaml`; si no los declara, ningún tema puede indicar `group`.
- `group` debe ser uno de los ids de `groups` de su pista.
- Los temas de un mismo grupo son consecutivos según `order`.
- Los grupos aparecen, según `order`, en el mismo orden en que la pista los declara.

## `meta.yaml`

```yaml
id: idempotencia-en-la-practica
track: rest
order: 17                   # posición dentro de la pista
freq: often                 # always | often | sometimes
concepts:                   # conceptos cuyo hogar es este tema
  - clave-de-idempotencia
  - reintentos
related:                    # ids de otros temas o conceptos (opcional)
  - idempotencia
  - rate-limiting
demo: token-bucket          # opcional: solo ids con componente en src/demos/registry.ts
group: fastapi              # solo en pistas con grupos, y entonces obligatorio
```

**Concepto único:** cada concepto tiene un solo tema hogar (aparece en `concepts` de un solo tema). Si otro tema lo necesita, lo enlaza en `related` o con `[[id]]` en el texto; no lo vuelve a declarar.

## `es.md` y `en.md`

Frontmatter en YAML y, debajo, el cuerpo en Markdown dividido en secciones con encabezados de nivel 2 cuyas **claves van en inglés y no se traducen**:

```markdown
---
title: Idempotencia en la práctica: claves y pagos duplicados
short: Idempotencia en la práctica   # opcional: 32 caracteres como máximo, sin HTML
summary: Una sola oración, sin HTML, de 140 caracteres como máximo.
concepts:
  clave-de-idempotencia:
    name: clave de idempotencia
    aliases: [idempotency key, Idempotency-Key]   # incluye el nombre en el otro idioma
  reintentos:
    name: reintentos
    aliases: [retries]
exercises:                  # opcional; puede faltar o ir vacío
  - type: choice
    prompt: ¿Qué método o respuesta corresponde?
    items:
      - q: Enunciado del ejercicio
        options: [GET, POST, PUT, PATCH]
        answer: 3           # índice de la opción correcta, desde 0
        why: Explicación que se muestra al responder.
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: |             # opcional: código sin valla, se muestra resaltado en Python
          print(type(1 + 1.0))
        options: [int, float, str, error]
        answer: 1
        why: El int se promueve a float.
  - type: classify
    prompt: ¿Qué método HTTP corresponde?
    categories: [GET, POST, PUT, PATCH, DELETE]   # 2 o más, distintas
    items:
      - text: Cambiar solo el teléfono de un cliente
        category: PATCH     # debe ser una de categories
        why: Modificación parcial.
  - type: verdict
    prompt: Revisa este diseño: ¿cada endpoint está bien o tiene un error?
    items:
      - statement: POST /v1/crearPedido
        ok: false
        why: Verbo en la URL. Debería ser POST /v1/pedidos.
---

## definition

Texto en Markdown. Se puede enlazar otro tema o concepto con [[rate-limiting]].

## analogy

## problem
...
```

El título corto (`short`) es opcional. Si un idioma lo tiene, el otro también. Se usa en las filas del sidebar, en la hoja de temas del teléfono y como nombre del tema en el cerebro; el lector, el buscador, los relacionados, los enlaces y los botones anterior y siguiente muestran siempre `title`. El buscador no indexa `short`.

### Ejercicios

Tres tipos de grupo, cada uno con su `prompt` (enunciado del grupo). En los tres, la app marca si la respuesta es correcta y muestra `why`, sin guardar nada.

- `choice`: opción múltiple. Cada ítem tiene `q`, `options`, `answer` (índice desde 0) y `why`, y puede llevar `code`, un bloque que se muestra resaltado en Python entre el enunciado y las opciones.
- `verdict`: el usuario juzga si `statement` está bien (`ok: true`) o tiene un error (`ok: false`).
- `classify`: el usuario asigna cada caso a una categoría. El grupo tiene `categories` (2 o más, distintas) e `items`, cada uno con `text`, `category` (una de `categories`) y `why`. Cada caso se muestra con un botón por categoría y se responde por separado.

### Claves de sección

| Clave | Obligatoria | Pestaña | Contenido |
|---|---|---|---|
| `definition` | sí | Entender | definición (sin rótulo, párrafo inicial) |
| `analogy` | sí | Entender | analogía |
| `problem` | sí | Entender | qué problema resuelve |
| `code:example` | no | En código | ejemplo principal: uno o más bloques de código consecutivos, sin texto entre ellos |
| `code:wire` | no | En código | la petición tal como viaja por la red |
| `code:server` | no | En código | el ejemplo del lado del servidor (FastAPI) |
| `bad` y `good` | no, pero van juntas | En código | ejemplo riesgoso y ejemplo correcto; cada uno puede llevar, debajo del código, un párrafo con una nota que lo explica |
| `bridge:typescript` | no | En código | puente con el frontend (TypeScript) |
| `interview` | sí | En la entrevista | respuesta modelo para decir en voz alta |
| `myths` | sí | En la entrevista | malentendidos comunes, como lista |

- El orden de las secciones dentro de cada pestaña es el de la tabla.
- Los bloques de código van entre vallas de tres comillas invertidas. Lenguaje de resaltado:
  - Si la valla declara un lenguaje (` ```python `), ese lenguaje manda, en cualquier sección. Admitidos: `python` (`py`), `http`, `json`, `bash` (`sh`), `typescript` (`ts`) y `text` (`txt`), que se muestra con la tipografía y el fondo de código pero sin colores. Cualquier otro lenguaje en la valla es un error de compilación que nombra el archivo y el lenguaje.
  - Si no lo declara: en `code:server`, Python; en `code:wire`, `bad` y `good`, Python si el bloque contiene `def `, `@app.` o `import `, y HTTP en otro caso; en el resto, HTTP.
  - En `code:example` cada valla debe declarar su lenguaje; si no, la compilación falla.
- La nota de `bad` o `good` es Markdown normal tras el bloque de código:

  ````markdown
  ## bad

  ```python
  def agregar(item, carrito=[]): ...
  ```

  La lista por defecto se crea una sola vez y se comparte entre llamadas.
  ````
- Los rótulos visibles ("Analogía", "Así viaja por la red"…) salen de `src/locales/*.json`, no del contenido.
- La pestaña Practicar solo aparece si el tema tiene ejercicios o una demo.

### Paridad entre idiomas

`es.md` y `en.md` deben tener las mismas secciones, los mismos conceptos y los mismos ejercicios (mismo número de grupos e ítems, y las mismas respuestas; en `classify`, el mismo número de categorías y, en cada caso, la categoría correcta en la misma posición). Si un idioma tiene `short`, el otro también. El código de los ejemplos es idéntico en ambos idiomas.

## Pasos para añadir un tema

1. Crea la carpeta `content/<pista>/<id-del-tema>/`.
2. Escribe `meta.yaml` con `id`, `track`, `order`, `freq`, `group` si la pista tiene grupos y, si los tiene, `concepts`, `related` y `demo`.
3. Escribe `es.md` y `en.md` con el frontmatter (`title`, `summary`, `short` si quieres un título corto, el nombre y los alias de cada concepto de `meta.yaml`, y `exercises` si hay) y al menos las cinco secciones obligatorias.
4. Ejecuta `npm run content`. Si algo no cuadra, la compilación falla con un mensaje que nombra el archivo o el tema y el identificador. Con `npm run dev` en marcha no hace falta ejecutarlo: se relanza solo al guardar.
5. Abre la app: el tema aparece como nodo en el cerebro, como resultado en el buscador y como ítem bajo su pista en el sidebar.

## Pasos para añadir una pista

1. Añade la pista a `tracks.yaml` con `id`, `abbr`, `color`, `order` y `name` en ambos idiomas y, si sus temas se reparten en grupos, `groups`.
2. Ejecuta `npm run content`: la pista aparece como "Próximamente" en el sidebar, la barra inferior del teléfono y el cerebro.
3. Crea la carpeta `content/<id-de-la-pista>/` y añade sus temas con los pasos anteriores. En cuanto tenga un tema deja de ser "Próximamente".
