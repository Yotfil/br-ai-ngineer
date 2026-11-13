---
title: What happens when you type a URL and press Enter
summary: The browser resolves the domain (DNS), opens a connection (TCP), encrypts it (TLS), sends the HTTP request and gets the response.
concepts:
  dns:
    name: DNS
    aliases: []
  tcp:
    name: TCP
    aliases: []
  ttfb:
    name: TTFB
    aliases: []
---

## definition

The browser resolves the domain name to an IP (DNS), opens a reliable connection with that server (TCP), encrypts it (TLS), sends the HTTP request and receives the response, which it then interprets and renders.

## analogy

It is like sending a registered letter to a company: first you look up its address in the directory (**DNS**), then the courier confirms someone can receive it (**TCP**), you put it in a sealed envelope only they can open (**TLS**), and finally your letter goes out (**request**) and they send another one back (**response**).

## problem

Understanding the whole journey lets you diagnose which layer is failing: a DNS error is not a 500, an expired certificate is not a bug in your endpoint, and a timeout can happen before your code even runs.

## code:wire

```http
# 1. DNS: api.tienda.co → 104.21.33.10  (caché del navegador → SO → resolver → servidores raíz/TLD/autoritativo)
# 2. TCP: SYN → SYN-ACK → ACK  (puerto 443)
# 3. TLS: ClientHello → ServerHello + certificado → claves acordadas
# 4. Petición HTTP (ya cifrada dentro del túnel TLS):
GET /v1/productos/42 HTTP/1.1
Host: api.tienda.co
Accept: application/json

# 5. Respuesta:
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 58

{"id":42,"nombre":"Café de origen Tolima","precio":38000}
```

## code:server

```python
# Del lado del servidor, todo lo anterior ya ocurrió cuando tu código se ejecuta.
# Un proxy (Nginx, el balanceador de AWS) suele terminar TLS; Uvicorn recibe HTTP
# y FastAPI enruta la petición a esta función:
@app.get("/v1/productos/{producto_id}")
def obtener_producto(producto_id: int):
    return {"id": producto_id, "nombre": "Café de origen Tolima", "precio": 38000}
```

## bridge:typescript

In the **Network** tab, the **Timing** view of each request shows these phases: `DNS Lookup`, `Initial connection` (TCP), `SSL` (TLS), `Waiting for server response` (how long your backend takes, the TTFB) and `Content Download`. When a request is slow in a project, that breakdown tells you whether the culprit is the network or the server.

## interview

First the browser checks its caches and, if it does not have the IP, makes a DNS query. With the IP it opens a TCP connection with the three-way handshake and, since it is HTTPS, negotiates TLS: the server presents its certificate and they agree on encryption keys. Over that channel it sends the HTTP request with method, path and headers. On the server side there is usually a load balancer or proxy that forwards it to the application; the app processes it, maybe queries the database, and returns a response with a status code, headers and body. Finally the browser interprets it and, if it is HTML, requests the additional resources and renders.

## myths

- Thinking the backend receives the request exactly as it left the browser. In between there is usually a CDN, a load balancer and a reverse proxy that add or remove headers (for example `X-Forwarded-For`).
- Believing every request repeats DNS, TCP and TLS. DNS is cached and connections are reused (keep-alive).
- Mixing up the port: HTTP uses 80 and HTTPS 443 by default, even if the URL does not show it.
