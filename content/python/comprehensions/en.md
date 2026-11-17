---
title: "Comprehensions: lists, dicts and sets in one line"
short: Comprehensions
summary: A comprehension builds a list, a dictionary or a set from another collection, in a single line.
concepts:
  comprehension:
    name: comprehension
    aliases: []
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: "print({n: n ** 2 for n in range(3)})"
        options:
          - "[0, 1, 4]"
          - "{0, 1, 4}"
          - "{0: 0, 1: 1, 2: 4}"
          - "{1: 1, 2: 4, 3: 9}"
        answer: 2
        why: 'Braces with `key: value` build a dictionary, not a set or a list. And `range(3)` starts at 0 and stops before 3, so the keys are 0, 1 and 2, each with its square.'
---

## definition

A **comprehension** builds a list, a dictionary or a set from another collection, in a single line: you say what value you want for each element and, if needed, which ones go in. It replaces the loop that creates an empty list and fills it little by little. Square brackets give a list, and braces give a dictionary or a set.

## analogy

An order to the kitchen. Instead of saying "take the first order from table 4, make its coffee, put it on the tray; take the second…" (the loop), you say "one coffee for each order from table 4" (the comprehension). In a single sentence you say what to do with each element (make a coffee) and where they come from (the orders from table 4), and the tray you get is the new list.

## problem

Without comprehensions, building a list from another one takes four lines: the empty list, the `for`, the `if` and the `append`. Whoever reads has to follow all of them to realize that a list is just being built. Misused, the opposite happens: a very long comprehension, or one written only to print, is harder to read than the loop.

## code:example

### Step 1. A loop that builds a list

This is the loop that the comprehension is going to replace: it applies a 10% discount to each price.

```python
precios = [38000, 25000, 120000]
con_descuento = []
for precio in precios:
    con_descuento.append(precio * 90 // 100)    # 10% off; // divides and leaves an integer
print(con_descuento)
# [34200, 22500, 108000]
```

### Step 2. The comprehension says the same in one line

It reads from left to right: "the discounted price, for each price in the list". The square brackets say that the result is a list.

```python
con_descuento = [precio * 90 // 100 for precio in precios]
print(con_descuento)
# [34200, 22500, 108000]
```

### Step 3. With an `if` at the end, only some go in

```python
caros = [precio for precio in precios if precio > 30000]   # the 25000 does not pass the if
print(caros)
# [38000, 120000]
```

### Step 4. With braces, a dictionary or a set

With `key: value` between braces you get a dictionary. `range(3)` gives the numbers 0, 1 and 2, and `**` is the power: `2 ** 2` is 4.

```python
lineas = [("café", 2), ("taza", 1)]
cantidades = {producto: cantidad for producto, cantidad in lineas}   # each tuple is unpacked
print(cantidades)
# {'café': 2, 'taza': 1}

cuadrados = {n ** 2 for n in range(3)}      # braces without "key:": a set
print(cuadrados)
# {0, 1, 4}
```

### Step 5. In the project: the subtotals of an order

```python
# app/pedidos/service.py
from app.pedidos.models import LineaPedido      # taken for granted: the model of an order line

def calcular_total(lineas: list[LineaPedido]) -> int:
    subtotales = [linea.cantidad * linea.precio_unitario for linea in lineas]   # one per line
    return sum(subtotales)                      # sum() adds up all the elements of the list
```

It is the loop from [[estructuras-de-datos]] in one line: the comprehension creates the list of subtotals and `sum()` adds them up. `POST /v1/pagos` calls it to know how much to charge. In [[generadores]] the square brackets are removed, and the list is not even created.

## bad

```python
precios = [38000, 25000, 120000]
resultado = [print(precio) for precio in precios]   # comprehension only to print
print(resultado)
# 38000
# 25000
# 120000
# [None, None, None]
```

It prints fine, but it also builds a list of `None`, which is what `print` returns, and nobody uses it. Whoever reads expects a useful list and does not find it.

## good

```python
precios = [38000, 25000, 120000]
for precio in precios:                  # no list is needed: a loop is enough
    print(precio)
# 38000
# 25000
# 120000
```

A normal `for`: the comprehension is kept for when the result is the collection.

## bridge:typescript

A comprehension with an `if` does what `.filter()` and `.map()` chained on an array do: first it keeps the elements that pass the condition and then it calculates the value of each one. The difference that confuses people most is the order: in Python the `if` is written at the end, but it is checked before calculating. And the same form works for a dictionary, which in JavaScript would need something like `Object.fromEntries`.

## interview

A comprehension builds a list, a dictionary or a set from another collection in a single expression: what value, for each element and, optionally, under what condition. Square brackets give a list; braces with `key: value`, a dictionary; and braces without a key, a set. It replaces the loop that creates an empty list and fills it with `append`, and it reads better as long as it is short. If it is used only for an effect, such as printing, a normal `for` is better.

## myths

- **"The comprehension calculates first and filters later."** The `if` is written at the end, but it is checked before calculating each value: `[100 // n for n in [5, 0, 2] if n != 0]` gives `[20, 50]`, never dividing by zero.
- **"Braces always give a dictionary."** Only if there is `key: value`. `{n * 2 for n in [1, 1, 2]}` is a set, `{2, 4}`, and that is why it loses the repeated ones.
- **"`range(3)` counts from 1 to 3."** It starts at 0 and stops before the number you give it: `list(range(3))` is `[0, 1, 2]`. To start at 1 you write `range(1, 4)`.
- **"With parentheses you get a tuple."** `(n * 2 for n in precios)` is neither a tuple nor a list: it is a generator, which gives the values one at a time and is studied in [[generadores]].
