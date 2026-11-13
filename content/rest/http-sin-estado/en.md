---
title: "HTTP keeps no state: cookies, sessions and tokens"
summary: "HTTP is stateless: each request is independent and the server does not remember the previous one."
concepts:
  stateless:
    name: stateless
    aliases:
      - sin estado (stateless)
  cookie:
    name: cookie
    aliases: []
  sesion:
    name: session
    aliases:
      - sesión
---

## definition

HTTP is **stateless**: each request is independent and the server does not remember the previous one. To "remember" the user, each request must carry proof of identity: a cookie with a session id (the state lives on the server) or a self-contained token (the state travels with the client).

## analogy

**Session**: a theater cloakroom. They give you a ticket with number 47; the coat stays inside, and the attendant finds it with your ticket. **Token**: a festival wristband that says "VIP, valid until Sunday", signed by the organizer. The guard does not check any list: they verify the signature and let you in.

## problem

The protocol keeping no state allows horizontal scaling: any instance can serve any request. But if you keep sessions in the memory of one instance, the user "loses the session" when the load balancer sends them to another. Sessions need a shared store (Redis); tokens do not, but they are hard to revoke before they expire.

## code:wire

```http
# Sesión con cookie
POST /v1/login            → HTTP/1.1 200 OK
                            Set-Cookie: sid=a8f3c2; HttpOnly; Secure; SameSite=Lax
GET /v1/pedidos
Cookie: sid=a8f3c2        → el servidor busca "a8f3c2" en Redis → usuario 7

# Token (JWT)
POST /v1/login            → {"access_token":"eyJhbGc...","token_type":"bearer"}
GET /v1/pedidos
Authorization: Bearer eyJhbGc...   → el servidor verifica la firma; no consulta nada
```

## code:server

```python
from fastapi import Cookie, Depends
from fastapi.security import OAuth2PasswordBearer

# Sesión: el id viaja en la cookie, el estado vive en un almacén
def usuario_por_sesion(sid: str | None = Cookie(default=None)):
    if not sid or sid not in sesiones:   # sesiones = Redis, BD...
        raise HTTPException(401)
    return sesiones[sid]

# Token: el estado viaja firmado en el propio token
oauth2 = OAuth2PasswordBearer(tokenUrl="/v1/login")
def usuario_por_token(token: str = Depends(oauth2)):
    return verificar_jwt(token)
```

## bad

```http
# Sesiones en memoria de cada proceso
sesiones = {}   # instancia A sabe del usuario; instancia B no → 401 aleatorios
```

## good

```http
# Almacén compartido (Redis) o tokens firmados verificables por cualquier instancia
```

## bridge:typescript

Your own function that wraps `fetch` and adds `Authorization: Bearer` to every request exists precisely because HTTP has no memory. With cookies you do not need that function: the browser attaches them on its own, which is why you need `credentials: "include"` when the API is on another domain.

## interview

HTTP is stateless: the server does not associate a request with the previous one. To keep a session there are two approaches: server-side sessions, where the client keeps only an id in a cookie and the server stores the data in a store like Redis, which makes revocation easy but requires shared storage; or self-contained tokens like JWT, where the server only verifies the signature, which scales very well but makes revoking before expiration hard. Cookies are the transport mechanism the browser sends automatically; tokens usually travel in the Authorization header.

## myths

- Thinking "stateless" means the application has no state. The database has state; what does not exist is conversation state between requests in the protocol.
- Believing cookies and tokens are mutually exclusive. You can store a JWT inside an HttpOnly cookie.
- Believing a JWT is encrypted. By default it is only signed: anyone can read the payload.
