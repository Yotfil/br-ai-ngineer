---
title: Rate limiting, 429 y Retry-After
summary: El rate limiting limita cuántas peticiones puede hacer un cliente en un período.
concepts:
  "429":
    name: 429 Too Many Requests
    aliases:
      - Too Many Requests
  token-bucket-concepto:
    name: token bucket
    aliases: []
  retry-after:
    name: Retry-After
    aliases: []
---

## definition

El **rate limiting** limita cuántas peticiones puede hacer un cliente en un período. Cuando se excede, el servidor responde `429 Too Many Requests` y, con `Retry-After`, dice cuánto esperar. Los headers `RateLimit-*` informan el cupo restante.

## analogy

Un dispensador de agua que llena tu vaso a un ritmo fijo: puedes tomar varios seguidos si el tanque está lleno (ráfaga), pero si lo vacías, tienes que esperar a que se recargue. Es el algoritmo **token bucket**.

## problem

Protege la API de abusos, scrapers, ataques de fuerza bruta al login y clientes con bugs que hacen peticiones en bucle. También reparte capacidad entre clientes y controla costos. Los algoritmos más comunes son **ventana fija**, **ventana deslizante** y **token bucket**.

## code:wire

```http
GET /v1/productos HTTP/1.1
X-API-Key: sk_live_9f2c...

HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 23

GET /v1/productos HTTP/1.1

HTTP/1.1 429 Too Many Requests
Retry-After: 23
Content-Type: application/problem+json

{"title":"Demasiadas peticiones","status":429,"detail":"Límite de 100 por minuto. Reintenta en 23 s."}
```

## code:server

```python
# Con la librería slowapi (basada en limits):
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, storage_uri="redis://cache:6379")
app.state.limiter = limiter

@app.get("/v1/productos")
@limiter.limit("100/minute")
def listar(request: Request): ...
# El contador va en Redis para que todas las instancias compartan el cupo.
```

## bad

```http
# Contador en memoria de cada instancia: con 5 instancias, el límite real es 5×
# Responder 503 o 500 al exceder el límite
```

## good

```http
# Contador compartido (Redis), clave por API key o usuario, 429 + Retry-After
```

## bridge:typescript

Un buscador con autocompletado que no espera antes de enviar es el clásico generador de 429. Y una función propia de reintentos que envuelve `fetch` debería leer `Retry-After` y usar **backoff exponencial con jitter** en lugar de reintentar de inmediato.

## interview

El rate limiting restringe la cantidad de peticiones por cliente en una ventana de tiempo para proteger la API de abusos y repartir la capacidad. Se implementa con algoritmos como ventana fija, ventana deslizante o token bucket, que permite ráfagas controladas, y en un entorno con varias instancias el contador debe vivir en un almacén compartido como Redis o en el API gateway. Cuando se excede el límite respondo 429 Too Many Requests con Retry-After, e informo el cupo con headers RateLimit. Del lado del cliente, lo correcto es respetar Retry-After y reintentar con backoff exponencial y jitter.

## myths

- Limitar solo por IP. Detrás de una oficina o un NAT hay cientos de usuarios con la misma IP; para APIs autenticadas es mejor limitar por usuario o API key.
- Confundir 429 con 503. 429 es «tú en particular excediste tu cupo»; 503 es «el servicio no está disponible para nadie».
- Reintentar inmediatamente al recibir 429.
