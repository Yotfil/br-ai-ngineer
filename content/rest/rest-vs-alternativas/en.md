---
title: REST vs. GraphQL, gRPC, WebSockets, SSE and webhooks
summary: REST is the standard for public resource APIs.
concepts:
  graphql:
    name: GraphQL
    aliases: []
  grpc:
    name: gRPC
    aliases: []
  websockets:
    name: WebSockets
    aliases: []
  sse:
    name: SSE
    aliases:
      - Server-Sent Events
  webhooks:
    name: webhooks
    aliases: []
---

## definition

REST is the standard for public resource APIs. **GraphQL** lets the client ask for exactly the fields it needs. **gRPC** is fast binary RPC between services. **WebSockets** give persistent bidirectional communication, **SSE** is a stream from the server to the client, and **webhooks** are HTTP requests that someone else’s server sends you when an event happens.

## analogy

**REST**: a restaurant with a fixed menu. **GraphQL**: a buffet where you build your plate. **gRPC**: the internal communication between kitchen and bar with short codes. **WebSocket**: an open phone call. **SSE**: the radio, you only listen. **Webhook**: "we will call you when your table is ready".

## problem

Choosing badly is costly: GraphQL in a simple public API adds complexity (hard HTTP caching, expensive queries); polling every second instead of SSE wastes resources; WebSockets for something that flows in only one direction complicates scaling; and not verifying a webhook’s signature lets anyone mark orders as paid.

## code:wire

```http
# GraphQL: un endpoint, el cliente elige los campos
POST /graphql
{"query":"{ pedido(id:1093){ total cliente{ nombre } } }"}

# SSE: una respuesta que no termina
GET /v1/pedidos/1093/eventos
Accept: text/event-stream
HTTP/1.1 200 OK
Content-Type: text/event-stream

event: estado
data: {"estado":"en_preparacion"}

event: estado
data: {"estado":"enviado"}

# Webhook: la pasarela de pagos llama a TU API
POST https://api.tienda.co/v1/webhooks/pagos
X-Signature: t=1731456000,v1=5257a869e7...
{"evento":"pago.aprobado","pago_id":"pay_501"}
```

## code:server

```python
from fastapi.responses import StreamingResponse

@app.get("/v1/pedidos/{id}/eventos")
async def eventos(id: int):
    async def stream():
        async for estado in escuchar_cambios(id):
            yield f"event: estado\ndata: {estado}\n\n"
    return StreamingResponse(stream(), media_type="text/event-stream")

@app.websocket("/ws/soporte")
async def chat(ws: WebSocket):
    await ws.accept()
    while True:
        msg = await ws.receive_text()
        await ws.send_text(f"Agente: recibido '{msg}'")
```

## bridge:typescript

You already know the client side of almost all of them: Apollo for GraphQL, `new WebSocket()`, `new EventSource()` for SSE, which is exactly what AI chat interfaces use to show the answer token by token. Webhooks have no frontend side: they are server to server.

## interview

REST is my default option for resource APIs, especially public ones, for its simplicity, HTTP caching and ecosystem. I consider GraphQL when there are many clients with very different data needs and I want to avoid fetching too much data or making several calls, accepting more complexity in caching, per-field authorization and query cost control. I use gRPC between internal microservices for performance and typed contracts with Protocol Buffers. WebSockets for real-time bidirectional communication, like chat. SSE when only the server sends updates, like progress or AI streaming. And webhooks to notify events to other systems, always signed and processed idempotently.

## myths

- Believing GraphQL replaces REST. It solves other problems: many clients with different data needs.
- Thinking gRPC works directly from the browser. It needs gRPC-Web and a proxy.
- Using WebSockets for one-way notifications when SSE is enough.
