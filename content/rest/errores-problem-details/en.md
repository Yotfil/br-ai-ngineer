---
title: Designing responses and errors (Problem Details)
summary: "A good API always responds with the same shape: consistent successes and errors with the right code and a structured body."
concepts:
  problem-details:
    name: Problem Details
    aliases: []
---

## definition

A good API always responds with the same shape: successes with the resource or a consistent envelope, and errors with a correct HTTP code plus a structured body. The standard for errors is **Problem Details** (RFC 9457), with `type`, `title`, `status`, `detail` and `instance`.

## analogy

The warning panel of a car: a red light that says "error" is not enough. A good one tells you which system failed, how serious it is and what to do. And every car of the brand uses the same symbols.

## problem

If each endpoint returns errors with a different shape, the frontend needs a parser per endpoint. If the message is vague ("Error"), support cannot help. If the message exposes internals (stack traces, SQL queries), you are giving information to an attacker.

## code:wire

```http
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{
  "type": "https://api.tienda.co/errores/stock-insuficiente",
  "title": "Stock insuficiente",
  "status": 409,
  "detail": "Pediste 5 unidades de 'Café de origen Tolima' y solo quedan 2.",
  "instance": "/v1/pedidos",
  "producto_id": 42,
  "disponible": 2,
  "trace_id": "4bf92f3577b34da6"
}
```

## code:server

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class ErrorDeNegocio(Exception):
    def __init__(self, status: int, titulo: str, detalle: str, tipo: str, **extra):
        self.status, self.titulo, self.detalle, self.tipo, self.extra = status, titulo, detalle, tipo, extra

@app.exception_handler(ErrorDeNegocio)
async def manejar(request: Request, exc: ErrorDeNegocio):
    return JSONResponse(status_code=exc.status, media_type="application/problem+json",
        content={"type": exc.tipo, "title": exc.titulo, "status": exc.status,
                 "detail": exc.detalle, "instance": request.url.path, **exc.extra})

# En el servicio:
raise ErrorDeNegocio(409, "Stock insuficiente", "Solo quedan 2.", "https://api.tienda.co/errores/stock-insuficiente", disponible=2)
```

## bad

```http
HTTP/1.1 500 Internal Server Error
{"error":"psycopg2.errors.UniqueViolation: duplicate key value violates unique constraint \"clientes_email_key\""}
```

## good

```http
HTTP/1.1 409 Conflict
Content-Type: application/problem+json
{"type":".../email-duplicado","title":"El email ya está registrado","status":409}
```

## bridge:typescript

After `await fetch(...)`, your own function that wraps `fetch` has `response.status` and the body. With Problem Details across the backend, that function can show the body’s `title` in a toast without a `switch` per endpoint.

## interview

I define a consistent response format for the whole API and use the correct HTTP code for each case. For errors I follow Problem Details, RFC 9457, with the application/problem+json media type and the type, title, status, detail and instance fields, plus custom fields when they add value, such as per-field errors in a validation. Messages must be useful to the consumer, but without exposing internal details: the stack trace stays in the logs with a trace_id that I also return in the response to correlate. In FastAPI I centralize it with exception handlers, so no endpoint builds its error by hand.

## myths

- Returning 500 for validation or business errors. 5xx means the server failed, not that the user sent something invalid.
- Exposing internal details in production. The stack trace goes to the logs, with a `trace_id` to correlate.
- Believing the FastAPI error format (`{"detail": ...}`) is enough for everything. It works for validation, but a single format for the whole API is better.
