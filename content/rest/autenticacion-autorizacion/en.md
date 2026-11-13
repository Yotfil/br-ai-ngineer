---
title: Authentication vs. authorization, JWT and OAuth2
summary: Authentication answers "who are you?" (401 if it fails).
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
    prompt: Which status code does this case return?
    items:
      - q: A token with a valid signature but with exp in the past reaches your API.
        options:
          - "200"
          - "401"
          - "403"
          - "419"
        answer: 1
        why: "The token no longer proves identity: 401. The client must use the refresh token."
      - q: A user with role "customer" calls DELETE /v1/productos/42, which requires the admin role.
        options:
          - "401"
          - "403"
          - "404"
          - "405"
        answer: 1
        why: "They are authenticated, but not authorized: 403."
---

## definition

**Authentication** answers "who are you?" (401 if it fails). **Authorization** answers "may you do this?" (403 if it fails). The most common mechanisms are Basic, API keys, cookie sessions, JWT with refresh tokens and OAuth2 to delegate access.

## analogy

At a hotel, the front desk checks your ID and gives you a key card (**authentication**). The card opens your room and the gym, but not the presidential suite (**authorization**). The card stops working on checkout day (**expiration**). **OAuth2** is giving the laundry service a limited card that only opens your closet, without handing over yours.

## problem

A JWT has three parts: the **header** (algorithm), the **payload** (claims such as `sub`, `role`, `exp`) and the **signature**, which guarantees nobody modified the first two. Since it cannot be revoked easily, the access token is short-lived (5–15 min) and a long-lived **refresh token**, stored securely and revocable on the server, is used to request a new one.

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

Your own function that wraps `fetch` and, on a 401, calls `/refresh` and retries the original request is the client half of the refresh token flow. On the server side, that 401 appears when `jwt.decode` detects that `exp` has already passed. And when you log in with Google in an app, the backend is acting as an OAuth2 client.

## interview

Authentication is verifying identity, and if it fails a 401 applies; authorization is deciding whether that identity may perform an action, and if it fails it is 403. Basic sends username and password in Base64 and is only acceptable over HTTPS; API keys identify applications; sessions keep the state on the server with a cookie; and a JWT is a signed token with header, payload and signature, which the server validates without querying the database, by checking signature and expiration. Since a JWT is hard to revoke, short access tokens and long, revocable refresh tokens are used. OAuth2 is a framework for an application to get limited access to a user’s resources without knowing their password; the recommended flow for web apps is Authorization Code with PKCE.

## myths

- Believing OAuth2 is an authentication protocol. It is for **delegated authorization**; authentication on top is added by OpenID Connect (the id_token).
- Thinking Base64 is encryption. Basic and the JWT payload are decoded in a second.
- Validating the role only in the frontend. Hiding a button does not protect the endpoint.
