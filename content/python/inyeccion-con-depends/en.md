---
title: Dependency injection with Depends
short: Depends
summary: Depends declares that a parameter's value is provided by a function FastAPI runs before the handler, on every request.
concepts:
  depends:
    name: Depends
    aliases: []
  dependency-overrides:
    name: dependency_overrides
    aliases: []
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: Two dependencies of the same endpoint ask for `SessionDep`. How many times does `get_session` run in that request?
        options:
          - Once
          - Twice
          - Once per endpoint in the app
          - Just once when the app starts
        answer: 0
        why: FastAPI caches the result of each dependency within the same request.
      - q: "What's wrong with `session: Session = Depends(get_session())`?"
        options:
          - Nothing
          - async is missing
          - It passes the result of calling the function, not the function
          - Depends only accepts classes
        answer: 2
        why: "Depends expects the callable: `Depends(get_session)`."
---

## definition

`Depends` declares that a parameter's value is provided by a function that FastAPI runs **before the handler, on every request**. Dependencies can have their own dependencies (a tree), their result is cached within the same request, and if they use `yield` they run cleanup after responding.

## analogy

Mise en place: before the chef cooks, someone leaves the ingredients ready and measured. The chef doesn't go to the storeroom or wash the dishes at the end.

## problem

Without dependencies you repeat in every endpoint how to open the session, read the token or paginate, and you can't replace those pieces in tests.

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

A session shared by all requests: mixed-up data and unclosed connections.

## good

```python
@app.get("/pedidos")
def listar(session: SessionDep):
    return session.exec(select(Pedido)).all()
```

One session per request, closed at the end and replaceable in tests.

## bridge:typescript

It resembles a TypeScript dependency injection container (like InversifyJS or tsyringe), but there are differences worth mentioning in the interview. Those containers resolve by **type or token** and usually hand out singletons. FastAPI resolves by **function**, runs it on every request, and its parameters can come from the request itself (query, headers, body). For tests, `app.dependency_overrides` ≈ `jest.mock` on a module.

## interview

Depends tells FastAPI that a parameter is produced by another function. FastAPI resolves the dependency tree before the handler, on every request, and caches the results within that request. With yield I can open and close resources like the database session. Unlike classic injection containers, there are no singletons by default nor resolution by type, and in tests I replace dependencies with dependency_overrides.

## myths

- Writing `Depends(get_session())` with parentheses: you pass the result, not the function.
- Expecting a singleton: each request creates its own value.
- Putting heavy business logic inside dependencies.
- Not creating aliases with `Annotated` and repeating `Depends(...)` in every endpoint.
