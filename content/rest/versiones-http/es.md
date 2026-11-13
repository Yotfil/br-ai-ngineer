---
title: HTTP/1.1 vs. HTTP/2 vs. HTTP/3
summary: HTTP/1.1 es texto, con conexiones persistentes pero una petición a la vez por conexión.
concepts:
  http2:
    name: HTTP/2
    aliases: []
  http3:
    name: HTTP/3
    aliases: []
  multiplexacion:
    name: multiplexación
    aliases:
      - multiplexing
---

## definition

**HTTP/1.1** es texto, con conexiones persistentes pero una petición a la vez por conexión. **HTTP/2** es binario y multiplexa muchas peticiones en una sola conexión TCP. **HTTP/3** hace lo mismo sobre **QUIC** (UDP), que evita que un paquete perdido bloquee todo.

## analogy

**1.1**: una caja de supermercado con fila; los navegadores abren hasta 6 cajas por tienda. **2**: una sola caja que atiende a todos intercalando productos, pero si se atasca la cinta (pérdida de paquete TCP), todos esperan. **3**: cada cliente tiene su propia cinta dentro de la misma caja; si una se atasca, las demás siguen.

## problem

Con HTTP/1.1, las páginas con decenas de recursos sufrían por el límite de conexiones y el **head-of-line blocking**, lo que llevó a hacks como concatenar archivos y sprites. HTTP/2 lo resolvió a nivel HTTP; HTTP/3 lo resolvió también a nivel de transporte, lo que importa sobre todo en redes móviles inestables.

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

En la pestaña Network puedes activar la columna **Protocol** y verás `h2` o `h3`. Que hoy no haga falta empaquetar todo en un solo bundle gigante para reducir peticiones es en parte gracias a la multiplexación de HTTP/2.

## interview

HTTP/1.1 introdujo conexiones persistentes, pero cada conexión atiende una petición a la vez, así que los navegadores abren varias en paralelo. HTTP/2 mantiene la misma semántica pero usa un formato binario, multiplexa muchas peticiones en una sola conexión y comprime headers; su limitación es que corre sobre TCP, y una pérdida de paquete frena todos los streams. HTTP/3 corre sobre QUIC, basado en UDP, con streams independientes, TLS 1.3 integrado y un establecimiento de conexión más rápido. Para el desarrollador backend la API no cambia; normalmente lo maneja el CDN o el balanceador.

## myths

- Creer que HTTP/2 cambia la API. La semántica es idéntica; cambia el formato en la red.
- Pensar que HTTP/3 reemplaza TCP en todas partes. Es opcional y convive con HTTP/2 como alternativa.
- Asumir que HTTP/2 elimina por completo el head-of-line blocking. Lo elimina en HTTP, no en TCP.
