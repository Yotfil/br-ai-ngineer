---
title: "Funciones: *args, **kwargs, defaults, lambdas y closures"
short: Funciones y closures
summary: Python acepta parámetros posicionales, con nombre y con valor por defecto.
concepts:
  args-kwargs:
    name: "*args y **kwargs"
    aliases:
      - "*args and **kwargs"
      - args
      - kwargs
  closure:
    name: closure
    aliases: []
  lambda:
    name: lambda
    aliases: []
  default-mutable:
    name: default mutable
    aliases:
      - mutable default argument
      - argumento mutable por defecto
exercises:
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
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
        why: La lista por defecto se creó una vez y conserva el 1 de la llamada anterior.
      - q: ¿Qué imprime?
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
        why: "`*a` es una tupla y `**k` un dict."
---

## definition

Python acepta parámetros posicionales, con nombre y con valor por defecto. `*args` recoge posicionales extra en una tupla y `**kwargs` recoge los nombrados extra en un dict. Las **lambdas** son funciones de una sola expresión y los **closures** son funciones que recuerdan variables del ámbito donde se crearon.

## analogy

`*args` es una bolsa donde caben cuantos productos quieras; `**kwargs` es la casilla de «observaciones» del formulario: campos opcionales con nombre.

## problem

El valor por defecto se evalúa **una sola vez**, cuando se define la función. Si es mutable (lista, dict), todas las llamadas comparten el mismo objeto.

## code:example

```python
def crear_pedido(cliente_id: int, *productos: str, urgente: bool = False, **extra):
    return {"cliente": cliente_id, "items": productos, "urgente": urgente, **extra}

crear_pedido(7, "cafe", "taza", urgente=True, nota="sin azúcar")
# {'cliente': 7, 'items': ('cafe', 'taza'), 'urgente': True, 'nota': 'sin azúcar'}

ordenados = sorted(productos, key=lambda p: p.precio)

def contador_pedidos():
    total = 0
    def siguiente():
        nonlocal total       # sin esto: UnboundLocalError
        total += 1
        return total
    return siguiente
```

## bad

```python
def agregar_item(item, carrito=[]):
    carrito.append(item)
    return carrito
```

Cada llamada sin carrito reutiliza la misma lista y arrastra los items anteriores.

## good

```python
def agregar_item(item, carrito: list | None = None):
    if carrito is None:
        carrito = []
    carrito.append(item)
    return carrito
```

Se crea una lista nueva en cada llamada.

## bridge:typescript

`*args` ≈ rest `...args`; `**kwargs` ≈ objeto de opciones; `f(*lista)` y `f(**dic)` ≈ spread. Los closures funcionan como en JS, pero para *reasignar* una variable externa necesitas `nonlocal`. En JS los defaults se evalúan en cada llamada; en Python no.

## interview

args recoge argumentos posicionales extra como tupla y kwargs los nombrados como diccionario; se usan para funciones flexibles o para reenviar argumentos, como hacen los decoradores. Un error clásico es poner una lista como valor por defecto: se evalúa una sola vez al definir la función y se comparte entre llamadas, así que el patrón correcto es usar None y crear la lista dentro.

## myths

- Default mutable: el error de entrevista más famoso de Python.
- Olvidar `nonlocal` al reasignar dentro de un closure.
- Las lambdas solo admiten una expresión, sin sentencias ni anotaciones.
- Closures en un bucle capturan la variable, no el valor (como `var` en JS).
