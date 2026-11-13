---
title: "Idempotencia en la práctica: claves y pagos duplicados"
summary: Para operaciones no idempotentes, el cliente genera una clave de idempotencia única y la envía en un header.
concepts:
  clave-de-idempotencia:
    name: clave de idempotencia
    aliases:
      - idempotency key
      - Idempotency-Key
  reintentos:
    name: reintentos
    aliases:
      - retries
---

## definition

Para operaciones no idempotentes (como crear un pago), el cliente genera una **clave de idempotencia** única y la envía en un header. El servidor guarda la clave con la respuesta; si llega un reintento con la misma clave, devuelve la respuesta guardada en lugar de procesar otra vez.

## analogy

El número de radicado de un trámite: si llevas el mismo formulario dos veces con el mismo radicado, la oficina te dice «ese trámite ya está en curso, aquí está tu comprobante» en lugar de abrir otro expediente.

## problem

Entre el cliente y tu API hay redes que se caen. Si la respuesta del pago se pierde, el cliente no sabe si se cobró o no, y la reacción natural es reintentar. Sin clave, cada reintento es un cobro nuevo. Pasarelas como Stripe exigen este patrón.

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

Deshabilitar el botón «Pagar» después del clic e ignorar clics mientras hay una petición en curso evitan el doble clic, pero no protegen de un reintento de tu función que envuelve `fetch` ni de la red. La solución robusta es generar un `crypto.randomUUID()` al abrir el checkout y enviarlo en cada intento como `Idempotency-Key`.

## interview

Para operaciones que no son naturalmente idempotentes, como crear un pago o un pedido, el cliente genera una clave única por intención y la envía en un header como Idempotency-Key. El servidor la reserva de forma atómica, procesa y guarda la respuesta asociada a la clave con un tiempo de vida. Si llega un reintento con la misma clave, devuelve la respuesta guardada sin volver a procesar; si llega la misma clave con un body distinto, rechaza la petición. Así los reintentos por timeouts son seguros. Lo complemento con restricciones únicas en la base de datos como última defensa.

## myths

- Generar una clave nueva en cada reintento. Entonces no sirve de nada: la clave identifica la intención, no el intento.
- Comprobar y guardar la clave en dos pasos no atómicos. Dos peticiones simultáneas pueden pasar el chequeo a la vez.
- Creer que basta con la validación del frontend.
