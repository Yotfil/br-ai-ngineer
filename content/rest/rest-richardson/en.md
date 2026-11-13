---
title: "REST: constraints and the Richardson model"
summary: REST is an architectural style (Roy Fielding, 2000), not a protocol or a standard.
concepts:
  restricciones-rest:
    name: REST constraints
    aliases:
      - restricciones REST
  modelo-de-richardson:
    name: Richardson maturity model
    aliases:
      - modelo de Richardson
  hateoas:
    name: HATEOAS
    aliases: []
---

## definition

REST is an **architectural style** (Roy Fielding, 2000), not a protocol or a standard. It defines constraints: client-server, stateless, cacheable, uniform interface, layered system and, optionally, code on demand. The Richardson model measures how well an API meets them, from level 0 to 3.

## analogy

REST is like the rules of a public library: each book has a unique location (**URI**), all of them are requested with the same form (**uniform interface**), the librarian does not remember your previous visit (**stateless**), you may photocopy pages that say "copying allowed" (**cacheable**) and you do not know whether the book comes from the warehouse or another branch (**layers**).

## problem

The constraints exist for a reason: **stateless** allows scaling, **cacheable** reduces load, **uniform interface** makes any client understand any resource, and **layers** allows putting CDNs, load balancers and gateways in place without the client noticing.

## code:wire

```http
# Nivel 3 (HATEOAS): la respuesta dice qué puedes hacer ahora
GET /v1/pedidos/1093 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/hal+json

{"id":1093,"estado":"pendiente","total":76000,
 "_links":{
   "self":   {"href":"/v1/pedidos/1093"},
   "pagar":  {"href":"/v1/pedidos/1093/pagos","method":"POST"},
   "cancelar":{"href":"/v1/pedidos/1093","method":"DELETE"}}}
```

## code:server

```python
# FastAPI te lleva naturalmente al nivel 2: recursos + métodos + códigos.
router = APIRouter(prefix="/v1/pedidos", tags=["pedidos"])

@router.get("")                     # colección
@router.post("", status_code=201)   # crear en la colección
@router.get("/{id}")                # elemento
@router.patch("/{id}")
@router.delete("/{id}", status_code=204)
```

## bad

```http
# Nivel 0: un solo endpoint, todo por POST (estilo RPC/SOAP)
POST /api   {"accion":"obtenerPedido","id":1093}
POST /api   {"accion":"cancelarPedido","id":1093}
```

## good

```http
# Nivel 2: recursos, métodos y códigos de estado
GET    /v1/pedidos/1093   → 200
DELETE /v1/pedidos/1093   → 204
```

## bridge:typescript

An API client module with `getAll`, `getById`, `create`, `update` and `remove` maps almost one to one to a level 2 API. If your module has methods like `ejecutarAccion(tipo, payload)` against a single endpoint, you are consuming a level 0.

## interview

REST is an architectural style defined by Roy Fielding, based on constraints: client-server separation, stateless communication, cacheable responses, a uniform interface (resources identified by URIs, manipulated through representations, self-descriptive messages and hypermedia), a layered system and code on demand as optional. The Richardson maturity model makes it practical: level 0 is a single RPC-style endpoint; level 1 introduces resources with their own URIs; level 2 uses HTTP methods and codes correctly, which is where most of the industry is; and level 3 adds HATEOAS, with links that indicate the possible actions.

## myths

- Believing REST is "HTTP + JSON". You can use HTTP and JSON and not be REST, and REST does not require JSON.
- Thinking most "REST" APIs comply with full REST. Almost all are at level 2, without HATEOAS.
- Confusing REST with CRUD. Resources can represent processes (a payment, an approval), not just tables.
