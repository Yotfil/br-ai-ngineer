---
title: "Proyecto: calcular el total de un pedido"
short: "Proyecto: total del pedido"
summary: "El total de un pedido, parte por parte: suma sus líneas, descuenta un 10 % desde 100000 pesos y deja cada cálculo en el log."
---

## context

Vamos a construir la función con la que la tienda calcula cuánto cuesta un pedido: `calcular_total`. La llama el endpoint `POST /v1/pagos` cuando un cliente, como Ana, paga su pedido, y lo que devuelve es el monto que se le cobra. La función suma lo que cuesta cada línea, descuenta un 10 % si el pedido llega a 100000 pesos y, cada vez que calcula un total, deja una línea en el log: el registro de lo que va haciendo la aplicación. Es Python puro, sin FastAPI, y verás dos archivos: `app/core/registro.py` y `app/pedidos/service.py`.

## walkthrough

### Parte 1. Dejar en el log cada llamada

```python
# app/core/registro.py
import functools
import logging

logger = logging.getLogger(__name__)     # __name__ es el nombre de este módulo: app.core.registro

def registrar(func):
    @functools.wraps(func)                # la envoltura conserva el nombre y los parámetros de func
    def envoltura(*args, **kwargs):
        logger.info("llamando a %s", func.__name__)   # %s se sustituye por el nombre de la función
        resultado = func(*args, **kwargs)
        return resultado                  # sin este return, quien llama recibe None
    return envoltura
```

`registrar` es el `avisar` del paso 4 de [[decoradores]], pero escribe en el log en lugar de imprimir. Para eso usa `logging`, el módulo de la biblioteca estándar de Python para dejar constancia de lo que pasa mientras un programa se ejecuta: `getLogger(__name__)` crea un registrador, o logger, con el nombre del módulo, y `logger.info(...)` escribe un mensaje de nivel INFO, el que confirma que todo va como se esperaba. Gracias a `*args` y `**kwargs`, `registrar` sirve para cualquier función, reciba los argumentos que reciba ([[funciones-y-parametros]]).

### Parte 2. El descuento de la tienda

```python
# app/pedidos/service.py
from app.core.registro import registrar
from app.pedidos.models import LineaPedido      # se da por hecho: el modelo de una línea del pedido

def crear_descuento(porcentaje: int):
    def aplicar(total: int) -> int:
        return total * (100 - porcentaje) // 100   # porcentaje sale de la mochila; // deja un entero
    return aplicar

MINIMO_PARA_DESCUENTO = 100000                  # en mayúsculas, por costumbre: es un valor fijo
diez_por_ciento = crear_descuento(10)           # se crea una sola vez, la primera vez que se importa
```

`crear_descuento` es el closure de [[closures-y-lambdas]]: `diez_por_ciento` es la función que devuelve, que guarda el 10 y lo aplica a cualquier total. `MINIMO_PARA_DESCUENTO` y `diez_por_ciento` son la regla de la tienda: un pedido de 100000 pesos o más paga un 10 % menos.

### Parte 3. El total, con el descuento cuando toca

```python
# app/pedidos/service.py (sigue)
@registrar                                       # cada cálculo queda en el log, sin tocar la función
def calcular_total(lineas: list[LineaPedido]) -> int:
    subtotal = sum(linea.cantidad * linea.precio_unitario for linea in lineas)   # sin crear una lista
    if subtotal >= MINIMO_PARA_DESCUENTO:        # 100000 pesos o más: paga un 10 % menos
        return diez_por_ciento(subtotal)
    return subtotal                              # por debajo del mínimo, se cobra la suma tal cual
```

Es la función que fue cambiando en [[estructuras-de-datos]], [[comprehensions]], [[generadores]] y [[decoradores]], y esta es su última versión: la suma y el decorador son los de antes, y lo nuevo es el descuento. Las anotaciones `list[LineaPedido]` y `-> int` dicen que recibe una lista de líneas y devuelve un entero, los pesos que se cobran ([[tipado-y-type-hints]]).

### Parte 4. Probarlo con dos pedidos

```python
# en la consola de Python, abierta en la carpeta tienda-api/
import logging

from app.pedidos.models import LineaPedido
from app.pedidos.service import calcular_total

logging.basicConfig(level=logging.INFO)   # sin esto, solo se ven los de nivel WARNING o más graves

cafe_y_taza = [
    LineaPedido(pedido_id=1201, producto_id=42, cantidad=1, precio_unitario=38000),    # café
    LineaPedido(pedido_id=1201, producto_id=43, cantidad=1, precio_unitario=25000),    # taza
]
print(calcular_total(cafe_y_taza))        # suman 63000: no llega al mínimo
# INFO:app.core.registro:llamando a calcular_total
# 63000

molinillo_y_cafe = [
    LineaPedido(pedido_id=1202, producto_id=44, cantidad=1, precio_unitario=120000),   # molinillo
    LineaPedido(pedido_id=1202, producto_id=42, cantidad=1, precio_unitario=38000),    # café
]
print(calcular_total(molinillo_y_cafe))   # suman 158000: llega al mínimo
# INFO:app.core.registro:llamando a calcular_total
# 142200
```

Las líneas se crean a mano, con los cuatro campos de `LineaPedido` y los precios de la tienda; `calcular_total` solo lee la cantidad y el precio. `logging.basicConfig(level=logging.INFO)` hace que el log se vea en la consola: cada llamada escribe el nivel, el nombre del registrador y el mensaje, antes de que `print` muestre el total. Café y taza suman 63000 y se cobran tal cual; molinillo y café suman 158000, y con el 10 % menos se cobran 142200.
