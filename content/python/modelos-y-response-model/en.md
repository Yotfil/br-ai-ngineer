---
title: Input and output models, validation and response_model
short: Models and response_model
summary: "Separate the schemas: what comes in, what goes out and what gets stored."
concepts:
  response-model:
    name: response_model
    aliases: []
  modelos-de-entrada-y-salida:
    name: input and output models
    aliases:
      - modelos de entrada y salida
exercises:
  - type: choice
    prompt: Which status code does it return?
    items:
      - q: The handler returns a dict without the `id` field, which is required in `ClientePublico`.
        options:
          - 200 without id
          - "422"
          - "500"
          - "204"
        answer: 2
        why: "Response validation fails (ResponseValidationError). It's a server error: 500."
  - type: choice
    prompt: Quick question
    items:
      - q: What does FastAPI do with fields that aren't in the output model?
        options:
          - Returns them anyway
          - Filters them out
          - Raises 422
          - Converts them to null
        answer: 1
        why: "The response model works as a filter: only what's declared goes out."
---

## definition

Separate the schemas: what **comes in** (`ClienteCrear`), what **goes out** (`ClientePublico`) and what gets **stored**. The endpoint's return type, or `response_model`, validates and **filters** the response: only the fields of the output model go out.

## analogy

The menu the customer sees doesn't show the cost of the ingredients or the supplier, even though the kitchen knows them.

## problem

With a single model for everything you end up returning the password hash or letting the client send fields it shouldn't, like `es_admin`.

## code:example

```python
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class ClienteBase(BaseModel):
    nombre: str = Field(min_length=2)
    email: EmailStr

class ClienteCrear(ClienteBase):
    password: str = Field(min_length=8)

class ClientePublico(ClienteBase):
    model_config = ConfigDict(from_attributes=True)   # para leer objetos ORM
    id: int

@app.post("/clientes", status_code=201)
def crear_cliente(datos: ClienteCrear, session: SessionDep) -> ClientePublico:
    cliente = guardar_cliente(session, datos)   # tiene hashed_password
    return cliente                              # sale solo id, nombre, email

# Si devuelves un tipo distinto al anotado, usa response_model
@app.get("/clientes/{cliente_id}", response_model=ClientePublico)
def obtener_cliente(cliente_id: int, session: SessionDep):
    return session.get(Cliente, cliente_id)
```

## bad

```python
@app.post("/clientes")
def crear(datos: ClienteCrear) -> ClienteCrear:
    guardar(datos)
    return datos            # devuelve el password
```

The input model is used as the output.

## good

```python
@app.post("/clientes", status_code=201)
def crear(datos: ClienteCrear) -> ClientePublico:
    return guardar(datos)   # FastAPI filtra
```

Separate input and output; inheritance avoids repeating fields.

## bridge:typescript

It's the idea of DTOs: having a `CreateClienteDto` type for what comes in and a `ClienteResponse` for what goes out. The difference is that here the output model isn't just a type: it's validated and filtered at runtime. Pydantic versus a TS interface: the interface disappears at compile time; the model acts.

## interview

I define different models for input and output, usually with a shared base class. The input validates what the client can send and the output controls what I expose: if I annotate the return type or use response_model, FastAPI filters the fields, so a password hash never leaks. If the body doesn't comply, the client gets a 422 with the details; if my response doesn't comply, it's a 500 because it's a server error.

## myths

- Using the same model for input, output and the table.
- Returning an ORM object without `from_attributes=True`.
- If your response doesn't match the output model, the error is a **500** (your bug), not a 422.
- By default extra fields are ignored; with `model_config = ConfigDict(extra="forbid")` you reject them.
