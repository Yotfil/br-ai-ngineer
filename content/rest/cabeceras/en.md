---
title: Essential headers and content negotiation
summary: Headers are the metadata of the message.
concepts:
  content-type:
    name: Content-Type
    aliases: []
  negociacion-de-contenido:
    name: content negotiation
    aliases:
      - negociación de contenido
---

## definition

Headers are the metadata of the message. Some describe the body (`Content-Type`), others say what the client expects (`Accept`), who it is (`Authorization`, `User-Agent`), how to cache (`Cache-Control`, `ETag`) or where something ended up (`Location`).

## analogy

The instructions on the bag of a home delivery: "contains soup" (**Content-Type**), "I prefer Spanish or English" (**Accept-Language**), "here is my customer card" (**Authorization**), "eat within 1 hour" (**Cache-Control**).

## problem

**Content negotiation** lets the same resource be served in several formats or languages depending on what the client asks for, without inventing routes like `/productos.xml`. `Vary` tells caches that the response depends on certain headers, so they do not serve the Spanish version to a user who asked for English.

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

When you look at **Response Headers** in DevTools, most of them are set by the backend or the proxy. The request's `Content-Type` is set by you: with `fetch`, if you send JSON you must declare `application/json`; if you send `FormData`, the browser builds it with its `boundary`, and if you set it by hand you break file uploads.

## interview

Content-Type describes the format of the body being sent; Accept is what the client wants to receive, and if the server cannot comply it responds 406. Authorization carries the credentials, usually a Bearer token. Cache-Control and ETag control caching and conditional validation. Location indicates the URL of the resource created in a 201 or the target of a redirect. User-Agent identifies the client, but it is not reliable for security. Content negotiation is the mechanism by which the server chooses the representation according to Accept, Accept-Language or Accept-Encoding, and it must respond with Vary so caches respect it.

## myths

- Mixing up Content-Type and Accept: the first describes what I **send**; the second what I **want to receive**.
- Trusting User-Agent for security: the client can fake it.
- Forgetting Location in a 201: the client has to guess where the resource ended up.
