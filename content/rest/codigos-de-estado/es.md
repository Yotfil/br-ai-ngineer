---
title: Códigos de estado y sus confusiones clásicas
summary: Número de tres dígitos que resume el resultado.
concepts:
  401-vs-403:
    name: 401 vs. 403
    aliases: []
  4xx-vs-5xx:
    name: 4xx vs. 5xx
    aliases: []
exercises:
  - type: choice
    prompt: ¿Qué código de estado devuelve este caso?
    items:
      - q: Un usuario con token válido intenta ver el pedido de otro cliente.
        options:
          - "401"
          - "403"
          - "404"
          - "400"
        answer: 1
        why: "Ya sabemos quién es (autenticado), pero no tiene permiso: 403. Algunas APIs devuelven 404 a propósito para no revelar que el recurso existe."
      - q: El body es JSON válido, pero el campo cantidad viene en -3.
        options:
          - "400"
          - "422"
          - "500"
          - "409"
        answer: 1
        why: La sintaxis es correcta; el contenido no cumple las reglas. FastAPI responde 422 automáticamente.
      - q: Intentas registrar un cliente con un email que ya existe.
        options:
          - "400"
          - "409"
          - "422"
          - "500"
        answer: 1
        why: "409 Conflict: la petición choca con el estado actual del recurso."
      - q: El balanceador esperó 60 s a tu API de pagos y nunca respondió.
        options:
          - "500"
          - "502"
          - "503"
          - "504"
        answer: 3
        why: "504 Gateway Timeout: el intermediario no recibió respuesta a tiempo del servidor de origen."
      - q: POST /v1/pedidos se procesó y el pedido quedó creado.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 1
        why: 201 Created, con el header Location apuntando al nuevo recurso.
      - q: La petición llega sin header Authorization a un endpoint protegido.
        options:
          - "401"
          - "403"
          - "400"
          - "404"
        answer: 0
        why: "401: no hay credenciales. Se acompaña de WWW-Authenticate."
      - q: Recibes la orden de generar un reporte pesado; lo encolas y lo procesarás después.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 2
        why: "202 Accepted: se aceptó, pero aún no se completó. Se suele devolver una URL para consultar el estado."
---

## definition

Número de tres dígitos que resume el resultado. La familia la da el primer dígito: **1xx** informativo, **2xx** éxito, **3xx** redirección, **4xx** error del cliente (la petición está mal) y **5xx** error del servidor (la petición estaba bien, pero el servidor falló).

## analogy

Los semáforos de una ventanilla: verde (**2xx**) «listo»; amarillo (**3xx**) «vaya a la otra ventanilla»; rojo con tu nombre (**4xx**) «tu formulario está mal llenado»; rojo con el letrero de la oficina (**5xx**) «se cayó el sistema, no es culpa tuya».

## problem

El código es lo primero que leen el cliente, los reintentos, los monitores y las alertas. Responder `200` con `{"error": true}` hace que el frontend tenga que inspeccionar el body, que el monitoreo no vea los errores y que las cachés guarden respuestas de error como si fueran válidas.

## code:wire

```http
HTTP/1.1 201 Created            ← creado; incluye Location
Location: /v1/pedidos/1093

HTTP/1.1 204 No Content         ← éxito sin body (DELETE, PUT sin retorno)

HTTP/1.1 401 Unauthorized       ← no sé quién eres (falta token o es inválido)
WWW-Authenticate: Bearer

HTTP/1.1 403 Forbidden          ← sé quién eres, pero no tienes permiso

HTTP/1.1 422 Unprocessable Content
Content-Type: application/json

{"detail":[{"loc":["body","cantidad"],"msg":"Input should be greater than 0"}]}
```

## code:server

```python
from fastapi import HTTPException, status

@app.get("/v1/pedidos/{id}")
def obtener(id: int, usuario = Depends(usuario_actual)):   # sin token → 401
    pedido = repo.buscar(id)
    if pedido is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido no encontrado")
    if pedido.cliente_id != usuario.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No es tu pedido")
    return pedido
# FastAPI devuelve 422 automáticamente si Pydantic no puede validar el body.
```

## bad

```http
HTTP/1.1 200 OK
{"ok": false, "error": "Pedido no encontrado"}
```

## good

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json
{"title":"Pedido no encontrado","status":404}
```

## bridge:typescript

Tras `await fetch(...)`, `response.ok` y `response.status` te indican error solo cuando el código es 4xx o 5xx. Cuando un backend responde 200 con un error dentro, tienes que revisar un campo del body (por ejemplo `ok: false`) después de cada petición: eso es síntoma de una API mal diseñada. Y tu función propia que envuelve `fetch` y redirige al login debería reaccionar a **401**, no a 403.

## interview

Los códigos se agrupan por familias: 2xx éxito, 3xx redirección, 4xx el cliente se equivocó y 5xx el servidor falló. Los que más uso son 200, 201 con Location al crear, 204 sin contenido, 400 y 422 para validación, 401 cuando falta autenticación, 403 cuando el usuario no tiene permiso, 404, 409 para conflictos como un email duplicado, 429 por rate limit, 500 para errores internos, y 502, 503 y 504 que suelen venir del proxy o del balanceador. La regla es que el código refleje el resultado real, porque clientes, reintentos y monitoreo dependen de él.

## myths

- 401 vs. 403: 401 significa «no autenticado» (a pesar del nombre Unauthorized); 403 es «autenticado pero sin permiso».
- 400 vs. 422: 400 es una petición mal formada (JSON roto, tipos imposibles); 422 es sintaxis correcta pero contenido inválido (cantidad negativa). FastAPI usa 422 para validación.
- 200 vs. 201 vs. 204: 200 éxito con body; 201 se creó un recurso (con Location); 204 éxito sin body.
- 301 vs. 302: 301 es permanente (buscadores y navegadores lo guardan); 302 es temporal. 307 y 308 son sus versiones que no permiten cambiar el método.
- 404 vs. 410: 404 no existe (o no te digo); 410 existió y se eliminó para siempre.
- 500 vs. 502 vs. 503 vs. 504: 500 tu app falló; 502 el proxy recibió una respuesta inválida de tu app; 503 el servicio no está disponible (mantenimiento o sobrecarga, con Retry-After); 504 el proxy se cansó de esperar a tu app.
