---
title: Dataclasses y Pydantic
short: Dataclasses y Pydantic
summary: "@dataclass genera __init__, __repr__ y __eq__ a partir de las anotaciones, sin validar."
concepts:
  dataclass:
    name: dataclass
    aliases: []
  pydantic:
    name: Pydantic
    aliases: []
exercises:
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: En Pydantic v2, ¿cómo conviertes un modelo a dict?
        options:
          - "`.dict()`"
          - "`.model_dump()`"
          - "`dict(modelo)` es lo recomendado"
          - "`.to_json()`"
        answer: 1
        why: "`.dict()` es de v1 y está deprecado. En v2 se usa `model_dump()` y `model_dump_json()`."
      - q: ¿Qué pasa con `ItemCarrito(producto_id="abc")` si es una dataclass?
        options:
          - ValidationError
          - TypeError
          - Se crea sin error con producto_id = "abc"
          - Convierte a int
        answer: 2
        why: Las dataclasses no validan tipos. Para eso existe Pydantic, o las dataclasses de Pydantic.
---

## definition

`@dataclass` genera `__init__`, `__repr__` y `__eq__` a partir de las anotaciones, **sin validar**. **Pydantic** (`BaseModel`, v2) valida y convierte datos en ejecución, serializa a dict o JSON y genera JSON Schema. FastAPI está construido sobre Pydantic.

## analogy

La dataclass es un formulario impreso: tiene casillas, pero nadie revisa lo que escribes. Pydantic es el funcionario de ventanilla que revisa cada casilla y te devuelve el formulario con la lista de errores.

## problem

Los datos externos (JSON de un cliente, variables de entorno) no son confiables. Una dataclass los acepta tal cual; Pydantic los valida en la frontera de tu sistema.

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

Sintaxis de v1 que aún aparece en tutoriales viejos.

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

La dataclass ≈ una `interface` más una clase con constructor automático. Pydantic ≈ **Zod**: `Cliente(**datos)` o `Cliente.model_validate(datos)` ≈ `schema.parse(datos)`. La diferencia es que en Zod defines el esquema y *derivas* el tipo con `z.infer`; en Pydantic la clase con type hints es esquema y tipo a la vez.

## interview

Una dataclass genera el boilerplate de una clase de datos pero no valida nada. Pydantic valida y convierte los datos en tiempo de ejecución usando los type hints, devuelve errores detallados y sabe serializar a JSON y generar JSON Schema. Uso dataclasses para estructuras internas y Pydantic en las fronteras: requests, respuestas y configuración. Es parecido a Zod, pero el esquema es la propia clase.

## myths

- Poner `notas: list = []` en una dataclass: error, usa `field(default_factory=list)`.
- Mezclar sintaxis de Pydantic v1 y v2 copiada de distintos tutoriales.
- Sorprenderse de que `"30"` se convierta a `30`: es el modo lax por defecto; existe `strict=True`.
- Usar `EmailStr` sin tener instalado email-validator (viene incluido en `fastapi[standard]`).
