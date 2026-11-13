---
title: Status codes and their classic confusions
summary: A three-digit number that summarizes the result.
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
        why: "We already know who they are (authenticated), but they lack permission: 403. Some APIs return 404 on purpose so as not to reveal that the resource exists."
      - q: The body is valid JSON, but the quantity field comes as -3.
        options:
          - "400"
          - "422"
          - "500"
          - "409"
        answer: 1
        why: The syntax is correct; the content breaks the rules. FastAPI responds 422 automatically.
      - q: You try to register a customer with an email that already exists.
        options:
          - "400"
          - "409"
          - "422"
          - "500"
        answer: 1
        why: "409 Conflict: the request clashes with the current state of the resource."
      - q: The load balancer waited 60 s for your payments API and it never responded.
        options:
          - "500"
          - "502"
          - "503"
          - "504"
        answer: 3
        why: "504 Gateway Timeout: the intermediary did not get a response from the origin server in time."
      - q: POST /v1/pedidos was processed and the order was created.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 1
        why: 201 Created, with the Location header pointing to the new resource.
      - q: The request arrives without an Authorization header at a protected endpoint.
        options:
          - "401"
          - "403"
          - "400"
          - "404"
        answer: 0
        why: "401: there are no credentials. It comes with WWW-Authenticate."
      - q: You receive an order to generate a heavy report; you queue it and will process it later.
        options:
          - "200"
          - "201"
          - "202"
          - "204"
        answer: 2
        why: "202 Accepted: it was accepted, but not completed yet. A URL to check the status is usually returned."
---

## definition

A three-digit number that summarizes the result. The first digit gives the family: **1xx** informational, **2xx** success, **3xx** redirection, **4xx** client error (the request is wrong) and **5xx** server error (the request was fine, but the server failed).

## analogy

The traffic lights at a service counter: green (**2xx**) "done"; yellow (**3xx**) "go to the other counter"; red with your name (**4xx**) "your form is filled in wrong"; red with the office sign (**5xx**) "the system is down, it is not your fault".

## problem

The code is the first thing the client, retries, monitors and alerts read. Responding `200` with `{"error": true}` forces the frontend to inspect the body, hides the errors from monitoring and makes caches store error responses as if they were valid.

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

After `await fetch(...)`, `response.ok` and `response.status` signal an error only when the code is 4xx or 5xx. When a backend answers 200 with an error inside, you have to check a field in the body (for example `ok: false`) after every request: that is a symptom of a poorly designed API. And your own function that wraps `fetch` and redirects to the login should react to **401**, not to 403.

## interview

Codes are grouped into families: 2xx success, 3xx redirection, 4xx the client made a mistake and 5xx the server failed. The ones I use most are 200, 201 with Location when creating, 204 with no content, 400 and 422 for validation, 401 when authentication is missing, 403 when the user has no permission, 404, 409 for conflicts such as a duplicate email, 429 for rate limiting, 500 for internal errors, and 502, 503 and 504, which usually come from the proxy or the load balancer. The rule is that the code must reflect the real result, because clients, retries and monitoring depend on it.

## myths

- 401 vs. 403: 401 means "not authenticated" (despite the name Unauthorized); 403 is "authenticated but without permission".
- 400 vs. 422: 400 is a malformed request (broken JSON, impossible types); 422 is correct syntax but invalid content (negative quantity). FastAPI uses 422 for validation.
- 200 vs. 201 vs. 204: 200 success with body; 201 a resource was created (with Location); 204 success without body.
- 301 vs. 302: 301 is permanent (search engines and browsers remember it); 302 is temporary. 307 and 308 are their versions that do not allow changing the method.
- 404 vs. 410: 404 does not exist (or I will not tell you); 410 existed and was deleted for good.
- 500 vs. 502 vs. 503 vs. 504: 500 your app failed; 502 the proxy got an invalid response from your app; 503 the service is unavailable (maintenance or overload, with Retry-After); 504 the proxy got tired of waiting for your app.
