---
title: Rutas, parámetros de ruta, query params y cuerpo
short: Rutas y parámetros
summary: Una path operation es método + ruta + función.
concepts:
  path-operation:
    name: path operation
    aliases: []
exercises:
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: "Con la ruta `/productos/{producto_id}` y la firma `def f(producto_id: int, categoria: str, datos: ProductoCrear)`, ¿de dónde sale `categoria`?"
        options:
          - De la ruta
          - Del query string
          - Del body
          - De las cabeceras
        answer: 1
        why: "Tipo simple que no aparece en la ruta: query param, y obligatorio porque no tiene default."
  - type: choice
    prompt: ¿Qué código de estado devuelve?
    items:
      - q: "`GET /productos/0` con `producto_id: Annotated[int, Path(gt=0)]`."
        options:
          - "200"
          - "400"
          - "404"
          - "422"
        answer: 3
        why: "0 no cumple gt=0: error de validación `greater_than`, 422."
---

## definition

Una **path operation** es método + ruta + función. FastAPI decide de dónde sale cada parámetro según su declaración: si su nombre aparece en la ruta es **path param**; si es un tipo simple que no está en la ruta, es **query param**; si es un modelo Pydantic, es el **body**. Con `Annotated` y `Path`/`Query` añades restricciones.

## analogy

Una dirección de entrega: la ruta es la calle y el número (identifica el recurso), los query params son las instrucciones opcionales («dejar en portería») y el body es el paquete.

## problem

Las rutas se evalúan en orden. Si la dinámica va primero, `/productos/destacados` intenta convertir «destacados» a int y responde 422.

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

Lo específico primero, lo genérico después.

## bridge:typescript

En Express escribirías `app.get('/productos/:id', (req, res) => ...)` y convertirías `req.params.id` a mano. Aquí la conversión y validación salen del type hint. Es la misma idea de `:id` en el router de una SPA, pero sin parsear el valor tú mismo.

## interview

FastAPI infiere el origen de cada parámetro: si el nombre está en la ruta es path param, si es un tipo simple fuera de la ruta es query param y si es un modelo Pydantic es el cuerpo. Los type hints convierten y validan, y con Annotated más Path o Query agrego restricciones como mínimos y máximos. Si algo no cumple, responde 422 sin que yo escriba validaciones. Ojo con el orden: las rutas fijas van antes que las que tienen parámetros.

## myths

- El orden de las rutas importa.
- Los query params llegan como texto; FastAPI los convierte según el hint (`?activo=true` → `True`).
- Un parámetro sin default es obligatorio, aunque sea query.
- `/productos/` con barra final redirige con un 307 a `/productos` si así la definiste.
