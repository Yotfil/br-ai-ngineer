---
title: "Comparaciones clásicas: is vs ==, copias, mutabilidad"
short: is, ==, copias
summary: "== compara valor (llama a __eq__); is compara identidad: si es el mismo objeto en memoria."
concepts:
  is-vs-igual:
    name: is vs. ==
    aliases: []
  copia-superficial-y-profunda:
    name: copia superficial y profunda
    aliases:
      - shallow and deep copy
      - deepcopy
      - shallow copy
      - deep copy
  mutabilidad:
    name: mutabilidad
    aliases:
      - mutability
exercises:
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
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
        why: Mismo contenido, distintos objetos.
      - q: ¿Qué imprime?
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
        why: "`* 2` sobre la lista externa repite la misma referencia a la fila."
  - type: classify
    prompt: ¿Mutable o inmutable?
    categories:
      - mutable
      - inmutable
    items:
      - text: list
        category: mutable
        why: append, pop y asignación por índice.
      - text: tuple
        category: inmutable
        why: No se puede reasignar un elemento.
      - text: str
        category: inmutable
        why: Cada operación crea un string nuevo.
      - text: dict
        category: mutable
        why: Se agregan y cambian claves.
      - text: frozenset
        category: inmutable
        why: Versión inmutable de set.
---

## definition

`==` compara valor (llama a `__eq__`); `is` compara identidad, es decir, si es el mismo objeto en memoria. Mutables: list, dict, set y la mayoría de objetos. Inmutables: int, float, str, tuple, frozenset. La **copia superficial** duplica el contenedor pero comparte lo de adentro; la **profunda** lo copia todo de forma recursiva.

## analogy

`is` pregunta si es la misma taza física; `==` pregunta si las dos tazas tienen el mismo café.

## problem

Confundir referencia con copia produce bugs fantasma: modificas el pedido de un cliente y cambia el de otro. Usar `is` para comparar valores funciona a veces por casualidad y falla en producción.

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

== None se puede sobrescribir; is con strings depende de detalles del intérprete; la última línea crea tres referencias a la misma fila.

## good

```python
if estado is None: ...
if nombre == "Ana": ...
tablero = [[0] * 3 for _ in range(3)]
```

is solo para None, True y False (singletons); comprehension para filas independientes.

## bridge:typescript

`is` se parece a `===` entre objetos (misma referencia). Pero `==` en Python compara contenido: `[1] == [1]` es True, mientras que en JS `[1] === [1]` es false. El spread `{...obj}` de JS es copia superficial, igual que `dict.copy()`, y `structuredClone` ≈ `copy.deepcopy`.

## interview

== compara valores y is compara identidad. Uso is solo con singletons como None. Las listas, diccionarios y sets son mutables; los números, strings y tuplas son inmutables, por eso las tuplas pueden ser claves de diccionario. Asignar no copia: crea otra referencia. Una copia superficial duplica el contenedor y comparte los objetos internos; si hay estructuras anidadas que voy a modificar, uso deepcopy.

## myths

- `a = b = []` crea una sola lista con dos nombres.
- `[[0] * 3] * 3`: cambiar una fila cambia las tres.
- `is` con enteros pequeños (-5 a 256) «funciona» por caché de CPython y engaña.
- Las tuplas son inmutables, pero si contienen una lista, esa lista sí cambia.
