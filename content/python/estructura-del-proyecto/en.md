---
title: Structure of a real project
short: Project structure
summary: "Split by responsibility: routers, services, repositories, schemas, models and configuration with pydantic-settings."
concepts:
  api-router:
    name: APIRouter
    aliases: []
  capas:
    name: layers (router, service, repository)
    aliases:
      - capas (router, servicio, repositorio)
  settings:
    name: Settings
    aliases: []
exercises:
  - type: classify
    prompt: Which layer does each thing go in?
    categories:
      - router
      - service
      - repository
      - schemas
      - config
    items:
      - text: Validate there is stock before creating the order
        category: service
        why: Business rule.
      - text: Define prefix /pedidos and status_code 201
        category: router
        why: HTTP detail.
      - text: Run a SELECT with filters and pagination
        category: repository
        why: Data access.
      - text: Read DATABASE_URL from the environment
        category: config
        why: pydantic-settings.
      - text: Declare which fields the POST accepts
        category: schemas
        why: Pydantic input model.
---

## definition

Split by responsibility: **routers** (HTTP), **services** (business rules), **repositories** (data access), **schemas** (Pydantic), **models** (tables) and **configuration** with pydantic-settings. `APIRouter` modularizes the routes and `lifespan` handles startup and shutdown (the `on_event` events are deprecated).

## analogy

In a restaurant, the waiter (router) takes the order, the chef (service) decides how to prepare it and the storekeeper (repository) brings the ingredients. The waiter doesn't cook and the chef doesn't wait tables.

## problem

With everything in `main.py`, business logic ends up mixed with HTTP and SQL: it cannot be tested without starting the API nor reused from a script or a worker.

## code:example

```text
tienda-api/
├── pyproject.toml
├── uv.lock
├── .env                    # nunca al repo
├── alembic.ini
├── migrations/
├── app/
│   ├── main.py             # crea FastAPI, lifespan, incluye routers
│   ├── core/
│   │   ├── config.py       # Settings
│   │   └── security.py     # hash y JWT
│   ├── db.py               # engine y get_session
│   ├── deps.py             # SessionDep, ClienteActual
│   ├── pedidos/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── service.py
│   │   └── repository.py
│   └── productos/ ...
└── tests/
```

```python
# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    database_url: str
    secret_key: str
    token_minutos: int = 30
    cors_origins: list[str] = ["http://localhost:4200"]

settings = Settings()

# app/pedidos/router.py
router = APIRouter(prefix="/pedidos", tags=["pedidos"])

@router.post("", status_code=201)
def crear(datos: PedidoCrear, cliente: ClienteActual, session: SessionDep) -> PedidoPublico:
    return PedidoService(session).crear(datos, cliente)

# app/main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    # arranque: conexiones, cargar modelos de IA, etc.
    yield
    # apagado: liberar recursos

app = FastAPI(title="Tienda API", lifespan=lifespan)
app.include_router(pedidos.router)
app.include_router(productos.router)
```

## bad

```python
@app.post("/pedidos")
def crear(datos: dict):
    con = psycopg.connect("postgres://admin:1234@...")
    total = sum(i["precio"] * i["cantidad"] for i in datos["items"])
    if total > 1_000_000: ...
    con.execute(f"INSERT INTO pedido ...")
```

Credentials in the code, no validation, rules and SQL in the handler.

## good

```python
@router.post("", status_code=201)
def crear(datos: PedidoCrear, servicio: PedidoServiceDep) -> PedidoPublico:
    return servicio.crear(datos)
```

The router only translates HTTP; the service holds the rule and is tested on its own.

## bridge:typescript

It is the organization by *features* you already use on the frontend: each folder with its router (like the feature's routes), its services and its models. `Settings` ≈ a per-environment configuration file or `import.meta.env`, but it is read from environment variables at runtime, not at build time.

## interview

I organize by features, and within each one I separate router, schemas, models, service and, if needed, repository. The router only handles HTTP; the service has the business rules and knows nothing about HTTP; the repository encapsulates the queries. Configuration comes from environment variables with pydantic-settings, common dependencies live in a deps module, and I use lifespan for startup and shutdown. I adjust the number of layers to the size of the project.

## myths

- Overengineering: a repository for a three-table CRUD may be overkill. Start simple.
- Committing the `.env` with secrets.
- Using `@app.on_event("startup")`: it is deprecated, use `lifespan`.
- Circular imports between modules of different features.
