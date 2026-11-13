---
title: CORS and the OPTIONS preflight
summary: CORS is a browser mechanism that lets JavaScript from one origin read responses from another only if the server allows it.
concepts:
  cors-concepto:
    name: CORS
    aliases: []
  preflight:
    name: preflight
    aliases: []
  origen:
    name: origin
    aliases:
      - origen
---

## definition

CORS (Cross-Origin Resource Sharing) is a **browser** mechanism that relaxes the same-origin policy: it lets JavaScript from `https://app.tienda.co` read responses from `https://api.tienda.co` only if the server authorizes it with `Access-Control-Allow-*` headers.

## analogy

A building with a doorman (the **browser**). You arrive from another tower (another origin) to visit apartment 502. The doorman calls up: "Do you accept visitors from tower B with a big package?" (**preflight**). If the resident says yes, he lets you go up. But the resident (the **server**) heard the doorbell anyway: the doorman only decides whether you get to see the answer.

## problem

Without the same-origin policy, any page you visit could read your email or your bank with your cookies. CORS lets you open that door in a controlled way. Misconfigured (`allow_origins=["*"]` with credentials, or reflecting any `Origin`) it cancels the protection.

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

The red message `blocked by CORS policy: No 'Access-Control-Allow-Origin' header` does not mean your request did not arrive: in many cases the server did process it, but the browser hid the response from you. The development server proxy "solves" it because it makes the request leave from the same origin (the dev server), not because it fixes the backend. That is why you never see CORS errors with Postman or curl.

## interview

CORS is a browser mechanism that allows, under the server’s control, a page from one origin to read responses from another origin, where origin means scheme, host and port. For non-simple requests, such as a PUT or any request with Authorization or JSON, the browser first sends an OPTIONS preflight asking whether the method and headers are allowed, and the server responds with Access-Control-Allow-Origin, Methods and Headers. It is a browser matter: it protects the user so other sites cannot read data with their credentials, but it does not protect the API from clients like curl or Postman, so it does not replace authentication.

## myths

- Believing CORS protects the server. It protects the browser user; an attacker with curl ignores it.
- Thinking it is fixed in the frontend. It is configured on the server (or on the proxy).
- Believing every request has a preflight. "Simple" ones (GET or POST with a form Content-Type and no custom headers) do not.
