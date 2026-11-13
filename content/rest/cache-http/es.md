---
title: "Caché HTTP: Cache-Control, ETag y 304"
summary: El servidor indica con Cache-Control si una respuesta se puede guardar, quién la puede guardar y por cuánto tiempo.
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

El servidor indica con `Cache-Control` si una respuesta se puede guardar, quién la puede guardar y por cuánto tiempo. Cuando expira, el cliente revalida con `If-None-Match` enviando el `ETag`; si no cambió, el servidor responde `304 Not Modified` sin body.

## analogy

El menú del día escrito en un tablero. Si dice «válido hasta las 3 p. m.» (**max-age**), no preguntas de nuevo. Después de las 3 preguntas: «¿Sigue el menú versión 7?» (**If-None-Match**). Si te dicen «sí, el mismo» (**304**), no te vuelven a leer todo el menú.

## problem

Evita trabajo y tráfico: sin caché, cada usuario descarga el mismo catálogo una y otra vez. Mal usado es peligroso: marcar como `public` una respuesta con datos del usuario puede hacer que un CDN le sirva a Pedro los pedidos de Ana. Para datos privados se usa `private` o `no-store`.

## code:wire

```http
GET /v1/productos/42 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: public, max-age=60
ETag: "a1b2c3"
{"id":42,"precio":38000}

# 2 minutos después (expiró), el navegador revalida:
GET /v1/productos/42 HTTP/1.1
If-None-Match: "a1b2c3"

HTTP/1.1 304 Not Modified
ETag: "a1b2c3"
# sin body: el cliente usa su copia
```

## code:server

```python
import hashlib, json
from fastapi import Request, Response

@app.get("/v1/productos/{id}")
def obtener(id: int, request: Request, response: Response):
    p = repo.buscar(id)
    etag = '"' + hashlib.md5(json.dumps(p).encode()).hexdigest() + '"'
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag})
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=60"
    return p
```

## bad

```http
GET /v1/clientes/me
Cache-Control: public, max-age=3600   ← el CDN la comparte entre usuarios
```

## good

```http
GET /v1/clientes/me
Cache-Control: private, no-cache        ← solo el navegador, y revalidando
```

## bridge:typescript

En la pestaña Network, la columna **Size** muestra `(disk cache)` o `(memory cache)` cuando la respuesta no tocó la red, y el código **304** cuando hubo revalidación. La casilla **Disable cache** existe precisamente porque estos headers a veces te muestran datos «viejos» durante el desarrollo.

## interview

El caché HTTP se controla con Cache-Control: max-age define cuánto tiempo la respuesta es fresca, public o private define si la pueden guardar intermediarios como un CDN o solo el navegador, no-cache obliga a revalidar y no-store prohíbe guardar. Para revalidar, el servidor envía un ETag, que es una huella de la versión del recurso; el cliente lo devuelve en If-None-Match y, si no cambió, recibe un 304 sin body, lo que ahorra ancho de banda. El caché ocurre en el navegador, en proxies y en CDN, y los datos privados nunca deben marcarse como public.

## myths

- `no-cache` no significa «no guardar»: significa «guarda, pero revalida antes de usar». El que prohíbe guardar es `no-store`.
- Pensar que solo cachea el navegador. También lo hacen CDN, proxies inversos y gateways.
- Creer que POST se cachea. En la práctica, solo GET y HEAD.
