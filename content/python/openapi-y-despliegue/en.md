---
title: Automatic OpenAPI and deployment with Uvicorn and Docker
short: OpenAPI, Uvicorn and Docker
summary: FastAPI generates an OpenAPI schema from routes, type hints and models, and serves it at /docs, /redoc and /openapi.json.
concepts:
  openapi:
    name: OpenAPI
    aliases: []
  uvicorn:
    name: Uvicorn
    aliases: []
  docker:
    name: Docker
    aliases: []
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: Inside Docker Compose, which host goes in DATABASE_URL to reach Postgres?
        options:
          - localhost
          - 127.0.0.1
          - db (the service name)
          - 0.0.0.0
        answer: 2
        why: Compose creates a network where each service is resolved by its name.
      - q: What sets `fastapi run` apart from `fastapi dev`?
        options:
          - None
          - "run is for production: no reloading and listens on 0.0.0.0"
          - run does not use Uvicorn
          - dev does not generate /docs
        answer: 1
        why: dev reloads on save and listens on 127.0.0.1; run is meant for production.
---

## definition

FastAPI generates an **OpenAPI** schema from routes, type hints and models, and serves it at `/docs` (Swagger UI), `/redoc` and `/openapi.json`. In production it runs on **Uvicorn**, an ASGI server; `fastapi run` uses it under the hood. The official documentation packages it in Docker with the `python:3.14` image.

## analogy

OpenAPI is the restaurant menu that reprints itself every time you change a recipe.

## problem

Hand-written documentation goes stale at the first change. In deployment, using dev mode or the shell form of CMD causes problems: unnecessary reloading and a shutdown that does not run the lifespan.

## code:example

```python
app = FastAPI(title="Tienda API", version="1.0.0")

@app.get(
    "/productos/{producto_id}",
    tags=["productos"],
    summary="Obtener un producto",
    responses={404: {"description": "El producto no existe"}},
)
def obtener(producto_id: int) -> ProductoPublico: ...

# Desarrollo: recarga automática, solo en 127.0.0.1
#   uv run fastapi dev app/main.py
# Producción: sin recarga, escucha en 0.0.0.0
#   fastapi run app/main.py --port 80
```

```text
# Dockerfile (basado en la documentación oficial)
FROM python:3.14
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt      # generado con uv export
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY ./app /code/app
CMD ["fastapi", "run", "app/main.py", "--port", "80"]

# compose.yaml
services:
  api:
    build: .
    ports: ["8000:80"]
    env_file: .env          # DATABASE_URL=postgresql+psycopg://tienda:secreto@db:5432/tienda
    depends_on: [db]
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: tienda
      POSTGRES_PASSWORD: secreto
      POSTGRES_DB: tienda
    volumes: ["pgdata:/var/lib/postgresql/data"]
volumes:
  pgdata:
```

## bad

```python
CMD fastapi dev app/main.py --host 0.0.0.0
# DATABASE_URL=...@localhost:5432/tienda
```

Dev mode in production, CMD in shell form (no clean shutdown) and localhost inside the container, which is the container itself.

## good

```python
CMD ["fastapi", "run", "app/main.py", "--port", "80"]
# DATABASE_URL=...@db:5432/tienda
```

Exec form and the Compose service name as host.

## bridge:typescript

`fastapi dev` vs `fastapi run` ≈ the development server (`vite dev`) vs serving the build. Uvicorn takes the place of Node's HTTP server. With `/openapi.json` you can generate the typed TypeScript client with openapi-generator and stop writing interfaces by hand.

## interview

FastAPI generates OpenAPI automatically from the type hints and the Pydantic models, so Swagger always reflects the code and I can generate typed clients. For production I use fastapi run, which runs Uvicorn without reloading, inside a Docker container with CMD in exec form for a clean shutdown. Configuration arrives through environment variables, and with Docker Compose I bring up the API alongside PostgreSQL using the service name as host.

## myths

- Using `localhost` for the DB inside Docker Compose: use the service name.
- Putting secrets in the image instead of environment variables.
- Leaving `/docs` public on an internal API without thinking about it.
- Several workers in one container when you already scale with replicas: the docs recommend one process per container in that case.
