---
title: Endpoints async vs sync
short: async def vs def
summary: "Un endpoint async def corre en el event loop: úsalo cuando todo lo que hace por dentro es awaitable."
concepts:
  threadpool:
    name: threadpool
    aliases: []
exercises:
  - type: classify
    prompt: ¿Declararías el endpoint con async def o con def?
    categories:
      - async def
      - def
    items:
      - text: Usa httpx.AsyncClient para consultar un proveedor
        category: async def
        why: "Librería async: await dentro de async def."
      - text: Usa requests para consultar un proveedor
        category: def
        why: "requests es bloqueante: threadpool."
      - text: Usa la Session síncrona de SQLModel
        category: def
        why: Sesión bloqueante.
      - text: Usa AsyncSession con asyncpg
        category: async def
        why: Driver async.
      - text: No sabes si la librería es async
        category: def
        why: Es la recomendación literal de la doc de FastAPI.
---

## definition

Un endpoint `async def` corre en el event loop: úsalo cuando todo lo que hace por dentro es awaitable (driver async, httpx). Un endpoint `def` normal FastAPI lo ejecuta en un **threadpool**, así que una llamada bloqueante no congela el servidor. Lo único realmente malo es poner código bloqueante dentro de `async def`. La propia documentación dice: si no sabes, usa `def` normal.

## analogy

Un mesero async que se queda parado frente a la cocina esperando un plato bloquea a todo el restaurante. Si la tarea es de esperar sin poder avisar, mejor contrata un ayudante (el threadpool).

## problem

Con `async def` y una llamada bloqueante, todas las peticiones concurrentes se atienden en fila. Con carga real, la latencia se dispara.

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

Parece moderno y es el más lento de los tres.

## good

```python
@app.get("/clientes/{id}")
def obtener(id: int):
    return psycopg2_buscar(id)   # threadpool
```

O cambias a un driver async y usas async def con await.

## bridge:typescript

En Node todo corre en un solo hilo: bloquear en un handler bloquea el servidor entero, siempre. FastAPI te da una salida que Node no tiene: declarar el endpoint con `def` y dejar que lo ejecute en un hilo aparte.

## interview

Si dentro del endpoint uso solo librerías async, lo declaro con async def y hago await; si uso librerías bloqueantes, lo declaro con def normal y FastAPI lo ejecuta en un threadpool. El error grave es llamar código bloqueante dentro de async def, porque congela el event loop y serializa todas las peticiones. Para trabajo pesado de CPU no uso ninguno de los dos: lo mando a otro proceso o a una cola.

## myths

- async def con `requests`, `time.sleep` o un driver sync.
- Creer que async siempre es más rápido.
- Hacer cálculo pesado dentro de un endpoint: muévelo a un proceso o a una cola de tareas.
- El threadpool es limitado (40 hilos por defecto en AnyIO): no es infinito.
