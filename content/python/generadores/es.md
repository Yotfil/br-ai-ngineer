---
title: Generadores y yield
short: Generadores y yield
summary: Un generador entrega valores de uno en uno, cuando se le piden, sin guardarlos todos en memoria. Se recorre una sola vez.
concepts:
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
        why: 'El primer `list(g)` le pide al generador todos sus valores, y el generador no vuelve a empezar: cuando el segundo `list(g)` le pide más, ya no le queda ninguno. Y `range(3)` empieza en 0, así que los dobles son 0, 2 y 4.'
---

## definition

Un **generador** entrega valores de uno en uno, solo cuando se le pide el siguiente, en lugar de crearlos todos de golpe en una lista. Se crea con una función que usa **`yield`**: `yield` entrega un valor y deja la función en pausa, justo ahí, hasta que se le pida otro. Por eso ocupa casi nada de memoria, aunque los valores sean millones, pero solo se puede recorrer una vez.

## analogy

Un barista que prepara cada café cuando se lo pides, en lugar de dejar cien cafés listos en la barra. El barista es el generador, cada café que entrega es un `yield` y pedirle el siguiente es `next()`. Entre un pedido y otro espera donde se quedó (la pausa), y cuando se le acaban los pedidos del día no vuelve a empezar (el generador se agota).

## problem

Si quieres sumar los subtotales de un millón de líneas y primero los guardas todos en una lista, ocupas memoria con un millón de números que solo vas a usar una vez. Con un generador, cada número se calcula, se suma y se descarta. Y si no sabes que se agota, recorrerlo dos veces da un resultado vacío, sin ningún error.

## code:example

### Paso 1. `yield` entrega un valor y deja la función en pausa

Una función con `yield` dentro es una función generadora. Un `for` le pide los valores uno a uno.

```python
def contar_hasta(n):
    i = 1
    while i <= n:
        yield i            # entrega i y se queda en pausa aquí hasta que le pidan otro
        i += 1

for numero in contar_hasta(3):
    print(numero)
# 1
# 2
# 3
```

### Paso 2. Llamar a la función no ejecuta su cuerpo

Al llamarla devuelve un generador y no ejecuta nada. `next()` le pide el siguiente valor: la función corre hasta el próximo `yield` y vuelve a pararse.

```python
def preparar():
    print("preparando café")
    yield "café"
    print("preparando taza")
    yield "taza"

g = preparar()             # no imprime nada: la función aún no empezó
print(next(g))
# preparando café
# café
print(next(g))             # sigue justo después del primer yield
# preparando taza
# taza
```

### Paso 3. Una expresión generadora: una comprehension con paréntesis

Con paréntesis en lugar de corchetes, una comprehension ([[comprehensions]]) da un generador. `range(3)` da los números 0, 1 y 2, y `list()` le pide al generador todos sus valores y los guarda en una lista.

```python
dobles = (x * 2 for x in range(3))     # todavía no calculó ninguno
print(list(dobles))
# [0, 2, 4]
```

### Paso 4. Un generador se agota

Cuando ya entregó todo, se queda vacío y no vuelve a empezar.

```python
print(list(dobles))                    # el mismo generador del paso 3: ya no le queda nada
# []
print(next(dobles))                    # pedirle uno más es un error
# StopIteration
```

### Paso 5. No guarda los valores en memoria

`sys.getsizeof()` dice cuántos bytes ocupa un objeto, sin contar los objetos que guarda dentro.

```python
import sys

lista = [n * 2 for n in range(1_000_000)]     # un millón de números, ya calculados
generador = (n * 2 for n in range(1_000_000)) # ninguno calculado todavía
print(sys.getsizeof(lista), sys.getsizeof(generador))
# 8448728 208
```

La lista ocupa unos 8 MB solo en su estructura, y el generador, 208 bytes, sean cuantos sean los valores (cifras medidas con Python 3.14).

### Paso 6. En el proyecto: el total sin crear ninguna lista

```python
# app/pedidos/service.py
from app.pedidos.models import LineaPedido      # se da por hecho: el modelo de una línea del pedido

def calcular_total(lineas: list[LineaPedido]) -> int:
    return sum(linea.cantidad * linea.precio_unitario for linea in lineas)   # sin corchetes
```

Es la comprehension de [[comprehensions]] sin corchetes: `sum()` le pide al generador cada subtotal y lo va sumando, sin crear la lista. La llama `POST /v1/pagos` para saber cuánto cobrar. En la tienda también hay una función con `yield`: `get_session`, en `app/db.py`, entrega la sesión de base de datos y la cierra cuando la respuesta ya salió ([[inyeccion-con-depends]]).

## bad

```python
precios = [38000, 25000, 120000]
con_descuento = (precio * 90 // 100 for precio in precios)   # un generador
print(max(con_descuento))       # max() devuelve el mayor... y agota el generador
print(sum(con_descuento))       # ya no le queda nada que sumar
# 108000
# 0
```

No hay ningún error: la suma sale 0 porque `max()` ya pidió todos los valores. Se nota cuando un total sale mal y nada en el código avisa por qué.

## good

```python
precios = [38000, 25000, 120000]
con_descuento = [precio * 90 // 100 for precio in precios]   # una lista
print(max(con_descuento))
print(sum(con_descuento))       # una lista se puede recorrer las veces que haga falta
# 108000
# 164700
```

Un solo cambio: corchetes en lugar de paréntesis. Si vas a recorrer los valores más de una vez, necesitas una lista.

## bridge:typescript

En JavaScript existen los mismos generadores, con `function*` y `yield`, y también se quedan en pausa hasta el siguiente `next()`. La diferencia que más confunde está en ese `next()`: en JavaScript devuelve un objeto `{ value, done }`, y al terminar da `done: true`; en Python devuelve el valor directamente y, cuando no quedan más, lanza `StopIteration`. Además, en Python no hay asterisco: cualquier `def` con un `yield` dentro ya es una función generadora.

## interview

Un generador produce valores de uno en uno, cuando se le piden, en lugar de crearlos todos en una lista. Se crea con una función que usa `yield`, que entrega un valor y deja la función en pausa hasta el siguiente `next()`, o con una expresión generadora, que es una comprehension con paréntesis. Ocupa casi nada de memoria aunque los valores sean millones, pero solo se recorre una vez: después queda agotado. En FastAPI, una dependencia con `yield`, como `get_session`, usa esa misma pausa para cerrar la sesión cuando la respuesta ya salió.

## myths

- **"Llamar a una función con `yield` ejecuta su código."** No: devuelve un generador, y el cuerpo no corre hasta que alguien le pide el primer valor, con `next()` o con un `for`. En el paso 2, `preparar()` no imprime nada hasta el primer `next(g)`.
- **"`yield` es lo mismo que `return`."** `return` termina la función y no vuelve a ella. `yield` entrega un valor y la deja en pausa: la siguiente vez sigue en la línea de después, con sus variables como estaban.
- **"Un generador se puede volver a recorrer desde el principio."** Se agota: cuando entregó todo, cada nuevo intento da vacío, sin error. Para recorrer los valores otra vez, llama de nuevo a la función o guárdalos en una lista.
- **"`(x * 2 for x in precios)` es una tupla."** Los paréntesis con un `for` dentro crean un generador: `type()` dice `<class 'generator'>`. Una tupla se crea con `tuple(...)`.
