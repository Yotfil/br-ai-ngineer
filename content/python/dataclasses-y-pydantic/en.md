---
title: Dataclasses and Pydantic
short: Dataclasses and Pydantic
summary: "@dataclass generates __init__, __repr__ and __eq__ from the annotations, without validating."
concepts:
  dataclass:
    name: dataclass
    aliases: []
  pydantic:
    name: Pydantic
    aliases: []
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: In Pydantic v2, how do you convert a model to a dict?
        options:
          - "`.dict()`"
          - "`.model_dump()`"
          - "`dict(modelo)` is the recommended way"
          - "`.to_json()`"
        answer: 1
        why: "`.dict()` is from v1 and is deprecated. In v2 you use `model_dump()` and `model_dump_json()`."
      - q: What happens with `ItemCarrito(producto_id="abc")` if it's a dataclass?
        options:
          - ValidationError
          - TypeError
          - It's created without error with producto_id = "abc"
          - Converts to int
        answer: 2
        why: Dataclasses don't validate types. That's what Pydantic is for, or Pydantic dataclasses.
---

## definition

`@dataclass` generates `__init__`, `__repr__` and `__eq__` from the annotations, **without validating**. **Pydantic** (`BaseModel`, v2) validates and converts data at runtime, serializes to dict or JSON and generates JSON Schema. FastAPI is built on top of Pydantic.

## analogy

The dataclass is a printed form: it has boxes, but nobody checks what you write. Pydantic is the clerk at the counter who checks every box and hands the form back to you with the list of errors.

## problem

External data (a client's JSON, environment variables) is not trustworthy. A dataclass accepts it as is; Pydantic validates it at the boundary of your system.

## code:example

```python
from dataclasses import dataclass, field
from pydantic import BaseModel, EmailStr, Field, field_validator

@dataclass
class ItemCarrito:
    producto_id: int
    cantidad: int = 1
    notas: list[str] = field(default_factory=list)

class Cliente(BaseModel):
    nombre: str = Field(min_length=2)
    email: EmailStr                      # requiere email-validator
    edad: int | None = Field(default=None, ge=18)

    @field_validator("nombre")
    @classmethod
    def limpiar_nombre(cls, v: str) -> str:
        return v.strip().title()

c = Cliente(nombre="  ana  ", email="ana@mail.com", edad="30")
c.edad            # 30 (convirtió el string a int)
c.model_dump()    # {'nombre': 'Ana', 'email': 'ana@mail.com', 'edad': 30}
c.model_dump_json()
```

## bad

```python
class Cliente(BaseModel):
    nombre: str
    class Config:              # Pydantic v1
        orm_mode = True

    @validator("nombre")       # v1, obsoleto
    def v(cls, v): ...

cliente.dict()                 # v1
```

v1 syntax that still shows up in old tutorials.

## good

```python
from pydantic import BaseModel, ConfigDict, field_validator

class Cliente(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    nombre: str

    @field_validator("nombre")
    @classmethod
    def v(cls, v: str) -> str: ...

cliente.model_dump()
```

Pydantic v2: model_config, field_validator, model_dump.

## bridge:typescript

The dataclass ≈ an `interface` plus a class with an automatic constructor. Pydantic ≈ **Zod**: `Cliente(**datos)` or `Cliente.model_validate(datos)` ≈ `schema.parse(datos)`. The difference is that in Zod you define the schema and *derive* the type with `z.infer`; in Pydantic the class with type hints is both schema and type.

## interview

A dataclass generates the boilerplate of a data class but validates nothing. Pydantic validates and converts data at runtime using the type hints, returns detailed errors and knows how to serialize to JSON and generate JSON Schema. I use dataclasses for internal structures and Pydantic at the boundaries: requests, responses and configuration. It's similar to Zod, but the schema is the class itself.

## myths

- Writing `notas: list = []` in a dataclass: error, use `field(default_factory=list)`.
- Mixing Pydantic v1 and v2 syntax copied from different tutorials.
- Being surprised that `"30"` gets converted to `30`: that's the default lax mode; `strict=True` exists.
- Using `EmailStr` without having email-validator installed (it comes included in `fastapi[standard]`).
