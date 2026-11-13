---
title: Autenticación vs. autorización, JWT y OAuth2
summary: Autenticación responde «¿quién eres?» (401 si falla).
concepts:
  jwt:
    name: JWT
    aliases:
      - JSON Web Token
  oauth2:
    name: OAuth2
    aliases: []
  refresh-token:
    name: refresh token
    aliases: []
exercises:
  - type: choice
    prompt: ¿Qué código de estado devuelve este caso?
    items:
      - q: Un token con firma válida pero con exp en el pasado llega a tu API.
        options:
          - "200"
          - "401"
          - "403"
          - "419"
        answer: 1
        why: "El token ya no prueba la identidad: 401. El cliente debe usar el refresh token."
      - q: Un usuario con rol «cliente» llama a DELETE /v1/productos/42, que exige rol admin.
        options:
          - "401"
          - "403"
          - "404"
          - "405"
        answer: 1
        why: "Está autenticado, pero no autorizado: 403."
---

## definition

**Autenticación** responde «¿quién eres?» (401 si falla). **Autorización** responde «¿puedes hacer esto?» (403 si falla). Los mecanismos más comunes son Basic, API keys, sesiones con cookies, JWT con refresh tokens y OAuth2 para delegar acceso.

## analogy

En un hotel, la recepción verifica tu cédula y te da una tarjeta (**autenticación**). La tarjeta abre tu habitación y el gimnasio, pero no la suite presidencial (**autorización**). La tarjeta deja de funcionar el día del checkout (**expiración**). **OAuth2** es darle al servicio de lavandería una tarjeta limitada que solo abre tu clóset, sin entregarle la tuya.

## problem

Un JWT tiene tres partes: el **header** (algoritmo), el **payload** (claims como `sub`, `role`, `exp`) y la **firma**, que garantiza que nadie modificó las dos primeras. Como no se puede revocar fácilmente, el access token dura poco (5–15 min) y un **refresh token** de larga duración, guardado de forma segura y revocable en el servidor, sirve para pedir uno nuevo.

## code:wire

```http
# Basic: usuario:clave en Base64 (no es cifrado). Solo sobre HTTPS.
Authorization: Basic YW5hOnNlY3JldG8=

# API key: identifica a una aplicación, no a una persona
X-API-Key: sk_live_9f2c...

# JWT = header.payload.firma (Base64URL)
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3Iiwicm9sZSI6ImNsaWVudGUiLCJleHAiOjE3OTk5OTk5OTl9.Xb3...

# Renovación con refresh token
POST /v1/auth/refresh
Cookie: refresh=rt_8c1f...; HttpOnly; Secure
→ 200 {"access_token":"eyJ... (nuevo, 15 min)"}
```

## code:server

```python
import jwt   # PyJWT
from datetime import datetime, timedelta, timezone

def crear_access_token(usuario_id: int, rol: str) -> str:
    payload = {"sub": str(usuario_id), "role": rol,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=15)}
    return jwt.encode(payload, SECRET, algorithm="HS256")

def usuario_actual(token: str = Depends(oauth2)):
    try:
        datos = jwt.decode(token, SECRET, algorithms=["HS256"])  # valida firma y exp
    except jwt.PyJWTError:
        raise HTTPException(401, headers={"WWW-Authenticate": "Bearer"})
    return datos

def requiere_admin(u = Depends(usuario_actual)):
    if u["role"] != "admin":
        raise HTTPException(403)   # autorización
    return u
```

## bad

```http
# Guardar datos sensibles en el payload y confiar en el rol que manda el cliente
{"sub":"7","role":"admin","password":"secreto"}   ← cualquiera lo lee
jwt.decode(token, options={"verify_signature": False})   ← acepta tokens falsificados
```

## good

```http
# Payload mínimo, firma verificada, expiración corta, algoritmo fijado
jwt.decode(token, SECRET, algorithms=["HS256"])
```

## bridge:typescript

Tu función propia que envuelve `fetch` y, ante un 401, llama a `/refresh` y reintenta la petición original es la mitad cliente del flujo de refresh token. Del lado del servidor, ese 401 aparece cuando `jwt.decode` detecta que `exp` ya pasó. Y cuando haces login con Google en una app, el backend está actuando como cliente de OAuth2.

## interview

Autenticación es verificar la identidad, y si falla corresponde un 401; autorización es decidir si esa identidad puede hacer una acción, y si falla es 403. Basic envía usuario y contraseña en Base64 y solo es aceptable sobre HTTPS; las API keys identifican aplicaciones; las sesiones guardan el estado en el servidor con una cookie; y un JWT es un token firmado con header, payload y firma, que el servidor valida sin consultar la base de datos, revisando firma y expiración. Como un JWT es difícil de revocar, se usan access tokens cortos y refresh tokens largos y revocables. OAuth2 es un framework para que una aplicación obtenga acceso limitado a recursos de un usuario sin conocer su contraseña; el flujo recomendado para apps web es Authorization Code con PKCE.

## myths

- Creer que OAuth2 es un protocolo de autenticación. Es de **autorización delegada**; la autenticación encima la agrega OpenID Connect (el id_token).
- Pensar que Base64 es cifrado. Basic y el payload del JWT se decodifican en un segundo.
- Validar el rol solo en el frontend. Ocultar un botón no protege el endpoint.
