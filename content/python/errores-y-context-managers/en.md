---
title: Error handling and context managers
short: Errors and with
summary: "try / except / else / finally handles errors: else runs if there was no exception and finally always runs."
concepts:
  context-manager:
    name: context manager
    aliases: []
  try-except:
    name: try/except/finally
    aliases:
      - try except
      - try except finally
  eafp:
    name: EAFP
    aliases: []
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: |-
          try:
              print(1)
              x = 1 / 0
              print(2)
          except ZeroDivisionError:
              print(3)
          else:
              print(4)
          finally:
              print(5)
        options:
          - 1 2 3 5
          - 1 3 5
          - 1 3 4 5
          - 1 5
        answer: 1
        why: The 2 never runs; else is skipped because there was an exception; finally always runs.
  - type: choice
    prompt: Quick question
    items:
      - q: What does `with open("pedidos.csv") as f:` guarantee?
        options:
          - That the file exists
          - That it's closed when leaving the block, even on error
          - That the read is async
          - That there are no exceptions
        answer: 1
        why: The context manager always calls `__exit__`, and that's where the file is closed.
---

## definition

`try / except / else / finally` handles errors: `else` runs if there was no exception and `finally` always runs. Custom exceptions inherit from `Exception`. A **context manager** (`with`) guarantees setup and cleanup, through `__enter__`/`__exit__` or the `@contextmanager` decorator.

## analogy

The `with` is signing out the storeroom keys: whatever happens inside, when you leave you return the keys.

## problem

Swallowing errors hides bugs and leaves data half-done. Without `with`, an error midway leaves files open or transactions unclosed.

## code:example

```python
class StockInsuficiente(Exception):
    def __init__(self, producto: str, pedido: int, disponible: int):
        super().__init__(f"{producto}: pediste {pedido}, hay {disponible}")
        self.producto = producto

def reservar(producto: str, cantidad: int) -> None:
    disponible = stock.get(producto, 0)
    if cantidad > disponible:
        raise StockInsuficiente(producto, cantidad, disponible)
    stock[producto] -= cantidad

try:
    reservar("cafe", 50)
except StockInsuficiente as e:
    print("No se pudo:", e)
else:
    print("Reservado")
finally:
    print("Fin del intento")

from contextlib import contextmanager

@contextmanager
def transaccion(sesion):
    try:
        yield sesion
        sesion.commit()
    except Exception:
        sesion.rollback()
        raise
```

## bad

```python
try:
    reservar("cafe", 50)
except:
    pass
```

It catches everything, even Ctrl+C (KeyboardInterrupt), and nobody finds out about the failure.

## good

```python
try:
    reservar("cafe", 50)
except StockInsuficiente as e:
    logger.warning("Sin stock: %s", e)
    raise ErrorDePedido("No se pudo reservar") from e
```

You catch what you expect and keep the original cause with `from e`.

## bridge:typescript

`try/catch/finally` ≈ `try/except/finally`; `throw` → `raise`; `catch (e)` → `except Tipo as e`. `with` has no classic equivalent in JS; the closest is `using` (explicit resource management, TS 5.2+). Python prefers the EAFP style: try and catch, instead of checking everything beforehand.

## interview

I catch specific exceptions, never a bare except. I use else for code that should only run if there was no error and finally for mandatory cleanup. For business errors I create custom exceptions that inherit from Exception, and I chain causes with raise from. For resources like files, connections or transactions I use context managers with with, which guarantee release even if there's an exception.

## myths

- A bare `except:` without a type also catches `SystemExit` and `KeyboardInterrupt`.
- Not knowing the try's `else`: it separates the code that can fail from the code that only runs if everything went well.
- Re-raising with `raise e` instead of a bare `raise` changes the traceback's point of origin.
- Inheriting from `BaseException` instead of `Exception`.
