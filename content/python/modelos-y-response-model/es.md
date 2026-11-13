---
title: Modelos de entrada y salida, validación y response_model
short: Modelos y response_model
summary: "Separa los esquemas: lo que entra, lo que sale y lo que se guarda."
concepts:
  response-model:
    name: response_model
    aliases: []
  modelos-de-entrada-y-salida:
    name: modelos de entrada y salida
    aliases:
      - input and output models
exercises:
  - type: choice
    prompt: ¿Qué código de estado devuelve?
    items:
      - q: El handler devuelve un dict sin el campo `id`, que es obligatorio en `ClientePublico`.
        options:
          - 200 sin id
          - "422"
          - "500"
          - "204"
        answer: 2
        why: "Falla la validación de la respuesta (ResponseValidationError). Es un error del servidor: 500."
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: ¿Qué hace FastAPI con los campos que no están en el modelo de salida?
        options:
          - Los devuelve igual
          - Los filtra
          - Lanza 422
          - Los convierte a null
        answer: 1
        why: "El modelo de respuesta funciona como filtro: solo sale lo declarado."
---

## definition

Separa los esquemas: lo que **entra** (`ClienteCrear`), lo que **sale** (`ClientePublico`) y lo que se **guarda**. El tipo de retorno del endpoint, o `response_model`, valida y **filtra** la respuesta: solo salen los campos del modelo de salida.

## analogy

La carta que ve el cliente no muestra el costo de los ingredientes ni el proveedor, aunque la cocina los conozca.

## problem

Con un solo modelo para todo terminas devolviendo el hash de la contraseña o permitiendo que el cliente envíe campos que no debería, como `es_admin`.

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

El modelo de entrada se usa como salida.

## good

```python
@app.post("/clientes", status_code=201)
def crear(datos: ClienteCrear) -> ClientePublico:
    return guardar(datos)   # FastAPI filtra
```

Entrada y salida separadas; la herencia evita repetir campos.

## bridge:typescript

Es la idea de los DTO: tener un tipo `CreateClienteDto` para lo que entra y otro `ClienteResponse` para lo que sale. La diferencia es que aquí el modelo de salida no es solo un tipo: se valida y filtra en ejecución. Pydantic frente a una interfaz de TS: la interfaz desaparece al compilar; el modelo actúa.

## interview

Defino modelos distintos para entrada y salida, normalmente con una clase base compartida. La entrada valida lo que el cliente puede enviar y la salida controla lo que expongo: si anoto el retorno o uso response_model, FastAPI filtra los campos, así nunca se filtra un hash de contraseña. Si el body no cumple, el cliente recibe 422 con el detalle; si mi respuesta no cumple, es un 500 porque es un error del servidor.

## myths

- Usar el mismo modelo para entrada, salida y tabla.
- Devolver un objeto ORM sin `from_attributes=True`.
- Si tu respuesta no cumple el modelo de salida, el error es un **500** (bug tuyo), no un 422.
- Por defecto los campos extra se ignoran; con `model_config = ConfigDict(extra="forbid")` los rechazas.
