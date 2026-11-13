---
title: CORS y el preflight con OPTIONS
summary: CORS es un mecanismo del navegador que deja a JavaScript de un origen leer respuestas de otro solo si el servidor lo autoriza.
concepts:
  cors-concepto:
    name: CORS
    aliases: []
  preflight:
    name: preflight
    aliases: []
  origen:
    name: origen
    aliases:
      - origin
---

## definition

CORS (Cross-Origin Resource Sharing) es un mecanismo del **navegador** que relaja la política de mismo origen: permite que JavaScript de `https://app.tienda.co` lea respuestas de `https://api.tienda.co` solo si el servidor lo autoriza con headers `Access-Control-Allow-*`.

## analogy

Un edificio con portero (el **navegador**). Tú llegas desde otra torre (otro origen) a visitar el apartamento 502. El portero llama arriba: «¿Recibe visitas de la torre B con paquete grande?» (**preflight**). Si el residente dice que sí, te deja subir. Pero el residente (el **servidor**) igual escuchó el timbre: el portero solo decide si te deja ver la respuesta.

## problem

Sin la política de mismo origen, cualquier página que visites podría leer con tus cookies tu correo o tu banco. CORS permite abrir esa puerta de forma controlada. Mal configurado (`allow_origins=["*"]` con credenciales, o reflejar cualquier `Origin`) anula la protección.

## code:wire

```http
# Preflight: lo envía el navegador solo, antes de un PUT con Authorization
OPTIONS /v1/pedidos/1093 HTTP/1.1
Origin: https://app.tienda.co
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: authorization, content-type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.tienda.co
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Max-Age: 600

# Luego la petición real
PUT /v1/pedidos/1093 HTTP/1.1
Origin: https://app.tienda.co
...
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.tienda.co
```

## code:server

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.tienda.co", "http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=True,   # necesario si usas cookies; incompatible con "*"
)
```

## bad

```http
# Reflejar cualquier origen con credenciales
Access-Control-Allow-Origin: <lo que venga en Origin>
Access-Control-Allow-Credentials: true
```

## good

```http
# Lista explícita de orígenes conocidos
allow_origins=["https://app.tienda.co"]
```

## bridge:typescript

El mensaje rojo `blocked by CORS policy: No 'Access-Control-Allow-Origin' header` no significa que tu petición no llegó: en muchos casos el servidor sí la procesó, pero el navegador te ocultó la respuesta. El proxy del servidor de desarrollo lo «resuelve» porque hace que la petición salga del mismo origen (el dev server), no porque arregle el backend. Por eso con Postman o curl nunca ves errores de CORS.

## interview

CORS es un mecanismo del navegador que permite, bajo control del servidor, que una página de un origen lea respuestas de otro origen, entendiendo origen como esquema, host y puerto. Para peticiones no simples, como un PUT o cualquier petición con Authorization o con JSON, el navegador primero envía un preflight OPTIONS preguntando si el método y los headers están permitidos, y el servidor responde con Access-Control-Allow-Origin, Methods y Headers. Es un asunto del navegador: protege al usuario para que otros sitios no lean datos con sus credenciales, pero no protege la API de clientes como curl o Postman, así que no reemplaza la autenticación.

## myths

- Creer que CORS protege al servidor. Protege al usuario del navegador; un atacante con curl lo ignora.
- Pensar que se arregla en el frontend. Se configura en el servidor (o en el proxy).
- Creer que todas las peticiones tienen preflight. Las «simples» (GET o POST con Content-Type de formulario y sin headers propios) no lo tienen.
