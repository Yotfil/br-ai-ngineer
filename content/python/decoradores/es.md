---
title: Decoradores
short: Decoradores
summary: Un decorador es una función que recibe otra función y devuelve una que la envuelve para añadirle comportamiento sin tocar su código.
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
        why: '"A" se imprime al decorar, antes de llamar a nada. Luego la llamada ejecuta el wrapper: B, hola, C.'
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
        why: La arroba aplica el decorador y reasigna el nombre con lo que devuelva.
---

## definition

Un decorador es una función que recibe una función y devuelve otra que la envuelve, para añadir comportamiento antes o después sin tocar su código. `@deco` encima de `def f` es azúcar sintáctico de `f = deco(f)`.

## analogy

El papel de regalo: el producto es el mismo, pero antes de llegar a él pasas por la envoltura (logs, permisos, medición de tiempos).

## problem

Sin decoradores repites el mismo código de logs, caché o permisos en cada función. Mal escritos, rompen la función: devuelven None o borran su firma.

## code:example

```python
import functools
import time

def medir_tiempo(func):
    @functools.wraps(func)          # conserva nombre, docstring y firma
    def wrapper(*args, **kwargs):
        inicio = time.perf_counter()
        resultado = func(*args, **kwargs)
        print(f"{func.__name__} tardó {time.perf_counter() - inicio:.3f}s")
        return resultado
    return wrapper

@medir_tiempo
def calcular_total(pedido_id: int) -> float:
    ...

# Decorador con argumentos: una capa más
def reintentar(veces: int):
    def decorador(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for intento in range(veces):
                try:
                    return func(*args, **kwargs)
                except ConnectionError:
                    if intento == veces - 1:
                        raise
        return wrapper
    return decorador
```

## bad

```python
def log(func):
    def wrapper(*args, **kwargs):
        print("llamando", func.__name__)
        func(*args, **kwargs)        # falta return
    return wrapper                   # falta functools.wraps
```

La función decorada devuelve None y pierde su nombre y firma. FastAPI lee la firma para saber los parámetros: sin wraps se rompe.

## good

```python
def log(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print("llamando", func.__name__)
        return func(*args, **kwargs)
    return wrapper
```

Devuelve el resultado y conserva los metadatos.

## bridge:typescript

En TypeScript, un decorador de clase (como `@Entity` en TypeORM) suele adjuntar *metadatos* a la clase para que una librería los lea después. En Python el decorador es una función normal que se ejecuta al definir y *reemplaza* el objeto por lo que devuelva. `@app.get("/productos")` en FastAPI registra tu función en el router y te la devuelve igual.

## interview

Un decorador es una función de orden superior: recibe una función y devuelve otra que la envuelve. La sintaxis con arroba equivale a reasignar la función con el resultado del decorador. Por dentro defino un wrapper que acepta args y kwargs, hago algo antes, llamo a la original, hago algo después y devuelvo su resultado, usando functools.wraps para no perder el nombre ni la firma. FastAPI los usa para registrar rutas.

## myths

- Olvidar `return resultado` en el wrapper.
- Olvidar `@functools.wraps`.
- Confundir `@deco` con `@deco()`: el segundo exige un decorador con argumentos.
- Creer que el decorador corre en cada llamada: el decorador corre una vez al definir; el wrapper corre en cada llamada.
