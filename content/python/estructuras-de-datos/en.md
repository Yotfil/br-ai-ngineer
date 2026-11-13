---
title: "Data structures: list, tuple, dict and set"
short: list, tuple, dict, set
summary: "list, tuple, dict and set: when to use each one based on order, mutability, key lookup and uniqueness."
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
        why: "Order and growth: list."
      - text: Price of each product by its SKU code
        category: dict
        why: Lookup by key.
      - text: Unique emails that already received the promo
        category: set
        why: Fast membership and no duplicates.
      - text: Latitude and longitude of a store
        category: tuple
        why: Fixed two-value data.
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
        why: "`.get()` returns `None` if the key is missing, and the set `{1, 1, 2}` ends up with two elements."
---

## definition

**list**: ordered, mutable sequence. **tuple**: ordered, immutable sequence (hashable if its contents are). **dict**: key → value, preserves insertion order and looks up in O(1). **set**: unique, unordered elements, membership in O(1).

## analogy

list is the line of orders at the counter; tuple, the coordinates printed on the receipt (they don't get rewritten); dict, the customer file indexed by ID number; set, the guest list where nobody appears twice.

## problem

Searching with `in` in a list scans everything (O(n)); in a set or dict it's almost instant. Using list for data that shouldn't change invites modifying it by mistake.

## code:example

```python
carrito = ["cafe", "taza", "cafe"]          # list: orden y duplicados
ubicacion = (4.4389, -75.2322)               # tuple: inmutable
stock = {"cafe": 12, "taza": 3}              # dict
categorias = {"bebidas", "accesorios"}       # set

stock.get("filtro", 0)     # 0, sin KeyError
"cafe" in stock            # True en O(1)
set(carrito)               # {'cafe', 'taza'}
precio, cantidad = (25_000, 2)   # desempaquetado de tupla
```

## bad

```python
ids_vip = [ ... 100_000 ids ... ]
for pedido in pedidos:
    if pedido.cliente_id in ids_vip:   # O(n) cada vez
        aplicar_descuento(pedido)
```

With 10,000 orders that's up to a billion comparisons.

## good

```python
ids_vip = set(lista_ids)
for pedido in pedidos:
    if pedido.cliente_id in ids_vip:   # O(1)
        aplicar_descuento(pedido)
```

Same code, different structure, orders of magnitude faster.

## bridge:typescript

**list** ≈ Array. **dict** ≈ object literal or `Map`, but keys must be hashable (you can't use a list as a key). **set** ≈ `Set`. **tuple** ≈ a TS `readonly` tuple, except the immutability really exists at runtime.

## interview

I use a list when I need an ordered collection that will change, a tuple when the data is fixed, like a record or a coordinate, and it can also be a dictionary key. A dictionary to look up by key in constant time and a set when I care about membership or removing duplicates. The choice affects performance: searching a list is O(n) and a set or dict is O(1) on average.

## myths

- `stock["filtro"]` raises `KeyError`; in JS you'd get `undefined`. Use `.get()` when the key may be missing.
- `(1)` is the number 1; the one-element tuple is `(1,)`.
- You use `len(x)`, not `x.length`.
- `{}` creates an empty dict, not a set. The empty set is `set()`.
