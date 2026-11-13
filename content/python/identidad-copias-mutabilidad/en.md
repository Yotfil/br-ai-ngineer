---
title: "Classic comparisons: is vs ==, copies, mutability"
short: is, ==, copies
summary: "== compares value (calls __eq__); is compares identity: whether it's the same object in memory."
concepts:
  is-vs-igual:
    name: is vs. ==
    aliases: []
  copia-superficial-y-profunda:
    name: shallow and deep copy
    aliases:
      - copia superficial y profunda
      - deepcopy
      - shallow copy
      - deep copy
  mutabilidad:
    name: mutability
    aliases:
      - mutabilidad
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
        code: |-
          a = [1, 2]
          b = [1, 2]
          print(a == b, a is b)
        options:
          - True True
          - True False
          - False False
          - False True
        answer: 1
        why: Same content, different objects.
      - q: What does it print?
        code: |-
          m = [[0] * 2] * 2
          m[0][0] = 9
          print(m)
        options:
          - "[[9, 0], [0, 0]]"
          - "[[9, 0], [9, 0]]"
          - "[[9, 9], [0, 0]]"
          - Error
        answer: 1
        why: "`* 2` on the outer list repeats the same reference to the row."
  - type: classify
    prompt: Mutable or immutable?
    categories:
      - mutable
      - immutable
    items:
      - text: list
        category: mutable
        why: append, pop and assignment by index.
      - text: tuple
        category: immutable
        why: You can't reassign an element.
      - text: str
        category: immutable
        why: Every operation creates a new string.
      - text: dict
        category: mutable
        why: Keys are added and changed.
      - text: frozenset
        category: immutable
        why: Immutable version of set.
---

## definition

`==` compares value (calls `__eq__`); `is` compares identity, that is, whether it's the same object in memory. Mutable: list, dict, set and most objects. Immutable: int, float, str, tuple, frozenset. A **shallow copy** duplicates the container but shares what's inside; a **deep** copy copies everything recursively.

## analogy

`is` asks whether it's the same physical cup; `==` asks whether both cups have the same coffee.

## problem

Confusing a reference with a copy produces ghost bugs: you modify one customer's order and another's changes. Using `is` to compare values sometimes works by chance and fails in production.

## code:example

```python
import copy

pedido = {"cliente": "Ana", "items": ["cafe", "taza"]}

alias = pedido                       # misma referencia
superficial = pedido.copy()          # o copy.copy(pedido), dict(pedido)
profunda = copy.deepcopy(pedido)

pedido["items"].append("filtro")
superficial["items"]   # ['cafe', 'taza', 'filtro']  ¡la lista es compartida!
profunda["items"]      # ['cafe', 'taza']

[1, 2] == [1, 2]       # True: compara contenido
[1, 2] is [1, 2]       # False: son dos objetos distintos

if cliente is None:    # forma correcta de comparar con None
    ...
```

## bad

```python
if estado == None: ...
if nombre is "Ana": ...
tablero = [[0] * 3] * 3
```

== None can be overridden; is with strings depends on interpreter details; the last line creates three references to the same row.

## good

```python
if estado is None: ...
if nombre == "Ana": ...
tablero = [[0] * 3 for _ in range(3)]
```

is only for None, True and False (singletons); a comprehension for independent rows.

## bridge:typescript

`is` is similar to `===` between objects (same reference). But `==` in Python compares content: `[1] == [1]` is True, whereas in JS `[1] === [1]` is false. JS's spread `{...obj}` is a shallow copy, just like `dict.copy()`, and `structuredClone` ≈ `copy.deepcopy`.

## interview

== compares values and is compares identity. I use is only with singletons like None. Lists, dictionaries and sets are mutable; numbers, strings and tuples are immutable, which is why tuples can be dictionary keys. Assigning doesn't copy: it creates another reference. A shallow copy duplicates the container and shares the inner objects; if there are nested structures I'm going to modify, I use deepcopy.

## myths

- `a = b = []` creates a single list with two names.
- `[[0] * 3] * 3`: changing one row changes all three.
- `is` with small integers (-5 to 256) "works" because of CPython's cache and is misleading.
- Tuples are immutable, but if they contain a list, that list can change.
