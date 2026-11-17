---
title: "Project: calculating an order total"
short: "Project: order total"
summary: "The total of an order, part by part: it adds up its lines, takes 10 % off from 100000 pesos and logs every calculation."
---

## context

We are going to build the function the store uses to calculate how much an order costs: `calcular_total`. The `POST /v1/pagos` endpoint calls it when a customer, like Ana, pays for an order, and what it returns is the amount they are charged. The function adds up what each line costs, takes 10 % off if the order reaches 100000 pesos and, every time it calculates a total, leaves a line in the log: the record of what the application is doing. It is plain Python, without FastAPI, and you will see two files: `app/core/registro.py` and `app/pedidos/service.py`.

## walkthrough

### Part 1. Logging every call

```python
# app/core/registro.py
import functools
import logging

logger = logging.getLogger(__name__)     # __name__ is the name of this module: app.core.registro

def registrar(func):
    @functools.wraps(func)                # the wrapper keeps the name and the parameters of func
    def envoltura(*args, **kwargs):
        logger.info("calling %s", func.__name__)   # %s is replaced by the function's name
        resultado = func(*args, **kwargs)
        return resultado                  # without this return, the caller gets None
    return envoltura
```

`registrar` is the `avisar` from step 4 of [[decoradores]], but it writes to the log instead of printing. To do that it uses `logging`, the Python standard library module for keeping a record of what happens while a program runs: `getLogger(__name__)` creates a logger with the module's name, and `logger.info(...)` writes a message at the INFO level, the one that confirms things are working as expected. Thanks to `*args` and `**kwargs`, `registrar` works for any function, whatever arguments it takes ([[funciones-y-parametros]]).

### Part 2. The store's discount

```python
# app/pedidos/service.py
from app.core.registro import registrar
from app.pedidos.models import LineaPedido      # taken for granted: the model of an order line

def crear_descuento(porcentaje: int):
    def aplicar(total: int) -> int:
        return total * (100 - porcentaje) // 100   # porcentaje comes from the backpack; // leaves an integer
    return aplicar

MINIMO_PARA_DESCUENTO = 100000                  # in capitals, by convention: it is a fixed value
diez_por_ciento = crear_descuento(10)           # created only once, the first time the module is imported
```

`crear_descuento` is the closure from [[closures-y-lambdas]]: `diez_por_ciento` is the function it returns, which keeps the 10 and applies it to any total. `MINIMO_PARA_DESCUENTO` and `diez_por_ciento` are the store's rule: an order of 100000 pesos or more pays 10 % less.

### Part 3. The total, with the discount when it applies

```python
# app/pedidos/service.py (continued)
@registrar                                       # every calculation ends up in the log, without touching the function
def calcular_total(lineas: list[LineaPedido]) -> int:
    subtotal = sum(linea.cantidad * linea.precio_unitario for linea in lineas)   # without creating a list
    if subtotal >= MINIMO_PARA_DESCUENTO:        # 100000 pesos or more: pays 10 % less
        return diez_por_ciento(subtotal)
    return subtotal                              # below the minimum, the sum is charged as it is
```

It is the function that kept changing in [[estructuras-de-datos]], [[comprehensions]], [[generadores]] and [[decoradores]], and this is its final version: the sum and the decorator are the ones from before, and what is new is the discount. The annotations `list[LineaPedido]` and `-> int` say that it receives a list of lines and returns an integer, the pesos that are charged ([[tipado-y-type-hints]]).

### Part 4. Trying it with two orders

```python
# in the Python console, opened in the tienda-api/ folder
import logging

from app.pedidos.models import LineaPedido
from app.pedidos.service import calcular_total

logging.basicConfig(level=logging.INFO)   # without this, only WARNING or more serious levels are shown

cafe_y_taza = [
    LineaPedido(pedido_id=1201, producto_id=42, cantidad=1, precio_unitario=38000),    # café
    LineaPedido(pedido_id=1201, producto_id=43, cantidad=1, precio_unitario=25000),    # taza
]
print(calcular_total(cafe_y_taza))        # they add up to 63000: below the minimum
# INFO:app.core.registro:calling calcular_total
# 63000

molinillo_y_cafe = [
    LineaPedido(pedido_id=1202, producto_id=44, cantidad=1, precio_unitario=120000),   # molinillo
    LineaPedido(pedido_id=1202, producto_id=42, cantidad=1, precio_unitario=38000),    # café
]
print(calcular_total(molinillo_y_cafe))   # they add up to 158000: it reaches the minimum
# INFO:app.core.registro:calling calcular_total
# 142200
```

The lines are created by hand, with the four fields of `LineaPedido` and the store's prices; `calcular_total` only reads the quantity and the price. `logging.basicConfig(level=logging.INFO)` makes the log show up in the console: each call writes the level, the logger's name and the message, before `print` shows the total. Café and taza add up to 63000 and are charged as they are; molinillo and café add up to 158000, and with 10 % off they are charged 142200.
