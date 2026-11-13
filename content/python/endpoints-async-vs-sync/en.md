---
title: Async vs sync endpoints
short: async def vs def
summary: "An async def endpoint runs on the event loop: use it when everything it does inside is awaitable."
concepts:
  threadpool:
    name: threadpool
    aliases: []
exercises:
  - type: classify
    prompt: Would you declare the endpoint with async def or with def?
    categories:
      - async def
      - def
    items:
      - text: Uses httpx.AsyncClient to query a provider
        category: async def
        why: "Async library: await inside async def."
      - text: Uses requests to query a provider
        category: def
        why: "requests is blocking: threadpool."
      - text: Uses SQLModel's synchronous Session
        category: def
        why: Blocking session.
      - text: Uses AsyncSession with asyncpg
        category: async def
        why: Async driver.
      - text: You don't know whether the library is async
        category: def
        why: It is the literal recommendation of the FastAPI docs.
---

## definition

An `async def` endpoint runs on the event loop: use it when everything it does inside is awaitable (async driver, httpx). A regular `def` endpoint is run by FastAPI in a **threadpool**, so a blocking call does not freeze the server. The only truly bad thing is putting blocking code inside `async def`. The documentation itself says: if you don't know, use a regular `def`.

## analogy

An async waiter who stands in front of the kitchen waiting for a dish blocks the whole restaurant. If the task is about waiting with no way to get notified, better hire a helper (the threadpool).

## problem

With `async def` and a blocking call, all concurrent requests are served one at a time. Under real load, latency skyrockets.

## code:example

```python
# 1. Bien: librería async dentro de async def
@app.get("/productos/{producto_id}")
async def obtener(producto_id: int, session: AsyncSessionDep):
    return await session.get(Producto, producto_id)

# 2. Bien: librería bloqueante con def (FastAPI usa el threadpool)
@app.get("/tasa-cambio")
def tasa_cambio():
    return requests.get("https://api.banco.co/usd").json()

# 3. Mal: bloqueante dentro de async def
@app.get("/reporte")
async def reporte():
    time.sleep(2)          # nadie más es atendido durante 2 s
    return {"ok": True}
```

## bad

```python
@app.get("/clientes/{id}")
async def obtener(id: int):
    return psycopg2_buscar(id)   # driver sync en async def
```

It looks modern and it is the slowest of the three.

## good

```python
@app.get("/clientes/{id}")
def obtener(id: int):
    return psycopg2_buscar(id)   # threadpool
```

Or you switch to an async driver and use async def with await.

## bridge:typescript

In Node everything runs on a single thread: blocking in a handler blocks the entire server, always. FastAPI gives you a way out that Node doesn't have: declare the endpoint with `def` and let it run on a separate thread.

## interview

If inside the endpoint I only use async libraries, I declare it with async def and use await; if I use blocking libraries, I declare it with a regular def and FastAPI runs it in a threadpool. The serious mistake is calling blocking code inside async def, because it freezes the event loop and serializes all requests. For heavy CPU work I use neither: I send it to another process or to a queue.

## myths

- async def with `requests`, `time.sleep` or a sync driver.
- Believing async is always faster.
- Doing heavy computation inside an endpoint: move it to a process or a task queue.
- The threadpool is limited (40 threads by default in AnyIO): it is not infinite.
