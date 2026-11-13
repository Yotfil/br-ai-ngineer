---
title: REST vs. GraphQL, gRPC, WebSockets, SSE y webhooks
summary: REST es el estándar para APIs públicas de recursos.
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

REST es el estándar para APIs públicas de recursos. **GraphQL** deja que el cliente pida exactamente los campos que necesita. **gRPC** es RPC binario y rápido entre servicios. **WebSockets** dan comunicación bidireccional persistente, **SSE** es un flujo del servidor al cliente, y los **webhooks** son peticiones HTTP que el servidor de otro te envía cuando ocurre un evento.

## analogy

**REST**: un restaurante con menú fijo. **GraphQL**: un buffet donde armas tu plato. **gRPC**: la comunicación interna entre cocina y barra con códigos cortos. **WebSocket**: una llamada telefónica abierta. **SSE**: la radio, solo escuchas. **Webhook**: «te llamamos cuando tu mesa esté lista».

## problem

Elegir mal cuesta: GraphQL en una API pública simple agrega complejidad (caché HTTP difícil, consultas costosas); polling cada segundo en lugar de SSE gasta recursos; WebSockets para algo que solo fluye en una dirección complica el escalado; y no verificar la firma de un webhook permite que cualquiera marque pedidos como pagados.

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

Ya conoces el lado cliente de casi todos: Apollo para GraphQL, `new WebSocket()`, `new EventSource()` para SSE, que es justo lo que usan las interfaces de chat con IA para mostrar la respuesta token por token. Los webhooks no tienen lado frontend: son servidor a servidor.

## interview

REST es mi opción por defecto para APIs de recursos, sobre todo públicas, por simplicidad, caché HTTP y ecosistema. GraphQL lo considero cuando hay muchos clientes con necesidades de datos muy distintas y quiero evitar traer datos de más o hacer varias llamadas, aceptando más complejidad en caché, autorización por campo y control de costo de consultas. gRPC lo uso entre microservicios internos por rendimiento y contratos tipados con Protocol Buffers. WebSockets para comunicación bidireccional en tiempo real, como chat. SSE cuando solo el servidor envía actualizaciones, como progreso o streaming de IA. Y webhooks para notificar eventos a otros sistemas, siempre firmados y procesados de forma idempotente.

## myths

- Creer que GraphQL reemplaza a REST. Resuelve otros problemas: muchos clientes con necesidades de datos distintas.
- Pensar que gRPC funciona directo desde el navegador. Necesita gRPC-Web y un proxy.
- Usar WebSockets para notificaciones unidireccionales cuando SSE basta.
