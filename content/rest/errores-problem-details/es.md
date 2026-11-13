---
title: Diseño de respuestas y errores (Problem Details)
summary: "Una buena API responde siempre con la misma forma: éxitos consistentes y errores con el código correcto y un cuerpo estructurado."
concepts:
  problem-details:
    name: Problem Details
    aliases: []
---

## definition

Una buena API responde siempre con la misma forma: los éxitos con el recurso o un sobre consistente, y los errores con un código HTTP correcto más un cuerpo estructurado. El estándar para errores es **Problem Details** (RFC 9457), con `type`, `title`, `status`, `detail` e `instance`.

## analogy

El tablero de fallas de un carro: no basta con una luz roja que dice «error». Uno bueno te dice qué sistema falló, qué tan grave es y qué hacer. Y todos los carros de la marca usan los mismos símbolos.

## problem

Si cada endpoint devuelve errores con forma distinta, el frontend necesita un parser por endpoint. Si el mensaje es vago («Error»), soporte no puede ayudar. Si el mensaje expone internals (stack traces, consultas SQL), le das información a un atacante.

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

Tras `await fetch(...)`, tu función propia que envuelve `fetch` tiene `response.status` y el body. Con Problem Details en todo el backend, esa función puede mostrar el `title` del body en un toast sin un `switch` por endpoint.

## interview

Defino un formato de respuesta consistente para toda la API y uso el código HTTP correcto para cada caso. Para errores sigo Problem Details, el RFC 9457, con media type application/problem+json y los campos type, title, status, detail e instance, más campos propios cuando aportan, como los errores por campo en una validación. Los mensajes deben ser útiles para quien consume, pero sin exponer detalles internos: el stack trace queda en los logs con un trace_id que también devuelvo en la respuesta para correlacionar. En FastAPI lo centralizo con exception handlers, para que ningún endpoint arme su error a mano.

## myths

- Devolver 500 por errores de validación o de negocio. 5xx significa que el servidor falló, no que el usuario envió algo inválido.
- Exponer detalles internos en producción. El stack trace va a los logs, con un `trace_id` para correlacionar.
- Creer que el formato de error de FastAPI (`{"detail": ...}`) es suficiente para todo. Sirve para validación, pero conviene un formato único para toda la API.
