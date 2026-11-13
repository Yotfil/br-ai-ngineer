---
title: HTTP/1.1 vs. HTTP/2 vs. HTTP/3
summary: HTTP/1.1 is text, with persistent connections but one request at a time per connection.
concepts:
  http2:
    name: HTTP/2
    aliases: []
  http3:
    name: HTTP/3
    aliases: []
  multiplexacion:
    name: multiplexing
    aliases:
      - multiplexación
---

## definition

**HTTP/1.1** is text, with persistent connections but one request at a time per connection. **HTTP/2** is binary and multiplexes many requests over a single TCP connection. **HTTP/3** does the same over **QUIC** (UDP), which prevents one lost packet from blocking everything.

## analogy

**1.1**: a supermarket checkout with a queue; browsers open up to 6 checkouts per store. **2**: a single checkout that serves everyone by interleaving products, but if the belt jams (TCP packet loss), everyone waits. **3**: each customer has their own belt within the same checkout; if one jams, the others keep going.

## problem

With HTTP/1.1, pages with dozens of resources suffered from the connection limit and **head-of-line blocking**, which led to hacks like concatenating files and sprites. HTTP/2 solved it at the HTTP level; HTTP/3 also solved it at the transport level, which matters above all on unstable mobile networks.

## code:wire

```http
# HTTP/1.1: texto legible, una petición por conexión a la vez
GET /v1/productos HTTP/1.1
Host: api.tienda.co
Connection: keep-alive

# HTTP/2: los mismos campos viajan como frames binarios en streams numerados
:method: GET   :path: /v1/productos   :authority: api.tienda.co   (stream 1)
:method: GET   :path: /v1/clientes/me (stream 3)   ← en paralelo, misma conexión
# Headers comprimidos con HPACK

# HTTP/3: igual que HTTP/2 pero sobre QUIC (UDP), TLS 1.3 integrado
Alt-Svc: h3=":443"; ma=86400   ← el servidor anuncia que soporta HTTP/3
```

## code:server

```python
# Uvicorn habla HTTP/1.1. HTTP/2 y HTTP/3 normalmente los maneja
# el CDN o el balanceador frente al cliente, y hacia tu app usa HTTP/1.1.
# Tu código FastAPI no cambia: la semántica (métodos, códigos, headers) es la misma.
```

## bridge:typescript

In the Network tab you can enable the **Protocol** column and you will see `h2` or `h3`. The fact that today you do not need to pack everything into one giant bundle to reduce requests is partly thanks to HTTP/2 multiplexing.

## interview

HTTP/1.1 introduced persistent connections, but each connection serves one request at a time, so browsers open several in parallel. HTTP/2 keeps the same semantics but uses a binary format, multiplexes many requests over a single connection and compresses headers; its limitation is that it runs over TCP, and one packet loss stalls all streams. HTTP/3 runs over QUIC, based on UDP, with independent streams, built-in TLS 1.3 and faster connection setup. For the backend developer the API does not change; it is usually handled by the CDN or the load balancer.

## myths

- Believing HTTP/2 changes the API. The semantics are identical; the wire format changes.
- Thinking HTTP/3 replaces TCP everywhere. It is optional and coexists with HTTP/2 as an alternative.
- Assuming HTTP/2 completely removes head-of-line blocking. It removes it in HTTP, not in TCP.
