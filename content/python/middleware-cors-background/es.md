---
title: Middleware, CORS y tareas en segundo plano
short: Middleware, CORS, background
summary: Un middleware envuelve cada petición y respuesta (logs, tiempos, cabeceras).
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
    prompt: Pregunta rápida
    items:
      - q: ¿Cuándo se ejecuta una tarea agregada con `tareas.add_task(...)`?
        options:
          - Antes del handler
          - En paralelo con el handler
          - Después de enviar la respuesta
          - Al reiniciar el servidor
        answer: 2
        why: El cliente recibe la respuesta y luego corre la tarea.
      - q: ¿Qué equivale a `await call_next(request)` en un middleware de Express?
        options:
          - "`req.clone()`"
          - "`next()`"
          - "`res.send()`"
          - "`app.use()`"
        answer: 1
        why: Ambos pasan la petición al siguiente eslabón de la cadena. En FastAPI, además, `call_next` te devuelve la respuesta para modificarla.
---

## definition

Un **middleware** envuelve cada petición y respuesta (logs, tiempos, cabeceras). **CORS** es una regla del navegador: bloquea respuestas de otro origen salvo que el servidor lo permita con cabeceras; se configura con `CORSMiddleware`. **BackgroundTasks** ejecuta algo después de enviar la respuesta, como un correo de confirmación.

## analogy

El middleware es el portero del edificio: todos pasan por él al entrar y al salir. La tarea en segundo plano es «te enviamos el recibo por correo»: te vas con tu café y el correo sale después.

## problem

Sin CORS configurado, tu frontend en `localhost:4200` no puede leer las respuestas de la API en `localhost:8000`. Sin tareas en segundo plano, el usuario espera a que salga un correo para ver su pedido.

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

Cualquier sitio web podría hacer peticiones con las credenciales de tus usuarios. La especificación de CORS no admite * cuando hay credenciales.

## good

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,   # lista explícita
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
)
```

Orígenes explícitos desde configuración.

## bridge:typescript

El middleware se parece al `(req, res, next)` de Express: `await call_next(request)` ≈ `next()`. Del lado del cliente, es la misma idea que una función que envuelve `fetch` para tocar cada petición. Y el error de CORS que veías en la consola del navegador se arregla aquí, no en el frontend (en desarrollo también lo esquivabas con el proxy del servidor de desarrollo).

## interview

El middleware intercepta todas las peticiones y respuestas; lo uso para logs, métricas o cabeceras, como una función que envuelve `fetch` en el cliente, pero en el servidor. CORS es una protección del navegador: configuro CORSMiddleware con una lista explícita de orígenes, nunca asterisco con credenciales, sabiendo que no protege contra clientes que no son navegadores. Para trabajo que no debe retrasar la respuesta, como enviar un correo, uso BackgroundTasks; si es pesado o no puede perderse, una cola de tareas.

## myths

- Creer que CORS protege tu API: solo lo aplican los navegadores; curl o Postman lo ignoran.
- Usar BackgroundTasks para trabajos pesados o críticos: si el proceso se reinicia, se pierden. Usa una cola (Celery, ARQ, RQ).
- Olvidar que las peticiones con JSON o Authorization generan un preflight OPTIONS.
- Registrar CORS después de otros middlewares que pueden responder antes.
