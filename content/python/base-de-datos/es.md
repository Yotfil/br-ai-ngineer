---
title: "Base de datos: SQLAlchemy o SQLModel, sesiones y migraciones"
short: BD, sesiones y Alembic
summary: Un ORM mapea clases a tablas.
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
    prompt: Pregunta rápida
    items:
      - q: Hiciste `session.add(producto)` y respondiste 201, pero el producto no aparece en la base de datos. ¿Qué faltó?
        options:
          - refresh()
          - commit()
          - flush()
          - close()
        answer: 1
        why: Sin commit la transacción se descarta al cerrar la sesión.
      - q: ¿Qué hace `alembic revision --autogenerate`?
        options:
          - Aplica las migraciones
          - Compara tus modelos con el esquema actual y genera un script para revisar
          - Borra y recrea las tablas
          - Genera los modelos desde la BD
        answer: 1
        why: Genera la migración; la aplicas con `alembic upgrade head` después de revisarla.
---

## definition

Un **ORM** mapea clases a tablas. SQLAlchemy 2.0 es el estándar en Python; **SQLModel**, del mismo autor de FastAPI, combina SQLAlchemy y Pydantic y es lo que usa la documentación oficial. La **Session** es la unidad de trabajo de una petición: acumulas cambios y se aplican con `commit()`. **Alembic** versiona el esquema con migraciones.

## analogy

La Session es un carrito de compras: agregas, cambias y quitas, pero nada se cobra hasta el commit. Las migraciones son las actas de cada remodelación del local: numeradas, en orden y reversibles.

## problem

El problema N+1 (una consulta por cada fila al acceder a una relación) y concatenar texto en SQL son los dos errores que más se preguntan. Y `create_all()` no sirve para evolucionar el esquema en producción.

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

N+1 consultas e inyección SQL.

## good

```python
from sqlalchemy.orm import selectinload

consulta = select(Pedido).options(selectinload(Pedido.cliente))
pedidos = session.exec(consulta).all()   # 2 consultas en total

session.exec(select(Producto).where(Producto.nombre == nombre))
```

Carga anticipada y parámetros enlazados por el ORM.

## bridge:typescript

SQLModel o SQLAlchemy ≈ TypeORM o Prisma; Alembic ≈ `prisma migrate` o las migraciones de TypeORM. La Session se parece al `EntityManager` de TypeORM: un unit of work que agrupa cambios.

## interview

Uso SQLAlchemy o SQLModel para mapear modelos a tablas, con una sesión por petición inyectada como dependencia, que se cierra al terminar. Agrego objetos a la sesión, hago commit y refresh para obtener los valores generados. Para evitar N+1 cargo relaciones con selectinload o joinedload, nunca concateno SQL, y el esquema lo evoluciono con migraciones de Alembic revisadas a mano, no con create_all en producción.

## myths

- Olvidar `commit()`: no se guarda nada.
- Compartir una sesión global entre peticiones.
- No revisar el script de `--autogenerate`: Alembic no detecta todo (por ejemplo, renombrados).
- Mezclar AsyncSession con un driver síncrono.
