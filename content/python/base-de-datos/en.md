---
title: "Database: SQLAlchemy or SQLModel, sessions and migrations"
short: DB, sessions and Alembic
summary: An ORM maps classes to tables.
concepts:
  orm:
    name: ORM
    aliases: []
  sqlalchemy:
    name: SQLAlchemy
    aliases: []
  sqlmodel:
    name: SQLModel
    aliases: []
  session-orm:
    name: Session
    aliases:
      - sesión de base de datos
      - database session
  alembic:
    name: Alembic
    aliases:
      - migraciones
      - migrations
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: You did `session.add(producto)` and responded 201, but the product does not show up in the database. What was missing?
        options:
          - refresh()
          - commit()
          - flush()
          - close()
        answer: 1
        why: Without commit the transaction is discarded when the session closes.
      - q: What does `alembic revision --autogenerate` do?
        options:
          - Applies the migrations
          - Compares your models with the current schema and generates a script to review
          - Drops and recreates the tables
          - Generates the models from the DB
        answer: 1
        why: It generates the migration; you apply it with `alembic upgrade head` after reviewing it.
---

## definition

An **ORM** maps classes to tables. SQLAlchemy 2.0 is the standard in Python; **SQLModel**, by the same author as FastAPI, combines SQLAlchemy and Pydantic and is what the official documentation uses. The **Session** is the unit of work of a request: you accumulate changes and they are applied with `commit()`. **Alembic** versions the schema with migrations.

## analogy

The Session is a shopping cart: you add, change and remove, but nothing is charged until the commit. Migrations are the records of each remodel of the store: numbered, in order and reversible.

## problem

The N+1 problem (one query per row when accessing a relationship) and concatenating text into SQL are the two most-asked mistakes. And `create_all()` is no good for evolving the schema in production.

## code:example

```python
from sqlmodel import Field, Session, SQLModel, create_engine, select

class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    precio: int
    stock: int = 0

# PostgreSQL con psycopg 3 (uv add "psycopg[binary]")
DATABASE_URL = "postgresql+psycopg://tienda:secreto@localhost:5432/tienda"
engine = create_engine(DATABASE_URL)

@app.post("/productos", status_code=201)
def crear_producto(datos: ProductoCrear, session: SessionDep) -> Producto:
    producto = Producto.model_validate(datos)
    session.add(producto)
    session.commit()
    session.refresh(producto)        # trae el id generado
    return producto

@app.get("/productos")
def listar(session: SessionDep, categoria: str | None = None) -> list[Producto]:
    consulta = select(Producto)
    if categoria:
        consulta = consulta.where(Producto.categoria == categoria)
    return session.exec(consulta).all()

# Migraciones
# uv add alembic
# uv run alembic init migrations
# uv run alembic revision --autogenerate -m "crear tabla productos"
# uv run alembic upgrade head
```

## bad

```python
pedidos = session.exec(select(Pedido)).all()
for p in pedidos:
    print(p.cliente.nombre)    # 1 consulta por pedido

session.exec(text(f"SELECT * FROM productos WHERE nombre = '{nombre}'"))
```

N+1 queries and SQL injection.

## good

```python
from sqlalchemy.orm import selectinload

consulta = select(Pedido).options(selectinload(Pedido.cliente))
pedidos = session.exec(consulta).all()   # 2 consultas en total

session.exec(select(Producto).where(Producto.nombre == nombre))
```

Eager loading and parameters bound by the ORM.

## bridge:typescript

SQLModel or SQLAlchemy ≈ TypeORM or Prisma; Alembic ≈ `prisma migrate` or TypeORM migrations. The Session resembles TypeORM's `EntityManager`: a unit of work that groups changes.

## interview

I use SQLAlchemy or SQLModel to map models to tables, with one database session per request injected as a dependency, which is closed when it finishes. I add objects to the session, commit and refresh to get the generated values. To avoid N+1 I load relationships with selectinload or joinedload, I never concatenate SQL, and I evolve the schema with hand-reviewed Alembic migrations, not with create_all in production.

## myths

- Forgetting `commit()`: nothing gets saved.
- Sharing a global session across requests.
- Not reviewing the `--autogenerate` script: Alembic does not detect everything (for example, renames).
- Mixing AsyncSession with a synchronous driver.
