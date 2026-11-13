---
title: "HTTP caching: Cache-Control, ETag and 304"
summary: With Cache-Control the server states whether a response can be stored, who can store it and for how long.
concepts:
  "304":
    name: 304 Not Modified
    aliases: []
  cache-control:
    name: Cache-Control
    aliases: []
  etag:
    name: ETag
    aliases: []
---

## definition

With `Cache-Control` the server states whether a response can be stored, who can store it and for how long. When it expires, the client revalidates with `If-None-Match`, sending the `ETag`; if it did not change, the server responds `304 Not Modified` with no body.

## analogy

The menu of the day written on a board. If it says "valid until 3 p.m." (**max-age**), you do not ask again. After 3 you ask: "Is it still menu version 7?" (**If-None-Match**). If they tell you "yes, the same one" (**304**), they do not read you the whole menu again.

## problem

It avoids work and traffic: without caching, every user downloads the same catalog over and over. Misused it is dangerous: marking a response with user data as `public` can make a CDN serve Pedro the orders of Ana. For private data you use `private` or `no-store`.

## code:wire

```http
GET /v1/productos/42 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: public, max-age=60
ETag: "a1b2c3"
{"id":42,"precio":38000}

# 2 minutos después (expiró), el navegador revalida:
GET /v1/productos/42 HTTP/1.1
If-None-Match: "a1b2c3"

HTTP/1.1 304 Not Modified
ETag: "a1b2c3"
# sin body: el cliente usa su copia
```

## code:server

```python
import hashlib, json
from fastapi import Request, Response

@app.get("/v1/productos/{id}")
def obtener(id: int, request: Request, response: Response):
    p = repo.buscar(id)
    etag = '"' + hashlib.md5(json.dumps(p).encode()).hexdigest() + '"'
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag})
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=60"
    return p
```

## bad

```http
GET /v1/clientes/me
Cache-Control: public, max-age=3600   ← el CDN la comparte entre usuarios
```

## good

```http
GET /v1/clientes/me
Cache-Control: private, no-cache        ← solo el navegador, y revalidando
```

## bridge:typescript

In the Network tab, the **Size** column shows `(disk cache)` or `(memory cache)` when the response did not touch the network, and the code **304** when there was a revalidation. The **Disable cache** checkbox exists precisely because these headers sometimes show you "stale" data during development.

## interview

HTTP caching is controlled with Cache-Control: max-age defines how long the response is fresh, public or private defines whether intermediaries like a CDN may store it or only the browser, no-cache forces revalidation and no-store forbids storing. To revalidate, the server sends an ETag, which is a fingerprint of the resource version; the client sends it back in If-None-Match and, if it did not change, gets a 304 with no body, which saves bandwidth. Caching happens in the browser, in proxies and in CDNs, and private data must never be marked as public.

## myths

- `no-cache` does not mean "do not store": it means "store, but revalidate before using". The one that forbids storing is `no-store`.
- Thinking only the browser caches. CDNs, reverse proxies and gateways do too.
- Believing POST gets cached. In practice, only GET and HEAD.
