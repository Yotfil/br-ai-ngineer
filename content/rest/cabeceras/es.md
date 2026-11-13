---
title: Cabeceras esenciales y negociación de contenido
summary: Los headers son metadatos del mensaje.
concepts:
  content-type:
    name: Content-Type
    aliases: []
  negociacion-de-contenido:
    name: negociación de contenido
    aliases:
      - content negotiation
---

## definition

Los headers son metadatos del mensaje. Unos describen el body (`Content-Type`), otros dicen qué espera el cliente (`Accept`), quién es (`Authorization`, `User-Agent`), cómo cachear (`Cache-Control`, `ETag`) o dónde quedó algo (`Location`).

## analogy

Las instrucciones en el sobre de un pedido a domicilio: «contiene sopa» (**Content-Type**), «prefiero en español o inglés» (**Accept-Language**), «muestro mi carné de cliente» (**Authorization**), «consumir antes de 1 hora» (**Cache-Control**).

## problem

La **negociación de contenido** permite que el mismo recurso se sirva en varios formatos o idiomas según lo que pida el cliente, sin inventar rutas como `/productos.xml`. `Vary` avisa a las cachés que la respuesta depende de ciertos headers, para que no le sirvan a un usuario en inglés la versión en español.

## code:wire

```http
GET /v1/productos/42 HTTP/1.1
Accept: application/json;q=1.0, application/xml;q=0.5
Accept-Language: es-CO, es;q=0.9
Authorization: Bearer eyJ...
User-Agent: Mozilla/5.0 (Macintosh...)

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Language: es-CO
Cache-Control: private, max-age=60
ETag: "v7-42"
Vary: Accept, Accept-Language

{"id":42,"nombre":"Café de origen Tolima"}
```

## code:server

```python
from fastapi import Response, Header

@app.post("/v1/productos", status_code=201)
def crear(data: ProductoIn, response: Response):
    p = repo.crear(data)
    response.headers["Location"] = f"/v1/productos/{p.id}"
    return p

@app.get("/v1/productos/{id}")
def obtener(id: int, accept: str = Header(default="application/json")):
    if "application/json" not in accept and "*/*" not in accept:
        raise HTTPException(406, "Solo servimos JSON")
    ...
```

## bridge:typescript

Cuando en DevTools miras **Response Headers**, la mayoría la pone el backend o el proxy. `Content-Type` de la petición lo pones tú: con `fetch`, si envías JSON debes declarar `application/json`; si envías `FormData`, el navegador lo arma con su `boundary`, y si lo fijas a mano rompes la subida de archivos.

## interview

Content-Type describe el formato del body que se envía; Accept es lo que el cliente quiere recibir, y si el servidor no puede cumplir responde 406. Authorization lleva las credenciales, normalmente un Bearer token. Cache-Control y ETag controlan el caché y la validación condicional. Location indica la URL del recurso creado en un 201 o el destino de una redirección. User-Agent identifica al cliente, pero no es confiable para seguridad. La negociación de contenido es el mecanismo por el cual el servidor elige la representación según Accept, Accept-Language o Accept-Encoding, y debe responder con Vary para que las cachés lo respeten.

## myths

- Confundir Content-Type y Accept: el primero describe lo que **envío**; el segundo lo que **quiero recibir**.
- Confiar en User-Agent para seguridad: el cliente lo puede falsificar.
- Olvidar Location en el 201: el cliente tiene que adivinar dónde quedó el recurso.
