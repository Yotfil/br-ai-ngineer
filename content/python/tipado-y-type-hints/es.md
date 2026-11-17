---
title: Tipado dinámico y type hints
short: Tipado y type hints
summary: En Python el tipo es del valor, no de la variable. Los type hints dicen qué tipo esperas, pero Python no los comprueba.
concepts:
  tipado-dinamico:
    name: tipado dinámico
    aliases:
      - dynamic typing
  type-hints:
    name: type hints
    aliases: []
exercises:
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: |-
          def doble(n: int) -> int:
              return n * 2

          print(doble("ha"))
        options:
          - TypeError
          - haha
          - "0"
          - None
        answer: 1
        why: 'Python no comprueba la anotación `n: int`: ejecuta la función con el texto que recibe. Y con un texto, `*` no multiplica: lo repite tantas veces como diga el número.'
      - q: ¿Qué imprime?
        code: print(bool(""), bool("0"), bool([0]))
        options:
          - False False False
          - False True True
          - True True True
          - False False True
        answer: 1
        why: 'Python solo trata como falso lo que está vacío o vale cero. `""` está vacío, pero `"0"` es un texto con un carácter y `[0]` es una lista con un elemento: no están vacíos, aunque lo que contienen sea un cero.'
---

## definition

En Python el tipo es del valor, no de la variable: la misma variable puede guardar un número y, después, un texto. A eso se le llama **tipado dinámico**.

Los **type hints** (anotaciones de tipo) son etiquetas que escribes en el código para decir qué tipo esperas, como `precio: int`. Python no las comprueba al ejecutar: las usan otras herramientas, como el editor o FastAPI.

## analogy

Las cajas de una mudanza. Una caja (la variable) puede llevar hoy platos y mañana libros: lo que tiene un tipo es lo que va dentro (el valor). Por fuera le pegas una etiqueta (el type hint) que dice qué debería llevar, pero el camión (Python al ejecutar) no la lee y lleva la caja igual. Quien desempaca (el editor o FastAPI) sí la lee, para saber qué esperar.

## problem

Sin anotaciones, quien lee `def obtener_producto(id)` no sabe si `id` es un número o un texto, y el editor tampoco puede ayudarte. En FastAPI es peor: sin `id: int`, el `id` de la URL llega como texto y nadie comprueba que sea un número. Y al revés: si crees que la anotación te protege al ejecutar, un texto donde esperabas un número pasa sin ningún aviso.

## code:example

### Paso 1. El tipo es del valor, no de la variable

`type()` te dice de qué tipo es un valor: `int` es un número entero y `str`, un texto.

```python
pedido = 1042
print(type(pedido))
# <class 'int'>

pedido = "1042"                  # la misma variable, ahora con un texto: Python no se queja
print(type(pedido))
# <class 'str'>
```

### Paso 2. Python no mezcla tipos por su cuenta

```python
cantidad = "2"                   # llegó como texto, por ejemplo desde un formulario
print(cantidad + 1)
# TypeError: can only concatenate str (not "int") to str
```

Python no adivina si querías sumar números o juntar textos: lanza un `TypeError`, un error de tipo. Para sumar, conviertes tú el texto con `int()`:

```python
print(int(cantidad) + 1)         # int() convierte el texto "2" en el número 2
# 3
```

Que Python no convierta los tipos por su cuenta se llama **tipado fuerte**. No choca con el tipado dinámico: la variable no tiene tipo, pero el valor no cambia de tipo solo.

### Paso 3. Una anotación dice qué tipo esperas

Después de un parámetro, `: int` dice qué tipo esperas; después de los paréntesis, `-> int` dice qué devuelve la función. En una lista, el tipo de lo que lleva va entre corchetes: `list[int]` es una lista de enteros.

```python
def total_linea(cantidad: int, precio: int) -> int:
    return cantidad * precio

def subtotal(totales: list[int]) -> int:
    return sum(totales)                    # sum() suma todos los elementos de la lista

print(subtotal([total_linea(2, 38000), total_linea(1, 25000)]))   # dos cafés y una taza
# 101000
```

### Paso 4. Python no comprueba la anotación

```python
precio: int = "38000"            # la anotación dice int, pero el valor es un texto
print(type(precio))
# <class 'str'>

print(total_linea(3, precio))    # tampoco se queja aquí: el texto entra en la función
# 380003800038000
```

No hay ningún error. Con un texto, `*` no multiplica: repite el texto tantas veces como diga el número.

### Paso 5. La anotación queda guardada para quien la quiera leer

Python no usa las anotaciones, pero tampoco las borra: quedan guardadas en la función, y `get_type_hints()` las muestra.

```python
from typing import get_type_hints

print(get_type_hints(total_linea))
# {'cantidad': <class 'int'>, 'precio': <class 'int'>, 'return': <class 'int'>}
```

mypy y pyright leen esas anotaciones sin ejecutar el código, y te avisan si llamas a `total_linea` con un texto. FastAPI las lee mientras el programa corre.

### Paso 6. En el proyecto: FastAPI convierte y valida el id

```python
# app/productos/router.py
from fastapi import APIRouter
from app.productos import repository     # se da por hecho: las consultas de productos

router = APIRouter()

@router.get("/v1/productos/{id}")
def obtener_producto(id: int):           # FastAPI lee esta anotación al registrar la ruta
    return repository.buscar(id)         # aquí id ya es un número: 7, no "7"
```

Cuando alguien pide `GET /v1/productos/7`, el `7` llega en la URL como texto: FastAPI lo convierte en el número 7, como dice la anotación, y llama a la función. Con `GET /v1/productos/abc` responde 422, el código de los datos que no son válidos, sin ejecutarla. Cómo se declaran las rutas está en [[rutas-y-parametros]].

## bad

```python
def total_linea(cantidad: int, precio: int) -> int:
    return cantidad * precio

precio = "38000"                         # así llega leído de un archivo: como texto
total = total_linea(2, precio)           # la anotación dice int, pero nadie lo comprobó
print(total)
# 3800038000
```

No sale ningún error: el total es un texto con el precio repetido. Se nota más tarde y en otra parte, cuando ese total se usa como si fuera un número.

## good

```python
def total_linea(cantidad: int, precio: int) -> int:
    return cantidad * precio

precio = int("38000")                    # se convierte al llegar: desde aquí es un int de verdad
total = total_linea(2, precio)
print(total)
# 76000
```

Un solo cambio: `int()` convierte el texto en cuanto llega, y la anotación vuelve a decir la verdad. En un endpoint no hace falta: FastAPI hace esa conversión, como en el paso 6.

## bridge:typescript

Las anotaciones se escriben casi igual que en TypeScript: `precio: int` frente a `precio: number`. La diferencia que más confunde: TypeScript revisa los tipos al compilar y después los borra del JavaScript que se ejecuta; Python no los revisa nunca por sí mismo, pero los conserva en la función mientras el programa corre. Por eso FastAPI puede convertir y validar a partir de `id: int`, algo que en TypeScript necesita código aparte que compruebe los datos al ejecutar.

## interview

Python tiene tipado dinámico: el tipo es del valor, no de la variable, y una misma variable puede guardar un número y después un texto. También es fuerte: no convierte tipos por su cuenta, así que `"1" + 1` lanza `TypeError`. Los type hints dicen qué tipo esperas en variables, parámetros y retorno, pero Python no los comprueba al ejecutar; los revisan herramientas como mypy o pyright, sin ejecutar el código. A diferencia de TypeScript, las anotaciones no se borran: quedan en la función, y FastAPI las lee para convertir y validar los datos de cada petición.

## myths

- **"Si anoto `precio: int`, Python rechaza un texto."** No: Python no mira las anotaciones al ejecutar, y `precio: int = "38000"` funciona sin ningún aviso. Quien comprueba es otra herramienta: mypy o pyright antes de ejecutar, o FastAPI con los datos que llegan a un endpoint.
- **"`"1" + 1` da `"11"`, como en JavaScript."** En Python es un `TypeError`, porque no junta un texto con un número por su cuenta. Conviertes tú: `int("1") + 1` da `2`, y `"1" + str(1)` da `"11"`, porque `str()` convierte en texto.
- **"Una lista vacía cuenta como verdadera, como en JavaScript."** En Python no: en un `if`, lo que está vacío o vale cero cuenta como falso. `bool()` te dice cómo cuenta un valor: `bool([])`, `bool("")` (el texto vacío), `bool(0)` y `bool(None)` dan `False`, y `None` es el valor que significa "nada". En cambio, `"0"` y `[0]` dan `True`: no están vacíos, aunque lo que contienen sea un cero.
