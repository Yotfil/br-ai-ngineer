---
title: "Caché HTTP: Cache-Control, ETag y 304"
summary: El caché HTTP deja que el navegador guarde una respuesta y la reutilice; el servidor lo controla con Cache-Control y ETag.
concepts:
  "304":
    name: 304 Not Modified
    aliases: []
  cache-control:
    name: Cache-Control
    aliases: []
  etag:
    name: ETag
    aliases: []
---

## definition

El caché HTTP permite que el navegador **guarde una respuesta y la reutilice**, en lugar de pedirla otra vez al servidor.

El servidor lo controla con dos cabeceras de la respuesta. `Cache-Control` dice si se puede guardar, quién puede guardarla y durante cuánto tiempo. `ETag` es un identificador de la versión del contenido: si el contenido cambia, el `ETag` cambia.

## analogy

El menú del día de un restaurante, escrito en un tablero que dice "válido hasta las 3 p. m." (`max-age`). Antes de las 3 no le preguntas nada al mesero: ya lo leíste. Después de las 3 preguntas "¿sigue siendo el menú número 7?" (`If-None-Match` con el `ETag`). Si te responde "sí, el mismo" (`304`), no te lo vuelve a leer entero.

## problem

Sin caché, cada visita descarga otra vez el mismo catálogo, aunque no haya cambiado: más espera para el usuario y más trabajo para el servidor.

Mal usado es peligroso. Si marcas como `public` una respuesta con datos personales, un servidor intermedio puede guardarla y entregarle a Luis los datos de Ana.

## code:wire

### Momento 1. Primera petición: el servidor responde y da permiso para guardar

```http
GET /v1/productos/42 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: public, max-age=60    # cualquiera puede guardarla, durante 60 segundos
ETag: "a1b2c3"                       # identificador de esta versión del producto

{"id":42,"nombre":"café","precio":38000}
```

### Momento 2. A los 30 segundos: no hay petición

El navegador necesita el producto otra vez. Aún no pasaron los 60 segundos, así que usa su copia y **no envía nada al servidor**.

### Momento 3. A los 2 minutos: la copia caducó y el navegador pregunta si sigue valiendo

```http
GET /v1/productos/42 HTTP/1.1
If-None-Match: "a1b2c3"              # "tengo la versión a1b2c3, ¿sigue siendo la actual?"

HTTP/1.1 304 Not Modified            # "sí, no cambió"
Cache-Control: public, max-age=60    # el 304 repite las cabeceras de caché del 200
ETag: "a1b2c3"
                                     # sin cuerpo: el navegador reutiliza su copia
```

Con las cabeceras del 304, el navegador renueva su copia: vuelve a valer 60 segundos. Si el producto hubiera cambiado, el servidor respondería `200 OK` con el producto nuevo y un `ETag` distinto, como en el momento 1.

## code:server

En la tienda, este es el endpoint `GET /v1/productos/{id}`. `router` es el `APIRouter` del archivo y `repository`, el módulo con las consultas de productos.

```python
# app/productos/router.py
import hashlib, json
from fastapi import Request, Response

@router.get("/v1/productos/{id}")
def obtener_producto(id: int, request: Request, response: Response):
    producto = repository.buscar(id)   # se da por hecho: el producto como dict (sin el caso 404)
    # 1. El ETag es una huella del contenido: si el producto cambia, la huella cambia.
    etag = '"' + hashlib.md5(json.dumps(producto).encode()).hexdigest() + '"'   # entre comillas dobles
    cache = {"ETag": etag, "Cache-Control": "public, max-age=60"}
    # 2. ¿El navegador ya tiene esta versión? If-None-Match puede traer varias, separadas por comas.
    if etag in request.headers.get("if-none-match", ""):
        return Response(status_code=304, headers=cache)   # sin cuerpo, pero con sus cabeceras
    response.headers.update(cache)   # 3. si no la tiene, o cambió: el producto con sus cabeceras
    return producto
```

FastAPI llama a esta función cada vez que alguien pide un producto, y le pasa en `request` la petición que llegó y en `response` la respuesta que está preparando.

## bad

```http
GET /v1/clientes/me HTTP/1.1
Authorization: Bearer <token de Ana>

HTTP/1.1 200 OK
Cache-Control: public, max-age=3600     # cualquier caché puede guardarla una hora
```

`public` permite que la guarden servidores intermedios, como un CDN, que atienden a muchos usuarios. Normalmente un caché compartido no guarda la respuesta a una petición con `Authorization`; `public` le da permiso. Durante una hora, quien pida `/v1/clientes/me` a ese caché puede recibir los datos de Ana.

## good

```http
GET /v1/clientes/me HTTP/1.1
Authorization: Bearer <token de Ana>

HTTP/1.1 200 OK
Cache-Control: private, no-cache        # solo el navegador de Ana, y preguntando antes de reutilizarla
```

`private`: solo la guarda el navegador de ese usuario. `no-cache`: antes de reutilizarla, pregunta al servidor si sigue valiendo.

## bridge:typescript

Con `fetch` no escribes nada de esto: el navegador lee `Cache-Control`, guarda la copia y envía `If-None-Match` por su cuenta. Si el servidor responde que no cambió, `fetch` te entrega la copia guardada, así que tu código recibe el producto igual que la primera vez. La diferencia que más confunde: el caché lo decide el servidor con sus cabeceras; desde el frontend puedes cambiar cómo lo usa una petición con la opción `cache` de `fetch`, por ejemplo `fetch(url, { cache: "no-store" })` para ir siempre a la red.

## interview

El caché HTTP permite reutilizar una respuesta guardada en lugar de pedirla otra vez. El servidor lo controla con `Cache-Control`: `max-age` dice cuántos segundos vale la copia, `public` o `private` si la pueden guardar cachés compartidos como un CDN o solo el navegador, `no-cache` obliga a preguntar antes de reutilizarla y `no-store` prohíbe guardarla. Para preguntar, el servidor envía un `ETag`, una huella de la versión; el navegador lo devuelve en `If-None-Match` y, si no cambió, recibe un `304 Not Modified` sin cuerpo, que le ahorra descargarlo otra vez. Los datos de un usuario nunca se marcan como `public`.

## myths

- **"`no-cache` significa que no se guarda."** Sí se guarda. Significa "pregunta al servidor antes de usar la copia", como en el momento 3. La que prohíbe guardar es `no-store`.
- **"Solo el navegador guarda respuestas."** También las guardan los servidores que hay en el camino, como un CDN o un proxy, y esos atienden a muchos usuarios. Por eso `public` y `private` importan.
- **"Un 304 es un error."** Es la respuesta buena: quiere decir que tu copia sigue valiendo y que te ahorraste descargarla otra vez.
