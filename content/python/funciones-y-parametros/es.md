---
title: "Funciones: parámetros, *args, **kwargs y valores por defecto"
short: Funciones y parámetros
summary: Una función recibe argumentos por posición o por nombre; *args y **kwargs admiten cuantos lleguen, y un valor por defecto, omitir uno.
concepts:
  args-kwargs:
    name: "*args y **kwargs"
    aliases:
      - "*args and **kwargs"
      - args
      - kwargs
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
        why: La lista `[]` se creó una sola vez, al definir `f`. La primera llamada le añadió el 1, y la segunda recibe esa misma lista, con el 1 todavía dentro.
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
        why: "`*a` junta los argumentos que llegan por posición en una tupla, por eso se imprime con paréntesis. `x=3` lleva nombre, así que no va a la tupla: va al diccionario `k`."
---

## definition

Una función recibe sus datos por **parámetros**: los nombres entre paréntesis de su `def`. Al llamarla, cada valor que le pasas (un argumento) llega por posición, `crear_linea("café", 2)`, o por nombre, `crear_linea(producto="café", cantidad=2)`; y un parámetro con valor por defecto se puede omitir.

`*args` y `**kwargs` sirven para aceptar cualquier cantidad de argumentos: `*args` junta los que llegan por posición en una tupla ([[tuple]]), y `**kwargs`, los que llegan con nombre, en un diccionario.

## analogy

Un formulario de pedido. Los campos fijos (los parámetros) se llenan siempre, en su orden o diciendo cuál es cuál (por nombre). Un campo que ya viene relleno, como "cantidad: 1" (el valor por defecto), solo lo tocas si quieres otra cosa. Y al final hay espacio para tantos productos como quieras (`*args`) y una casilla de observaciones con nombre, como "envolver: sí" (`**kwargs`).

## problem

Sin `*args` ni `**kwargs`, una función que acepta cualquier número de precios te obliga a meterlos antes en una lista, y no podrías reenviar a otra función argumentos que no conoces. Y un valor por defecto mal elegido da un error clásico: `def agregar(producto, carrito=[])` usa el mismo carrito en todas las llamadas, y lo que agrega un cliente aparece en el carrito de otro.

## code:example

### Paso 1. Por posición o por nombre

```python
def crear_linea(producto, cantidad):
    return f"{cantidad} x {producto}"

print(crear_linea("café", 2))                     # por posición: el orden importa
# 2 x café
print(crear_linea(cantidad=2, producto="café"))   # por nombre: el orden da igual
# 2 x café
```

### Paso 2. Un valor por defecto hace opcional un parámetro

```python
def crear_linea(producto, cantidad=1):   # si no pasas cantidad, vale 1
    return f"{cantidad} x {producto}"

print(crear_linea("taza"))
# 1 x taza
print(crear_linea("taza", 3))
# 3 x taza
```

El valor por defecto se crea una sola vez, cuando Python lee el `def`. Con un número no importa; con una lista sí, y lo verás más abajo, en "Riesgoso".

### Paso 3. `*args` junta los argumentos por posición en una tupla

```python
def total(*precios):          # precios: una tupla con todo lo que llegue por posición
    print(precios)
    return sum(precios)

print(total(38000, 25000))
# (38000, 25000)
# 63000
print(total())                # también sin ninguno: la tupla queda vacía
# ()
# 0
```

### Paso 4. `**kwargs` junta los argumentos con nombre en un diccionario

```python
def crear_pedido(cliente, **extra):   # extra: un dict con los argumentos con nombre que sobran
    print(cliente, extra)

crear_pedido("Ana", envolver=True, nota="es un regalo")
# Ana {'envolver': True, 'nota': 'es un regalo'}
```

### Paso 5. Al llamar, `*` y `**` hacen lo contrario: reparten

Con el `crear_linea` del paso 2:

```python
datos = ["café", 2]
print(crear_linea(*datos))        # * reparte la lista: crear_linea("café", 2)
# 2 x café

opciones = {"producto": "taza", "cantidad": 3}
print(crear_linea(**opciones))    # ** reparte el dict: crear_linea(producto="taza", cantidad=3)
# 3 x taza
```

Así reenvía un decorador los argumentos que recibe sin conocerlos: `func(*args, **kwargs)` ([[decoradores]]).

### Paso 6. En el proyecto: valores por defecto en la paginación

En la tienda, `GET /v1/productos` devuelve los productos de 20 en 20. FastAPI lee los parámetros de la función: lo que no venga en la URL toma su valor por defecto.

```python
# app/productos/router.py
from fastapi import APIRouter

from app.productos import repository     # se da por hecho: las consultas de productos

router = APIRouter()

@router.get("/v1/productos")             # esta función atiende GET /v1/productos
def listar_productos(pagina: int = 1, tamano: int = 20):
    # GET /v1/productos           → pagina=1, tamano=20
    # GET /v1/productos?pagina=3  → pagina=3, tamano=20
    return repository.listar(pagina, tamano)
```

FastAPI llama a `listar_productos` cada vez que un cliente pide el catálogo. Los valores por defecto son números, que no se pueden modificar ([[mutabilidad]]), así que compartirlos entre llamadas no es un problema. Cómo convierte FastAPI la URL en argumentos se ve en [[rutas-y-parametros]].

## bad

```python
def agregar(producto, carrito=[]):   # esta lista se crea una vez, al leer el def
    carrito.append(producto)
    return carrito

print(agregar("café"))               # el carrito de Ana
# ['café']
print(agregar("taza"))               # el de Luis, que debería empezar vacío
# ['café', 'taza']
```

Todas las llamadas sin `carrito` comparten la misma lista: el café de Ana aparece en el carrito de Luis. No da ningún error; se nota cuando un cliente ve productos que no pidió.

## good

```python
def agregar(producto, carrito=None):   # None no se puede modificar: es seguro compartirlo
    if carrito is None:
        carrito = []                   # una lista nueva en cada llamada
    carrito.append(producto)
    return carrito

print(agregar("café"))
# ['café']
print(agregar("taza"))
# ['taza']
```

El valor por defecto pasa a ser `None` y la lista se crea dentro, en cada llamada. Es la solución que propone la documentación de Python.

## bridge:typescript

`*args` es el parámetro rest de TypeScript (`...precios: number[]`), con una diferencia: en Python llega como tupla, no como array. `**kwargs` no tiene equivalente directo: en TypeScript pasarías un objeto de opciones. Al llamar, `f(*lista)` es el spread `f(...lista)`. Y lo que más confunde: en TypeScript el valor por defecto se evalúa en cada llamada, así que `carrito = []` es seguro; en Python, no.

## interview

Una función recibe argumentos por posición o por nombre, y un parámetro con valor por defecto se puede omitir. `*args` recoge los argumentos que sobran por posición en una tupla y `**kwargs`, los que llevan nombre, en un diccionario; al llamar, `*` y `**` hacen lo contrario y reparten una lista o un diccionario en argumentos. Sirven para funciones flexibles y para reenviar argumentos a otra función sin conocerlos. El error clásico es una lista como valor por defecto: se crea una sola vez al definir la función y todas las llamadas la comparten, así que se usa `None` y la lista se crea dentro.

## myths

- **"El valor por defecto se calcula en cada llamada."** Se calcula una sola vez, cuando Python lee el `def`. Con un número da igual; con una lista o un diccionario, todas las llamadas comparten el mismo objeto, como en "Riesgoso".
- **"`*args` es una lista."** Es una tupla: no la puedes cambiar, y `precios.append(1000)` lanza `AttributeError: 'tuple' object has no attribute 'append'`. Si necesitas una lista, conviértela con `list(precios)`.
- **"Los nombres `args` y `kwargs` son obligatorios."** Lo que cuenta son la estrella y las dos estrellas; el nombre es una costumbre. Por eso `def total(*precios)` del paso 3 funciona igual.
