---
title: Tipado dinámico y type hints
short: Tipado y type hints
summary: "Python tiene tipado dinámico y fuerte: los valores tienen tipo, las variables no, y no hay conversiones implícitas."
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
        why: El hint no se aplica en ejecución. `"ha" * 2` es una operación válida que repite el string.
      - q: ¿Qué imprime?
        code: print(bool(""), bool("0"), bool([0]))
        options:
          - False False False
          - False True True
          - True True True
          - False False True
        answer: 1
        why: 'Solo el string vacío es falsy. `"0"` es un string con un carácter y `[0]` es una lista con un elemento: ambos truthy.'
---

## definition

Python es de **tipado dinámico y fuerte**: las variables no tienen tipo, los valores sí, y no hay conversiones implícitas (`"1" + 1` lanza `TypeError`). Los **type hints** son anotaciones que el intérprete no hace cumplir; las verifican herramientas como mypy o pyright y, sobre todo, las leen FastAPI y Pydantic en tiempo de ejecución para validar.

## analogy

Son como las etiquetas en las cajas de una mudanza: el camión no las lee y lleva la caja igual, pero quien desempaca (el IDE, mypy, FastAPI) sí las usa para saber qué hacer con cada una.

## problem

Sin hints pierdes autocompletado y, en FastAPI, la validación automática: FastAPI no sabe que `id` debe ser entero. El mal uso típico es creer que el hint protege en ejecución.

## code:example

```python
def total_pedido(precios: list[float], descuento: float = 0.0) -> float:
    return sum(precios) * (1 - descuento)

total_pedido([12_000.0, 8_500.0])   # 20500.0
total_pedido("abc")                 # Python no se queja hasta que sum() falla

cliente_id: int | None = None       # unión, como number | null en TS
contacto: dict[str, str] = {"email": "ana@mail.com"}
```

## bad

```python
def buscar_producto(id, incluir_stock=False):
    ...  # ¿id es int o str? ¿qué devuelve?
```

Nadie sabe qué recibe ni qué devuelve; FastAPI trataría id como str.

## good

```python
def buscar_producto(id: int, incluir_stock: bool = False) -> Producto | None:
    ...
```

El contrato queda claro, el IDE ayuda y FastAPI valida que id sea entero.

## bridge:typescript

**TypeScript:** los tipos se borran al compilar y el compilador bloquea el build si no cuadran. **Python:** no hay paso que bloquee (mypy es opcional), pero los hints *sí existen en ejecución* (`func.__annotations__`). Por eso FastAPI convierte `producto_id: int` en validación y documentación, algo que en TS requiere Zod o class-validator. Además TS es estructural; las clases de Python son nominales (para estructural existe `typing.Protocol`).

## interview

Python es dinámico pero fuerte: los valores tienen tipo y no se convierten solos. Los type hints no se aplican en ejecución; los revisa una herramienta como mypy o pyright. La diferencia con TypeScript es que en TS los tipos desaparecen al compilar, mientras que en Python siguen disponibles en runtime, y por eso Pydantic y FastAPI los usan para validar datos y generar la documentación de la API.

## myths

- Esperar que `x: int = "hola"` falle: Python lo acepta sin decir nada.
- Pensar que `"1" + 1` da `"11"`: en Python es `TypeError`, conviertes explícitamente con `int()` o `str()`.
- Truthiness distinta: `[]`, `{}`, `""` y `0` son falsy. En JS `[]` es truthy.
- Solo existe `None`: no hay `null` y `undefined` por separado.
