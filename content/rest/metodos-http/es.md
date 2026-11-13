---
title: Métodos HTTP y PUT vs. PATCH
summary: "El método indica la intención de la petición sobre el recurso: leer, crear, reemplazar, modificar, eliminar, pedir headers o consultar."
concepts:
  put-vs-patch:
    name: PUT vs. PATCH
    aliases: []
  get-vs-post:
    name: GET vs. POST
    aliases: []
exercises:
  - type: choice
    prompt: ¿Qué método o respuesta corresponde?
    items:
      - q: Quieres cambiar solo la dirección de envío de un pedido existente.
        options:
          - GET
          - POST
          - PUT
          - PATCH
        answer: 3
        why: Es una modificación parcial de un recurso existente. Con PUT tendrías que enviar el pedido completo.
      - q: El cliente hace clic en «Confirmar compra» y se crea un pedido nuevo con id generado por el servidor.
        options:
          - POST
          - PUT
          - PATCH
          - GET
        answer: 0
        why: Crear en una colección donde el servidor asigna el id es el caso clásico de POST a /v1/pedidos.
      - q: Un health check solo quiere saber si /v1/productos/42 existe y cuándo cambió, sin descargar el body.
        options:
          - GET
          - HEAD
          - OPTIONS
          - POST
        answer: 1
        why: HEAD devuelve los mismos headers que GET (Content-Length, ETag, Last-Modified) sin body.
      - q: Un formulario de administración envía todos los campos de un producto para sobrescribirlo.
        options:
          - PATCH
          - POST
          - PUT
          - DELETE
        answer: 2
        why: "Se reemplaza la representación completa en una URI conocida: PUT."
---

## definition

El método indica la intención de la petición sobre el recurso: leer (GET), crear o procesar (POST), reemplazar (PUT), modificar parcialmente (PATCH), eliminar (DELETE), pedir solo los headers (HEAD) o consultar qué se permite (OPTIONS).

## analogy

Una ficha de cliente en un archivador: **GET** es leerla, **POST** es entregar una ficha nueva para que el archivo le asigne número, **PUT** es cambiar la ficha completa por otra, **PATCH** es corregir solo el teléfono con corrector, **DELETE** es sacarla, **HEAD** es preguntar si existe y cuándo se modificó sin sacarla, y **OPTIONS** es preguntar qué te dejan hacer con ella.

## problem

Los métodos le dicen a toda la infraestructura qué puede hacer con la petición: los cachés solo guardan GET, los clientes reintentan automáticamente los idempotentes, y los navegadores hacen preflight según el método. Usar POST para todo te hace perder caché, reintentos seguros y claridad.

## code:wire

```http
# Estado actual de /v1/clientes/7
{"id":7,"nombre":"Ana Ruiz","email":"ana@mail.co","telefono":"3001112233"}

PUT /v1/clientes/7 HTTP/1.1
Content-Type: application/json

{"nombre":"Ana Ruiz","email":"ana@nuevo.co"}
# → el teléfono se pierde: PUT reemplaza la representación completa

PATCH /v1/clientes/7 HTTP/1.1
Content-Type: application/merge-patch+json

{"email":"ana@nuevo.co"}
# → solo cambia el email; el teléfono queda igual
```

## code:server

```python
class ClienteIn(BaseModel):            # PUT: todos los campos obligatorios
    nombre: str
    email: str
    telefono: str

class ClientePatch(BaseModel):         # PATCH: todos opcionales
    nombre: str | None = None
    email: str | None = None
    telefono: str | None = None

@app.put("/v1/clientes/{id}")
def reemplazar(id: int, data: ClienteIn): ...

@app.patch("/v1/clientes/{id}")
def actualizar(id: int, data: ClientePatch):
    cambios = data.model_dump(exclude_unset=True)   # solo lo que llegó
    ...
```

## bad

```http
POST /v1/clientes/7/eliminar
GET  /v1/clientes/7/borrar        ← un crawler o un prefetch lo ejecuta
POST /v1/actualizarCliente
```

## good

```http
DELETE /v1/clientes/7
PATCH  /v1/clientes/7
PUT    /v1/clientes/7
```

## bridge:typescript

La petición `OPTIONS` que ves en Network antes de tu `PUT` no la hiciste tú: es el preflight de CORS que lanza el navegador (ver [[cors]]). Y cuando usas `fetch` con `method: "PUT"` para editar un formulario a medias, estás borrando en el servidor los campos que no enviaste, si el backend implementa PUT correctamente.

## interview

GET obtiene un recurso sin modificarlo; POST crea un recurso en una colección o dispara un procesamiento; PUT reemplaza por completo la representación del recurso en esa URI, así que los campos que no envíes se pierden; PATCH aplica una modificación parcial; DELETE elimina; HEAD es como GET pero sin body, útil para revisar headers o existencia; y OPTIONS describe qué métodos admite el recurso, y es el que usa el navegador en el preflight de CORS. La diferencia clave entre PUT y PATCH es reemplazo total frente a cambio parcial, y que PUT es idempotente por definición mientras que PATCH no necesariamente.

## myths

- Usar PUT y PATCH como sinónimos. PUT reemplaza el recurso completo; PATCH aplica cambios parciales.
- Creer que PUT solo actualiza. Con PUT el cliente también puede crear un recurso en una URI que él elige (`PUT /archivos/foto.png`).
- Pensar que DELETE debe devolver el recurso borrado. Lo común es 204 sin body.
