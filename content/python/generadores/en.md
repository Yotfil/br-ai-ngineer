---
title: Generators and yield
short: Generators and yield
summary: A generator hands out values one at a time, when asked, without keeping them all in memory. It can only be read once.
concepts:
  generador:
    name: generator
    aliases:
      - generador
  yield:
    name: yield
    aliases: []
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: |-
          g = (x * 2 for x in range(3))
          print(list(g))
          print(list(g))
        options:
          - "[0, 2, 4] and [0, 2, 4]"
          - "[0, 2, 4] and []"
          - "[2, 4, 6] and []"
          - Error
        answer: 1
        why: 'The first `list(g)` asks the generator for all its values, and the generator does not start over: when the second `list(g)` asks for more, it has none left. And `range(3)` starts at 0, so the doubles are 0, 2 and 4.'
---

## definition

A **generator** hands out values one at a time, only when the next one is requested, instead of creating them all at once in a list. It is created with a function that uses **`yield`**: `yield` hands out a value and leaves the function paused, right there, until another one is requested. That is why it takes almost no memory, even if there are millions of values, but it can only be read once.

## analogy

A barista who makes each coffee when you ask for it, instead of leaving a hundred coffees ready on the counter. The barista is the generator, each coffee handed out is a `yield`, and asking for the next one is `next()`. Between one order and the next, the barista waits where they left off (the pause), and when the day's orders run out, they do not start over (the generator is exhausted).

## problem

If you want to add up the subtotals of a million lines and you first store them all in a list, you use memory for a million numbers that you will only use once. With a generator, each number is calculated, added and discarded. And if you do not know it gets exhausted, reading it twice gives an empty result, with no error at all.

## code:example

### Step 1. `yield` hands out a value and leaves the function paused

A function with `yield` inside is a generator function. A `for` asks it for the values one by one.

```python
def contar_hasta(n):
    i = 1
    while i <= n:
        yield i            # hands out i and stays paused here until another one is requested
        i += 1

for numero in contar_hasta(3):
    print(numero)
# 1
# 2
# 3
```

### Step 2. Calling the function does not run its body

Calling it returns a generator and runs nothing. `next()` asks it for the next value: the function runs up to the next `yield` and stops again.

```python
def preparar():
    print("preparing café")
    yield "café"
    print("preparing taza")
    yield "taza"

g = preparar()             # prints nothing: the function has not started yet
print(next(g))
# preparing café
# café
print(next(g))             # continues right after the first yield
# preparing taza
# taza
```

### Step 3. A generator expression: a comprehension with parentheses

With parentheses instead of brackets, a comprehension ([[comprehensions]]) gives a generator. `range(3)` gives the numbers 0, 1 and 2, and `list()` asks the generator for all its values and stores them in a list.

```python
dobles = (x * 2 for x in range(3))     # it has not calculated any yet
print(list(dobles))
# [0, 2, 4]
```

### Step 4. A generator gets exhausted

Once it has handed out everything, it is empty and does not start over.

```python
print(list(dobles))                    # the same generator from step 3: it has nothing left
# []
print(next(dobles))                    # asking for one more is an error
# StopIteration
```

### Step 5. It does not keep the values in memory

`sys.getsizeof()` says how many bytes an object takes up, without counting the objects it holds inside.

```python
import sys

lista = [n * 2 for n in range(1_000_000)]     # a million numbers, already calculated
generador = (n * 2 for n in range(1_000_000)) # none calculated yet
print(sys.getsizeof(lista), sys.getsizeof(generador))
# 8448728 208
```

The list takes about 8 MB in its structure alone, and the generator, 208 bytes, no matter how many values there are (figures measured with Python 3.14).

### Step 6. In the project: the total without creating any list

```python
# app/pedidos/service.py
from app.pedidos.models import LineaPedido      # taken for granted: the model of an order line

def calcular_total(lineas: list[LineaPedido]) -> int:
    return sum(linea.cantidad * linea.precio_unitario for linea in lineas)   # no brackets
```

It is the comprehension from [[comprehensions]] without brackets: `sum()` asks the generator for each subtotal and adds it up, without creating the list. `POST /v1/pagos` calls it to know how much to charge. In the store there is also a function with `yield`: `get_session`, in `app/db.py`, hands out the database session and closes it once the response has gone out ([[inyeccion-con-depends]]).

## bad

```python
precios = [38000, 25000, 120000]
con_descuento = (precio * 90 // 100 for precio in precios)   # a generator
print(max(con_descuento))       # max() returns the largest... and exhausts the generator
print(sum(con_descuento))       # it has nothing left to add
# 108000
# 0
```

There is no error: the sum comes out 0 because `max()` already asked for all the values. You notice it when a total comes out wrong and nothing in the code tells you why.

## good

```python
precios = [38000, 25000, 120000]
con_descuento = [precio * 90 // 100 for precio in precios]   # a list
print(max(con_descuento))
print(sum(con_descuento))       # a list can be read as many times as needed
# 108000
# 164700
```

A single change: brackets instead of parentheses. If you are going to read the values more than once, you need a list.

## bridge:typescript

JavaScript has the same generators, with `function*` and `yield`, and they also stay paused until the next `next()`. The difference that confuses most is in that `next()`: in JavaScript it returns an object `{ value, done }`, and when it finishes it gives `done: true`; in Python it returns the value directly and, when there are no more, it raises `StopIteration`. Also, Python has no asterisk: any `def` with a `yield` inside is already a generator function.

## interview

A generator produces values one at a time, when asked, instead of creating them all in a list. It is created with a function that uses `yield`, which hands out a value and leaves the function paused until the next `next()`, or with a generator expression, which is a comprehension with parentheses. It takes almost no memory even if there are millions of values, but it can only be read once: afterwards it is exhausted. In FastAPI, a dependency with `yield`, like `get_session`, uses that same pause to close the session once the response has gone out.

## myths

- **"Calling a function with `yield` runs its code."** No: it returns a generator, and the body does not run until someone asks for the first value, with `next()` or with a `for`. In step 2, `preparar()` prints nothing until the first `next(g)`.
- **"`yield` is the same as `return`."** `return` ends the function and does not come back to it. `yield` hands out a value and leaves it paused: the next time it continues on the following line, with its variables as they were.
- **"A generator can be read again from the start."** It gets exhausted: once it has handed out everything, every new attempt gives empty, with no error. To read the values again, call the function again or store them in a list.
- **"`(x * 2 for x in precios)` is a tuple."** Parentheses with a `for` inside create a generator: `type()` says `<class 'generator'>`. A tuple is created with `tuple(...)`.
