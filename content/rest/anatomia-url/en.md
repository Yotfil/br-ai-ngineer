---
title: Anatomy of a URL
summary: "A URL identifies a resource and where to find it: scheme, host, port, path, query and fragment."
concepts:
  query-string:
    name: query string
    aliases: []
  parametro-de-ruta:
    name: path parameter
    aliases:
      - parámetro de ruta
  fragmento:
    name: fragment
    aliases:
      - fragmento
---

## definition

A URL identifies a resource and where to find it: `scheme://host:port/path?query#fragment`. The fragment never travels to the server; everything else does.

## analogy

A full postal address: the **scheme** is the delivery method (regular or registered mail), the **host** is the building, the **port** the service window, the **path** the apartment, the **query** the extra instructions ("deliver only in the morning") and the **fragment** a note you use when you arrive, but the mail carrier never reads.

## problem

Knowing which part to use defines your API design: the **path** identifies the resource (`/productos/42`) and the **query** filters it or changes the view (`?categoria=cafe`). If you mix up their roles you end up with paths like `/productos/categoria/cafe/orden/precio`, impossible to combine.

## code:wire

```http
URL: https://api.tienda.co:443/v1/productos?categoria=cafe&orden=-precio#reseñas

# Lo que realmente viaja por la red:
GET /v1/productos?categoria=cafe&orden=-precio HTTP/1.1
Host: api.tienda.co
# El "#reseñas" nunca sale del navegador.
```

## code:server

```python
@app.get("/v1/productos")
def listar_productos(categoria: str | None = None,   # query param opcional
                     orden: str = "nombre"):          # query param con default
    ...

@app.get("/v1/productos/{producto_id}")              # path param
def obtener_producto(producto_id: int): ...
```

## bad

```http
GET /v1/productos/buscar/cafe/barato
GET /v1/getProductoById?id=42
```

## good

```http
GET /v1/productos?categoria=cafe&precio_max=40000
GET /v1/productos/42
```

## bridge:typescript

The fragment is exactly what SPA routers used in hash mode (`/#/pedidos`): since the server never sees it, it always served the same `index.html`. With normal routes (the router of an SPA) the server does receive `/pedidos`, and that is why you have to configure it to return `index.html` for any route.

## interview

A URL has a scheme, which indicates the protocol; a host, which is the domain; a port, which if omitted is 80 for HTTP or 443 for HTTPS; a path, which identifies the resource; a query string, with key-value parameters to filter or paginate; and a fragment, which only the browser uses and is never sent to the server. In REST design, the path identifies the resource and the query modifies the view of the collection.

## myths

- Putting sensitive data in the query string: it ends up in server logs, proxy logs and browser history, even if you use HTTPS.
- Believing the fragment reaches the backend.
- Forgetting to encode special characters: a space travels as `%20` and ñ as `%C3%B1`.
