---
title: Inyección de dependencias con Depends
short: Depends
summary: Depends le dice a FastAPI qué función ejecutar antes de tu endpoint, en cada petición, y le pasa su resultado.
concepts:
  depends:
    name: Depends
    aliases: []
  dependency-overrides:
    name: dependency_overrides
    aliases: []
exercises:
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: Dos dependencias del mismo endpoint piden `SessionDep`. ¿Cuántas veces corre `get_session` en esa petición?
        options:
          - Una
          - Dos
          - Una por cada endpoint de la app
          - Una sola vez al arrancar la app
        answer: 0
        why: Dentro de una misma petición, FastAPI guarda el resultado de cada dependencia y se lo da a todas las piezas que la piden, así que las dos trabajan con la misma sesión. En la petición siguiente la vuelve a ejecutar.
      - q: "¿Qué está mal en `session: Session = Depends(get_session())`?"
        options:
          - Nada
          - Falta async
          - Se pasa el resultado de llamar la función, no la función
          - Depends solo acepta clases
        answer: 2
        why: "Con paréntesis, `get_session` se llama una sola vez, al cargar el archivo, y `Depends` recibe lo que devolvió. FastAPI necesita la función sin llamar, para llamarla él en cada petición: `Depends(get_session)`."
---

## definition

`Depends` sirve para decirle a FastAPI: "antes de ejecutar mi endpoint, ejecuta esta otra función y pásame lo que devuelva".

Esa otra función se llama **dependencia**. Se usa para lo que muchos endpoints necesitan por igual: abrir la conexión a la base de datos, leer el usuario del token o calcular la paginación.

## analogy

Un cirujano y su instrumentista. El cirujano (tu endpoint) no va al almacén a buscar el bisturí (lo que la dependencia entrega, como la sesión de base de datos) ni lo esteriliza al terminar. El instrumentista (FastAPI) lo prepara antes de la operación, se lo pone en la mano y lo recoge al final. El cirujano solo dice qué necesita.

## problem

Sin dependencias, cada endpoint repite las mismas líneas para abrir la sesión de base de datos o leer el token. Y en los tests no puedes cambiar la base de datos real por una de prueba, porque está escrita dentro de cada endpoint.

## code:example

### Paso 1. Una dependencia es una función normal

```python
from fastapi import Depends, FastAPI

app = FastAPI()

def paginacion(pagina: int = 1, tamano: int = 20) -> dict:
    # FastAPI saca pagina y tamano de la URL: /v1/productos?pagina=2&tamano=10
    return {"offset": (pagina - 1) * tamano, "limit": tamano}

@app.get("/v1/productos")
def listar_productos(pag: dict = Depends(paginacion)):   # sin paréntesis: le doy la función
    return pag    # FastAPI ya llamó a paginacion y dejó aquí su resultado

# GET /v1/productos?pagina=2&tamano=10
# {"offset":10,"limit":10}
```

`offset` es cuántos productos saltar y `limit`, cuántos devolver. En cada petición el orden es: llega la petición, FastAPI ejecuta `paginacion`, y después ejecuta `listar_productos` con ese resultado.

### Paso 2. Una dependencia que abre algo y lo cierra al final

Con `yield` en lugar de `return` ([[yield]]), la función se queda en pausa mientras el endpoint trabaja y continúa después, cuando la respuesta ya se envió. Así el `with` ([[context-manager]]) cierra la sesión de base de datos ([[session-orm]]) sin que el endpoint se entere.

```python
from sqlmodel import Session, select

def get_session():
    with Session(engine) as session:   # 1. abre la sesión (engine: la conexión, de app/db.py)
        yield session                  # 2. se la entrega al endpoint y espera
                                       # 3. cuando la respuesta ya salió, el with cierra la sesión

@app.get("/v1/productos")
def listar_productos(session: Session = Depends(get_session)):
    return session.exec(select(Producto)).all()   # consulta todos los productos; no abre ni cierra nada
```

### Paso 3. Un nombre corto para no repetir `Depends(...)`

`Annotated` junta el tipo y la dependencia en un solo nombre que puedes reutilizar.

```python
from typing import Annotated

SessionDep = Annotated[Session, Depends(get_session)]   # "una Session que sale de get_session"

@app.get("/v1/productos")
def listar_productos(session: SessionDep):            # igual que el paso 2, más corto
    return session.exec(select(Producto)).all()

@app.get("/v1/productos/{id}")
def obtener_producto(id: int, session: SessionDep):   # se reutiliza en todos los endpoints
    return session.get(Producto, id)                  # busca un producto por su id
```

### Paso 4. En los tests se cambia la dependencia por otra

`app.dependency_overrides` es un diccionario que dice: "cada vez que alguien pida esta función, usa esta otra".

```python
def get_session_de_prueba():
    with Session(engine_de_prueba) as session:   # una base de datos aparte, solo para tests
        yield session

app.dependency_overrides[get_session] = get_session_de_prueba
```

Los endpoints no cambian ni una línea: siguen pidiendo `SessionDep` y reciben la sesión de prueba. Para quitar el cambio se vacía el diccionario: `app.dependency_overrides = {}`.

### Paso 5. En el proyecto: los pedidos del cliente que pregunta

En la tienda, las dependencias viven en `app/deps.py`: `SessionDep`, como la del paso 3, y `ClienteActual`, que lee el token y devuelve el cliente que hace la petición ([[autenticacion-en-fastapi]]). `router` es el `APIRouter` del archivo.

```python
# app/pedidos/router.py
from sqlmodel import select

from app.deps import ClienteActual, SessionDep
from app.pedidos.models import Pedido

@router.get("/v1/pedidos")
def listar_pedidos(cliente: ClienteActual, session: SessionDep):
    # FastAPI ya ejecutó las dos dependencias: llegan el cliente del token y una sesión abierta.
    consulta = select(Pedido).where(Pedido.cliente_id == cliente.id)   # solo los suyos
    return session.exec(consulta).all()
```

FastAPI llama a `listar_pedidos` con cada `GET /v1/pedidos`, pero antes ejecuta `ClienteActual` y `SessionDep`. El endpoint no sabe cómo se lee un token ni cómo se abre una sesión: solo dice qué necesita.

## bad

```python
session = Session(engine)            # una sola sesión, creada al cargar el archivo

@app.get("/v1/productos")
def listar_productos():
    return session.exec(select(Producto)).all()
```

Todas las peticiones comparten la misma sesión, que nunca se cierra. FastAPI ejecuta las funciones `def` en varios hilos a la vez ([[hilos-vs-procesos]]), y la documentación de SQLAlchemy avisa que una sesión no se puede compartir entre hilos sin un cuidado especial. En los tests, además, no hay forma de cambiarla por otra.

## good

```python
@app.get("/v1/productos")
def listar_productos(session: SessionDep):   # una sesión nueva en cada petición
    return session.exec(select(Producto)).all()
```

Cada petición recibe su propia sesión, que se cierra al terminar, y en los tests se cambia con `dependency_overrides`.

## bridge:typescript

En el frontend ya inyectas dependencias cuando le pasas a una función lo que necesita (por ejemplo, el cliente HTTP) en lugar de crearlo dentro. La diferencia que más confunde: en FastAPI no registras nada en un contenedor ni marcas clases; la dependencia es una función, se pide en los parámetros con `Depends` y se ejecuta en cada petición. Para los tests, `app.dependency_overrides` cumple el papel de `vi.mock`: cambia una pieza por otra sin tocar el código que la usa.

## interview

`Depends` le dice a FastAPI que un parámetro lo produce otra función, la dependencia, que FastAPI ejecuta antes del endpoint en cada petición. Sirve para lo que muchos endpoints necesitan por igual, como la sesión de base de datos o el cliente que viene en el token. Si la dependencia usa `yield`, el código que va después del `yield` se ejecuta cuando la respuesta ya salió, y así se cierra la sesión sin que el endpoint lo haga. Dentro de una misma petición, si dos piezas piden la misma dependencia, FastAPI la ejecuta una sola vez. Con `Annotated` le doy un nombre corto, como `SessionDep`, y en los tests la cambio por otra con `app.dependency_overrides`, sin tocar los endpoints.

## myths

- **"`Depends(get_session())` y `Depends(get_session)` son lo mismo."** Con paréntesis llamas tú a la función, una sola vez, al cargar el archivo, y `Depends` recibe lo que devolvió. FastAPI necesita la función sin llamar, para llamarla él en cada petición.
- **"La dependencia se crea una vez y se comparte."** Se ejecuta de nuevo en cada petición: cada petición recibe su propia sesión. Solo dentro de una misma petición, si dos piezas piden la misma dependencia, FastAPI la ejecuta una vez y les da el mismo resultado.
- **"Es magia del framework."** Es una función normal que FastAPI llama antes que la tuya. Puedes ponerle un `print` y verás que se ejecuta primero.
