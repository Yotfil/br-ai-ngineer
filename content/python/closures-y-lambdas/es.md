---
title: Closures y lambdas
short: Closures y lambdas
summary: Un closure es una función que recuerda las variables del lugar donde se creó; una lambda, una función sin nombre de una línea.
concepts:
  closure:
    name: closure
    aliases: []
  lambda:
    name: lambda
    aliases: []
---

## definition

Un closure es una función que **recuerda variables del lugar donde fue creada**, aunque ese lugar ya haya terminado de ejecutarse. Aparece cuando defines una función dentro de otra y la de dentro usa una variable de la de fuera.

Una **lambda** es una función sin nombre que se escribe en una línea, para pasársela a otra función: `lambda p: p["precio"]` recibe `p` y devuelve su precio.

## analogy

Una mochila. Cuando la función de dentro (el closure) sale de la función de fuera, se lleva en la mochila las variables de fuera que usa. Cada vez que la llamas, abre la mochila (las variables recordadas) y las encuentra tal como las dejó.

## problem

Sin closures, para que una función recuerde algo entre llamadas (un contador, una configuración) necesitas una variable global o una clase. Con un closure, ese dato queda guardado dentro de la función y nadie más lo puede tocar. Sin lambdas, para ordenar productos por precio tendrías que escribir con `def`, y con nombre, una función de una línea que solo usas ahí.

## code:example

### Paso 1. Una función de dentro puede leer variables de la de fuera

```python
def crear_saludo(nombre):
    def saludar():
        print(f"hola, {nombre}")   # nombre no es de saludar: es de crear_saludo
    return saludar                 # devuelvo la función, sin llamarla

saludo_ana = crear_saludo("Ana")   # crear_saludo ya terminó...
saludo_ana()                       # ...pero saludar todavía recuerda "Ana"
# hola, Ana
```

### Paso 2. Cada closure tiene su propia mochila

```python
saludo_ana = crear_saludo("Ana")
saludo_luis = crear_saludo("Luis")

saludo_ana()
# hola, Ana
saludo_luis()      # no se mezclan: cada llamada a crear_saludo creó su propio nombre
# hola, Luis
```

### Paso 3. Para cambiar la variable recordada hace falta `nonlocal`

Leer la variable de fuera funciona sin más. Asignarle un valor nuevo, no: Python cree que estás creando una variable local distinta. `nonlocal` le dice "me refiero a la de fuera".

```python
def crear_contador():
    total = 0
    def siguiente():
        nonlocal total     # sin esta línea: UnboundLocalError en la línea de abajo
        total += 1         # cambia el total de crear_contador, no uno nuevo
        return total
    return siguiente

contar = crear_contador()
print(contar())
# 1
print(contar())            # el total se conservó entre llamadas
# 2
```

### Paso 4. Una lambda es una función de una línea, sin nombre

`lambda p: p["precio"]` hace lo mismo que una función con `def` que solo tiene `return p["precio"]`. Se usa sobre todo para pasarle una función corta a otra, como el `key` de `sorted`, que dice qué mirar de cada elemento para ordenar.

```python
productos = [
    {"nombre": "molinillo", "precio": 120000},
    {"nombre": "café", "precio": 38000},
    {"nombre": "taza", "precio": 25000},
]

baratos_primero = sorted(productos, key=lambda p: p["precio"])   # ordena por precio
print([p["nombre"] for p in baratos_primero])
# ['taza', 'café', 'molinillo']
```

### Paso 5. La trampa del bucle

El closure recuerda la **variable**, no el valor que tenía cuando se creó. Si la variable cambia después, el closure ve el valor nuevo. Pasa mucho con lambdas creadas en un bucle.

```python
funciones = []
for numero in range(3):
    funciones.append(lambda: numero)   # las tres recuerdan la misma variable "numero"

print([f() for f in funciones])        # al llamarlas, el bucle ya terminó y numero vale 2
# [2, 2, 2]

funciones = []
for numero in range(3):
    funciones.append(lambda n=numero: n)   # n=numero copia el valor en ese momento

print([f() for f in funciones])
# [0, 1, 2]
```

`n=numero` es un valor por defecto ([[funciones-y-parametros]]): se calcula una vez, al crear cada lambda, y por eso guarda el valor de esa vuelta.

### Paso 6. En el proyecto: un descuento que recuerda su porcentaje

En la tienda, un closure sirve para crear descuentos: `crear_descuento(10)` devuelve una función que guarda el 10 en su mochila y lo aplica a cualquier total.

```python
# app/pedidos/service.py
def crear_descuento(porcentaje: int):
    def aplicar(total: int) -> int:
        return total * (100 - porcentaje) // 100   # porcentaje sale de la mochila; // deja un entero
    return aplicar
```

Así se usa, con el precio del café:

```python
diez_por_ciento = crear_descuento(10)
print(diez_por_ciento(38000))
# 34200
```

`crear_descuento` se ejecuta una vez por cada descuento que se crea; `aplicar`, cada vez que hay que descontarlo de un total. Los precios de la tienda son enteros en pesos, y por eso `//` divide sin dejar decimales.

## bad

```python
descuentos = {}
for porcentaje in [5, 10, 20]:
    descuentos[porcentaje] = lambda total: total * (100 - porcentaje) // 100

print(descuentos[5](38000))     # se esperaba el café con un 5 % menos: 36100
# 30400
```

Las tres lambdas miran la misma variable `porcentaje`, que al terminar el bucle vale 20: el descuento "del 5 %" quita el 20 %. No hay ningún error; se nota cuando alguien revisa lo que se cobró.

## good

```python
descuentos = {}
for porcentaje in [5, 10, 20]:
    descuentos[porcentaje] = lambda total, porcentaje=porcentaje: total * (100 - porcentaje) // 100

print(descuentos[5](38000))
# 36100
```

`porcentaje=porcentaje` copia el valor de cada vuelta en un argumento por defecto, como en el paso 5. También sirve `crear_descuento(porcentaje)` del paso 6: cada llamada tiene su propia mochila.

## bridge:typescript

En TypeScript los closures funcionan igual: una función recuerda las variables del lugar donde se creó. La primera diferencia: para reasignar una variable de fuera, Python exige `nonlocal`; en TypeScript basta con asignarla. La lambda de Python es mucho más limitada que una función flecha: solo una expresión, sin llaves ni varias líneas. Y la trampa del bucle es la de `var`: con `let` o `const` dentro del bucle, cada closure de TypeScript ve su propia variable, mientras que el bucle de Python usa una sola, como `var`.

## interview

Un closure es una función que recuerda las variables del lugar donde se creó, aunque la función de fuera ya haya terminado; aparece al definir una función dentro de otra que usa sus variables. Puede leerlas sin más, pero para reasignarlas necesita `nonlocal`, porque si no Python las trata como locales y lanza `UnboundLocalError`. Recuerda la variable, no su valor: en un bucle, todas las funciones ven el último valor, salvo que lo copies con un argumento por defecto. Una lambda es una función sin nombre de una sola expresión, útil como `key` de `sorted`.

## myths

- **"El closure guarda una copia del valor."** Guarda la variable. Por eso en el paso 5 las tres funciones devuelven 2: todas miran la misma variable, que al final vale 2.
- **"Puedo modificar la variable de fuera sin más."** Puedes leerla. En cuanto escribes `total += 1` sin `nonlocal`, Python trata `total` como variable local, ve que no tiene valor y lanza `UnboundLocalError: cannot access local variable 'total' where it is not associated with a value`.
- **"Una lambda es un tipo especial de función."** Es una función normal: `type(lambda: 0)` es la misma clase que la de cualquier `def`. Solo cambian dos cosas: no tiene nombre (si le pides su nombre, `__name__`, responde `'<lambda>'`) y su cuerpo es una sola expresión, sin sentencias como `return` o un bloque `if`.
- **"Un closure es algo raro que casi no se usa."** Todo decorador es un closure: la envoltura recuerda `func`, que es una variable de la función de fuera. Ver [[decoradores]].
