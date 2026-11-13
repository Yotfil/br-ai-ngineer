---
title: Comprehensions y generadores
short: Comprehensions y generadores
summary: Una comprehension construye una lista, dict o set en una sola expresión.
concepts:
  comprehension:
    name: comprehension
    aliases: []
  generador:
    name: generador
    aliases:
      - generator
  yield:
    name: yield
    aliases: []
exercises:
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: |-
          g = (x * 2 for x in range(3))
          print(list(g))
          print(list(g))
        options:
          - "[0, 2, 4] y [0, 2, 4]"
          - "[0, 2, 4] y []"
          - "[2, 4, 6] y []"
          - Error
        answer: 1
        why: El generador se agota tras la primera lectura completa.
      - q: ¿Qué imprime?
        code: "print({n: n ** 2 for n in range(3)})"
        options:
          - "[0, 1, 4]"
          - "{0, 1, 4}"
          - "{0: 0, 1: 1, 2: 4}"
          - "{1: 1, 2: 4, 3: 9}"
        answer: 2
        why: Dict comprehension. `range(3)` va de 0 a 2.
---

## definition

Una **comprehension** construye una lista, dict o set en una sola expresión. Un **generador** produce valores de uno en uno bajo demanda con `yield`: no guarda todo en memoria (evaluación perezosa).

## analogy

La comprehension es preparar todos los pedidos y ponerlos en la barra de una vez. El generador es un barista que prepara el siguiente café solo cuando lo pides.

## problem

Cargar millones de filas en una lista para recorrerlas una vez gasta memoria sin necesidad. El generador procesa en streaming.

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

Toda la data vive en memoria al mismo tiempo.

## good

```python
with open("ventas_2026.csv") as f:
    total = sum(len(l) for l in f)   # una línea a la vez
```

Memoria constante, mismo resultado.

## bridge:typescript

La comprehension equivale a `.filter().map()` encadenados. Los generadores existen igual en JS (`function*` y `yield`). Frente a un stream que *empuja* valores hacia ti (push), como un `EventEmitter` o un `ReadableStream`, un generador los entrega cuando tú los pides (pull).

## interview

Una list comprehension crea la lista completa en memoria; una expresión generadora o una función con yield produce los valores de forma perezosa, uno por iteración, y conserva su estado entre llamadas. Uso generadores para procesar archivos grandes o resultados paginados sin cargarlos completos. Hay que recordar que un generador solo se puede recorrer una vez.

## myths

- Un generador se agota: la segunda vez que lo recorres está vacío.
- `(x for x in datos)` es un generador, no una tupla.
- Comprehensions anidadas de tres niveles: si no se lee en voz alta, usa un for normal.
- Llamar a la función generadora no ejecuta nada hasta el primer `next()`.
