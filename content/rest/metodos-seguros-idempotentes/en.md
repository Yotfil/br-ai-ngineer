---
title: Safe and idempotent methods
summary: A method is safe if it does not modify the server state (GET, HEAD, OPTIONS).
concepts:
  idempotencia:
    name: idempotency
    aliases:
      - idempotencia
  metodo-seguro:
    name: safe method
    aliases:
      - método seguro
exercises:
  - type: choice
    prompt: Which method or response fits?
    items:
      - q: Which of these operations is idempotent?
        options:
          - POST /pedidos
          - 'PATCH /productos/42 {"stock": "+1"}'
          - DELETE /pedidos/9
          - POST /pagos
        answer: 2
        why: "Deleting order 9 twice leaves the same state: the order does not exist."
      - q: A GET /v1/reportes/generar creates a new file every time it is called. Which principle does it break?
        options:
          - Only idempotency
          - Method safety (and idempotency too)
          - None, it is valid
          - Only caching
        answer: 1
        why: GET must be safe. If it generates a file every time, it also stops being idempotent. It should be POST /v1/reportes.
  - type: classify
    prompt: Which HTTP method fits?
    categories:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
    items:
      - text: Create a new order
        category: POST
        why: It creates a resource and is not idempotent.
      - text: List the products in the coffee category
        category: GET
        why: A read with a query param.
      - text: Replace all the data of customer 7
        category: PUT
        why: A full, idempotent replacement.
      - text: Change only the order status to “shipped”
        category: PATCH
        why: A partial modification.
      - text: Delete product 3
        category: DELETE
        why: Deleting is idempotent.
---

## definition

A method is **safe** if it does not modify the server state (GET, HEAD, OPTIONS). It is **idempotent** if sending it once or ten times leaves the server in the same state (the safe ones, plus PUT and DELETE). POST and PATCH guarantee neither.

## analogy

The elevator button is **idempotent**: pressing it five times does not call five elevators. A coin-operated candy dispenser **is not**: each coin gets you another candy. Looking at the floor display is **safe**: it changes nothing.

## problem

It is the basis of retries. HTTP clients, load balancers and queues retry automatically when there are timeouts. If the method is idempotent, retrying does no harm; if it is not (POST), the retry can duplicate orders or charges, and it has to be protected with idempotency keys (see [[idempotencia-en-la-practica]]).

## code:wire

```http
# La red se cae justo después de enviar. ¿Reintento?
DELETE /v1/pedidos/1093   → 204    reintento → 404 o 204   estado final: borrado   ✔ seguro reintentar
PUT /v1/clientes/7 {...}  → 200    reintento → 200        estado final: igual     ✔ seguro reintentar
POST /v1/pagos {"monto":76000}  → 201 (id 501)
     reintento → 201 (id 502)     ✘ ¡dos cobros!
```

## code:server

```python
# Idempotencia se refiere al EFECTO en el servidor, no a la respuesta.
@app.delete("/v1/pedidos/{id}", status_code=204)
def borrar(id: int):
    pedidos.pop(id, None)   # si ya no existe, el estado final es el mismo
    # Algunos equipos devuelven 404 la segunda vez; sigue siendo idempotente.
```

## bad

```http
GET /v1/carrito/agregar?producto=42   ← GET con efecto: el prefetch del navegador lo dispara
PUT /v1/cuentas/7/saldo  {"sumar": 5000}  ← PUT no idempotente: cada reintento suma
```

## good

```http
POST /v1/carrito/items  {"producto_id":42}
PUT  /v1/cuentas/7/saldo  {"saldo": 125000}   ← valor absoluto: idempotente
```

## bridge:typescript

A retry loop in your own function that wraps `fetch`, applied to everything, is dangerous precisely because of this: retrying a GET is fine, but retrying a payment POST can charge twice. A well-built function that wraps `fetch` only retries idempotent methods or requests with an idempotency key.

## interview

A safe method is read-only: it must not change the server state, like GET, HEAD and OPTIONS. Idempotent means the effect of N identical requests is the same as that of one; all safe methods are, plus PUT and DELETE. POST is not and PATCH is not guaranteed. It matters because distributed systems have timeouts and automatic retries: retrying an idempotent method is harmless, but retrying a POST can duplicate an order or a payment, which is why idempotency keys are used for those operations.

## myths

- Believing idempotent means "always returns the same response". A DELETE can respond 204 and then 404; what does not change is the state.
- Thinking GET is safe because the framework guarantees it. It is a promise you keep or break in your code.
- Assuming PATCH is never idempotent. It can be (set email = x), but the standard does not guarantee it (add 1 to the stock).
