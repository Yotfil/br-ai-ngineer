---
title: Decorators
short: Decorators
summary: A decorator is a function that wraps another one to do something before or after it, without changing its code.
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
        why: 'The `print("A")` is inside `deco`, and `deco` runs only once, when Python reads `@deco`: that is why the A comes out before any call. Then `hola()` runs the wrapper `w`, which prints B, calls the original and ends with C.'
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
        why: 'The at sign is a shortcut for an assignment: Python passes the function to `cache` and stores whatever `cache` returns under the same name, `precio`. The function does not run: it only gets wrapped.'
---

## definition

A decorator is a function that **wraps** another one to do something before or after it, without changing its code. It saves you from repeating the same thing (timing, writing logs, checking permissions) in twenty functions.

You only need one prior idea: in Python a function is a value like any other. It can be stored in a variable, passed as an argument and returned from another function.

## analogy

A guard at the door of an office. You go to talk to the accountant (the original function). The guard (the decorator) asks for your ID before you go in and writes down the time when you leave. The accountant works as always and does not know the guard exists.

## problem

Without decorators, the logging or permission code is copied at the start of every function, and the day it changes you have to change it in all of them. With a decorator you write it once and apply it with one line.

## code:example

### Step 1. A function can be passed to another function

```python
def saludar():
    print("hello")

def ejecutar_dos_veces(func):   # func is a function, not its result
    func()
    func()

ejecutar_dos_veces(saludar)     # no parentheses: I pass the function, I do not call it
# hello
# hello
```

### Step 2. A handmade decorator

`avisar` takes a function and returns a new one that calls it inside. That new function is usually called a *wrapper* (`envoltura` in the code).

```python
def avisar(func):            # 1. takes the original function
    def envoltura():         # 2. creates a new function around it
        print("before")
        func()               # 3. calls the original
        print("after")
    return envoltura         # 4. returns the new one, without running it

saludar = avisar(saludar)    # the name "saludar" now points to the wrapper
saludar()
# before
# hello
# after
```

The wrapper still remembers `func` even though `avisar` has finished: that is a closure ([[closure]]).

### Step 3. The at sign is a shortcut for that last assignment

```python
@avisar                      # same as writing: saludar = avisar(saludar)
def saludar():
    print("hello")

saludar()
# before
# hello
# after
```

### Step 4. The version you actually use

The previous version is missing three things: accepting arguments, returning the result and keeping the name of the original function. `*args` and `**kwargs` collect every argument that arrives, however many there are ([[args-kwargs]]).

```python
import functools

def avisar(func):
    @functools.wraps(func)                 # the wrapper keeps the name and the parameters of func
    def envoltura(*args, **kwargs):        # accepts any argument...
        print(f"calling {func.__name__}")      # __name__: the function's name
        resultado = func(*args, **kwargs)  # ...and passes it as is to the original
        return resultado                   # without this return, the caller gets None
    return envoltura
```

It is used as before, now with a function that takes arguments:

```python
@avisar
def sumar(a, b):
    return a + b

print(sumar(2, 3))
# calling sumar
# 5
```

### Step 5. In the project: logging every total calculation

In the store, the `registrar` decorator in `app/core/registro.py` does the same as `avisar`, but writes to the log instead of printing.

```python
# app/pedidos/service.py
from app.core.registro import registrar          # the avisar from step 4, with another name: writes to the log
from app.pedidos.models import LineaPedido

@registrar                                       # every calculation ends up in the log, without touching the function
def calcular_total(lineas: list[LineaPedido]) -> int:
    return sum(linea.cantidad * linea.precio_unitario for linea in lineas)
```

Every time the store calculates the total of an order, `@registrar` leaves a line in the log, and `calcular_total` does not know it exists. If what gets logged changes tomorrow, only `registro.py` is touched.

### Advanced. A decorator that takes arguments

To write `@reintentar(3)` you need one more layer: `reintentar(3)` runs first and returns the real decorator.

```python
import functools

def reintentar(veces):                             # 1. takes the argument
    def decorador(func):                           # 2. the decorator from the previous steps
        @functools.wraps(func)
        def envoltura(*args, **kwargs):
            for intento in range(veces):
                try:
                    return func(*args, **kwargs)   # if it works, it ends here
                except ConnectionError:
                    if intento == veces - 1:       # it was the last attempt:
                        raise                      # let the error out
        return envoltura
    return decorador
```

To see it at work, this `consultar` always fails:

```python
@reintentar(3)               # same as: consultar = reintentar(3)(consultar)
def consultar():
    print("trying...")
    raise ConnectionError("no network")   # simulates a network that never answers

consultar()
# trying...
# trying...
# trying...
# ConnectionError: no network   (after the third attempt, the error gets out)
```

This is how `@app.get("/v1/productos")` works in FastAPI: `app.get("/v1/productos")` returns a decorator, which registers your function as an endpoint and hands it back to you unchanged.

## bad

```python
def avisar(func):
    def envoltura(*args, **kwargs):
        print(f"calling {func.__name__}")
        func(*args, **kwargs)              # calls the original, but throws its result away
    return envoltura

@avisar
def sumar(a, b):
    return a + b

total = sumar(2, 3)
print(total * 2)                           # the error shows up here, far from the decorator
# calling sumar
# TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'
```

Whoever calls `sumar` gets `None`. It does not fail when decorating or when calling: you notice later, when another part of the code uses that result, and the error says nothing about the decorator.

## good

```python
def avisar(func):
    def envoltura(*args, **kwargs):
        print(f"calling {func.__name__}")
        return func(*args, **kwargs)       # returns what the original returned
    return envoltura

@avisar
def sumar(a, b):
    return a + b

total = sumar(2, 3)
print(total * 2)
# calling sumar
# 10
```

A single change: `return` in front of the call to the original. In real code you also add `functools.wraps`, as in step 4.

## bridge:typescript

In TypeScript the at sign looks the same, and the decorator is also a function that takes what it decorates and can return a replacement. The difference that confuses people most: in TypeScript you can only decorate a class or what is inside it (methods, properties); in Python, also a standalone function, like `sumar`. And in Python there is nothing else behind it: `@avisar` is exactly `sumar = avisar(sumar)`.

## interview

A decorator is a function that takes another function and returns a wrapper that calls it inside, to do something before or after without changing its code. The at sign is a shortcut: `@avisar` above `def sumar` is equivalent to `sumar = avisar(sumar)`, and the decorator runs only once, when the function is defined; what runs on every call is the wrapper. The wrapper accepts `*args` and `**kwargs`, returns the result of the original and uses `functools.wraps` to keep its name and its parameters, which FastAPI reads. If the decorator takes arguments, like `@reintentar(3)`, there is one more layer: `reintentar(3)` returns the decorator. That is how `@app.get(...)` works in FastAPI: it registers the function as an endpoint.

## myths

- **"The decorator runs every time I call the function."** No: `avisar` runs only once, when Python reads the `def`. What runs on every call is `envoltura`.
- **"`functools.wraps` is optional."** Without it, `sumar.__name__` returns `"envoltura"`, and Python sees the parameters of the wrapper, `(*args, **kwargs)`, instead of `(a, b)`. FastAPI reads the parameters of your function to know what data the endpoint receives: without `wraps`, the ones it finds are not yours.
- **"`@avisar` and `@avisar()` are the same."** The second one first calls `avisar` with no arguments and uses whatever it returns as the decorator. With the `avisar` from step 4 it fails when the function is defined: `TypeError: avisar() missing 1 required positional argument: 'func'`. It only works if the decorator was written to take arguments, like the one in the advanced step.
