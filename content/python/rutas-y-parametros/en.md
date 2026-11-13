---
title: Routes, path parameters, query params and body
short: Routes and parameters
summary: A path operation is method + path + function.
concepts:
  path-operation:
    name: path operation
    aliases: []
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: "With the path `/productos/{producto_id}` and the signature `def f(producto_id: int, categoria: str, datos: ProductoCrear)`, where does `categoria` come from?"
        options:
          - From the path
          - From the query string
          - From the body
          - From the headers
        answer: 1
        why: "Simple type that doesn't appear in the path: query param, and required because it has no default."
  - type: choice
    prompt: Which status code does it return?
    items:
      - q: "`GET /productos/0` with `producto_id: Annotated[int, Path(gt=0)]`."
        options:
          - "200"
          - "400"
          - "404"
          - "422"
        answer: 3
        why: "0 doesn't satisfy gt=0: `greater_than` validation error, 422."
---

## definition

A **path operation** is method + path + function. FastAPI decides where each parameter comes from based on its declaration: if its name appears in the path it's a **path param**; if it's a simple type that isn't in the path, it's a **query param**; if it's a Pydantic model, it's the **body**. With `Annotated` and `Path`/`Query` you add constraints.

## analogy

A delivery address: the path is the street and number (it identifies the resource), the query params are the optional instructions ("leave it at the front desk") and the body is the package.

## problem

Routes are evaluated in order. If the dynamic one comes first, `/productos/destacados` tries to convert "destacados" to int and responds 422.

## code:example

```python
from typing import Annotated
from fastapi import FastAPI, Path, Query
from pydantic import BaseModel

app = FastAPI()

class ProductoCrear(BaseModel):
    nombre: str
    precio: int
    categoria: str | None = None

@app.get("/productos/destacados")          # rutas fijas antes que las dinámicas
async def destacados():
    return [{"id": 1, "nombre": "Café de origen"}]

@app.get("/productos/{producto_id}")
async def obtener_producto(producto_id: Annotated[int, Path(gt=0)]):
    return {"id": producto_id}

@app.get("/productos")
async def listar_productos(
    categoria: str | None = None,
    limite: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return {"categoria": categoria, "limite": limite}

@app.post("/productos", status_code=201)
async def crear_producto(producto: ProductoCrear):
    return producto
```

## bad

```python
@app.get("/productos/{producto_id}")
async def obtener(producto_id: int): ...

@app.get("/productos/destacados")    # nunca se alcanza
async def destacados(): ...
```

GET /productos/destacados → 422 int_parsing.

## good

```python
@app.get("/productos/destacados")
async def destacados(): ...

@app.get("/productos/{producto_id}")
async def obtener(producto_id: int): ...
```

Specific first, generic after.

## bridge:typescript

In Express you'd write `app.get('/productos/:id', (req, res) => ...)` and convert `req.params.id` by hand. Here the conversion and validation come from the type hint. It's the same idea as `:id` in a SPA router, but without parsing the value yourself.

## interview

FastAPI infers where each parameter comes from: if the name is in the path it's a path param, if it's a simple type outside the path it's a query param, and if it's a Pydantic model it's the body. The type hints convert and validate, and with Annotated plus Path or Query I add constraints like minimums and maximums. If something doesn't comply, it responds 422 without me writing validations. Watch the order: fixed routes go before routes with parameters.

## myths

- Route order matters.
- Query params arrive as text; FastAPI converts them according to the hint (`?activo=true` → `True`).
- A parameter without a default is required, even if it's a query param.
- `/productos/` with a trailing slash redirects with a 307 to `/productos` if that's how you defined it.
