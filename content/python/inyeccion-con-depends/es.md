---
title: Inyección de dependencias con Depends
short: Depends
summary: Depends declara que el valor de un parámetro lo provee una función que FastAPI ejecuta antes del handler, en cada petición.
concepts:
  depends:
    name: Depends
    aliases: []
  dependency-overrides:
    name: dependency_overrides
    aliases: []
exercises:
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: Dos dependencias del mismo endpoint piden `SessionDep`. ¿Cuántas veces corre `get_session` en esa petición?
        options:
          - Una
          - Dos
          - Una por cada endpoint de la app
          - Una sola vez al arrancar la app
        answer: 0
        why: FastAPI cachea el resultado de cada dependencia dentro de la misma petición.
      - q: "¿Qué está mal en `session: Session = Depends(get_session())`?"
        options:
          - Nada
          - Falta async
          - Se pasa el resultado de llamar la función, no la función
          - Depends solo acepta clases
        answer: 2
        why: "Depends espera el callable: `Depends(get_session)`."
---

## definition

`Depends` declara que el valor de un parámetro lo provee una función que FastAPI ejecuta **antes del handler, en cada petición**. Las dependencias pueden tener sus propias dependencias (un árbol), su resultado se cachea dentro de la misma petición, y si usan `yield` ejecutan limpieza después de responder.

## analogy

El mise en place: antes de que el chef cocine, alguien le deja listos y medidos los ingredientes. El chef no va a la bodega ni lava los platos al final.

## problem

Sin dependencias repites en cada endpoint cómo abrir la sesión, leer el token o paginar, y no puedes reemplazar esas piezas en los tests.

## code:example

```python
from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, select

def get_session():
    with Session(engine) as session:
        yield session              # tras la respuesta, se cierra

SessionDep = Annotated[Session, Depends(get_session)]

def paginacion(pagina: int = 1, tamano: int = 20) -> dict:
    return {"offset": (pagina - 1) * tamano, "limit": tamano}

PaginacionDep = Annotated[dict, Depends(paginacion)]

@app.get("/pedidos")
def listar_pedidos(session: SessionDep, pag: PaginacionDep) -> list[PedidoPublico]:
    consulta = select(Pedido).offset(pag["offset"]).limit(pag["limit"])
    return session.exec(consulta).all()
```

## bad

```python
session = Session(engine)       # global, compartida

@app.get("/pedidos")
def listar():
    return session.exec(select(Pedido)).all()
```

Una sesión compartida por todas las peticiones: datos cruzados y conexiones sin cerrar.

## good

```python
@app.get("/pedidos")
def listar(session: SessionDep):
    return session.exec(select(Pedido)).all()
```

Una sesión por petición, cerrada al terminar y reemplazable en tests.

## bridge:typescript

Se parece a un contenedor de inyección de dependencias de TypeScript (como InversifyJS o tsyringe), pero hay diferencias que conviene decir en la entrevista. Esos contenedores resuelven por **tipo o token** y suelen entregar singletons. FastAPI resuelve por **función**, la ejecuta en cada petición y sus parámetros pueden salir de la propia petición (query, cabeceras, body). Para tests, `app.dependency_overrides` ≈ `jest.mock` sobre un módulo.

## interview

Depends le dice a FastAPI que un parámetro lo produce otra función. FastAPI resuelve el árbol de dependencias antes del handler, en cada petición, y cachea los resultados dentro de esa petición. Con yield puedo abrir y cerrar recursos como la sesión de base de datos. A diferencia de los contenedores de inyección clásicos, no hay singletons por defecto ni resolución por tipo, y en tests reemplazo dependencias con dependency_overrides.

## myths

- Escribir `Depends(get_session())` con paréntesis: le pasas el resultado, no la función.
- Esperar un singleton: cada petición crea su propio valor.
- Poner lógica de negocio pesada dentro de las dependencias.
- No crear alias con `Annotated` y repetir `Depends(...)` en todos los endpoints.
