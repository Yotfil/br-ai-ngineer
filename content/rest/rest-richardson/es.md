---
title: "REST: restricciones y modelo de Richardson"
summary: REST es un estilo de arquitectura (Roy Fielding, 2000), no un protocolo ni un estándar.
concepts:
  restricciones-rest:
    name: restricciones REST
    aliases:
      - REST constraints
  modelo-de-richardson:
    name: modelo de Richardson
    aliases:
      - Richardson maturity model
  hateoas:
    name: HATEOAS
    aliases: []
---

## definition

REST es un **estilo de arquitectura** (Roy Fielding, 2000), no un protocolo ni un estándar. Define restricciones: cliente-servidor, sin estado, cacheable, interfaz uniforme, sistema en capas y, opcionalmente, código bajo demanda. El modelo de Richardson mide qué tanto las cumple una API, del nivel 0 al 3.

## analogy

REST es como las reglas de una biblioteca pública: cada libro tiene una ubicación única (**URI**), todos se piden con el mismo formulario (**interfaz uniforme**), el bibliotecario no recuerda tu visita anterior (**sin estado**), puedes fotocopiar las páginas que dicen «se permite copiar» (**cacheable**) y no sabes si el libro viene del depósito o de otra sede (**capas**).

## problem

Las restricciones existen por algo: **sin estado** permite escalar, **cacheable** reduce carga, **interfaz uniforme** hace que cualquier cliente entienda cualquier recurso, y **capas** permite poner CDN, balanceadores y gateways sin que el cliente lo note.

## code:wire

```http
# Nivel 3 (HATEOAS): la respuesta dice qué puedes hacer ahora
GET /v1/pedidos/1093 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/hal+json

{"id":1093,"estado":"pendiente","total":76000,
 "_links":{
   "self":   {"href":"/v1/pedidos/1093"},
   "pagar":  {"href":"/v1/pedidos/1093/pagos","method":"POST"},
   "cancelar":{"href":"/v1/pedidos/1093","method":"DELETE"}}}
```

## code:server

```python
# FastAPI te lleva naturalmente al nivel 2: recursos + métodos + códigos.
router = APIRouter(prefix="/v1/pedidos", tags=["pedidos"])

@router.get("")                     # colección
@router.post("", status_code=201)   # crear en la colección
@router.get("/{id}")                # elemento
@router.patch("/{id}")
@router.delete("/{id}", status_code=204)
```

## bad

```http
# Nivel 0: un solo endpoint, todo por POST (estilo RPC/SOAP)
POST /api   {"accion":"obtenerPedido","id":1093}
POST /api   {"accion":"cancelarPedido","id":1093}
```

## good

```http
# Nivel 2: recursos, métodos y códigos de estado
GET    /v1/pedidos/1093   → 200
DELETE /v1/pedidos/1093   → 204
```

## bridge:typescript

Un módulo cliente de la API con `getAll`, `getById`, `create`, `update` y `remove` mapea casi uno a uno con una API de nivel 2. Si tu módulo tiene métodos como `ejecutarAccion(tipo, payload)` contra un solo endpoint, estás consumiendo un nivel 0.

## interview

REST es un estilo de arquitectura que definió Roy Fielding, basado en restricciones: separación cliente-servidor, comunicación sin estado, respuestas cacheables, interfaz uniforme (recursos identificados por URIs, manipulados mediante representaciones, mensajes autodescriptivos e hipermedia), sistema en capas y código bajo demanda como opcional. El modelo de madurez de Richardson lo hace práctico: nivel 0 es un único endpoint tipo RPC; nivel 1 introduce recursos con URIs propias; nivel 2 usa correctamente los métodos y códigos HTTP, que es donde está la mayoría de la industria; y nivel 3 agrega HATEOAS, con enlaces que indican las acciones posibles.

## myths

- Creer que REST es «HTTP + JSON». Puedes usar HTTP y JSON y no ser REST, y REST no exige JSON.
- Pensar que la mayoría de las APIs «REST» cumplen REST completo. Casi todas están en el nivel 2, sin HATEOAS.
- Confundir REST con CRUD. Los recursos pueden representar procesos (un pago, una aprobación), no solo tablas.
