---
title: Manejo de errores y context managers
short: Errores y with
summary: "try / except / else / finally controla errores: else corre si no hubo excepción y finally corre siempre."
concepts:
  context-manager:
    name: context manager
    aliases: []
  try-except:
    name: try/except/finally
    aliases:
      - try except
      - try except finally
  eafp:
    name: EAFP
    aliases: []
exercises:
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: |-
          try:
              print(1)
              x = 1 / 0
              print(2)
          except ZeroDivisionError:
              print(3)
          else:
              print(4)
          finally:
              print(5)
        options:
          - 1 2 3 5
          - 1 3 5
          - 1 3 4 5
          - 1 5
        answer: 1
        why: El 2 nunca se ejecuta; else se salta porque hubo excepción; finally siempre corre.
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: ¿Qué garantiza `with open("pedidos.csv") as f:`?
        options:
          - Que el archivo existe
          - Que se cierra al salir del bloque, incluso con error
          - Que la lectura es async
          - Que no hay excepciones
        answer: 1
        why: El context manager llama `__exit__` siempre, y ahí se cierra el archivo.
---

## definition

`try / except / else / finally` controla errores: `else` corre si no hubo excepción y `finally` corre siempre. Las excepciones propias heredan de `Exception`. Un **context manager** (`with`) garantiza preparación y limpieza, por medio de `__enter__`/`__exit__` o del decorador `@contextmanager`.

## analogy

El `with` es el préstamo de llaves de la bodega con firma: pase lo que pase adentro, al salir devuelves las llaves.

## problem

Tragarse errores esconde bugs y deja datos a medias. Sin `with`, un error en medio deja archivos abiertos o transacciones sin cerrar.

## code:example

```python
class StockInsuficiente(Exception):
    def __init__(self, producto: str, pedido: int, disponible: int):
        super().__init__(f"{producto}: pediste {pedido}, hay {disponible}")
        self.producto = producto

def reservar(producto: str, cantidad: int) -> None:
    disponible = stock.get(producto, 0)
    if cantidad > disponible:
        raise StockInsuficiente(producto, cantidad, disponible)
    stock[producto] -= cantidad

try:
    reservar("cafe", 50)
except StockInsuficiente as e:
    print("No se pudo:", e)
else:
    print("Reservado")
finally:
    print("Fin del intento")

from contextlib import contextmanager

@contextmanager
def transaccion(sesion):
    try:
        yield sesion
        sesion.commit()
    except Exception:
        sesion.rollback()
        raise
```

## bad

```python
try:
    reservar("cafe", 50)
except:
    pass
```

Atrapa todo, incluso Ctrl+C (KeyboardInterrupt), y nadie se entera del fallo.

## good

```python
try:
    reservar("cafe", 50)
except StockInsuficiente as e:
    logger.warning("Sin stock: %s", e)
    raise ErrorDePedido("No se pudo reservar") from e
```

Atrapas lo que esperas y conservas la causa original con `from e`.

## bridge:typescript

`try/catch/finally` ≈ `try/except/finally`; `throw` → `raise`; `catch (e)` → `except Tipo as e`. El `with` no tiene equivalente clásico en JS; lo más parecido es `using` (gestión explícita de recursos, TS 5.2+). Python prefiere el estilo EAFP: intentar y capturar, en vez de verificar todo antes.

## interview

Capturo excepciones específicas, nunca un except vacío. Uso else para el código que solo debe correr si no hubo error y finally para la limpieza obligatoria. Para errores de negocio creo excepciones propias que heredan de Exception, y encadeno causas con raise from. Para recursos como archivos, conexiones o transacciones uso context managers con with, que garantizan la liberación aunque haya una excepción.

## myths

- `except:` sin tipo captura también `SystemExit` y `KeyboardInterrupt`.
- No conocer el `else` del try: separa el código que puede fallar del que solo corre si todo salió bien.
- Relanzar con `raise e` en vez de `raise` a secas cambia el punto de origen del traceback.
- Heredar de `BaseException` en vez de `Exception`.
