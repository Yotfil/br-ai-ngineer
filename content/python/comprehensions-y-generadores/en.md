---
title: Comprehensions and generators
short: Comprehensions and generators
summary: A comprehension builds a list, dict or set in a single expression.
concepts:
  comprehension:
    name: comprehension
    aliases: []
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
        why: The generator is exhausted after the first full read.
      - q: What does it print?
        code: "print({n: n ** 2 for n in range(3)})"
        options:
          - "[0, 1, 4]"
          - "{0, 1, 4}"
          - "{0: 0, 1: 1, 2: 4}"
          - "{1: 1, 2: 4, 3: 9}"
        answer: 2
        why: Dict comprehension. `range(3)` goes from 0 to 2.
---

## definition

A **comprehension** builds a list, dict or set in a single expression. A **generator** produces values one at a time on demand with `yield`: it doesn't keep everything in memory (lazy evaluation).

## analogy

The comprehension is preparing all the orders and putting them on the counter at once. The generator is a barista who makes the next coffee only when you ask for it.

## problem

Loading millions of rows into a list to iterate over them once wastes memory needlessly. The generator processes them in streaming fashion.

## code:example

```python
precios = [12_000, 8_500, 30_000]
con_iva = [round(p * 1.19) for p in precios if p > 10_000]   # [14280, 35700]
por_id = {p.id: p for p in productos}                        # dict comprehension

def leer_pedidos(ruta: str):
    with open(ruta) as f:
        for linea in f:
            yield linea.strip()     # se pausa aquí y entrega un valor

# expresión generadora: paréntesis en vez de corchetes
total_caracteres = sum(len(l) for l in leer_pedidos("pedidos.csv"))
```

## bad

```python
lineas = [l for l in open("ventas_2026.csv")]   # 4 GB en RAM
total = sum(len(l) for l in lineas)
```

All the data lives in memory at the same time.

## good

```python
with open("ventas_2026.csv") as f:
    total = sum(len(l) for l in f)   # una línea a la vez
```

Constant memory, same result.

## bridge:typescript

The comprehension is equivalent to chained `.filter().map()`. Generators exist the same way in JS (`function*` and `yield`). Compared to a stream that *pushes* values to you (push), like an `EventEmitter` or a `ReadableStream`, a generator delivers them when you ask for them (pull).

## interview

A list comprehension creates the whole list in memory; a generator expression or a function with yield produces the values lazily, one per iteration, and keeps its state between calls. I use generators to process large files or paginated results without loading them completely. You have to remember that a generator can only be iterated once.

## myths

- A generator gets exhausted: the second time you iterate over it, it's empty.
- `(x for x in datos)` is a generator, not a tuple.
- Three-level nested comprehensions: if it can't be read aloud, use a normal for.
- Calling the generator function runs nothing until the first `next()`.
