---
title: "Concurrency: async/await, event loop, threads, processes and GIL"
short: async, threads and GIL
summary: async/await gives cooperative concurrency on a single thread with an event loop (asyncio), ideal for I/O waits.
concepts:
  async-await:
    name: async/await
    aliases:
      - async await
  event-loop:
    name: event loop
    aliases: []
  gil:
    name: GIL
    aliases:
      - Global Interpreter Lock
  hilos-vs-procesos:
    name: threads vs. processes
    aliases:
      - hilos vs. procesos
exercises:
  - type: classify
    prompt: Which concurrency tool would you use?
    categories:
      - async
      - threads
      - processes
    items:
      - text: Calling 50 supplier APIs with httpx.AsyncClient
        category: async
        why: Many network waits with an async library.
      - text: Resizing 10,000 product photos
        category: processes
        why: "Heavy CPU: the GIL blocks threads."
      - text: Using a blocking legacy SDK with no async version
        category: threads
        why: "Blocking I/O: a thread (or asyncio.to_thread) avoids freezing the loop."
      - text: Computing sales statistics in pure Python over millions of rows
        category: processes
        why: CPU computation.
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: |-
          async def f():
              return 1

          print(f())
        options:
          - "1"
          - "&lt;coroutine object f at 0x...> and a RuntimeWarning"
          - Promise { 1 }
          - None
        answer: 1
        why: Calling an async function creates a coroutine but doesn't run it. You need `await f()` or `asyncio.run(f())`.
---

## definition

**async/await** gives cooperative concurrency on a single thread with an event loop (asyncio): ideal for I/O waits. **Threads** are managed by the operating system, but in CPython the **GIL** lets only one thread execute Python bytecode at a time: they help with I/O, they don't speed up computation. **Processes** give real parallelism for CPU work. Python 3.13+ offers an optional build without the GIL (free-threaded), but the standard installation still has it.

## analogy

The event loop is a waiter serving several tables: he takes an order and, while the kitchen prepares it (await), serves another table. Threads are several waiters sharing a single notepad (the GIL): only one writes at a time. Processes are several independent kitchens.

## problem

A `time.sleep()` or a blocking library inside a coroutine freezes the whole event loop: no other task makes progress.

## code:example

```python
import asyncio

async def consultar_inventario(producto: str) -> int:
    await asyncio.sleep(1)        # simula I/O: BD, API externa
    return 10

async def main():
    resultados = await asyncio.gather(
        consultar_inventario("cafe"),
        consultar_inventario("taza"),
        consultar_inventario("filtro"),
    )                              # ~1 s en total, no 3 s
    print(resultados)              # [10, 10, 10]

asyncio.run(main())

# Código bloqueante dentro de async: mándalo a un hilo
resultado = await asyncio.to_thread(generar_pdf_factura, pedido_id)
```

## bad

```python
async def consultar(producto):
    time.sleep(1)                 # bloquea el loop
    return requests.get(url).json()  # requests es bloqueante
```

It looks async, but it handles one thing at a time.

## good

```python
async def consultar(producto):
    await asyncio.sleep(1)
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
    return r.json()
```

Every wait yields control to the event loop.

## bridge:typescript

The syntax is almost the same as JS and `asyncio.gather` ≈ `Promise.all`. Key difference: in JS a Promise starts running as soon as it is created; in Python a coroutine **does nothing** until you await it or turn it into a Task. Node also has a single thread with an event loop, but it has no GIL because it never had JS threads sharing memory. In JS you cancel with `AbortController`; asyncio has cancellable Tasks and async generators.

## interview

Async is concurrency on a single thread: the event loop switches between tasks every time one awaits on I/O, so it works for many network or database waits. Threads also work for I/O, but because of the GIL only one runs Python at a time, so they don't speed up computation. For CPU work I use processes. In FastAPI the important thing is not to block the event loop inside an async endpoint.

## myths

- Calling an async function without `await`: you get a coroutine object and the "was never awaited" warning.
- Using blocking libraries (requests, psycopg2, time.sleep) inside `async def`.
- Believing async speeds up CPU computation: it only helps you wait better.
- Using threads to parallelize heavy computation: the GIL serializes it.
