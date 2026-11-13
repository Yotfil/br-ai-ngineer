---
title: Métodos seguros e idempotentes
summary: Un método es seguro si no modifica el estado del servidor (GET, HEAD, OPTIONS).
concepts:
  idempotencia:
    name: idempotencia
    aliases:
      - idempotency
  metodo-seguro:
    name: método seguro
    aliases:
      - safe method
exercises:
  - type: choice
    prompt: ¿Qué método o respuesta corresponde?
    items:
      - q: ¿Cuál de estas operaciones es idempotente?
        options:
          - POST /pedidos
          - 'PATCH /productos/42 {"stock": "+1"}'
          - DELETE /pedidos/9
          - POST /pagos
        answer: 2
        why: "Borrar el pedido 9 dos veces deja el mismo estado: el pedido no existe."
      - q: Un GET /v1/reportes/generar crea un archivo nuevo cada vez que se llama. ¿Qué principio rompe?
        options:
          - Solo la idempotencia
          - La seguridad del método (y también la idempotencia)
          - Ninguno, es válido
          - Solo el cacheo
        answer: 1
        why: GET debe ser seguro. Si genera un archivo cada vez, además deja de ser idempotente. Debería ser POST /v1/reportes.
  - type: classify
    prompt: ¿Qué método HTTP corresponde?
    categories:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
    items:
      - text: Crear un pedido nuevo
        category: POST
        why: Crea un recurso y no es idempotente.
      - text: Listar los productos de la categoría café
        category: GET
        why: Lectura con query param.
      - text: Reemplazar todos los datos del cliente 7
        category: PUT
        why: Reemplazo completo e idempotente.
      - text: Cambiar solo el estado del pedido a «enviado»
        category: PATCH
        why: Modificación parcial.
      - text: Eliminar el producto 3
        category: DELETE
        why: Eliminar es idempotente.
---

## definition

Un método es **seguro** si no modifica el estado del servidor (GET, HEAD, OPTIONS). Es **idempotente** si enviarlo una vez o diez veces deja el servidor en el mismo estado (los seguros, más PUT y DELETE). POST y PATCH no garantizan ninguna de las dos cosas.

## analogy

El botón del ascensor es **idempotente**: oprimirlo cinco veces no llama cinco ascensores. Un dispensador de dulces con monedas **no lo es**: cada moneda saca otro dulce. Mirar el tablero de pisos es **seguro**: no cambia nada.

## problem

Es la base de los reintentos. Los clientes HTTP, los balanceadores y las colas reintentan automáticamente cuando hay timeouts. Si el método es idempotente, reintentar no causa daño; si no lo es (POST), el reintento puede duplicar pedidos o cobros, y hay que protegerlo con claves de idempotencia (ver [[idempotencia-en-la-practica]]).

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

Un bucle de reintento en una función propia que envuelve `fetch`, aplicado a todo, es peligroso justo por esto: reintentar un GET está bien, pero reintentar un POST de pago puede cobrar dos veces. Una función que envuelve `fetch` bien hecha solo reintenta métodos idempotentes o peticiones con clave de idempotencia.

## interview

Un método seguro es de solo lectura: no debe cambiar el estado del servidor, como GET, HEAD y OPTIONS. Idempotente significa que el efecto de N peticiones iguales es el mismo que el de una; lo son todos los seguros más PUT y DELETE. POST no lo es y PATCH no está garantizado. Importa porque en sistemas distribuidos hay timeouts y reintentos automáticos: un reintento de un método idempotente es inofensivo, pero uno de POST puede duplicar un pedido o un pago, por eso para esas operaciones se usan claves de idempotencia.

## myths

- Creer que idempotente significa «devuelve siempre la misma respuesta». Un DELETE puede responder 204 y luego 404; lo que no cambia es el estado.
- Pensar que GET es seguro porque el framework lo garantiza. Es una promesa que tú cumples o rompes en tu código.
- Asumir que PATCH nunca es idempotente. Puede serlo (poner email = x), pero el estándar no lo garantiza (sumar 1 al stock).
