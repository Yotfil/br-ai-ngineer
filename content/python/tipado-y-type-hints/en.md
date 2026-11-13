---
title: Dynamic typing and type hints
short: Typing and type hints
summary: "Python is dynamically and strongly typed: values have types, variables don't, and there are no implicit conversions."
concepts:
  tipado-dinamico:
    name: dynamic typing
    aliases:
      - tipado dinámico
  type-hints:
    name: type hints
    aliases: []
exercises:
  - type: choice
    prompt: What does this code print?
    items:
      - q: What does it print?
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
        why: The hint is not enforced at runtime. `"ha" * 2` is a valid operation that repeats the string.
      - q: What does it print?
        code: print(bool(""), bool("0"), bool([0]))
        options:
          - False False False
          - False True True
          - True True True
          - False False True
        answer: 1
        why: 'Only the empty string is falsy. `"0"` is a string with one character and `[0]` is a list with one element: both truthy.'
---

## definition

Python is **dynamically and strongly typed**: variables have no type, values do, and there are no implicit conversions (`"1" + 1` raises `TypeError`). **Type hints** are annotations the interpreter does not enforce; tools like mypy or pyright check them and, above all, FastAPI and Pydantic read them at runtime to validate.

## analogy

They are like the labels on moving boxes: the truck doesn't read them and carries the box anyway, but whoever unpacks (the IDE, mypy, FastAPI) does use them to know what to do with each one.

## problem

Without hints you lose autocompletion and, in FastAPI, automatic validation: FastAPI doesn't know that `id` must be an integer. The typical misuse is believing the hint protects you at runtime.

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

Nobody knows what it receives or what it returns; FastAPI would treat id as str.

## good

```python
def buscar_producto(id: int, incluir_stock: bool = False) -> Producto | None:
    ...
```

The contract is clear, the IDE helps and FastAPI validates that id is an integer.

## bridge:typescript

**TypeScript:** types are erased at compile time and the compiler blocks the build if they don't match. **Python:** there is no step that blocks (mypy is optional), but hints *do exist at runtime* (`func.__annotations__`). That's why FastAPI turns `producto_id: int` into validation and documentation, something that in TS requires Zod or class-validator. Also, TS is structural; Python classes are nominal (for structural typing there is `typing.Protocol`).

## interview

Python is dynamic but strong: values have types and are not converted on their own. Type hints are not enforced at runtime; a tool like mypy or pyright checks them. The difference from TypeScript is that in TS types disappear at compile time, while in Python they remain available at runtime, and that's why Pydantic and FastAPI use them to validate data and generate the API documentation.

## myths

- Expecting `x: int = "hola"` to fail: Python accepts it silently.
- Thinking `"1" + 1` gives `"11"`: in Python it's a `TypeError`, you convert explicitly with `int()` or `str()`.
- Different truthiness: `[]`, `{}`, `""` and `0` are falsy. In JS `[]` is truthy.
- There is only `None`: there are no separate `null` and `undefined`.
