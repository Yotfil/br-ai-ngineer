---
title: "Functions: *args, **kwargs, defaults, lambdas and closures"
short: Functions and closures
summary: Python accepts positional, keyword and default-valued parameters.
concepts:
  args-kwargs:
    name: "*args and **kwargs"
    aliases:
      - "*args y **kwargs"
      - args
      - kwargs
  closure:
    name: closure
    aliases: []
  lambda:
    name: lambda
    aliases: []
  default-mutable:
    name: mutable default argument
    aliases:
      - default mutable
      - argumento mutable por defecto
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: |-
          def f(x, lista=[]):
              lista.append(x)
              return lista

          f(1)
          print(f(2))
        options:
          - "[2]"
          - "[1, 2]"
          - "[1]"
          - Error
        answer: 1
        why: The default list was created once and keeps the 1 from the previous call.
      - q: What does it print?
        code: |-
          def g(*a, **k):
              print(a, k)

          g(1, 2, x=3)
        options:
          - "[1, 2] {'x': 3}"
          - "(1, 2) {'x': 3}"
          - (1, 2, 3) {}
          - 1 2 x=3
        answer: 1
        why: "`*a` is a tuple and `**k` a dict."
---

## definition

Python accepts positional, keyword and default-valued parameters. `*args` collects extra positional arguments into a tuple and `**kwargs` collects extra keyword arguments into a dict. **Lambdas** are single-expression functions and **closures** are functions that remember variables from the scope where they were created.

## analogy

`*args` is a bag that fits as many products as you want; `**kwargs` is the “notes” box on the form: optional named fields.

## problem

The default value is evaluated **only once**, when the function is defined. If it's mutable (list, dict), all calls share the same object.

## code:example

```python
def crear_pedido(cliente_id: int, *productos: str, urgente: bool = False, **extra):
    return {"cliente": cliente_id, "items": productos, "urgente": urgente, **extra}

crear_pedido(7, "cafe", "taza", urgente=True, nota="sin azúcar")
# {'cliente': 7, 'items': ('cafe', 'taza'), 'urgente': True, 'nota': 'sin azúcar'}

ordenados = sorted(productos, key=lambda p: p.precio)

def contador_pedidos():
    total = 0
    def siguiente():
        nonlocal total       # sin esto: UnboundLocalError
        total += 1
        return total
    return siguiente
```

## bad

```python
def agregar_item(item, carrito=[]):
    carrito.append(item)
    return carrito
```

Every call without a cart reuses the same list and drags along the previous items.

## good

```python
def agregar_item(item, carrito: list | None = None):
    if carrito is None:
        carrito = []
    carrito.append(item)
    return carrito
```

A new list is created on every call.

## bridge:typescript

`*args` ≈ rest `...args`; `**kwargs` ≈ options object; `f(*lista)` and `f(**dic)` ≈ spread. Closures work like in JS, but to *reassign* an outer variable you need `nonlocal`. In JS defaults are evaluated on every call; in Python they aren't.

## interview

args collects extra positional arguments as a tuple and kwargs the keyword ones as a dictionary; they're used for flexible functions or to forward arguments, as decorators do. A classic bug is putting a list as a default value: it's evaluated only once when the function is defined and shared between calls, so the correct pattern is to use None and create the list inside.

## myths

- Mutable default: Python's most famous interview bug.
- Forgetting `nonlocal` when reassigning inside a closure.
- Lambdas only allow one expression, no statements or annotations.
- Closures in a loop capture the variable, not the value (like `var` in JS).
