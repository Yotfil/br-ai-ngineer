---
title: OpenAPI automático y despliegue con Uvicorn y Docker
short: OpenAPI, Uvicorn y Docker
summary: FastAPI genera un esquema OpenAPI a partir de rutas, type hints y modelos, y lo sirve en /docs, /redoc y /openapi.json.
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
    prompt: Pregunta rápida
    items:
      - q: Dentro de Docker Compose, ¿qué host va en DATABASE_URL para llegar a Postgres?
        options:
          - localhost
          - 127.0.0.1
          - db (el nombre del servicio)
          - 0.0.0.0
        answer: 2
        why: Compose crea una red donde cada servicio se resuelve por su nombre.
      - q: ¿Qué diferencia a `fastapi run` de `fastapi dev`?
        options:
          - Ninguna
          - "run es para producción: sin recarga y escucha en 0.0.0.0"
          - run no usa Uvicorn
          - dev no genera /docs
        answer: 1
        why: dev recarga al guardar y escucha en 127.0.0.1; run está pensado para producción.
---

## definition

FastAPI genera un esquema **OpenAPI** a partir de rutas, type hints y modelos, y lo sirve en `/docs` (Swagger UI), `/redoc` y `/openapi.json`. En producción corre sobre **Uvicorn**, un servidor ASGI; `fastapi run` lo usa por debajo. La documentación oficial lo empaqueta en Docker con la imagen `python:3.14`.

## analogy

OpenAPI es la carta del restaurante que se reimprime sola cada vez que cambias una receta.

## problem

La documentación escrita a mano se desactualiza al primer cambio. En despliegue, usar el modo dev o la forma shell del CMD causa problemas: recarga innecesaria y un apagado que no ejecuta el lifespan.

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

Modo dev en producción, CMD en forma shell (sin apagado limpio) y localhost dentro del contenedor, que es el propio contenedor.

## good

```python
CMD ["fastapi", "run", "app/main.py", "--port", "80"]
# DATABASE_URL=...@db:5432/tienda
```

Forma exec y el nombre del servicio de Compose como host.

## bridge:typescript

`fastapi dev` vs `fastapi run` ≈ el servidor de desarrollo (`vite dev`) vs servir el build. Uvicorn ocupa el lugar del servidor HTTP de Node. Con `/openapi.json` puedes generar el cliente tipado de TypeScript con openapi-generator y dejar de escribir interfaces a mano.

## interview

FastAPI genera OpenAPI automáticamente a partir de los type hints y los modelos Pydantic, así que Swagger siempre refleja el código y puedo generar clientes tipados. Para producción uso fastapi run, que corre Uvicorn sin recarga, dentro de un contenedor Docker con el CMD en forma exec para un apagado limpio. La configuración llega por variables de entorno, y con Docker Compose levanto la API junto a PostgreSQL usando el nombre del servicio como host.

## myths

- Usar `localhost` para la BD dentro de Docker Compose: usa el nombre del servicio.
- Meter secretos en la imagen en vez de variables de entorno.
- Dejar `/docs` público en una API interna sin pensarlo.
- Varios workers en un contenedor cuando ya escalas con réplicas: la doc recomienda un proceso por contenedor en ese caso.
