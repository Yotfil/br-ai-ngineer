---
title: Anatomía de una petición y una respuesta
summary: Un mensaje HTTP tiene línea inicial, headers, una línea en blanco y un body opcional.
concepts:
  linea-inicial:
    name: línea inicial
    aliases:
      - start line
  body:
    name: cuerpo (body)
    aliases:
      - body
---

## definition

Un mensaje HTTP tiene tres partes: una línea inicial (en la petición: método, ruta y versión; en la respuesta: versión, código y texto de estado), un bloque de headers `Nombre: valor`, una línea en blanco y un body opcional.

## analogy

Un paquete por mensajería: la **etiqueta** dice a quién va y qué tipo de envío es (línea inicial), las **notas adhesivas** agregan instrucciones como «frágil» o «contiene líquidos» (headers), y la **caja** trae el contenido (body).

## problem

Si no respetas la estructura (por ejemplo, envías JSON sin `Content-Type: application/json`), el servidor no sabe cómo interpretar el body y responde 415 o 422. Los headers son la forma estándar de enviar metadatos; meterlos en el body o en la URL rompe herramientas intermedias como cachés y proxies.

## code:wire

```http
POST /v1/pedidos HTTP/1.1
Host: api.tienda.co
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Length: 46

{"cliente_id":7,"items":[{"producto_id":42,"cantidad":2}]}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /v1/pedidos/1093

{"id":1093,"estado":"pendiente","total":76000}
```

## code:server

```python
from fastapi import FastAPI, Header, Request
from pydantic import BaseModel

class Item(BaseModel):
    producto_id: int
    cantidad: int

class PedidoIn(BaseModel):        # el body ya validado
    cliente_id: int
    items: list[Item]

@app.post("/v1/pedidos", status_code=201)
def crear_pedido(pedido: PedidoIn, request: Request,
                 user_agent: str | None = Header(default=None)):
    # request.method, request.url.path, request.headers, user_agent...
    return {"id": 1093, "estado": "pendiente", "total": 76000}
```

## bridge:typescript

Cuando escribes `fetch(url, { method: "POST", headers, body: JSON.stringify(datos) })`, armas exactamente esta estructura: el método y la URL van a la línea inicial, los parámetros que agregues a la URL con `URLSearchParams` van a la query string, `headers` al bloque de headers y el body viaja como el texto JSON que serializaste. Tu función propia que envuelve `fetch` solo agrega una línea más al bloque de headers.

## interview

Una petición HTTP tiene una línea inicial con el método, la ruta con su query string y la versión del protocolo; luego vienen los headers, que son metadatos en formato clave-valor como Content-Type, Accept o Authorization; después una línea en blanco y el body opcional. La respuesta tiene la misma estructura, salvo que la línea inicial lleva la versión, el código de estado y su texto. Así, el servidor sabe qué se pide, con qué formato y credenciales, y el cliente sabe si salió bien y cómo leer lo que recibe.

## myths

- Creer que GET no puede tener headers o que solo POST tiene body. GET tiene headers siempre; lo que no debería llevar es body con significado.
- Pensar que los nombres de headers distinguen mayúsculas. `content-type` y `Content-Type` son el mismo header (en HTTP/2 viajan en minúscula).
- Olvidar la línea en blanco: es lo que separa los headers del body.
