---
title: Dependency injection with Depends
short: Depends
summary: Depends tells FastAPI which function to run before your endpoint, on every request, and passes it that function's result.
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
        why: Within a single request, FastAPI stores the result of each dependency and hands it to every piece that asks for it, so both work with the same session. On the next request it runs it again.
      - q: "What's wrong with `session: Session = Depends(get_session())`?"
        options:
          - Nothing
          - async is missing
          - It passes the result of calling the function, not the function
          - Depends only accepts classes
        answer: 2
        why: "With parentheses, `get_session` is called once, when the file loads, and `Depends` receives what it returned. FastAPI needs the function uncalled, so it can call it itself on every request: `Depends(get_session)`."
---

## definition

`Depends` is how you tell FastAPI: "before running my endpoint, run this other function and give me what it returns".

That other function is called a **dependency**. It is used for what many endpoints need in the same way: opening the database connection, reading the user from the token or computing pagination.

## analogy

A surgeon and the scrub nurse. The surgeon (your endpoint) does not go to the storeroom to fetch the scalpel (what the dependency delivers, like the database session) or sterilize it afterwards. The scrub nurse (FastAPI) prepares it before the operation, puts it in the surgeon's hand and collects it at the end. The surgeon only says what is needed.

## problem

Without dependencies, every endpoint repeats the same lines to open the database session or read the token. And in tests you cannot swap the real database for a test one, because it is written inside each endpoint.

## code:example

### Step 1. A dependency is a normal function

```python
from fastapi import Depends, FastAPI

app = FastAPI()

def paginacion(pagina: int = 1, tamano: int = 20) -> dict:
    # FastAPI takes pagina and tamano from the URL: /v1/productos?pagina=2&tamano=10
    return {"offset": (pagina - 1) * tamano, "limit": tamano}

@app.get("/v1/productos")
def listar_productos(pag: dict = Depends(paginacion)):   # no parentheses: I give it the function
    return pag    # FastAPI already called paginacion and left its result here

# GET /v1/productos?pagina=2&tamano=10
# {"offset":10,"limit":10}
```

`offset` is how many products to skip and `limit`, how many to return. On each request the order is: the request arrives, FastAPI runs `paginacion`, and then it runs `listar_productos` with that result.

### Step 2. A dependency that opens something and closes it at the end

With `yield` instead of `return` ([[yield]]), the function stays paused while the endpoint works and continues afterwards, once the response has already been sent. That way the `with` ([[context-manager]]) closes the database session ([[session-orm]]) without the endpoint noticing.

```python
from sqlmodel import Session, select

def get_session():
    with Session(engine) as session:   # 1. opens the session (engine: the connection, from app/db.py)
        yield session                  # 2. hands it to the endpoint and waits
                                       # 3. once the response has gone out, the with closes the session

@app.get("/v1/productos")
def listar_productos(session: Session = Depends(get_session)):
    return session.exec(select(Producto)).all()   # queries all the products; it does not open or close anything
```

### Step 3. A short name so you do not repeat `Depends(...)`

`Annotated` joins the type and the dependency into a single name you can reuse.

```python
from typing import Annotated

SessionDep = Annotated[Session, Depends(get_session)]   # "a Session that comes out of get_session"

@app.get("/v1/productos")
def listar_productos(session: SessionDep):            # same as step 2, shorter
    return session.exec(select(Producto)).all()

@app.get("/v1/productos/{id}")
def obtener_producto(id: int, session: SessionDep):   # reused in all the endpoints
    return session.get(Producto, id)                  # looks up a product by its id
```

### Step 4. In tests, the dependency is swapped for another one

`app.dependency_overrides` is a dictionary that says: "every time someone asks for this function, use this other one".

```python
def get_session_de_prueba():
    with Session(engine_de_prueba) as session:   # a separate database, only for tests
        yield session

app.dependency_overrides[get_session] = get_session_de_prueba
```

The endpoints do not change a single line: they still ask for `SessionDep` and receive the test session. To remove the swap, you empty the dictionary: `app.dependency_overrides = {}`.

### Step 5. In the project: the orders of the customer who asks

In the store, the dependencies live in `app/deps.py`: `SessionDep`, like the one in step 3, and `ClienteActual`, which reads the token and returns the customer making the request ([[autenticacion-en-fastapi]]). `router` is the `APIRouter` of the file.

```python
# app/pedidos/router.py
from sqlmodel import select

from app.deps import ClienteActual, SessionDep
from app.pedidos.models import Pedido

@router.get("/v1/pedidos")
def listar_pedidos(cliente: ClienteActual, session: SessionDep):
    # FastAPI already ran the two dependencies: the customer from the token and an open session arrive.
    consulta = select(Pedido).where(Pedido.cliente_id == cliente.id)   # only their own
    return session.exec(consulta).all()
```

FastAPI calls `listar_pedidos` on every `GET /v1/pedidos`, but first it runs `ClienteActual` and `SessionDep`. The endpoint does not know how a token is read or how a session is opened: it only says what it needs.

## bad

```python
session = Session(engine)            # a single session, created when the file loads

@app.get("/v1/productos")
def listar_productos():
    return session.exec(select(Producto)).all()
```

All the requests share the same session, which is never closed. FastAPI runs `def` functions in several threads at once ([[hilos-vs-procesos]]), and the SQLAlchemy documentation warns that a session cannot be shared between threads without special care. In tests, besides, there is no way to swap it for another one.

## good

```python
@app.get("/v1/productos")
def listar_productos(session: SessionDep):   # a new session on every request
    return session.exec(select(Producto)).all()
```

Each request receives its own session, which is closed when it finishes, and in tests it is swapped with `dependency_overrides`.

## bridge:typescript

In the frontend you already inject dependencies when you pass a function what it needs (for example, the HTTP client) instead of creating it inside. The difference that confuses most: in FastAPI you do not register anything in a container or mark classes; the dependency is a function, it is requested in the parameters with `Depends` and it runs on every request. For tests, `app.dependency_overrides` plays the role of `vi.mock`: it swaps one piece for another without touching the code that uses it.

## interview

`Depends` tells FastAPI that a parameter is produced by another function, the dependency, which FastAPI runs before the endpoint on every request. It is used for what many endpoints need in the same way, like the database session or the customer that comes in the token. If the dependency uses `yield`, the code after the `yield` runs once the response has gone out, and that is how the session is closed without the endpoint doing it. Within a single request, if two pieces ask for the same dependency, FastAPI runs it only once. With `Annotated` I give it a short name, like `SessionDep`, and in tests I swap it for another one with `app.dependency_overrides`, without touching the endpoints.

## myths

- **"`Depends(get_session())` and `Depends(get_session)` are the same."** With parentheses you call the function yourself, once, when the file loads, and `Depends` receives what it returned. FastAPI needs the function uncalled, so it can call it itself on every request.
- **"The dependency is created once and shared."** It runs again on every request: each request receives its own session. Only within a single request, if two pieces ask for the same dependency, FastAPI runs it once and gives them the same result.
- **"It is framework magic."** It is a normal function that FastAPI calls before yours. Put a `print` in it and you will see it runs first.
