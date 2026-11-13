---
title: Testing con pytest y TestClient
short: pytest y TestClient
summary: pytest descubre funciones test_* en archivos test_*.py, usa assert normal y prepara contexto con fixtures inyectadas por nombre.
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
    prompt: Pregunta rápida
    items:
      - q: ¿Cómo recibe un test una fixture llamada `client`?
        options:
          - Con un import
          - Declarando un parámetro llamado client
          - Con el decorador @use("client")
          - Llamando client()
        answer: 1
        why: pytest inyecta la fixture por nombre de parámetro.
      - q: ¿Para qué sirve `app.dependency_overrides`?
        options:
          - Cambiar rutas
          - Reemplazar dependencias como la sesión o el usuario actual en tests
          - Desactivar validación
          - Cachear respuestas
        answer: 1
        why: Es el mecanismo oficial para inyectar dobles de prueba.
---

## definition

**pytest** descubre funciones `test_*` en archivos `test_*.py`, usa `assert` normal y prepara contexto con **fixtures**, que se inyectan por nombre de parámetro. **TestClient** (basado en HTTPX) hace peticiones a tu app sin levantar un servidor. `app.dependency_overrides` reemplaza la BD o el usuario actual.

## analogy

Un ensayo general con utilería: el escenario y los actores son los reales, pero la comida es de plástico.

## problem

Sin tests, cada cambio en un modelo o una dependencia puede romper endpoints en silencio. Con tests que usan la BD de desarrollo, los resultados dependen del orden y de datos viejos.

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

Lento, frágil y deja basura en la base.

## good

```python
def test_crear(client):
    r = client.post("/productos", json={...})
    assert r.status_code == 201
```

Sin servidor, con BD aislada por fixture.

## bridge:typescript

pytest ≈ Jest o Vitest, y `assert` ≈ `expect`. Una fixture ≈ `beforeEach`, pero se inyecta por el **nombre del parámetro** (otra vez inyección de dependencias). `dependency_overrides` ≈ `jest.mock` sobre un módulo, y TestClient ≈ supertest.

## interview

Uso pytest con fixtures para preparar una base de datos aislada, normalmente SQLite en memoria o un Postgres de pruebas, y TestClient para llamar los endpoints sin servidor. Con dependency_overrides reemplazo la sesión y el usuario autenticado. Pruebo el camino feliz y los errores: validación 422, 401, 403 y 404. Con parametrize cubro varios casos sin duplicar código, y las reglas de negocio de los servicios las pruebo con tests unitarios sin HTTP.

## myths

- No limpiar `dependency_overrides` y contaminar otros tests.
- Probar solo el camino feliz: los 401, 404 y 422 también son contrato.
- No usar `with TestClient(app)`: sin el with no corre el lifespan.
- Archivos o funciones sin el prefijo `test_`: pytest no los encuentra.
