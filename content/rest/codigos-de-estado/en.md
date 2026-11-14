---
title: Status codes and their classic confusions
summary: A status code is the three-digit number that summarizes the result of a request; the first digit gives the family.
concepts:
  401-vs-403:
    name: 401 vs. 403
    aliases: []
  4xx-vs-5xx:
    name: 4xx vs. 5xx
    aliases: []
exercises:
  - type: choice
    prompt: Which status code does this case return?
    items:
      - q: A user with a valid token tries to view another customer’s order.
        options:
          - "401"
          - "403"
          - "404"
          - "400"
        answer: 1
        why: "The token already says who they are, so they are not missing identification (that would be 401): they are missing permission. Some APIs answer 404 on purpose, so as not to reveal that the order exists."
      - q: The body is valid JSON, but the quantity field comes as -3.
        options:
          - "400"
          - "422"
          - "500"
          - "409"
        answer: 1
        why: "The JSON can be read; what fails is a rule about the data, because the quantity must be greater than 0. That is what 422 is for, and FastAPI answers it by itself when the data does not fit its model."
      - q: You try to register a customer with an email that already exists.
        options:
          - "400"
          - "409"
          - "422"
          - "500"
        answer: 1
        why: "The request is well written and the data is valid; the problem is that it clashes with what is already stored. That is a conflict with the current state of the resource."
      - q: The load balancer waited 60 s for your payments API and it never responded.
        options:
          - "500"
          - "502"
          - "503"
          - "504"
        answer: 3
        why: "The one answering is the load balancer, which sits between the client and your API: it had to wait for a response and none arrived in time. 502 would be an invalid response, not one that never arrives."
      - q: POST /v1/pedidos was processed and the order was created.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 1
        why: "A new resource was created, and that is exactly what 201 says; 200 would only say that it went well. It usually carries the Location header with the address of the order."
      - q: The request arrives without an Authorization header at a protected endpoint.
        options:
          - "401"
          - "403"
          - "400"
          - "404"
        answer: 0
        why: "The identification is missing, not the permission. That is why a 401 carries the WWW-Authenticate header, which tells the client how to identify itself."
      - q: You receive an order to generate a heavy report; you queue it and will process it later.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 2
        why: "202 says the request was accepted but has not finished yet; 200 or 201 would say it is already done. An address to check its progress is usually returned."
      - q: An authenticated customer requests `GET /pedidos/1042`, but that order belongs to another customer.
        options:
          - "401"
          - "403"
          - "404"
          - "422"
        answer: 1
        why: "They are already identified, so it is not 401; the order exists, but it is not theirs. If in the interview you add that some APIs answer 404 so as not to reveal that it exists, you earn points."
      - q: "`POST /clientes` with an email that is already registered."
        options:
          - "400"
          - "409"
          - "422"
          - "500"
        answer: 1
        why: "The data is valid, but it cannot be saved without clashing with a customer that already exists: it is a conflict with the current state, not a format error."
---

## definition

A status code is the three-digit number that every HTTP response starts with. It summarizes what happened to the request.

The first digit gives the family: **1xx** informational, **2xx** success, **3xx** redirection (the resource has to be looked for somewhere else), **4xx** client error (the request is wrong) and **5xx** server error (the request looked fine, but the server failed).

## analogy

The traffic lights at a service counter: green (**2xx**) "done"; yellow (**3xx**) "go to the other counter"; red with your name (**4xx**) "your form is filled in wrong"; red with the office sign (**5xx**) "the system is down, it is not your fault".

## problem

The code is the first thing the browser, the frontend and the monitoring tools read. If you respond `200` with `{"ok": false}`, `fetch` takes it as good, monitoring counts no error, and every client has to check the body after each request.

## code:wire

### Moment 1. Ana creates an order: 201 and where it ended up

```http
POST /v1/pedidos HTTP/1.1
Authorization: Bearer <Ana's token>
Content-Type: application/json

{"lineas":[{"producto_id":42,"cantidad":2}]}

HTTP/1.1 201 Created                 # something new was created
Location: /v1/pedidos/1093           # and this is its address
```

### Moment 2. A request without a token: 401

```http
GET /v1/pedidos/1093 HTTP/1.1        # it carries no Authorization

HTTP/1.1 401 Unauthorized            # "I don't know who you are"
WWW-Authenticate: Bearer             # required in a 401: how to identify yourself
```

### Moment 3. Luis asks for Ana's order: 403

```http
GET /v1/pedidos/1093 HTTP/1.1
Authorization: Bearer <Luis's token>    # Luis is identified...

HTTP/1.1 403 Forbidden                  # ...but order 1093 is Ana's
```

The server can also respond `404 Not Found`, so as not to reveal that the order exists.

### Moment 4. Data that breaks the rules: 422

```http
POST /v1/pedidos HTTP/1.1
Authorization: Bearer <Ana's token>
Content-Type: application/json

{"lineas":[{"producto_id":42,"cantidad":0}]}   # the JSON is well written; the quantity is not

HTTP/1.1 422 Unprocessable Content
Content-Type: application/json

{"detail":[{"type":"greater_than","loc":["body","lineas",0,"cantidad"],"msg":"Input should be greater than 0"}]}
```

This is the format FastAPI uses, trimmed down: each error says where it is (`loc`) and which rule failed.

## code:server

In the store, this is the `GET /v1/pedidos/{id}` endpoint, which can respond 200, 401, 403 or 404. `router` is the `APIRouter` of the file.

```python
# app/pedidos/router.py
from fastapi import HTTPException

from app.deps import ClienteActual, SessionDep   # the customer from the token and the database session
from app.pedidos.models import Pedido

@router.get("/v1/pedidos/{id}")
def obtener_pedido(id: int, cliente: ClienteActual, session: SessionDep):
    # 1. Before getting in here, ClienteActual read the token: if it was missing or invalid, it already responded 401.
    pedido = session.get(Pedido, id)
    if pedido is None:                                   # 2. it does not exist: 404
        raise HTTPException(status_code=404, detail="Order not found")
    if pedido.cliente_id != cliente.id:                  # 3. it exists, but it belongs to another customer: 403
        raise HTTPException(status_code=403, detail="Not your order")
    return pedido                                        # 4. all good: 200
```

FastAPI calls this function on every `GET /v1/pedidos/{id}`. A `raise HTTPException` cuts the function short and responds with that code and `{"detail": "..."}` in the body. How `ClienteActual` works is covered in [[autenticacion-en-fastapi]].

## bad

```http
GET /v1/pedidos/9999 HTTP/1.1
Authorization: Bearer <Ana's token>

HTTP/1.1 200 OK                                  # "all good"...
Content-Type: application/json

{"ok":false,"error":"Order not found"}           # ...but the body says the opposite
```

For the browser and for monitoring it is a success: `response.ok` is `true` and no alert goes off. Only whoever reads the body finds out, and every client has to remember to do it.

## good

```http
GET /v1/pedidos/9999 HTTP/1.1
Authorization: Bearer <Ana's token>

HTTP/1.1 404 Not Found                           # the code already says what happened
Content-Type: application/json

{"detail":"Order not found"}                     # the body only adds the detail
```

The code tells the result. It is what `HTTPException(status_code=404, ...)` responds in the server block.

## bridge:typescript

`fetch` does not throw an error for a 404 or a 500: only when there is no response, for example with no network. That is why you check `response.ok`, which is `true` from 200 to 299, or `response.status` to decide what to do. The difference that confuses people most: on a 401 it makes sense to send the user to the login; on a 403 it does not, because they are already identified and identifying themselves again does not give them permission.

## interview

Status codes are grouped by the first digit: 2xx success, 3xx redirection, 4xx client error and 5xx server error. When creating I respond 201 with `Location`, and 204 when there is nothing to return. For client errors I use 400 if the request is malformed, 422 if it is well formed but the data does not meet the rules, 401 if identification is missing, 403 if the user is identified but has no permission, 404 if it does not exist and 409 if it clashes with what is already stored, such as a repeated email. Among the 5xx I tell apart 500, when my application fails, from 502 and 504, which are generated by the proxy or load balancer in front, and from 503, which warns that the service cannot handle requests for now. The rule is that the code reflects the real result, because the frontend and monitoring depend on it.

## myths

- **"401 means 'not authorized'."** Despite its name, *Unauthorized*, it means "not identified": a token is missing, or the one that arrived is not valid. When the user is identified but has no permission, the code is 403.
- **"400 and 422 are the same."** 400 is a request the server cannot even read properly, for example a malformed message. 422 is a well-written request whose data does not meet the rules, such as a quantity of 0. FastAPI responds 422 to both cases of its body: to broken JSON and to data that does not fit the model.
- **"If it went well, always 200."** When creating something you respond 201 Created, which says there is a new resource and usually carries `Location` with its address. If there is nothing to return, as when cancelling an order with `DELETE /v1/pedidos/{id}`, you respond 204 No Content, with no body.
- **"Every 5xx is a failure in my code."** Only 500 says that. 502 and 504 are generated by an intermediate server (a proxy or a load balancer, which distributes the requests) when your application answers it something invalid or does not answer in time. 503 warns that the service cannot handle requests now, because of overload or maintenance.
