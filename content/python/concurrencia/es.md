---
title: "Concurrencia: async/await, event loop, hilos, procesos y GIL"
short: async, hilos y GIL
summary: async/await da concurrencia cooperativa en un solo hilo con un event loop (asyncio), ideal para esperas de I/O.
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
    name: hilos vs. procesos
    aliases:
      - threads vs. processes
exercises:
  - type: classify
    prompt: ¿Qué herramienta de concurrencia usarías?
    categories:
      - async
      - hilos
      - procesos
    items:
      - text: Llamar a 50 APIs de proveedores con httpx.AsyncClient
        category: async
        why: Muchas esperas de red con librería async.
      - text: Redimensionar 10.000 fotos de productos
        category: procesos
        why: "CPU pesada: el GIL bloquea a los hilos."
      - text: Usar un SDK legacy bloqueante sin versión async
        category: hilos
        why: "I/O bloqueante: un hilo (o asyncio.to_thread) evita congelar el loop."
      - text: Calcular estadísticas de ventas en Python puro con millones de filas
        category: procesos
        why: Cálculo de CPU.
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: |-
          async def f():
              return 1

          print(f())
        options:
          - "1"
          - "&lt;coroutine object f at 0x...> y un RuntimeWarning"
          - Promise { 1 }
          - None
        answer: 1
        why: Llamar a una función async crea una corrutina pero no la ejecuta. Necesitas `await f()` o `asyncio.run(f())`.
---

## definition

**async/await** da concurrencia cooperativa en un solo hilo con un event loop (asyncio): ideal para esperas de I/O. Los **hilos** los gestiona el sistema operativo, pero en CPython el **GIL** deja que solo un hilo ejecute bytecode Python a la vez: sirven para I/O, no aceleran cálculos. Los **procesos** dan paralelismo real para trabajo de CPU. Python 3.13+ ofrece una compilación opcional sin GIL (free-threaded), pero la instalación estándar todavía lo tiene.

## analogy

El event loop es un mesero que atiende varias mesas: toma un pedido y, mientras la cocina prepara (await), atiende otra mesa. Los hilos son varios meseros que comparten una sola libreta (el GIL): solo uno escribe a la vez. Los procesos son varias cocinas independientes.

## problem

Un `time.sleep()` o una librería bloqueante dentro de una corrutina congela todo el event loop: ninguna otra tarea avanza.

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

Parece async, pero atiende una cosa a la vez.

## good

```python
async def consultar(producto):
    await asyncio.sleep(1)
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
    return r.json()
```

Cada espera cede el control al event loop.

## bridge:typescript

La sintaxis es casi igual a JS y `asyncio.gather` ≈ `Promise.all`. Diferencia clave: en JS una Promise empieza a ejecutarse en cuanto se crea; en Python una corrutina **no hace nada** hasta que la awaiteas o la conviertes en Task. Node también tiene un solo hilo con event loop, pero no tiene GIL porque nunca tuvo hilos de JS compartiendo memoria. En JS cancelas con `AbortController`; asyncio tiene Tasks cancelables y async generators.

## interview

Async es concurrencia en un solo hilo: el event loop alterna entre tareas cada vez que una hace await sobre I/O, así que sirve para muchas esperas de red o base de datos. Los hilos también sirven para I/O, pero por el GIL solo uno ejecuta Python a la vez, así que no aceleran cálculos. Para trabajo de CPU uso procesos. En FastAPI lo importante es no bloquear el event loop dentro de un endpoint async.

## myths

- Llamar una función async sin `await`: obtienes un objeto corrutina y el warning «was never awaited».
- Usar librerías bloqueantes (requests, psycopg2, time.sleep) dentro de `async def`.
- Creer que async acelera cálculos de CPU: solo ayuda a esperar mejor.
- Usar hilos para paralelizar cálculo pesado: el GIL lo serializa.
