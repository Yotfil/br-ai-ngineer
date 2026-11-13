---
title: "HTTP no guarda estado: cookies, sesiones y tokens"
summary: "HTTP es stateless: cada petición es independiente y el servidor no recuerda la anterior."
concepts:
  stateless:
    name: sin estado (stateless)
    aliases:
      - stateless
  cookie:
    name: cookie
    aliases: []
  sesion:
    name: sesión
    aliases:
      - session
---

## definition

HTTP es **stateless**: cada petición es independiente y el servidor no recuerda la anterior. Para «recordar» al usuario, cada petición debe llevar una prueba de identidad: una cookie con un id de sesión (el estado vive en el servidor) o un token autocontenido (el estado viaja con el cliente).

## analogy

**Sesión**: el guardarropa de un teatro. Te dan una ficha con el número 47; el abrigo queda adentro, y el empleado lo busca con tu ficha. **Token**: una pulsera de festival que dice «VIP, válida hasta el domingo», firmada por el organizador. El guardia no consulta ninguna lista: verifica la firma y te deja pasar.

## problem

Que el protocolo no guarde estado permite escalar horizontalmente: cualquier instancia puede atender cualquier petición. Pero si guardas sesiones en la memoria de una instancia, el usuario «pierde la sesión» cuando el balanceador lo envía a otra. Las sesiones necesitan un almacén compartido (Redis); los tokens no, pero son difíciles de revocar antes de que expiren.

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

Tu función propia que envuelve `fetch` y agrega `Authorization: Bearer` a cada petición existe justamente porque HTTP no tiene memoria. Con cookies no necesitas esa función: el navegador las adjunta solo, y por eso necesitas `credentials: "include"` cuando la API está en otro dominio.

## interview

HTTP es sin estado: el servidor no asocia una petición con la anterior. Para mantener una sesión hay dos enfoques: sesiones del lado del servidor, donde el cliente guarda solo un id en una cookie y el servidor guarda los datos en un almacén como Redis, lo que facilita revocar pero exige almacenamiento compartido; o tokens autocontenidos como JWT, donde el servidor solo verifica la firma, lo que escala muy bien pero complica revocar antes de la expiración. Las cookies son el mecanismo de transporte que el navegador envía automáticamente; los tokens normalmente viajan en el header Authorization.

## myths

- Pensar que «stateless» significa que la aplicación no tiene estado. La base de datos tiene estado; lo que no hay es estado de conversación entre peticiones en el protocolo.
- Creer que cookies y tokens se excluyen. Puedes guardar un JWT dentro de una cookie HttpOnly.
- Creer que un JWT está cifrado. Por defecto solo está firmado: cualquiera puede leer el payload.
