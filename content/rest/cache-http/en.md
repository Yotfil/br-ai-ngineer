---
title: "HTTP caching: Cache-Control, ETag and 304"
summary: HTTP caching lets the browser store a response and reuse it; the server controls it with Cache-Control and ETag.
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

HTTP caching lets the browser **store a response and reuse it**, instead of asking the server for it again.

The server controls it with two response headers. `Cache-Control` says whether the response can be stored, who can store it and for how long. `ETag` is an identifier for the version of the content: if the content changes, the `ETag` changes.

## analogy

The menu of the day at a restaurant, written on a board that says "valid until 3 p.m." (`max-age`). Before 3 you do not ask the waiter anything: you already read it. After 3 you ask "is it still menu number 7?" (`If-None-Match` with the `ETag`). If the answer is "yes, the same one" (`304`), they do not read it out to you in full again.

## problem

Without caching, every visit downloads the same catalog again, even if it has not changed: more waiting for the user and more work for the server.

Misused, it is dangerous. If you mark a response with personal data as `public`, an intermediate server can store it and hand Ana's data to Luis.

## code:wire

### Moment 1. First request: the server responds and gives permission to store

```http
GET /v1/productos/42 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: public, max-age=60    # anyone can store it, for 60 seconds
ETag: "a1b2c3"                       # identifier of this version of the product

{"id":42,"nombre":"café","precio":38000}
```

### Moment 2. After 30 seconds: no request

The browser needs the product again. The 60 seconds have not passed yet, so it uses its copy and **sends nothing to the server**.

### Moment 3. After 2 minutes: the copy expired and the browser asks if it is still valid

```http
GET /v1/productos/42 HTTP/1.1
If-None-Match: "a1b2c3"              # "I have version a1b2c3, is it still the current one?"

HTTP/1.1 304 Not Modified            # "yes, it did not change"
Cache-Control: public, max-age=60    # the 304 repeats the cache headers of the 200
ETag: "a1b2c3"
                                     # no body: the browser reuses its copy
```

With the headers of the 304, the browser renews its copy: it is valid for 60 seconds again. If the product had changed, the server would respond `200 OK` with the new product and a different `ETag`, as in moment 1.

## code:server

In the store, this is the `GET /v1/productos/{id}` endpoint. `router` is the `APIRouter` of the file and `repository` is the module with the product queries.

```python
# app/productos/router.py
import hashlib, json
from fastapi import Request, Response

@router.get("/v1/productos/{id}")
def obtener_producto(id: int, request: Request, response: Response):
    producto = repository.buscar(id)   # taken for granted: the product as a dict (without the 404 case)
    # 1. The ETag is a fingerprint of the content: if the product changes, the fingerprint changes.
    etag = '"' + hashlib.md5(json.dumps(producto).encode()).hexdigest() + '"'   # inside double quotes
    cache = {"ETag": etag, "Cache-Control": "public, max-age=60"}
    # 2. Does the browser already have this version? If-None-Match can carry several, separated by commas.
    if etag in request.headers.get("if-none-match", ""):
        return Response(status_code=304, headers=cache)   # no body, but with its headers
    response.headers.update(cache)   # 3. if it does not have it, or it changed: the product with its headers
    return producto
```

FastAPI calls this function every time someone asks for a product, and passes it in `request` the request that arrived and in `response` the response it is preparing.

## bad

```http
GET /v1/clientes/me HTTP/1.1
Authorization: Bearer <Ana's token>

HTTP/1.1 200 OK
Cache-Control: public, max-age=3600     # any cache can store it for an hour
```

`public` allows intermediate servers, such as a CDN, which serve many users, to store it. Normally a shared cache does not store the response to a request with `Authorization`; `public` gives it permission. For an hour, whoever requests `/v1/clientes/me` from that cache may receive Ana's data.

## good

```http
GET /v1/clientes/me HTTP/1.1
Authorization: Bearer <Ana's token>

HTTP/1.1 200 OK
Cache-Control: private, no-cache        # only Ana's browser, and asking before reusing it
```

`private`: only that user's browser stores it. `no-cache`: before reusing it, it asks the server if it is still valid.

## bridge:typescript

With `fetch` you write none of this: the browser reads `Cache-Control`, stores the copy and sends `If-None-Match` on its own. If the server responds that it did not change, `fetch` hands you the stored copy, so your code receives the product just as it did the first time. The difference that confuses people most: the server decides the cache with its headers; from the frontend you can change how a request uses it with the `cache` option of `fetch`, for example `fetch(url, { cache: "no-store" })` to always go to the network.

## interview

HTTP caching lets you reuse a stored response instead of asking for it again. The server controls it with `Cache-Control`: `max-age` says how many seconds the copy is valid, `public` or `private` says whether shared caches such as a CDN can store it or only the browser, `no-cache` forces asking before reusing it and `no-store` forbids storing it. To ask, the server sends an `ETag`, a fingerprint of the version; the browser sends it back in `If-None-Match` and, if it did not change, receives a `304 Not Modified` with no body, which saves it from downloading it again. A user's data is never marked as `public`.

## myths

- **"`no-cache` means it is not stored."** It is stored. It means "ask the server before using the copy", as in moment 3. The one that forbids storing is `no-store`.
- **"Only the browser stores responses."** The servers along the way, such as a CDN or a proxy, store them too, and those serve many users. That is why `public` and `private` matter.
- **"A 304 is an error."** It is the good response: it means your copy is still valid and you saved yourself from downloading it again.
