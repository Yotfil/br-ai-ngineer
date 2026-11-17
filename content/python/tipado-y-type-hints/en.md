---
title: Dynamic typing and type hints
short: Typing and type hints
summary: In Python the type belongs to the value, not the variable. Type hints say what type you expect, but Python does not check them.
concepts:
  tipado-dinamico:
    name: dynamic typing
    aliases:
      - tipado dinámico
  type-hints:
    name: type hints
    aliases: []
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: |-
          def doble(n: int) -> int:
              return n * 2

          print(doble("ha"))
        options:
          - TypeError
          - haha
          - "0"
          - None
        answer: 1
        why: 'Python does not check the annotation `n: int`: it runs the function with the text it receives. And with a text, `*` does not multiply: it repeats the text as many times as the number says.'
      - q: What does it print?
        code: print(bool(""), bool("0"), bool([0]))
        options:
          - False False False
          - False True True
          - True True True
          - False False True
        answer: 1
        why: 'Python only treats as false what is empty or equal to zero. `""` is empty, but `"0"` is a text with one character and `[0]` is a list with one element: they are not empty, even though what they contain is a zero.'
---

## definition

In Python the type belongs to the value, not the variable: the same variable can hold a number and, later, a text. This is called **dynamic typing**.

**Type hints** (type annotations) are labels you write in the code to say what type you expect, such as `precio: int`. Python does not check them when it runs: other tools use them, such as the editor or FastAPI.

## analogy

The boxes of a move. A box (the variable) can carry plates today and books tomorrow: what has a type is what goes inside (the value). On the outside you stick a label (the type hint) that says what it should carry, but the truck (Python when it runs) does not read it and carries the box anyway. Whoever unpacks (the editor or FastAPI) does read it, to know what to expect.

## problem

Without annotations, whoever reads `def obtener_producto(id)` does not know whether `id` is a number or a text, and the editor cannot help you either. In FastAPI it is worse: without `id: int`, the `id` from the URL arrives as a text and nobody checks that it is a number. And the other way around: if you believe the annotation protects you when the code runs, a text where you expected a number goes through without any warning.

## code:example

### Step 1. The type belongs to the value, not the variable

`type()` tells you what type a value is: `int` is a whole number and `str`, a text.

```python
pedido = 1042
print(type(pedido))
# <class 'int'>

pedido = "1042"                  # the same variable, now with a text: Python does not complain
print(type(pedido))
# <class 'str'>
```

### Step 2. Python does not mix types on its own

```python
cantidad = "2"                   # it arrived as a text, for example from a form
print(cantidad + 1)
# TypeError: can only concatenate str (not "int") to str
```

Python does not guess whether you wanted to add numbers or join texts: it raises a `TypeError`, a type error. To add, you convert the text yourself with `int()`:

```python
print(int(cantidad) + 1)         # int() converts the text "2" into the number 2
# 3
```

That Python does not convert types on its own is called **strong typing**. It does not clash with dynamic typing: the variable has no type, but the value does not change type by itself.

### Step 3. An annotation says what type you expect

After a parameter, `: int` says what type you expect; after the parentheses, `-> int` says what the function returns. In a list, the type of what it holds goes between square brackets: `list[int]` is a list of integers.

```python
def total_linea(cantidad: int, precio: int) -> int:
    return cantidad * precio

def subtotal(totales: list[int]) -> int:
    return sum(totales)                    # sum() adds up all the elements of the list

print(subtotal([total_linea(2, 38000), total_linea(1, 25000)]))   # two cafés and one taza
# 101000
```

### Step 4. Python does not check the annotation

```python
precio: int = "38000"            # the annotation says int, but the value is a text
print(type(precio))
# <class 'str'>

print(total_linea(3, precio))    # it does not complain here either: the text goes into the function
# 380003800038000
```

There is no error. With a text, `*` does not multiply: it repeats the text as many times as the number says.

### Step 5. The annotation stays stored for whoever wants to read it

Python does not use annotations, but it does not delete them either: they stay stored in the function, and `get_type_hints()` shows them.

```python
from typing import get_type_hints

print(get_type_hints(total_linea))
# {'cantidad': <class 'int'>, 'precio': <class 'int'>, 'return': <class 'int'>}
```

mypy and pyright read those annotations without running the code, and warn you if you call `total_linea` with a text. FastAPI reads them while the program runs.

### Step 6. In the project: FastAPI converts and validates the id

```python
# app/productos/router.py
from fastapi import APIRouter
from app.productos import repository     # taken for granted: the product queries

router = APIRouter()

@router.get("/v1/productos/{id}")
def obtener_producto(id: int):           # FastAPI reads this annotation when it registers the route
    return repository.buscar(id)         # here id is already a number: 7, not "7"
```

When someone requests `GET /v1/productos/7`, the `7` arrives in the URL as a text: FastAPI converts it into the number 7, as the annotation says, and calls the function. With `GET /v1/productos/abc` it responds 422, the code for data that is not valid, without running it. How routes are declared is in [[rutas-y-parametros]].

## bad

```python
def total_linea(cantidad: int, precio: int) -> int:
    return cantidad * precio

precio = "38000"                         # this is how it arrives read from a file: as a text
total = total_linea(2, precio)           # the annotation says int, but nobody checked it
print(total)
# 3800038000
```

No error comes out: the total is a text with the price repeated. You notice it later and somewhere else, when that total is used as if it were a number.

## good

```python
def total_linea(cantidad: int, precio: int) -> int:
    return cantidad * precio

precio = int("38000")                    # converted on arrival: from here on it is a real int
total = total_linea(2, precio)
print(total)
# 76000
```

A single change: `int()` converts the text as soon as it arrives, and the annotation tells the truth again. In an endpoint it is not needed: FastAPI does that conversion, as in step 6.

## bridge:typescript

Annotations are written almost the same as in TypeScript: `precio: int` versus `precio: number`. The difference that confuses people most: TypeScript checks the types when it compiles and then erases them from the JavaScript that runs; Python never checks them by itself, but keeps them in the function while the program runs. That is why FastAPI can convert and validate from `id: int`, something that in TypeScript needs separate code that checks the data when it runs.

## interview

Python has dynamic typing: the type belongs to the value, not the variable, and the same variable can hold a number and then a text. It is also strong: it does not convert types on its own, so `"1" + 1` raises `TypeError`. Type hints say what type you expect in variables, parameters and return values, but Python does not check them when it runs; tools such as mypy or pyright check them, without running the code. Unlike TypeScript, annotations are not erased: they stay in the function, and FastAPI reads them to convert and validate the data of each request.

## myths

- **"If I annotate `precio: int`, Python rejects a text."** No: Python does not look at annotations when it runs, and `precio: int = "38000"` works without any warning. Something else does the checking: mypy or pyright before running, or FastAPI with the data that reaches an endpoint.
- **"`"1" + 1` gives `"11"`, as in JavaScript."** In Python it is a `TypeError`, because it does not join a text with a number on its own. You convert yourself: `int("1") + 1` gives `2`, and `"1" + str(1)` gives `"11"`, because `str()` converts to text.
- **"An empty list counts as true, as in JavaScript."** Not in Python: in an `if`, what is empty or equal to zero counts as false. `bool()` tells you how a value counts: `bool([])`, `bool("")` (the empty text), `bool(0)` and `bool(None)` give `False`, and `None` is the value that means "nothing". On the other hand, `"0"` and `[0]` give `True`: they are not empty, even though what they contain is a zero.
