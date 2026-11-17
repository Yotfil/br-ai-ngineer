---
title: "Comprehensions: listas, dicts y sets en una línea"
short: Comprehensions
summary: Una comprehension construye una lista, un diccionario o un set a partir de otra colección, en una sola línea.
concepts:
  comprehension:
    name: comprehension
    aliases: []
exercises:
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: "print({n: n ** 2 for n in range(3)})"
        options:
          - "[0, 1, 4]"
          - "{0, 1, 4}"
          - "{0: 0, 1: 1, 2: 4}"
          - "{1: 1, 2: 4, 3: 9}"
        answer: 2
        why: 'Las llaves con `clave: valor` construyen un diccionario, no un set ni una lista. Y `range(3)` empieza en 0 y se detiene antes del 3, así que las claves son 0, 1 y 2, cada una con su cuadrado.'
---

## definition

Una **comprehension** construye una lista, un diccionario o un set a partir de otra colección, en una sola línea: dices qué valor quieres por cada elemento y, si hace falta, cuáles entran. Sustituye al bucle que crea una lista vacía y la va llenando. Los corchetes dan una lista, y las llaves, un diccionario o un set.

## analogy

Un pedido a la cocina. En lugar de decir «toma el primer pedido de la mesa 4, prepara su café, ponlo en la bandeja; toma el segundo…» (el bucle), dices «un café por cada pedido de la mesa 4» (la comprehension). En una sola frase dices qué hacer con cada elemento (preparar un café) y de dónde salen (los pedidos de la mesa 4), y la bandeja que recibes es la lista nueva.

## problem

Sin comprehensions, construir una lista a partir de otra lleva cuatro líneas: la lista vacía, el `for`, el `if` y el `append`. Quien lee tiene que seguirlas todas para darse cuenta de que solo se está construyendo una lista. Mal usada pasa lo contrario: una comprehension muy larga, o escrita solo para imprimir, se lee peor que el bucle.

## code:example

### Paso 1. Un bucle que construye una lista

Este es el bucle que la comprehension va a sustituir: aplica un 10 % de descuento a cada precio.

```python
precios = [38000, 25000, 120000]
con_descuento = []
for precio in precios:
    con_descuento.append(precio * 90 // 100)    # 10 % menos; // divide y deja un entero
print(con_descuento)
# [34200, 22500, 108000]
```

### Paso 2. La comprehension dice lo mismo en una línea

Se lee de izquierda a derecha: «el precio con descuento, por cada precio de la lista». Los corchetes dicen que el resultado es una lista.

```python
con_descuento = [precio * 90 // 100 for precio in precios]
print(con_descuento)
# [34200, 22500, 108000]
```

### Paso 3. Con `if` al final, solo entran algunos

```python
caros = [precio for precio in precios if precio > 30000]   # el 25000 no pasa el if
print(caros)
# [38000, 120000]
```

### Paso 4. Con llaves, un diccionario o un set

Con `clave: valor` entre llaves sale un diccionario. `range(3)` da los números 0, 1 y 2, y `**` es la potencia: `2 ** 2` vale 4.

```python
lineas = [("café", 2), ("taza", 1)]
cantidades = {producto: cantidad for producto, cantidad in lineas}   # cada tupla se desempaqueta
print(cantidades)
# {'café': 2, 'taza': 1}

cuadrados = {n ** 2 for n in range(3)}      # llaves sin "clave:": un set
print(cuadrados)
# {0, 1, 4}
```

### Paso 5. En el proyecto: los subtotales de un pedido

```python
# app/pedidos/service.py
from app.pedidos.models import LineaPedido      # se da por hecho: el modelo de una línea del pedido

def calcular_total(lineas: list[LineaPedido]) -> int:
    subtotales = [linea.cantidad * linea.precio_unitario for linea in lineas]   # uno por línea
    return sum(subtotales)                      # sum() suma todos los elementos de la lista
```

Es el bucle de [[estructuras-de-datos]] en una línea: la comprehension crea la lista de subtotales y `sum()` los suma. La llama `POST /v1/pagos` para saber cuánto cobrar. En [[generadores]] se quitan los corchetes, y la lista ni siquiera se crea.

## bad

```python
precios = [38000, 25000, 120000]
resultado = [print(precio) for precio in precios]   # comprehension solo para imprimir
print(resultado)
# 38000
# 25000
# 120000
# [None, None, None]
```

Imprime bien, pero también construye una lista de `None`, lo que devuelve `print`, que nadie usa. Quien lee espera una lista útil y no la encuentra.

## good

```python
precios = [38000, 25000, 120000]
for precio in precios:                  # no hace falta ninguna lista: basta un bucle
    print(precio)
# 38000
# 25000
# 120000
```

Un `for` normal: la comprehension se deja para cuando el resultado es la colección.

## bridge:typescript

Una comprehension con `if` hace lo que `.filter()` y `.map()` encadenados sobre un array: primero se queda con los elementos que pasan la condición y después calcula el valor de cada uno. La diferencia que más confunde es el orden: en Python el `if` se escribe al final, pero se comprueba antes de calcular. Y la misma forma sirve para un diccionario, que en JavaScript necesitaría algo como `Object.fromEntries`.

## interview

Una comprehension construye una lista, un diccionario o un set a partir de otra colección en una sola expresión: qué valor, por cada elemento y, opcionalmente, con qué condición. Los corchetes dan una lista; las llaves con `clave: valor`, un diccionario; y las llaves sin clave, un set. Sustituye al bucle que crea una lista vacía y la llena con `append`, y se lee mejor mientras sea corta. Si se usa solo por un efecto, como imprimir, es mejor un `for` normal.

## myths

- **"La comprehension calcula primero y filtra después."** El `if` se escribe al final, pero se comprueba antes de calcular cada valor: `[100 // n for n in [5, 0, 2] if n != 0]` da `[20, 50]`, sin dividir nunca entre cero.
- **"Con llaves siempre sale un diccionario."** Solo si hay `clave: valor`. `{n * 2 for n in [1, 1, 2]}` es un set, `{2, 4}`, y por eso pierde los repetidos.
- **"`range(3)` cuenta de 1 a 3."** Empieza en 0 y se detiene antes del número que le das: `list(range(3))` es `[0, 1, 2]`. Para empezar en 1 se escribe `range(1, 4)`.
- **"Con paréntesis sale una tupla."** `(n * 2 for n in precios)` no es una tupla ni una lista: es un generador, que da los valores de uno en uno y se estudia en [[generadores]].
