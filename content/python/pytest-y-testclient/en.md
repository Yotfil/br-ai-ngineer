---
title: Testing with pytest and TestClient
short: pytest and TestClient
summary: pytest discovers test_* functions in test_*.py files, uses plain assert and sets up context with fixtures injected by name.
concepts:
  pytest:
    name: pytest
    aliases: []
  fixture:
    name: fixture
    aliases: []
  testclient:
    name: TestClient
    aliases: []
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: How does a test receive a fixture called `client`?
        options:
          - With an import
          - By declaring a parameter called client
          - With the @use("client") decorator
          - By calling client()
        answer: 1
        why: pytest injects the fixture by parameter name.
      - q: What is `app.dependency_overrides` for?
        options:
          - Changing routes
          - Replacing dependencies like the session or the current user in tests
          - Disabling validation
          - Caching responses
        answer: 1
        why: It is the official mechanism for injecting test doubles.
---

## definition

**pytest** discovers `test_*` functions in `test_*.py` files, uses plain `assert` and sets up context with **fixtures**, which are injected by parameter name. **TestClient** (based on HTTPX) makes requests to your app without starting a server. `app.dependency_overrides` replaces the DB or the current user.

## analogy

A dress rehearsal with props: the stage and the actors are real, but the food is plastic.

## problem

Without tests, every change to a model or a dependency can silently break endpoints. With tests that use the development DB, results depend on the order and on stale data.

## code:example

```python
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.db import get_session

@pytest.fixture
def session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool)      # BD en memoria
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        yield s

@pytest.fixture
def client(session):
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as c:                         # corre el lifespan
        yield c
    app.dependency_overrides.clear()

def test_crear_producto(client):
    r = client.post("/productos", json={"nombre": "Café", "precio": 25000})
    assert r.status_code == 201
    assert r.json()["nombre"] == "Café"

@pytest.mark.parametrize("limite, esperado", [(1, 200), (100, 200), (101, 422)])
def test_limite(client, limite, esperado):
    assert client.get(f"/productos?limite={limite}").status_code == esperado
```

## bad

```python
def test_crear():
    r = requests.post("http://localhost:8000/productos", json={...})
    assert r.status_code == 201   # requiere servidor y BD reales
```

Slow, fragile and leaves junk in the database.

## good

```python
def test_crear(client):
    r = client.post("/productos", json={...})
    assert r.status_code == 201
```

No server, with a DB isolated per fixture.

## bridge:typescript

pytest ≈ Jest or Vitest, and `assert` ≈ `expect`. A fixture ≈ `beforeEach`, but it is injected by the **parameter name** (dependency injection again). `dependency_overrides` ≈ `jest.mock` on a module, and TestClient ≈ supertest.

## interview

I use pytest with fixtures to set up an isolated database, usually in-memory SQLite or a test Postgres, and TestClient to call the endpoints without a server. With dependency_overrides I replace the database session and the authenticated user. I test the happy path and the errors: 422 validation, 401, 403 and 404. With parametrize I cover several cases without duplicating code, and I test the services' business rules with unit tests without HTTP.

## myths

- Not clearing `dependency_overrides` and contaminating other tests.
- Testing only the happy path: 401, 404 and 422 are part of the contract too.
- Not using `with TestClient(app)`: without the with, lifespan does not run.
- Files or functions without the `test_` prefix: pytest doesn't find them.
