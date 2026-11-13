---
title: Estructura de un proyecto real
short: Estructura del proyecto
summary: "Separa por responsabilidad: routers, servicios, repositorios, schemas, models y configuración con pydantic-settings."
concepts:
  api-router:
    name: APIRouter
    aliases: []
  capas:
    name: capas (router, servicio, repositorio)
    aliases:
      - layers (router, service, repository)
  settings:
    name: Settings
    aliases: []
exercises:
  - type: classify
    prompt: ¿En qué capa va cada cosa?
    categories:
      - router
      - servicio
      - repositorio
      - schemas
      - config
    items:
      - text: Validar que hay stock antes de crear el pedido
        category: servicio
        why: Regla de negocio.
      - text: Definir prefix /pedidos y status_code 201
        category: router
        why: Detalle HTTP.
      - text: Ejecutar un SELECT con filtros y paginación
        category: repositorio
        why: Acceso a datos.
      - text: Leer DATABASE_URL del entorno
        category: config
        why: pydantic-settings.
      - text: Declarar qué campos acepta el POST
        category: schemas
        why: Modelo Pydantic de entrada.
---

## definition

Separa por responsabilidad: **routers** (HTTP), **servicios** (reglas de negocio), **repositorios** (acceso a datos), **schemas** (Pydantic), **models** (tablas) y **configuración** con pydantic-settings. `APIRouter` modulariza las rutas y `lifespan` maneja el arranque y el apagado (los eventos `on_event` están deprecados).

## analogy

En un restaurante, el mesero (router) toma el pedido, el chef (servicio) decide cómo prepararlo y el bodeguero (repositorio) trae los ingredientes. El mesero no cocina y el chef no atiende mesas.

## problem

Con todo en `main.py`, la lógica de negocio queda mezclada con HTTP y SQL: no se puede probar sin levantar la API ni reutilizar desde un script o un worker.

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

Credenciales en el código, sin validación, reglas y SQL en el handler.

## good

```python
@router.post("", status_code=201)
def crear(datos: PedidoCrear, servicio: PedidoServiceDep) -> PedidoPublico:
    return servicio.crear(datos)
```

El router solo traduce HTTP; el servicio contiene la regla y se prueba solo.

## bridge:typescript

Es la organización por *features* que ya usas en el frontend: cada carpeta con su router (como las rutas del feature), sus servicios y sus modelos. `Settings` ≈ un archivo de configuración por entorno o `import.meta.env`, pero se lee de variables de entorno en ejecución, no al compilar.

## interview

Organizo por features, y dentro de cada uno separo router, esquemas, modelos, servicio y, si hace falta, repositorio. El router solo maneja HTTP; el servicio tiene las reglas de negocio y no conoce HTTP; el repositorio encapsula las consultas. La configuración sale de variables de entorno con pydantic-settings, las dependencias comunes viven en un módulo deps, y uso lifespan para el arranque y el apagado. Ajusto la cantidad de capas al tamaño del proyecto.

## myths

- Sobreingeniería: un repositorio para un CRUD de tres tablas puede sobrar. Empieza simple.
- Commitear el `.env` con secretos.
- Usar `@app.on_event("startup")`: está deprecado, usa `lifespan`.
- Imports circulares entre módulos de distintos features.
