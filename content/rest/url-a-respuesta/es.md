---
title: Qué pasa cuando escribes una URL y das Enter
summary: El navegador resuelve el dominio (DNS), abre una conexión (TCP), la cifra (TLS), envía la petición HTTP y recibe la respuesta.
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

El navegador resuelve el nombre del dominio a una IP (DNS), abre una conexión confiable con ese servidor (TCP), la cifra (TLS), envía la petición HTTP y recibe la respuesta, que luego interpreta y renderiza.

## analogy

Es como enviar una carta certificada a una empresa: primero buscas su dirección en el directorio (**DNS**), luego el mensajero confirma que alguien la puede recibir (**TCP**), la metes en un sobre sellado que solo ellos abren (**TLS**), y finalmente va tu carta (**petición**) y te devuelven otra (**respuesta**).

## problem

Entender el viaje completo te permite diagnosticar en qué capa falla algo: un error de DNS no es un 500, un certificado vencido no es un bug de tu endpoint, y un timeout puede ocurrir antes de que tu código se ejecute.

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

En la pestaña **Network**, la vista **Timing** de cada petición muestra estas fases: `DNS Lookup`, `Initial connection` (TCP), `SSL` (TLS), `Waiting for server response` (lo que tarda tu backend, el TTFB) y `Content Download`. Cuando en un proyecto la petición es lenta, ese desglose te dice si el culpable es la red o el servidor.

## interview

Primero el navegador revisa sus cachés y, si no tiene la IP, hace una consulta DNS. Con la IP abre una conexión TCP con el handshake de tres pasos y, como es HTTPS, negocia TLS: el servidor presenta su certificado y acuerdan claves de cifrado. Sobre ese canal envía la petición HTTP con método, ruta y headers. Del lado del servidor normalmente hay un balanceador o proxy que la reenvía a la aplicación; la app procesa, quizás consulta la base de datos, y devuelve una respuesta con código de estado, headers y body. Finalmente el navegador la interpreta y, si es HTML, pide los recursos adicionales y renderiza.

## myths

- Pensar que el backend recibe la petición tal como salió del navegador. En medio suele haber CDN, balanceador y proxy inverso que agregan o quitan headers (por ejemplo `X-Forwarded-For`).
- Creer que cada petición repite DNS, TCP y TLS. Hay caché de DNS y las conexiones se reutilizan (keep-alive).
- Confundir el puerto: HTTP usa 80 y HTTPS 443 por defecto, aunque la URL no lo muestre.
