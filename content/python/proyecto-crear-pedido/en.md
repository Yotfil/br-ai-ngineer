---
title: "Project: the create-order endpoint"
short: "Project: create an order"
summary: "The full POST /v1/pedidos endpoint, part by part: it validates the data, checks the products, saves the order and responds 201."
---

## context

We are going to build the endpoint a store customer uses to create an order: `POST /v1/pedidos`. The store's application calls it when a customer, like Ana, confirms a purchase: it sends the products and quantities, and receives the created order. The endpoint validates the data, checks that each product exists, saves the order with its lines and responds 201; if something does not add up, it responds 404 or 422. You will see three files: `app/pedidos/schemas.py`, `app/deps.py` and `app/pedidos/router.py`.

## walkthrough

### Part 1. The data that comes in and the data that goes out

```python
# app/pedidos/schemas.py
from datetime import datetime

from pydantic import BaseModel, Field

class LineaCrear(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)                      # 0 units makes no sense: it is rejected on its own

class PedidoCrear(BaseModel):                        # what the customer sends
    lineas: list[LineaCrear] = Field(min_length=1)   # at least one product

class PedidoPublico(BaseModel):                      # what is sent back
    id: int
    estado: str
    creado_en: datetime
```

FastAPI compares what the customer sends with `PedidoCrear` before running the endpoint. If a field is missing or the quantity is 0, it responds 422 without you writing a single check ([[codigos-de-estado]]). `PedidoPublico` decides what goes out in the response; how both work is covered in [[modelos-y-response-model]].

### Part 2. The pieces the endpoint asks for

```python
# app/deps.py
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.clientes.models import Cliente
from app.core.security import get_cliente_actual   # taken as given: reads the token and looks up the customer
from app.db import get_session                     # opens one session per request and closes it at the end

SessionDep = Annotated[Session, Depends(get_session)]
ClienteActual = Annotated[Cliente, Depends(get_cliente_actual)]
```

`SessionDep` delivers one database session per request, and `ClienteActual`, the customer who owns the token; without a valid token, it responds 401 before reaching the endpoint. The endpoint only asks for them in its parameters ([[inyeccion-con-depends]]).

### Part 3. Checking that each product exists

```python
# app/pedidos/router.py
from fastapi import APIRouter, HTTPException, Response
from sqlmodel import Session

from app.deps import ClienteActual, SessionDep
from app.pedidos.models import LineaPedido, Pedido
from app.pedidos.schemas import PedidoCrear, PedidoPublico
from app.productos.models import Producto

router = APIRouter()

def buscar_productos(datos: PedidoCrear, session: Session) -> list[Producto]:
    productos = []
    for linea in datos.lineas:
        producto = session.get(Producto, linea.producto_id)
        if producto is None:                    # it does not exist: 404, and the endpoint stops here
            raise HTTPException(status_code=404, detail=f"Product {linea.producto_id} does not exist")
        productos.append(producto)
    return productos
```

If a product does not exist, the `raise HTTPException` cuts the request short even though it is inside another function, and FastAPI responds 404 with `{"detail": "Product 7 does not exist"}` ([[errores-y-httpexception]]). That body is FastAPI's own format; the standard format for API errors, Problem Details, is covered in [[errores-problem-details]].

### Part 4. The endpoint: saving the order and responding 201

```python
# app/pedidos/router.py (continued)
@router.post("/v1/pedidos", status_code=201, response_model=PedidoPublico)
def crear_pedido(datos: PedidoCrear, cliente: ClienteActual, session: SessionDep, response: Response):
    productos = buscar_productos(datos, session)              # 1. they all exist, or it already responded 404
    pedido = Pedido(cliente_id=cliente.id, estado="pendiente")   # the model sets creado_en
    session.add(pedido)
    session.flush()                                           # 2. the database gives it an id, without saving yet
    for linea, producto in zip(datos.lineas, productos):
        session.add(LineaPedido(pedido_id=pedido.id, producto_id=producto.id,
                                cantidad=linea.cantidad,
                                precio_unitario=producto.precio))   # the price is copied from the product
    session.commit()                                          # 3. the order and its lines are saved together
    session.refresh(pedido)                                   # reads it again, now saved
    response.headers["Location"] = f"/v1/pedidos/{pedido.id}"   # 4. where the new order ended up
    return pedido                                             # 5. FastAPI turns it into PedidoPublico
```

`@router.post("/v1/pedidos", status_code=201, ...)` declares the method, the path and the success code ([[rutas-y-parametros]]). It is POST because it creates a new resource whose address the server decides ([[metodos-http]]), and that is why it responds 201 with `Location`. It is `def` and not `async def` because the SQLModel session does not use `await`: FastAPI runs the function in a separate thread, without holding up the other requests ([[endpoints-async-vs-sync]]).
