---
title: "Data structures: list, tuple, dict and set"
short: list, tuple, dict, set
summary: "A list for what goes in order and changes, a tuple for what is fixed, a dictionary to look up by key, a set to avoid repeats."
concepts:
  list:
    name: list
    aliases: []
  tuple:
    name: tuple
    aliases: []
  dict:
    name: dict
    aliases: []
  set:
    name: set
    aliases: []
exercises:
  - type: classify
    prompt: Classify each case with the most suitable structure.
    categories:
      - list
      - tuple
      - dict
      - set
    items:
      - text: History of an order's statuses, in order
        category: list
        why: The statuses are stored in the order they happened and a new one is added with each change, so you need order and the ability to grow.
      - text: Price of each product by its name
        category: dict
        why: What you do is find a value, the price, from another one, the name, which acts as the key.
      - text: Unique emails that already received the promo
        category: set
        why: Each email must count only once, and what you ask is whether one is already there; the set does not store repeats and answers that without scanning.
      - text: Latitude and longitude of a store
        category: tuple
        why: They are two values that go together and should not change afterwards.
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: |-
          d = {"a": 1}
          print(d.get("b"), len({1, 1, 2}))
        options:
          - KeyError
          - None 3
          - None 2
          - 0 2
        answer: 2
        why: '`get()` does not fail when the key is missing: with no second argument it returns `None`. And a set does not store repeats, so the 1 that appears twice counts only once for `len()`.'
---

## definition

Python has four ways to store several values together. A **list** (`list`) stores them in order and can be changed; a **tuple** (`tuple`) also stores them in order, but cannot be changed. A **dictionary** (`dict`) stores each value under a key, to look it up by that key, and a **set** stores elements with no order and no repeats.

## analogy

A coffee shop. The line of orders at the counter is a list (they arrive in order and the line grows), and the table and the time printed on the receipt are a tuple (they go together and are not rewritten). The menu with the price of each drink is a dictionary (you look up by the name, which is the key, and read the price, which is the value), and the list of regular customers, where nobody appears twice, is a set.

## problem

If you choose badly, the code works, but it becomes slow or breaks. Asking with `in` whether an email is in a list of 100,000 emails scans it from the start every time; in a set the answer is direct. And storing in a list a piece of data that should not change invites modifying it by mistake.

## code:example

### Step 1. A list stores values in order and can change

It is written in square brackets. `append()` adds at the end, `[0]` reads the first element, because counting starts at 0, and `len()` says how many there are.

```python
carrito = ["café", "taza"]
carrito.append("café")           # it can repeat: the list stores what you give it, in order
print(carrito)
# ['café', 'taza', 'café']
print(carrito[0], len(carrito))
# café 3
```

### Step 2. A tuple groups values that go together and do not change

It is written in parentheses. It is used for a fixed piece of data made of several parts, such as a product and its quantity, or the latitude and longitude of a place.

```python
linea = ("café", 2)              # product and quantity: they go together
producto, cantidad = linea       # unpack: each part into its own variable
print(producto, cantidad)
# café 2

linea[1] = 3                     # changing a part is an error: the tuple is not touched
# TypeError: 'tuple' object does not support item assignment
```

### Step 3. A dictionary stores each value under a key

It is written in curly braces, with `key: value`, and you look up by putting the key in square brackets. If the key is missing, Python raises an error: `KeyError`.

```python
precios = {"café": 38000, "taza": 25000}
print(precios["café"])
# 38000

print(precios["molinillo"])      # the molinillo is not in this dictionary
# KeyError: 'molinillo'
```

If the key may be missing, `get()` does not fail: it returns `None`, the value that means "nothing", or whatever you pass as the second argument.

```python
print(precios.get("molinillo"))
# None
print(precios.get("molinillo", 0))
# 0
```

### Step 4. A set stores each element only once

It is created with `set()` from a list, or written in curly braces without `key:`, like `{"café", "taza"}`. It stores neither repeats nor order: that is why it is not read by position, and `productos[0]` would be an error.

```python
carrito = ["café", "taza", "café"]
productos = set(carrito)                 # the repeated café ends up only once
print(len(carrito), len(productos))
# 3 2
```

### Step 5. To know whether something is there, a set does not scan

`in` asks whether a value is there.

```python
emails = ["ana@correo.co", "luis@correo.co"]           # a list
print("luis@correo.co" in emails)                      # compares one by one, from the start
# True

registrados = {"ana@correo.co", "luis@correo.co"}      # a set
print("luis@correo.co" in registrados)                 # goes straight there, without scanning
# True
```

The answer is the same, but not the work: with 100,000 emails, the list may make 100,000 comparisons, while the set, or the keys of a dictionary, take almost the same time however many elements they have. In an interview you say it like this: in a list, `in` is O(n), it grows with the number of elements; in a set or a dictionary it is O(1) on average.

### Step 6. In the project: the lines of an order are a list

```python
# app/pedidos/service.py
from app.pedidos.models import LineaPedido      # taken for granted: the model of an order line

def calcular_total(lineas: list[LineaPedido]) -> int:
    total = 0
    for linea in lineas:                        # the list is traversed in order, one line at a time
        total += linea.cantidad * linea.precio_unitario
    return total
```

An order can have one line or many, and the function goes through all of them: that is why it receives a list. Each line is a `LineaPedido`, and its fields are read with a dot. `POST /v1/pagos` calls it to know how much to charge; in [[generadores]], this loop becomes a single line.

## bad

```python
ids_registrados = list(range(100_000))      # the ids of 100,000 customers, in a list

def esta_registrado(cliente_id: int) -> bool:
    return cliente_id in ids_registrados    # compares one by one until it finds it

print(esta_registrado(99_999))
# True
```

The answer is correct, but each call may compare all 100,000 ids. You notice it when the function is called thousands of times, for example once per order.

## good

```python
ids_registrados = set(range(100_000))       # the same ids, in a set

def esta_registrado(cliente_id: int) -> bool:
    return cliente_id in ids_registrados    # goes straight there, without scanning

print(esta_registrado(99_999))
# True
```

A single change: `set()` instead of `list()`. Now the function takes almost the same time with 100 ids as with 100,000.

## bridge:typescript

The list is similar to an `Array`, the set to a `Set` and the dictionary to an object literal or a `Map`, but its keys cannot be lists: `{["café"]: 1}` gives `TypeError: cannot use 'list' as a dict key (unhashable type: 'list')`, and a tuple, on the other hand, can be a key. The difference that confuses most is in the tuple: in TypeScript, `readonly` is checked only by the compiler and does not exist at runtime; in Python, a tuple cannot be changed even while the program runs.

## interview

I use a list for an ordered collection that is going to change, and a tuple for a fixed piece of data with several parts, which can also be a dictionary key. The dictionary is for looking up a value by its key, and the set is for storing elements without repeats or quickly asking whether one is there. The choice affects performance: with `in`, the list compares one by one, O(n), and the set or the dictionary goes straight there, O(1) on average.

## myths

- **"If the key is missing, the dictionary returns `undefined`, like in JavaScript."** Python has no `undefined`: `precios["molinillo"]` raises `KeyError` and the program stops. If the key may be missing, use `get()`, which returns `None` or the value you pass to it.
- **"`(1)` is a one-element tuple."** It is the number 1 in parentheses: what makes the tuple is the comma. The one-element tuple is written `(1,)`.
- **"`{}` creates an empty set."** It creates an empty dictionary: `type({})` is `dict`. Curly braces only create a set if they hold elements without `key:`, like `{"café"}`; the empty set is created with `set()`.
- **"The size is requested with `carrito.length`, like in JavaScript."** The list has no `length`: it gives `AttributeError: 'list' object has no attribute 'length'`. In Python the size is requested with `len(carrito)`, and it works the same for tuples, dictionaries, sets and texts.
