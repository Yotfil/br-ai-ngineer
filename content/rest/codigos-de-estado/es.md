---
title: Códigos de estado y sus confusiones clásicas
summary: Un código de estado es el número de tres dígitos que resume el resultado de una petición; el primer dígito dice la familia.
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
        why: "El token ya dice quién es, así que no le falta identificarse (eso sería 401): le falta permiso. Algunas APIs responden 404 a propósito, para no revelar que el pedido existe."
      - q: El body es JSON válido, pero el campo cantidad viene en -3.
        options:
          - "400"
          - "422"
          - "500"
          - "409"
        answer: 1
        why: "El JSON se puede leer; lo que falla es una regla sobre los datos, porque la cantidad debe ser mayor que 0. Para eso es 422, y FastAPI lo responde solo cuando los datos no cumplen su modelo."
      - q: Intentas registrar un cliente con un email que ya existe.
        options:
          - "400"
          - "409"
          - "422"
          - "500"
        answer: 1
        why: "La petición está bien escrita y los datos son válidos; el problema es que choca con lo que ya está guardado. Eso es un conflicto con el estado actual del recurso."
      - q: El balanceador esperó 60 s a tu API de pagos y nunca respondió.
        options:
          - "500"
          - "502"
          - "503"
          - "504"
        answer: 3
        why: "Quien responde es el balanceador, que está entre el cliente y tu API: le tocaba esperar una respuesta y no le llegó a tiempo. 502 sería una respuesta inválida, no una que no llega."
      - q: POST /v1/pedidos se procesó y el pedido quedó creado.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 1
        why: "Se creó un recurso nuevo, y eso es justo lo que dice 201; 200 solo diría que salió bien. Suele llevar la cabecera Location con la dirección del pedido."
      - q: La petición llega sin header Authorization a un endpoint protegido.
        options:
          - "401"
          - "403"
          - "400"
          - "404"
        answer: 0
        why: "Falta la identificación, no el permiso. Por eso el 401 lleva la cabecera WWW-Authenticate, que le dice al cliente cómo identificarse."
      - q: Recibes la orden de generar un reporte pesado; lo encolas y lo procesarás después.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 2
        why: "202 dice que la petición se aceptó pero aún no terminó; 200 o 201 dirían que ya está hecha. Se suele devolver una dirección para consultar cómo va."
      - q: Un cliente autenticado pide `GET /pedidos/1042`, pero ese pedido es de otro cliente.
        options:
          - "401"
          - "403"
          - "404"
          - "422"
        answer: 1
        why: "Ya está identificado, así que no es 401; el pedido existe, pero no es suyo. Si en la entrevista añades que algunas APIs responden 404 para no revelar que existe, suma puntos."
      - q: "`POST /clientes` con un email que ya está registrado."
        options:
          - "400"
          - "409"
          - "422"
          - "500"
        answer: 1
        why: "Los datos son válidos, pero no se pueden guardar sin chocar con un cliente que ya existe: es un conflicto con el estado actual, no un error de formato."
---

## definition

Un código de estado es el número de tres dígitos con el que empieza cada respuesta HTTP. Resume qué pasó con la petición.

El primer dígito dice la familia: **1xx** información, **2xx** éxito, **3xx** redirección (el recurso hay que buscarlo en otro sitio), **4xx** error del cliente (la petición está mal) y **5xx** error del servidor (la petición parecía bien, pero el servidor falló).

## analogy

Los semáforos de una ventanilla: verde (**2xx**) "listo"; amarillo (**3xx**) "vaya a la otra ventanilla"; rojo con tu nombre (**4xx**) "tu formulario está mal llenado"; rojo con el letrero de la oficina (**5xx**) "se cayó el sistema, no es culpa tuya".

## problem

El código es lo primero que leen el navegador, el frontend y las herramientas de monitoreo. Si respondes `200` con `{"ok": false}`, `fetch` lo da por bueno, el monitoreo no cuenta ningún error y cada cliente tiene que revisar el cuerpo después de cada petición.

## code:wire

### Momento 1. Ana crea un pedido: 201 y dónde quedó

```http
POST /v1/pedidos HTTP/1.1
Authorization: Bearer <token de Ana>
Content-Type: application/json

{"lineas":[{"producto_id":42,"cantidad":2}]}

HTTP/1.1 201 Created                 # se creó algo nuevo
Location: /v1/pedidos/1093           # y esta es su dirección
```

### Momento 2. Una petición sin token: 401

```http
GET /v1/pedidos/1093 HTTP/1.1        # no lleva Authorization

HTTP/1.1 401 Unauthorized            # "no sé quién eres"
WWW-Authenticate: Bearer             # obligatoria en un 401: cómo identificarse
```

### Momento 3. Luis pide el pedido de Ana: 403

```http
GET /v1/pedidos/1093 HTTP/1.1
Authorization: Bearer <token de Luis>   # Luis sí está identificado...

HTTP/1.1 403 Forbidden                  # ...pero el pedido 1093 es de Ana
```

El servidor también puede responder `404 Not Found`, para no revelar que el pedido existe.

### Momento 4. Datos que no cumplen las reglas: 422

```http
POST /v1/pedidos HTTP/1.1
Authorization: Bearer <token de Ana>
Content-Type: application/json

{"lineas":[{"producto_id":42,"cantidad":0}]}   # el JSON está bien escrito; la cantidad, no

HTTP/1.1 422 Unprocessable Content
Content-Type: application/json

{"detail":[{"type":"greater_than","loc":["body","lineas",0,"cantidad"],"msg":"Input should be greater than 0"}]}
```

Es el formato que usa FastAPI, recortado: cada error dice dónde está (`loc`) y qué regla falló.

## code:server

En la tienda, este es el endpoint `GET /v1/pedidos/{id}`, que puede responder 200, 401, 403 o 404. `router` es el `APIRouter` del archivo.

```python
# app/pedidos/router.py
from fastapi import HTTPException

from app.deps import ClienteActual, SessionDep   # el cliente del token y la sesión de base de datos
from app.pedidos.models import Pedido

@router.get("/v1/pedidos/{id}")
def obtener_pedido(id: int, cliente: ClienteActual, session: SessionDep):
    # 1. Antes de entrar aquí, ClienteActual leyó el token: si faltaba o no valía, ya respondió 401.
    pedido = session.get(Pedido, id)
    if pedido is None:                                   # 2. no existe: 404
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.cliente_id != cliente.id:                  # 3. existe, pero es de otro cliente: 403
        raise HTTPException(status_code=403, detail="No es tu pedido")
    return pedido                                        # 4. todo bien: 200
```

FastAPI llama a esta función con cada `GET /v1/pedidos/{id}`. Un `raise HTTPException` corta la función y responde con ese código y `{"detail": "..."}` en el cuerpo. Cómo funciona `ClienteActual` se ve en [[autenticacion-en-fastapi]].

## bad

```http
GET /v1/pedidos/9999 HTTP/1.1
Authorization: Bearer <token de Ana>

HTTP/1.1 200 OK                                  # "todo bien"...
Content-Type: application/json

{"ok":false,"error":"Pedido no encontrado"}      # ...pero el cuerpo dice lo contrario
```

Para el navegador y el monitoreo es un éxito: `response.ok` es `true` y no salta ninguna alerta. Solo se entera quien lea el cuerpo, y cada cliente tiene que acordarse de hacerlo.

## good

```http
GET /v1/pedidos/9999 HTTP/1.1
Authorization: Bearer <token de Ana>

HTTP/1.1 404 Not Found                           # el código ya dice qué pasó
Content-Type: application/json

{"detail":"Pedido no encontrado"}                # el cuerpo solo añade el detalle
```

El código cuenta el resultado. Es lo que responde `HTTPException(status_code=404, ...)` en el bloque del servidor.

## bridge:typescript

`fetch` no lanza un error por un 404 ni por un 500: solo cuando no hay respuesta, por ejemplo sin red. Por eso se revisa `response.ok`, que es `true` del 200 al 299, o `response.status` para decidir qué hacer. La diferencia que más confunde: ante un 401 tiene sentido llevar al usuario al login; ante un 403, no, porque ya está identificado y volver a identificarse no le da permiso.

## interview

Los códigos de estado se agrupan por el primer dígito: 2xx éxito, 3xx redirección, 4xx error del cliente y 5xx error del servidor. Al crear respondo 201 con `Location`, y 204 cuando no hay nada que devolver. Para errores del cliente uso 400 si la petición está mal formada, 422 si está bien formada pero los datos no cumplen las reglas, 401 si falta identificarse, 403 si el usuario está identificado pero no tiene permiso, 404 si no existe y 409 si choca con lo que ya está guardado, como un email repetido. En los 5xx distingo el 500, cuando falla mi aplicación, de 502 y 504, que genera el proxy o el balanceador que hay delante, y de 503, que avisa que el servicio no puede atender por ahora. La regla es que el código refleje el resultado real, porque el frontend y el monitoreo dependen de él.

## myths

- **"401 significa «no autorizado»."** A pesar de su nombre, *Unauthorized*, significa "no identificado": falta un token, o el que llegó no vale. Cuando el usuario sí está identificado pero no tiene permiso, el código es 403.
- **"400 y 422 son lo mismo."** 400 es una petición que el servidor no puede ni leer bien, por ejemplo un mensaje mal formado. 422 es una petición bien escrita cuyos datos no cumplen las reglas, como una cantidad de 0. FastAPI responde 422 a los dos casos de su cuerpo: al JSON roto y a los datos que no cumplen el modelo.
- **"Si salió bien, siempre 200."** Al crear algo se responde 201 Created, que dice que hay un recurso nuevo y suele llevar `Location` con su dirección. Si no hay nada que devolver, como al cancelar un pedido con `DELETE /v1/pedidos/{id}`, se responde 204 No Content, sin cuerpo.
- **"Todo 5xx es un fallo de mi código."** Solo el 500 dice eso. El 502 y el 504 los genera un servidor intermedio (un proxy o un balanceador, que reparte las peticiones) cuando tu aplicación le responde algo inválido o no le responde a tiempo. El 503 avisa que el servicio no puede atender ahora, por sobrecarga o mantenimiento.
