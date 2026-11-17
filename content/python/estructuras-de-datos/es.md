---
title: "Estructuras de datos: list, tuple, dict y set"
short: list, tuple, dict, set
summary: "Lista para lo que va en orden y cambia, tupla para lo fijo, diccionario para buscar por clave y set para no repetir."
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
    prompt: Clasifica cada caso con la estructura más adecuada.
    categories:
      - list
      - tuple
      - dict
      - set
    items:
      - text: Historial de estados de un pedido, en orden
        category: list
        why: Los estados se guardan en el orden en que ocurrieron y se añade uno nuevo con cada cambio, así que hace falta orden y poder crecer.
      - text: Precio de cada producto por su nombre
        category: dict
        why: Lo que haces es encontrar un valor, el precio, a partir de otro, el nombre, que hace de clave.
      - text: Emails únicos que ya recibieron la promo
        category: set
        why: Cada email debe contar una sola vez, y lo que preguntas es si uno ya está; el set no guarda repetidos y responde eso sin recorrer.
      - text: Latitud y longitud de una tienda
        category: tuple
        why: Son dos valores que van juntos y no deberían cambiar después.
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: |-
          d = {"a": 1}
          print(d.get("b"), len({1, 1, 2}))
        options:
          - KeyError
          - None 3
          - None 2
          - 0 2
        answer: 2
        why: '`get()` no falla cuando la clave no está: sin segundo argumento devuelve `None`. Y un set no guarda repetidos, así que el 1 que aparece dos veces cuenta una sola vez para `len()`.'
---

## definition

Python trae cuatro formas de guardar varios valores juntos. Una **lista** (`list`) los guarda en orden y se puede cambiar; una **tupla** (`tuple`) también los guarda en orden, pero no se puede cambiar. Un **diccionario** (`dict`) guarda cada valor bajo una clave, para buscarlo por ella, y un **set** guarda elementos sin orden y sin repetir.

## analogy

Una cafetería. La fila de pedidos en la barra es una lista (llegan en orden y la fila crece), y la mesa y la hora impresas en el recibo son una tupla (van juntas y no se reescriben). La carta con el precio de cada bebida es un diccionario (buscas por el nombre, que es la clave, y lees el precio, que es el valor), y la lista de clientes frecuentes, donde nadie aparece dos veces, es un set.

## problem

Si eliges mal, el código funciona, pero se vuelve lento o se rompe. Preguntar con `in` si un email está en una lista de 100 000 emails la recorre desde el principio cada vez; en un set la respuesta es directa. Y guardar en una lista un dato que no debería cambiar invita a modificarlo por error.

## code:example

### Paso 1. Una lista guarda valores en orden y puede cambiar

Se escribe entre corchetes. `append()` añade al final, `[0]` lee el primer elemento, porque se cuenta desde 0, y `len()` dice cuántos hay.

```python
carrito = ["café", "taza"]
carrito.append("café")           # se puede repetir: la lista guarda lo que le des, en orden
print(carrito)
# ['café', 'taza', 'café']
print(carrito[0], len(carrito))
# café 3
```

### Paso 2. Una tupla agrupa valores que van juntos y no cambian

Se escribe entre paréntesis. Sirve para un dato fijo hecho de varias partes, como un producto y su cantidad, o la latitud y la longitud de un lugar.

```python
linea = ("café", 2)              # producto y cantidad: van juntos
producto, cantidad = linea       # desempaquetar: cada parte en su propia variable
print(producto, cantidad)
# café 2

linea[1] = 3                     # cambiar una parte es un error: la tupla no se toca
# TypeError: 'tuple' object does not support item assignment
```

### Paso 3. Un diccionario guarda cada valor bajo una clave

Se escribe entre llaves, con `clave: valor`, y se busca poniendo la clave entre corchetes. Si la clave no está, Python lanza un error: `KeyError`.

```python
precios = {"café": 38000, "taza": 25000}
print(precios["café"])
# 38000

print(precios["molinillo"])      # el molinillo no está en este diccionario
# KeyError: 'molinillo'
```

Si la clave puede faltar, `get()` no falla: devuelve `None`, el valor que significa "nada", o lo que le pases como segundo argumento.

```python
print(precios.get("molinillo"))
# None
print(precios.get("molinillo", 0))
# 0
```

### Paso 4. Un set guarda cada elemento una sola vez

Se crea con `set()` a partir de una lista, o se escribe entre llaves sin `clave:`, como `{"café", "taza"}`. No guarda repetidos ni orden: por eso no se lee por posición, y `productos[0]` sería un error.

```python
carrito = ["café", "taza", "café"]
productos = set(carrito)                 # el café repetido queda una sola vez
print(len(carrito), len(productos))
# 3 2
```

### Paso 5. Para saber si algo está, un set no recorre

`in` pregunta si un valor está.

```python
emails = ["ana@correo.co", "luis@correo.co"]           # una lista
print("luis@correo.co" in emails)                      # compara uno por uno, desde el principio
# True

registrados = {"ana@correo.co", "luis@correo.co"}      # un set
print("luis@correo.co" in registrados)                 # va directo, sin recorrer
# True
```

La respuesta es la misma, pero no el trabajo: con 100 000 emails, la lista puede hacer 100 000 comparaciones, y el set, o las claves de un diccionario, tardan casi lo mismo tengan los elementos que tengan. En una entrevista se dice así: en la lista, `in` es O(n), crece con el número de elementos; en un set o un diccionario es O(1) en promedio.

### Paso 6. En el proyecto: las líneas de un pedido son una lista

```python
# app/pedidos/service.py
from app.pedidos.models import LineaPedido      # se da por hecho: el modelo de una línea del pedido

def calcular_total(lineas: list[LineaPedido]) -> int:
    total = 0
    for linea in lineas:                        # la lista se recorre en orden, una línea cada vez
        total += linea.cantidad * linea.precio_unitario
    return total
```

Un pedido puede tener una línea o muchas, y la función las recorre todas: por eso recibe una lista. Cada línea es un `LineaPedido`, y sus campos se leen con un punto. La llama `POST /v1/pagos` para saber cuánto cobrar; en [[generadores]], este bucle queda en una sola línea.

## bad

```python
ids_registrados = list(range(100_000))      # los ids de 100 000 clientes, en una lista

def esta_registrado(cliente_id: int) -> bool:
    return cliente_id in ids_registrados    # compara uno por uno hasta encontrarlo

print(esta_registrado(99_999))
# True
```

La respuesta es correcta, pero cada llamada puede comparar los 100 000 ids. Se nota cuando la función se llama miles de veces, por ejemplo una vez por cada pedido.

## good

```python
ids_registrados = set(range(100_000))       # los mismos ids, en un set

def esta_registrado(cliente_id: int) -> bool:
    return cliente_id in ids_registrados    # va directo, sin recorrer

print(esta_registrado(99_999))
# True
```

Un solo cambio: `set()` en lugar de `list()`. Ahora la función tarda casi lo mismo con 100 ids que con 100 000.

## bridge:typescript

La lista se parece a un `Array`, el set a un `Set` y el diccionario a un objeto literal o a un `Map`, pero sus claves no pueden ser listas: `{["café"]: 1}` da `TypeError: cannot use 'list' as a dict key (unhashable type: 'list')`, y una tupla, en cambio, sí puede ser clave. La diferencia que más confunde está en la tupla: en TypeScript, `readonly` lo comprueba solo el compilador y no existe al ejecutar; en Python, una tupla no se puede cambiar ni siquiera mientras el programa corre.

## interview

Uso una lista para una colección ordenada que va a cambiar, y una tupla para un dato fijo de varias partes, que además puede ser clave de un diccionario. El diccionario sirve para buscar un valor por su clave, y el set, para guardar elementos sin repetir o preguntar rápido si uno está. La elección afecta al rendimiento: con `in`, la lista compara uno por uno, O(n), y el set o el diccionario van directo, O(1) en promedio.

## myths

- **"Si la clave no está, el diccionario devuelve `undefined`, como en JavaScript."** En Python no existe `undefined`: `precios["molinillo"]` lanza `KeyError` y el programa se detiene. Si la clave puede faltar, usa `get()`, que devuelve `None` o el valor que le pases.
- **"`(1)` es una tupla de un elemento."** Es el número 1 entre paréntesis: lo que hace la tupla es la coma. La tupla de un elemento se escribe `(1,)`.
- **"`{}` crea un set vacío."** Crea un diccionario vacío: `type({})` es `dict`. Las llaves solo crean un set si llevan elementos sin `clave:`, como `{"café"}`; el set vacío se crea con `set()`.
- **"El tamaño se pide con `carrito.length`, como en JavaScript."** La lista no tiene `length`: da `AttributeError: 'list' object has no attribute 'length'`. En Python el tamaño se pide con `len(carrito)`, y vale igual para tuplas, diccionarios, sets y textos.
