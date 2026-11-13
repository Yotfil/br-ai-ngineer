---
title: "Idempotency in practice: keys and duplicate payments"
summary: For non-idempotent operations, the client generates a unique idempotency key and sends it in a header.
concepts:
  clave-de-idempotencia:
    name: idempotency key
    aliases:
      - clave de idempotencia
      - Idempotency-Key
  reintentos:
    name: retries
    aliases:
      - reintentos
---

## definition

For non-idempotent operations (such as creating a payment), the client generates a unique **idempotency key** and sends it in a header. The server stores the key with the response; if a retry arrives with the same key, it returns the stored response instead of processing again.

## analogy

The filing number of a paperwork procedure: if you bring the same form twice with the same filing number, the office tells you "that procedure is already in progress, here is your receipt" instead of opening another file.

## problem

Between the client and your API there are networks that go down. If the payment response gets lost, the client does not know whether it was charged or not, and the natural reaction is to retry. Without a key, each retry is a new charge. Gateways like Stripe require this pattern.

## code:wire

```http
POST /v1/pagos HTTP/1.1
Idempotency-Key: 8f14e45f-ceea-467a-9575-0b0d1b2c3a4f
Content-Type: application/json

{"pedido_id":1093,"monto":76000,"metodo":"tarjeta"}

HTTP/1.1 201 Created
{"id":"pay_501","estado":"aprobado"}

# timeout → el cliente reintenta con la MISMA clave
POST /v1/pagos HTTP/1.1
Idempotency-Key: 8f14e45f-ceea-467a-9575-0b0d1b2c3a4f

HTTP/1.1 201 Created
Idempotent-Replayed: true
{"id":"pay_501","estado":"aprobado"}   ← mismo pago, no se cobró dos veces
```

## code:server

```python
@app.post("/v1/pagos", status_code=201)
def crear_pago(data: PagoIn, idempotency_key: str = Header(...)):
    previo = claves.get(idempotency_key)       # Redis o tabla con índice único
    if previo:
        if previo["hash_body"] != hash_de(data):
            raise HTTPException(422, "Misma clave con un body distinto")
        return previo["respuesta"]
    # reservar la clave de forma atómica (SET NX) para evitar carreras
    pago = pasarela.cobrar(data)
    claves.set(idempotency_key, {"hash_body": hash_de(data), "respuesta": pago}, ttl=86400)
    return pago
```

## bad

```http
# Deshabilitar el botón en el frontend como única protección
# (no cubre timeouts de red, reintentos del proxy ni doble pestaña)
```

## good

```http
# Clave generada por el cliente + almacenamiento atómico en el servidor
# + restricción única en BD como última línea de defensa
```

## bridge:typescript

Disabling the "Pay" button after the click and ignoring clicks while a request is in flight prevent the double click, but they do not protect against a retry from your function that wraps `fetch` or from the network. The robust solution is to generate a `crypto.randomUUID()` when the checkout opens and send it on every attempt as `Idempotency-Key`.

## interview

For operations that are not naturally idempotent, such as creating a payment or an order, the client generates a unique key per intent and sends it in a header like Idempotency-Key. The server reserves it atomically, processes and stores the response associated with the key with a time to live. If a retry arrives with the same key, it returns the stored response without processing again; if the same key arrives with a different body, it rejects the request. That way retries caused by timeouts are safe. I complement it with unique constraints in the database as the last line of defense.

## myths

- Generating a new key on each retry. Then it is useless: the key identifies the intent, not the attempt.
- Checking and storing the key in two non-atomic steps. Two simultaneous requests can pass the check at the same time.
- Believing frontend validation is enough.
