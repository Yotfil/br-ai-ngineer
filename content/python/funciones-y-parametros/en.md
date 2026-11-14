---
title: "Functions: parameters, *args, **kwargs and default values"
short: Functions and parameters
summary: A function takes arguments by position or by name; *args and **kwargs accept any number of them, and a default value lets you leave one out.
concepts:
  args-kwargs:
    name: "*args and **kwargs"
    aliases:
      - "*args y **kwargs"
      - args
      - kwargs
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
        why: The list `[]` was created only once, when `f` was defined. The first call added the 1 to it, and the second receives that same list, with the 1 still inside.
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
        why: "`*a` collects the arguments that arrive by position into a tuple, which is why it prints with parentheses. `x=3` has a name, so it does not go into the tuple: it goes into the dictionary `k`."
---

## definition

A function receives its data through **parameters**: the names in parentheses in its `def`. When you call it, each value you pass (an argument) arrives by position, `crear_linea("café", 2)`, or by name, `crear_linea(producto="café", cantidad=2)`; and a parameter with a default value can be left out.

`*args` and `**kwargs` are used to accept any number of arguments: `*args` collects the ones that arrive by position into a tuple ([[tuple]]), and `**kwargs`, the ones that arrive by name, into a dictionary.

## analogy

An order form. The fixed fields (the parameters) are always filled in, in their order or by saying which is which (by name). A field that comes already filled in, like "quantity: 1" (the default value), you only touch if you want something else. And at the end there is room for as many products as you like (`*args`) and a named box for remarks, like "wrap: yes" (`**kwargs`).

## problem

Without `*args` or `**kwargs`, a function that accepts any number of prices forces you to put them in a list first, and you could not forward to another function arguments you do not know. And a badly chosen default value causes a classic error: `def agregar(producto, carrito=[])` uses the same cart in every call, and what one customer adds shows up in another customer's cart.

## code:example

### Step 1. By position or by name

```python
def crear_linea(producto, cantidad):
    return f"{cantidad} x {producto}"

print(crear_linea("café", 2))                     # by position: the order matters
# 2 x café
print(crear_linea(cantidad=2, producto="café"))   # by name: the order does not matter
# 2 x café
```

### Step 2. A default value makes a parameter optional

```python
def crear_linea(producto, cantidad=1):   # if you do not pass cantidad, it is 1
    return f"{cantidad} x {producto}"

print(crear_linea("taza"))
# 1 x taza
print(crear_linea("taza", 3))
# 3 x taza
```

The default value is created only once, when Python reads the `def`. With a number it does not matter; with a list it does, and you will see it below, in "Risky".

### Step 3. `*args` collects the arguments by position into a tuple

```python
def total(*precios):          # precios: a tuple with everything that arrives by position
    print(precios)
    return sum(precios)

print(total(38000, 25000))
# (38000, 25000)
# 63000
print(total())                # also with none: the tuple is left empty
# ()
# 0
```

### Step 4. `**kwargs` collects the arguments by name into a dictionary

```python
def crear_pedido(cliente, **extra):   # extra: a dict with the leftover arguments passed by name
    print(cliente, extra)

crear_pedido("Ana", envolver=True, nota="it's a gift")
# Ana {'envolver': True, 'nota': "it's a gift"}
```

### Step 5. When calling, `*` and `**` do the opposite: they spread

With the `crear_linea` from step 2:

```python
datos = ["café", 2]
print(crear_linea(*datos))        # * spreads the list: crear_linea("café", 2)
# 2 x café

opciones = {"producto": "taza", "cantidad": 3}
print(crear_linea(**opciones))    # ** spreads the dict: crear_linea(producto="taza", cantidad=3)
# 3 x taza
```

This is how a decorator forwards the arguments it receives without knowing them: `func(*args, **kwargs)` ([[decoradores]]).

### Step 6. In the project: default values in pagination

In the store, `GET /v1/productos` returns the products 20 at a time. FastAPI reads the parameters of the function: whatever does not come in the URL takes its default value.

```python
# app/productos/router.py
from fastapi import APIRouter

from app.productos import repository     # taken for granted: the product queries

router = APIRouter()

@router.get("/v1/productos")             # this function handles GET /v1/productos
def listar_productos(pagina: int = 1, tamano: int = 20):
    # GET /v1/productos           → pagina=1, tamano=20
    # GET /v1/productos?pagina=3  → pagina=3, tamano=20
    return repository.listar(pagina, tamano)
```

FastAPI calls `listar_productos` every time a client asks for the catalog. The default values are numbers, which cannot be modified ([[mutabilidad]]), so sharing them between calls is not a problem. How FastAPI turns the URL into arguments is shown in [[rutas-y-parametros]].

## bad

```python
def agregar(producto, carrito=[]):   # this list is created once, when the def is read
    carrito.append(producto)
    return carrito

print(agregar("café"))               # Ana's cart
# ['café']
print(agregar("taza"))               # Luis's, which should start empty
# ['café', 'taza']
```

Every call without `carrito` shares the same list: the `café` Ana added shows up in Luis's cart. It raises no error; you notice it when a customer sees products they did not order.

## good

```python
def agregar(producto, carrito=None):   # None cannot be modified: it is safe to share
    if carrito is None:
        carrito = []                   # a new list in every call
    carrito.append(producto)
    return carrito

print(agregar("café"))
# ['café']
print(agregar("taza"))
# ['taza']
```

The default value becomes `None` and the list is created inside, in every call. It is the solution that the Python documentation proposes.

## bridge:typescript

`*args` is TypeScript's rest parameter (`...precios: number[]`), with one difference: in Python it arrives as a tuple, not as an array. `**kwargs` has no direct equivalent: in TypeScript you would pass an options object. When calling, `f(*lista)` is the spread `f(...lista)`. And what confuses people most: in TypeScript the default value is evaluated on every call, so `carrito = []` is safe; in Python, it is not.

## interview

A function receives arguments by position or by name, and a parameter with a default value can be left out. `*args` collects the leftover arguments passed by position into a tuple and `**kwargs`, the ones that have a name, into a dictionary; when calling, `*` and `**` do the opposite and spread a list or a dictionary into arguments. They are used for flexible functions and to forward arguments to another function without knowing them. The classic error is a list as a default value: it is created only once when the function is defined and every call shares it, so you use `None` and create the list inside.

## myths

- **"The default value is calculated on every call."** It is calculated only once, when Python reads the `def`. With a number it makes no difference; with a list or a dictionary, every call shares the same object, as in "Risky".
- **"`*args` is a list."** It is a tuple: you cannot change it, and `precios.append(1000)` raises `AttributeError: 'tuple' object has no attribute 'append'`. If you need a list, convert it with `list(precios)`.
- **"The names `args` and `kwargs` are mandatory."** What counts is the star and the two stars; the name is a habit. That is why `def total(*precios)` from step 3 works the same.
