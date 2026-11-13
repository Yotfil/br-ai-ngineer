---
title: Designing a REST API
summary: Designing a REST API is modeling the domain as plural resources, with predictable routes, filters, pagination and versioning.
concepts:
  paginacion:
    name: pagination
    aliases:
      - paginación
  paginacion-por-cursor:
    name: cursor pagination
    aliases:
      - paginación por cursor
      - cursor
      - offset
  versionado-de-api:
    name: API versioning
    aliases:
      - versionado de API
exercises:
  - type: verdict
    prompt: "Review this design: is each endpoint correct or does it have an error?"
    items:
      - statement: GET /v1/clientes/7
        ok: true
        why: "Correct: plural resource and an id."
      - statement: POST /v1/crearPedido
        ok: false
        why: Verb in the URL. It should be POST /v1/pedidos.
      - statement: GET /v1/productos?categoria=cafe
        ok: true
        why: "Correct: filter in the query string."
      - statement: GET /v1/pedidos/1093/eliminar
        ok: false
        why: GET with a side effect and a verb in the path. It should be DELETE /v1/pedidos/1093.
      - statement: PATCH /v1/clientes/7
        ok: true
        why: "Correct: partial modification."
      - statement: GET /v1/cliente/7/pedido
        ok: false
        why: Mixes singulars and does not say which order. It should be /v1/clientes/7/pedidos.
      - statement: POST /v1/pedidos/1093/pagos
        ok: true
        why: "Correct: creates a payment as a sub-resource of the order."
      - statement: GET /v1/pedidos?page=999999
        ok: false
        why: Technically valid, but with offset at that depth the query is expensive. On large tables, cursor.
---

## definition

Designing a REST API is modeling the domain as **resources** (plural nouns), with predictable routes, relationships expressed with moderate nesting, filters and ordering in the query string, pagination for collections and a versioning strategy from day one.

## analogy

An airport signage system: consistent names ("Gates A1–A20"), a clear hierarchy ("Terminal 2 → Gate B5"), no signs saying "Walk-to-the-plane-now". If each terminal used different conventions, nobody would make their flight.

## problem

A badly designed API is hard to learn, to document and to evolve without breaking clients. **Offset pagination** (`?page=3`) is simple and lets you jump to a page, but it gets slow with large tables and repeats or skips items when data is inserted. **Cursor pagination** is stable and fast, but it does not let you jump to page 50. **Versioning** in the URL (`/v1`) is the most common and visible; by header it is more "pure" but less practical.

## code:wire

```http
GET    /v1/clientes                         listar
POST   /v1/clientes                         crear
GET    /v1/clientes/7                       obtener uno
GET    /v1/clientes/7/pedidos               pedidos de un cliente (anidado, 1 nivel)
GET    /v1/pedidos/1093                     acceso directo al pedido
GET    /v1/productos?categoria=cafe&precio_max=40000&orden=-precio&limit=20
GET    /v1/productos?limit=20&cursor=eyJpZCI6NDJ9
POST   /v1/pedidos/1093/cancelacion         acción como sub-recurso

HTTP/1.1 200 OK
{"data":[...],"next_cursor":"eyJpZCI6NjJ9","has_more":true}
```

## code:server

```python
from typing import Literal
from fastapi import Query

@app.get("/v1/productos")
def listar(categoria: str | None = None,
           precio_max: int | None = Query(default=None, gt=0),
           orden: Literal["precio", "-precio", "nombre"] = "nombre",
           limit: int = Query(default=20, le=100),
           cursor: str | None = None):
    ...

@app.get("/v1/clientes/{cliente_id}/pedidos")
def pedidos_de_cliente(cliente_id: int, estado: str | None = None): ...
```

## bad

```http
GET  /v1/getAllCustomers
POST /v1/cliente/crear
GET  /v1/clientes/7/pedidos/1093/items/3/producto/42   ← anidamiento excesivo
GET  /v1/productos            ← devuelve 80.000 registros sin paginar
```

## good

```http
GET  /v1/clientes
POST /v1/clientes
GET  /v1/pedidos/1093/items
GET  /v1/productos?limit=20&cursor=...
```

## bridge:typescript

A paginated table works with offset because it needs to jump between pages and show the total. An infinite scroll, on the other hand, fits cursor. When you design the API for your own frontend, choose the pagination according to the UI.

## interview

I model the domain as resources with plural nouns, for example /clientes, /pedidos and /productos, and let the HTTP method express the action. I use one level of nesting for ownership relationships, like /clientes/7/pedidos, and direct access for everything else. Filters, ordering and pagination go in the query string. To paginate I choose offset when the UI needs to jump between pages and the table is moderate, and cursor when there is a lot of volume or changing data, because it is stable and efficient. I version from the start, usually in the URL as /v1, and only bump the version for incompatible changes. Actions that are not CRUD I model as sub-resources, for example POST /pedidos/1093/cancelacion.

## myths

- Mixing singular and plural (`/cliente/7` and `/pedidos`). The convention is always plural.
- Believing every relationship must be nested. More than one level usually means the resource deserves its own route.
- Breaking contracts without versioning: renaming a field is an incompatible change.
