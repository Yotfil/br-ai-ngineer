---
title: Decoradores
short: Decoradores
summary: Un decorador es una función que envuelve a otra para hacer algo antes o después de ella, sin cambiar su código.
concepts:
  decorador:
    name: decorador
    aliases:
      - decorator
exercises:
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿En qué orden se imprime?
        code: |-
          def deco(f):
              print("A")
              def w():
                  print("B")
                  f()
                  print("C")
              return w

          @deco
          def hola():
              print("hola")

          hola()
        options:
          - B hola C
          - A B hola C
          - A hola
          - B A hola C
        answer: 1
        why: 'El `print("A")` está en `deco`, y `deco` se ejecuta una sola vez, cuando Python lee `@deco`: por eso la A sale antes de cualquier llamada. Después, `hola()` ejecuta la envoltura `w`, que imprime B, llama a la original y termina con C.'
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: ¿A qué equivale `@cache` encima de `def precio()`?
        options:
          - "`precio = cache`"
          - "`precio = cache(precio)`"
          - "`cache = precio(cache)`"
          - "`precio()` se ejecuta al importar"
        answer: 1
        why: 'La arroba es un atajo de una asignación: Python le pasa la función a `cache` y guarda lo que `cache` devuelva en el mismo nombre, `precio`. La función no se ejecuta: solo se envuelve.'
---

## definition

Un decorador es una función que **envuelve** a otra para hacer algo antes o después de ella, sin cambiar su código. Sirve para no repetir lo mismo (medir tiempo, escribir logs, comprobar permisos) en veinte funciones.

Solo necesitas una idea previa: en Python una función es un valor como cualquier otro. Se puede guardar en una variable, pasar como argumento y devolver desde otra función.

## analogy

Un guardia en la puerta de una oficina. Tú vas a hablar con la contadora (la función original). El guardia (el decorador) te pide el carnet antes de entrar y anota la hora cuando sales. La contadora trabaja igual que siempre y no sabe que el guardia existe.

## problem

Sin decoradores, el código de logs o de permisos se copia al principio de cada función, y el día que cambia hay que cambiarlo en todas. Con un decorador se escribe una vez y se aplica con una línea.

## code:example

### Paso 1. Una función se puede pasar a otra función

```python
def saludar():
    print("hola")

def ejecutar_dos_veces(func):   # func es una función, no su resultado
    func()
    func()

ejecutar_dos_veces(saludar)     # sin paréntesis: paso la función, no la llamo
# hola
# hola
```

### Paso 2. Un decorador hecho a mano

`avisar` recibe una función y devuelve otra nueva que la llama por dentro. A esa función nueva se le suele llamar *wrapper* (envoltura).

```python
def avisar(func):            # 1. recibe la función original
    def envoltura():         # 2. crea una función nueva alrededor de ella
        print("antes")
        func()               # 3. llama a la original
        print("después")
    return envoltura         # 4. devuelve la nueva, sin ejecutarla

saludar = avisar(saludar)    # el nombre "saludar" ahora apunta a la envoltura
saludar()
# antes
# hola
# después
```

La envoltura sigue recordando `func` aunque `avisar` ya terminó: eso es un closure ([[closure]]).

### Paso 3. La arroba es un atajo para esa última asignación

```python
@avisar                      # igual que escribir: saludar = avisar(saludar)
def saludar():
    print("hola")

saludar()
# antes
# hola
# después
```

### Paso 4. La versión que se usa de verdad

A la versión anterior le faltan tres cosas: aceptar argumentos, devolver el resultado y conservar el nombre de la función original. `*args` y `**kwargs` recogen todos los argumentos que lleguen, sean cuantos sean ([[args-kwargs]]).

```python
import functools

def avisar(func):
    @functools.wraps(func)                 # la envoltura conserva el nombre y los parámetros de func
    def envoltura(*args, **kwargs):        # acepta cualquier argumento...
        print(f"llamando a {func.__name__}")   # __name__: el nombre de la función
        resultado = func(*args, **kwargs)  # ...y se lo pasa tal cual a la original
        return resultado                   # sin este return, quien llama recibe None
    return envoltura
```

Se usa igual que antes, ahora con una función que recibe argumentos:

```python
@avisar
def sumar(a, b):
    return a + b

print(sumar(2, 3))
# llamando a sumar
# 5
```

### Paso 5. En el proyecto: registrar cada cálculo del total

En la tienda, el decorador `registrar` de `app/core/registro.py` hace lo mismo que `avisar`, pero escribe en el log en lugar de imprimir.

```python
# app/pedidos/service.py
from app.core.registro import registrar          # el avisar del paso 4, con otro nombre: escribe en el log
from app.pedidos.models import LineaPedido

@registrar                                       # cada cálculo queda en el log, sin tocar la función
def calcular_total(lineas: list[LineaPedido]) -> int:
    return sum(linea.cantidad * linea.precio_unitario for linea in lineas)
```

Cada vez que la tienda calcula el total de un pedido, `@registrar` deja una línea en el log, y `calcular_total` no sabe que existe. Si mañana cambia lo que se anota, solo se toca `registro.py`.

### Avanzado. Un decorador que recibe argumentos

Para escribir `@reintentar(3)` hace falta una capa más: `reintentar(3)` se ejecuta primero y devuelve el decorador de verdad.

```python
import functools

def reintentar(veces):                             # 1. recibe el argumento
    def decorador(func):                           # 2. el decorador de los pasos anteriores
        @functools.wraps(func)
        def envoltura(*args, **kwargs):
            for intento in range(veces):
                try:
                    return func(*args, **kwargs)   # si sale bien, termina aquí
                except ConnectionError:
                    if intento == veces - 1:       # era el último intento:
                        raise                      # deja salir el error
        return envoltura
    return decorador
```

Para verlo trabajar, esta `consultar` falla siempre:

```python
@reintentar(3)               # igual que: consultar = reintentar(3)(consultar)
def consultar():
    print("intentando...")
    raise ConnectionError("sin red")   # simula una red que nunca responde

consultar()
# intentando...
# intentando...
# intentando...
# ConnectionError: sin red   (tras el tercer intento, el error sale)
```

Así está hecho `@app.get("/v1/productos")` en FastAPI: `app.get("/v1/productos")` devuelve un decorador, que registra tu función como endpoint y te la devuelve sin cambios.

## bad

```python
def avisar(func):
    def envoltura(*args, **kwargs):
        print(f"llamando a {func.__name__}")
        func(*args, **kwargs)              # llama a la original, pero tira su resultado
    return envoltura

@avisar
def sumar(a, b):
    return a + b

total = sumar(2, 3)
print(total * 2)                           # el error salta aquí, lejos del decorador
# llamando a sumar
# TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'
```

Quien llama a `sumar` recibe `None`. No falla al decorar ni al llamar: se nota después, cuando otra parte del código usa ese resultado, y el error no dice nada del decorador.

## good

```python
def avisar(func):
    def envoltura(*args, **kwargs):
        print(f"llamando a {func.__name__}")
        return func(*args, **kwargs)       # devuelve lo que devolvió la original
    return envoltura

@avisar
def sumar(a, b):
    return a + b

total = sumar(2, 3)
print(total * 2)
# llamando a sumar
# 10
```

Un solo cambio: `return` delante de la llamada a la original. En el código real se añade además `functools.wraps`, como en el paso 4.

## bridge:typescript

En TypeScript la arroba se ve igual, y el decorador también es una función que recibe lo que decora y puede devolver un reemplazo. La diferencia que más confunde: en TypeScript solo se decora una clase o lo que hay dentro de ella (métodos, propiedades); en Python, también una función suelta, como `sumar`. Y en Python no hay nada más detrás: `@avisar` es exactamente `sumar = avisar(sumar)`.

## interview

Un decorador es una función que recibe otra función y devuelve una envoltura que la llama por dentro, para hacer algo antes o después sin cambiar su código. La arroba es un atajo: `@avisar` encima de `def sumar` equivale a `sumar = avisar(sumar)`, y el decorador se ejecuta una sola vez, al definir la función; lo que corre en cada llamada es la envoltura. La envoltura acepta `*args` y `**kwargs`, devuelve el resultado de la original y lleva `functools.wraps` para conservar su nombre y sus parámetros, que FastAPI lee. Si el decorador recibe argumentos, como `@reintentar(3)`, hay una capa más: `reintentar(3)` devuelve el decorador. Así funciona `@app.get(...)` en FastAPI: registra la función como endpoint.

## myths

- **"El decorador se ejecuta cada vez que llamo a la función."** No: `avisar` se ejecuta una sola vez, cuando Python lee el `def`. Lo que se ejecuta en cada llamada es `envoltura`.
- **"`functools.wraps` es opcional."** Sin él, `sumar.__name__` devuelve `"envoltura"`, y Python ve los parámetros de la envoltura, `(*args, **kwargs)`, en lugar de `(a, b)`. FastAPI lee los parámetros de tu función para saber qué datos recibe el endpoint: sin `wraps`, los que encuentra no son los tuyos.
- **"`@avisar` y `@avisar()` son lo mismo."** El segundo llama primero a `avisar` sin argumentos y usa lo que devuelva como decorador. Con el `avisar` del paso 4 falla al definir la función: `TypeError: avisar() missing 1 required positional argument: 'func'`. Solo funciona si el decorador fue escrito para recibir argumentos, como el del paso avanzado.
