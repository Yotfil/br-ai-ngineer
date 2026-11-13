---
title: Anatomy of a request and a response
summary: An HTTP message has a start line, headers, a blank line and an optional body.
concepts:
  linea-inicial:
    name: start line
    aliases:
      - línea inicial
  body:
    name: body
    aliases:
      - cuerpo (body)
---

## definition

An HTTP message has three parts: a start line (in the request: method, path and version; in the response: version, status code and status text), a block of `Name: value` headers, a blank line and an optional body.

## analogy

A courier parcel: the **label** says who it goes to and what kind of shipment it is (start line), the **sticky notes** add instructions like "fragile" or "contains liquids" (headers), and the **box** carries the contents (body).

## problem

If you do not respect the structure (for example, you send JSON without `Content-Type: application/json`), the server does not know how to interpret the body and responds 415 or 422. Headers are the standard way to send metadata; putting them in the body or the URL breaks intermediate tools such as caches and proxies.

## code:wire

```http
POST /v1/pedidos HTTP/1.1
Host: api.tienda.co
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Length: 46

{"cliente_id":7,"items":[{"producto_id":42,"cantidad":2}]}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/pedidos/1093

{"id":1093,"estado":"pendiente","total":76000}
```

## code:server

```python
from fastapi import FastAPI, Header, Request
from pydantic import BaseModel

class Item(BaseModel):
    producto_id: int
    cantidad: int

class PedidoIn(BaseModel):        # el body ya validado
    cliente_id: int
    items: list[Item]

@app.post("/v1/pedidos", status_code=201)
def crear_pedido(pedido: PedidoIn, request: Request,
                 user_agent: str | None = Header(default=None)):
    # request.method, request.url.path, request.headers, user_agent...
    return {"id": 1093, "estado": "pendiente", "total": 76000}
```

## bridge:typescript

When you write `fetch(url, { method: "POST", headers, body: JSON.stringify(data) })`, you build exactly this structure: the method and the URL go in the start line, the parameters you add to the URL with `URLSearchParams` go in the query string, `headers` go in the header block, and the body travels as the JSON text you serialized. Your own function that wraps `fetch` only adds one more line to the header block.

## interview

An HTTP request has a start line with the method, the path with its query string and the protocol version; then come the headers, which are key-value metadata such as Content-Type, Accept or Authorization; then a blank line and the optional body. The response has the same structure, except the start line carries the version, the status code and its text. That way the server knows what is being asked, in what format and with which credentials, and the client knows whether it went well and how to read what it receives.

## myths

- Believing GET cannot have headers or that only POST has a body. GET always has headers; what it should not carry is a body with meaning.
- Thinking header names are case-sensitive. `content-type` and `Content-Type` are the same header (in HTTP/2 they travel in lowercase).
- Forgetting the blank line: it is what separates the headers from the body.
