---
title: Decorators
short: Decorators
summary: A decorator is a function that takes another function and returns one that wraps it to add behavior without touching its code.
concepts:
  decorador:
    name: decorator
    aliases:
      - decorador
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: In what order is it printed?
        code: |-
          def deco(f):
              print("A")
              def w():
                  print("B")
                  f()
                  print("C")
              return w

          @deco
          def hola():
              print("hola")

          hola()
        options:
          - B hola C
          - A B hola C
          - A hola
          - B A hola C
        answer: 1
        why: '"A" is printed at decoration time, before anything is called. Then the call runs the wrapper: B, hola, C.'
  - type: choice
    prompt: Quick question
    items:
      - q: What is `@cache` above `def precio()` equivalent to?
        options:
          - "`precio = cache`"
          - "`precio = cache(precio)`"
          - "`cache = precio(cache)`"
          - "`precio()` runs on import"
        answer: 1
        why: The at sign applies the decorator and reassigns the name with whatever it returns.
---

## definition

A decorator is a function that takes a function and returns another that wraps it, to add behavior before or after without touching its code. `@deco` above `def f` is syntactic sugar for `f = deco(f)`.

## analogy

Gift wrap: the product is the same, but before reaching it you go through the wrapping (logs, permissions, timing).

## problem

Without decorators you repeat the same logging, caching or permission code in every function. Badly written, they break the function: they return None or erase its signature.

## code:example

```python
import functools
import time

def medir_tiempo(func):
    @functools.wraps(func)          # conserva nombre, docstring y firma
    def wrapper(*args, **kwargs):
        inicio = time.perf_counter()
        resultado = func(*args, **kwargs)
        print(f"{func.__name__} tardó {time.perf_counter() - inicio:.3f}s")
        return resultado
    return wrapper

@medir_tiempo
def calcular_total(pedido_id: int) -> float:
    ...

# Decorador con argumentos: una capa más
def reintentar(veces: int):
    def decorador(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for intento in range(veces):
                try:
                    return func(*args, **kwargs)
                except ConnectionError:
                    if intento == veces - 1:
                        raise
        return wrapper
    return decorador
```

## bad

```python
def log(func):
    def wrapper(*args, **kwargs):
        print("llamando", func.__name__)
        func(*args, **kwargs)        # falta return
    return wrapper                   # falta functools.wraps
```

The decorated function returns None and loses its name and signature. FastAPI reads the signature to know the parameters: without wraps it breaks.

## good

```python
def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("llamando", func.__name__)
        return func(*args, **kwargs)
    return wrapper
```

It returns the result and keeps the metadata.

## bridge:typescript

In TypeScript, a class decorator (like `@Entity` in TypeORM) usually attaches *metadata* to the class for a library to read later. In Python the decorator is a normal function that runs at definition time and *replaces* the object with whatever it returns. `@app.get("/productos")` in FastAPI registers your function in the router and hands it back to you unchanged.

## interview

A decorator is a higher-order function: it takes a function and returns another that wraps it. The at-sign syntax is equivalent to reassigning the function with the decorator's result. Inside I define a wrapper that accepts args and kwargs, do something before, call the original, do something after and return its result, using functools.wraps so as not to lose the name or the signature. FastAPI uses them to register routes.

## myths

- Forgetting `return resultado` in the wrapper.
- Forgetting `@functools.wraps`.
- Confusing `@deco` with `@deco()`: the second requires a decorator with arguments.
- Believing the decorator runs on every call: the decorator runs once at definition; the wrapper runs on every call.
