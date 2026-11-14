---
title: "Proyecto: el endpoint de crear un pedido"
short: "Proyecto: crear un pedido"
summary: "El endpoint POST /v1/pedidos completo, parte por parte: valida los datos, comprueba los productos, guarda el pedido y responde 201."
---

## context

Vamos a construir el endpoint con el que un cliente de la tienda crea un pedido: `POST /v1/pedidos`. Lo llama la aplicación de la tienda cuando un cliente, como Ana, confirma su compra: envía los productos y las cantidades, y recibe el pedido creado. El endpoint valida los datos, comprueba que cada producto existe, guarda el pedido con sus líneas y responde 201; si algo no cuadra, responde 404 o 422. Verás tres archivos: `app/pedidos/schemas.py`, `app/deps.py` y `app/pedidos/router.py`.

## walkthrough

### Parte 1. Los datos que llegan y los que salen

```python
# app/pedidos/schemas.py
from datetime import datetime

from pydantic import BaseModel, Field

class LineaCrear(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)                      # 0 unidades no tiene sentido: se rechaza solo

class PedidoCrear(BaseModel):                        # lo que envía el cliente
    lineas: list[LineaCrear] = Field(min_length=1)   # al menos un producto

class PedidoPublico(BaseModel):                      # lo que se le devuelve
    id: int
    estado: str
    creado_en: datetime
```

FastAPI compara lo que envía el cliente con `PedidoCrear` antes de ejecutar el endpoint. Si falta un campo o la cantidad es 0, responde 422 sin que escribas una sola comprobación ([[codigos-de-estado]]). `PedidoPublico` decide qué sale en la respuesta; cómo funcionan los dos se ve en [[modelos-y-response-model]].

### Parte 2. Las piezas que el endpoint pide

```python
# app/deps.py
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.clientes.models import Cliente
from app.core.security import get_cliente_actual   # se da por hecho: lee el token y busca al cliente
from app.db import get_session                     # abre una sesión por petición y la cierra al final

SessionDep = Annotated[Session, Depends(get_session)]
ClienteActual = Annotated[Cliente, Depends(get_cliente_actual)]
```

`SessionDep` entrega una sesión de base de datos por petición, y `ClienteActual`, el cliente dueño del token; sin un token válido, responde 401 antes de llegar al endpoint. El endpoint solo los pide en sus parámetros ([[inyeccion-con-depends]]).

### Parte 3. Comprobar que cada producto existe

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
        if producto is None:                    # no existe: 404, y el endpoint ya no sigue
            raise HTTPException(status_code=404, detail=f"No existe el producto {linea.producto_id}")
        productos.append(producto)
    return productos
```

Si un producto no existe, el `raise HTTPException` corta la petición aunque esté dentro de otra función, y FastAPI responde 404 con `{"detail": "No existe el producto 7"}` ([[errores-y-httpexception]]). Ese cuerpo es el formato propio de FastAPI; el formato estándar para los errores de una API, Problem Details, se ve en [[errores-problem-details]].

### Parte 4. El endpoint: guardar el pedido y responder 201

```python
# app/pedidos/router.py (sigue)
@router.post("/v1/pedidos", status_code=201, response_model=PedidoPublico)
def crear_pedido(datos: PedidoCrear, cliente: ClienteActual, session: SessionDep, response: Response):
    productos = buscar_productos(datos, session)              # 1. todos existen, o ya respondió 404
    pedido = Pedido(cliente_id=cliente.id, estado="pendiente")   # creado_en lo pone el modelo
    session.add(pedido)
    session.flush()                                           # 2. la base de datos le da un id, sin guardar aún
    for linea, producto in zip(datos.lineas, productos):
        session.add(LineaPedido(pedido_id=pedido.id, producto_id=producto.id,
                                cantidad=linea.cantidad,
                                precio_unitario=producto.precio))   # el precio se copia del producto
    session.commit()                                          # 3. el pedido y sus líneas se guardan juntos
    session.refresh(pedido)                                   # vuelve a leerlo, ya guardado
    response.headers["Location"] = f"/v1/pedidos/{pedido.id}"   # 4. dónde quedó el pedido nuevo
    return pedido                                             # 5. FastAPI lo convierte en PedidoPublico
```

`@router.post("/v1/pedidos", status_code=201, ...)` declara el método, la ruta y el código de éxito ([[rutas-y-parametros]]). Es POST porque crea un recurso nuevo cuya dirección decide el servidor ([[metodos-http]]), y por eso responde 201 con `Location`. Es `def` y no `async def` porque la sesión de SQLModel no usa `await`: FastAPI ejecuta la función en un hilo aparte, sin frenar las demás peticiones ([[endpoints-async-vs-sync]]).
