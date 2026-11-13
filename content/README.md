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
```

**Concepto único:** cada concepto tiene un solo tema hogar (aparece en `concepts` de un solo tema). Si otro tema lo necesita, lo enlaza en `related` o con `[[id]]` en el texto; no lo vuelve a declarar.

## `es.md` y `en.md`

Frontmatter en YAML y, debajo, el cuerpo en Markdown dividido en secciones con encabezados de nivel 2 cuyas **claves van en inglés y no se traducen**:

```markdown
---
title: Idempotencia en la práctica: claves y pagos duplicados
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

### Claves de sección

| Clave | Obligatoria | Pestaña | Contenido |
|---|---|---|---|
| `definition` | sí | Entender | definición (sin rótulo, párrafo inicial) |
| `analogy` | sí | Entender | analogía |
| `problem` | sí | Entender | qué problema resuelve |
| `code:wire` | no | En código | la petición tal como viaja por la red |
| `code:server` | no | En código | el ejemplo del lado del servidor (FastAPI) |
| `bad` y `good` | no, pero van juntas | En código | ejemplo riesgoso y ejemplo correcto |
| `bridge:typescript` | no | En código | puente con el frontend (TypeScript) |
| `interview` | sí | En la entrevista | respuesta modelo para decir en voz alta |
| `myths` | sí | En la entrevista | malentendidos comunes, como lista |

- El orden de las secciones dentro de cada pestaña es el de la tabla.
- Los bloques de código van entre vallas de tres comillas invertidas. En `code:server` se resaltan como Python; en `code:wire`, `bad` y `good`, como Python si contienen `def `, `@app.` o `import `, y como HTTP en otro caso.
- Los rótulos visibles ("Analogía", "Así viaja por la red"…) salen de `src/locales/*.json`, no del contenido.
- La pestaña Practicar solo aparece si el tema tiene ejercicios o una demo.

### Paridad entre idiomas

`es.md` y `en.md` deben tener las mismas secciones, los mismos conceptos y los mismos ejercicios (mismo número de grupos e ítems, y las mismas respuestas). El código de los ejemplos es idéntico en ambos idiomas.

## Pasos para añadir un tema

1. Crea la carpeta `content/<pista>/<id-del-tema>/`.
2. Escribe `meta.yaml` con `id`, `track`, `order`, `freq` y, si los tiene, `concepts`, `related` y `demo`.
3. Escribe `es.md` y `en.md` con el frontmatter (`title`, `summary`, el nombre y los alias de cada concepto de `meta.yaml`, y `exercises` si hay) y al menos las cinco secciones obligatorias.
4. Ejecuta `npm run content`. Si algo no cuadra, la compilación falla con un mensaje que nombra el archivo o el tema y el identificador. Con `npm run dev` en marcha no hace falta ejecutarlo: se relanza solo al guardar.
5. Abre la app: el tema aparece como nodo en el cerebro, como resultado en el buscador y como ítem bajo su pista en el sidebar.

## Pasos para añadir una pista

1. Añade la pista a `tracks.yaml` con `id`, `abbr`, `color`, `order` y `name` en ambos idiomas.
2. Ejecuta `npm run content`: la pista aparece como "Próximamente" en el sidebar, la barra inferior del teléfono y el cerebro.
3. Crea la carpeta `content/<id-de-la-pista>/` y añade sus temas con los pasos anteriores. En cuanto tenga un tema deja de ser "Próximamente".
