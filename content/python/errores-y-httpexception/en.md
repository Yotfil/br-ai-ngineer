---
title: Error handling and HTTPException
short: HTTPException
summary: raise HTTPException(status_code, detail) stops execution and FastAPI responds with a JSON with detail and that code.
concepts:
  httpexception:
    name: HTTPException
    aliases: []
  exception-handler:
    name: exception handler
    aliases: []
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: What does the client get with `raise HTTPException(404, "Pedido no encontrado")`?
        options:
          - 200 with null
          - '404 and `{"detail": "Pedido no encontrado"}`'
          - '404 and `{"error": "Pedido no encontrado"}`'
          - "500"
        answer: 1
        why: FastAPI uses the `detail` key in the error JSON.
  - type: choice
    prompt: Which status code does it return?
    items:
      - q: An endpoint divides by zero and nobody catches the exception.
        options:
          - "400"
          - "422"
          - "500"
          - "503"
        answer: 2
        why: Every unhandled exception ends up as a 500 Internal Server Error.
---

## definition

`raise HTTPException(status_code, detail)` stops execution and FastAPI responds with a JSON `{"detail": ...}` with that code. For domain errors, the clean approach is to create your own exceptions and translate them to HTTP with `@app.exception_handler`.

## analogy

It's the cashier who tells you "that dish doesn't exist" instead of staying silent (500) or serving you an empty plate (200 with null).

## problem

Returning errors as 200 responses misleads the frontend and retries. Raising HTTPException from business logic ties it to HTTP and makes it hard to reuse.

## code:example

```python
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse

@app.get("/pedidos/{pedido_id}")
def obtener_pedido(pedido_id: int, session: SessionDep) -> PedidoPublico:
    pedido = session.get(Pedido, pedido_id)
    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    return pedido

# Excepción de dominio, sin saber nada de HTTP
class StockInsuficiente(Exception):
    def __init__(self, producto: str):
        self.producto = producto

@app.exception_handler(StockInsuficiente)
async def stock_insuficiente_handler(request: Request, exc: StockInsuficiente):
    return JSONResponse(status_code=409, content={"detail": f"Sin stock de {exc.producto}"})
```

## bad

```python
@app.get("/pedidos/{pedido_id}")
def obtener(pedido_id: int):
    pedido = buscar(pedido_id)
    if not pedido:
        return {"error": "no existe"}   # 200 OK
```

The client gets a 200 and has to guess.

## good

```python
@app.get("/pedidos/{pedido_id}")
def obtener(pedido_id: int):
    pedido = buscar(pedido_id)
    if pedido is None:
        raise HTTPException(404, "Pedido no encontrado")
    return pedido
```

raise, not return, and the correct code.

## bridge:typescript

It's equivalent to throwing an error with a status code in Express and letting an error middleware turn it into a response. On the other side, it's what your frontend receives after `await fetch(...)`: a response with `response.ok` set to `false` and the reason in the `detail` field of the body. The `exception_handler` is the equivalent of Express's global error middleware.

## interview

For expected errors I raise HTTPException with the code and a clear detail, for example 404 if the resource doesn't exist. For business rules I prefer domain exceptions, like StockInsuficiente, that know nothing about HTTP, and I register an exception handler that translates them to the appropriate response, for example 409. That way the logic is reusable and testable, and unhandled errors end up as 500 without exposing internal details.

## myths

- Writing `return HTTPException(...)` instead of `raise`.
- Catching `Exception` in the handler and hiding the real error.
- Raising HTTPException from services or repositories: better a domain exception and a handler.
- Leaking internal stack traces in the `detail` of a 500.
