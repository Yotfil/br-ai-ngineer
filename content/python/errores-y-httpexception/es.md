---
title: Manejo de errores y HTTPException
short: HTTPException
summary: raise HTTPException(status_code, detail) corta la ejecución y FastAPI responde un JSON con detail y ese código.
concepts:
  httpexception:
    name: HTTPException
    aliases: []
  exception-handler:
    name: exception handler
    aliases: []
exercises:
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: ¿Qué recibe el cliente con `raise HTTPException(404, "Pedido no encontrado")`?
        options:
          - 200 con null
          - '404 y `{"detail": "Pedido no encontrado"}`'
          - '404 y `{"error": "Pedido no encontrado"}`'
          - "500"
        answer: 1
        why: FastAPI usa la clave `detail` en el JSON de error.
  - type: choice
    prompt: ¿Qué código de estado devuelve?
    items:
      - q: Un endpoint divide entre cero y nadie captura la excepción.
        options:
          - "400"
          - "422"
          - "500"
          - "503"
        answer: 2
        why: Toda excepción no controlada termina en 500 Internal Server Error.
---

## definition

`raise HTTPException(status_code, detail)` corta la ejecución y FastAPI responde un JSON `{"detail": ...}` con ese código. Para errores de dominio, lo limpio es crear excepciones propias y traducirlas a HTTP con `@app.exception_handler`.

## analogy

Es el cajero que te dice «ese plato no existe» en lugar de quedarse callado (500) o servirte un plato vacío (200 con null).

## problem

Devolver errores como respuestas 200 engaña al frontend y a los reintentos. Lanzar HTTPException desde la lógica de negocio la ata a HTTP y la vuelve difícil de reutilizar.

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

El cliente recibe 200 y tiene que adivinar.

## good

```python
@app.get("/pedidos/{pedido_id}")
def obtener(pedido_id: int):
    pedido = buscar(pedido_id)
    if pedido is None:
        raise HTTPException(404, "Pedido no encontrado")
    return pedido
```

raise, no return, y el código correcto.

## bridge:typescript

Equivale a lanzar un error con código de estado en Express y dejar que un middleware de errores lo convierta en respuesta. Del otro lado, es lo que tu frontend recibe tras `await fetch(...)`: una respuesta con `response.ok` en `false` y el motivo en el campo `detail` del body. El `exception_handler` es el equivalente al middleware de errores global de Express.

## interview

Para errores esperados lanzo HTTPException con el código y un detail claro, por ejemplo 404 si no existe el recurso. Para reglas de negocio prefiero excepciones de dominio, como StockInsuficiente, que no saben nada de HTTP, y registro un exception handler que las traduce a la respuesta adecuada, por ejemplo 409. Así la lógica es reutilizable y testeable, y los errores no controlados terminan en 500 sin exponer detalles internos.

## myths

- Escribir `return HTTPException(...)` en vez de `raise`.
- Capturar `Exception` en el handler y esconder el error real.
- Lanzar HTTPException desde servicios o repositorios: mejor una excepción de dominio y un handler.
- Filtrar trazas internas en el `detail` de un 500.
