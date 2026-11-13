---
title: Middleware, CORS and background tasks
short: Middleware, CORS, background
summary: A middleware wraps every request and response (logs, timings, headers).
concepts:
  middleware:
    name: middleware
    aliases: []
  cors-middleware:
    name: CORSMiddleware
    aliases: []
  background-tasks:
    name: BackgroundTasks
    aliases:
      - tareas en segundo plano
      - background tasks
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: When does a task added with `tareas.add_task(...)` run?
        options:
          - Before the handler
          - In parallel with the handler
          - After the response is sent
          - When the server restarts
        answer: 2
        why: The client receives the response and then the task runs.
      - q: What is the Express middleware equivalent of `await call_next(request)`?
        options:
          - "`req.clone()`"
          - "`next()`"
          - "`res.send()`"
          - "`app.use()`"
        answer: 1
        why: Both pass the request to the next link in the chain. In FastAPI, in addition, `call_next` returns the response to you so you can modify it.
---

## definition

A **middleware** wraps every request and response (logs, timings, headers). **CORS** is a browser rule: it blocks responses from another origin unless the server allows it with headers; it is configured with `CORSMiddleware`. **BackgroundTasks** runs something after the response is sent, like a confirmation email.

## analogy

The middleware is the building's doorman: everyone goes past him on the way in and on the way out. The background task is “we'll email you the receipt”: you leave with your coffee and the email goes out afterwards.

## problem

Without CORS configured, your frontend on `localhost:4200` cannot read the responses from the API on `localhost:8000`. Without background tasks, the user waits for an email to go out before seeing their order.

## code:example

```python
import time
from fastapi import BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "https://tienda.co"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def medir_tiempo(request: Request, call_next):
    inicio = time.perf_counter()
    response = await call_next(request)        # sigue la cadena
    response.headers["X-Process-Time"] = f"{time.perf_counter() - inicio:.4f}"
    return response

def enviar_confirmacion(email: str, pedido_id: int) -> None:
    ...  # SMTP: lento

@app.post("/pedidos", status_code=201)
def crear_pedido(datos: PedidoCrear, tareas: BackgroundTasks, cliente: ClienteActual):
    pedido = guardar_pedido(datos, cliente)
    tareas.add_task(enviar_confirmacion, cliente.email, pedido.id)
    return pedido                               # el cliente no espera el correo
```

## bad

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
)
```

Any website could make requests with your users' credentials. The CORS specification does not allow * when there are credentials.

## good

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,   # lista explícita
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
)
```

Explicit origins from configuration.

## bridge:typescript

Middleware resembles Express's `(req, res, next)`: `await call_next(request)` ≈ `next()`. On the client side, it is the same idea as a function wrapping `fetch` to touch every request. And the CORS error you used to see in the browser console gets fixed here, not on the frontend (in development you also dodged it with the dev server's proxy).

## interview

Middleware intercepts all requests and responses; I use it for logs, metrics or headers, like a function wrapping `fetch` on the client, but on the server. CORS is a browser protection: I configure CORSMiddleware with an explicit list of origins, never an asterisk with credentials, knowing it does not protect against non-browser clients. For work that must not delay the response, like sending an email, I use BackgroundTasks; if it is heavy or cannot be lost, a task queue.

## myths

- Believing CORS protects your API: only browsers enforce it; curl or Postman ignore it.
- Using BackgroundTasks for heavy or critical jobs: if the process restarts, they are lost. Use a queue (Celery, ARQ, RQ).
- Forgetting that requests with JSON or Authorization trigger an OPTIONS preflight.
- Registering CORS after other middlewares that may respond first.
