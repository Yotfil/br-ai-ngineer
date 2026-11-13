---
title: Rate limiting, 429 and Retry-After
summary: Rate limiting caps how many requests a client can make in a period.
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

**Rate limiting** caps how many requests a client can make in a period. When it is exceeded, the server responds `429 Too Many Requests` and, with `Retry-After`, says how long to wait. The `RateLimit-*` headers report the remaining quota.

## analogy

A water dispenser that fills your glass at a fixed rate: you can drink several in a row if the tank is full (burst), but if you empty it, you have to wait for it to refill. It is the **token bucket** algorithm.

## problem

It protects the API from abuse, scrapers, brute-force attacks on the login and buggy clients that make requests in a loop. It also shares capacity among clients and controls costs. The most common algorithms are **fixed window**, **sliding window** and **token bucket**.

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

An autocomplete search box that does not wait before sending is the classic 429 generator. And your own retry function that wraps `fetch` should read `Retry-After` and use **exponential backoff with jitter** instead of retrying immediately.

## interview

Rate limiting restricts the number of requests per client in a time window to protect the API from abuse and share capacity. It is implemented with algorithms like fixed window, sliding window or token bucket, which allows controlled bursts, and in an environment with several instances the counter must live in a shared store like Redis or in the API gateway. When the limit is exceeded I respond 429 Too Many Requests with Retry-After, and report the quota with RateLimit headers. On the client side, the right thing is to respect Retry-After and retry with exponential backoff and jitter.

## myths

- Limiting only by IP. Behind an office or a NAT there are hundreds of users with the same IP; for authenticated APIs it is better to limit by user or API key.
- Confusing 429 with 503. 429 is "you in particular exceeded your quota"; 503 is "the service is unavailable to everyone".
- Retrying immediately after receiving a 429.
