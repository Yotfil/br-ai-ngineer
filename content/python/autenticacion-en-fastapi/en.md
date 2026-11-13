---
title: "Authentication in FastAPI: OAuth2, JWT and password hashing"
short: "Auth: OAuth2 and hashing"
summary: "Authentication: who you are."
concepts:
  hashing-de-contrasenas:
    name: password hashing
    aliases:
      - hashing de contraseñas
      - Argon2
      - pwdlib
      - hash
  oauth2-password-flow:
    name: OAuth2 password flow
    aliases:
      - flujo de contraseña de OAuth2
      - OAuth2PasswordBearer
exercises:
  - type: choice
    prompt: Which status code does it return?
    items:
      - q: Someone changes one character of the JWT payload and sends it.
        options:
          - "200"
          - "401"
          - "403"
          - "422"
        answer: 1
        why: "The signature no longer matches: `InvalidSignatureError` → 401."
  - type: choice
    prompt: Quick question
    items:
      - q: Is a JWT's payload secret?
        options:
          - Yes, it is encrypted
          - No, it is base64url-encoded and anyone can read it; the signature only guarantees it was not altered
          - Only if you use HS256
          - Only over HTTPS
        answer: 1
        why: Signing is not encrypting. Don't put sensitive data in the payload.
---

## definition

**Authentication**: who you are. **Authorization**: what you can do. The flow from the FastAPI documentation: `POST /token` with username and password (OAuth2 password flow) → signed JWT → the client sends it in `Authorization: Bearer` → a dependency verifies it on every request. Passwords are stored as a hash with **Argon2** using **pwdlib**, and JWTs are signed with **PyJWT**.

## analogy

The JWT is a concert wristband: they put it on you at the entrance after checking your ticket; inside, nobody goes back to the box office, they only check that the wristband is authentic and not expired. But anyone can read what the wristband says.

## problem

Storing passwords in plain text or with a fast hash (MD5, SHA-256 without salt) lets them be recovered if the database leaks. Putting sensitive data in the JWT exposes it: the payload is only base64-encoded, not encrypted.

## code:example

```python
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()          # Argon2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def crear_token(sub: str, minutos: int = 30) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=minutos)
    return jwt.encode({"sub": sub, "exp": expira}, settings.secret_key, algorithm="HS256")

async def get_cliente_actual(
    token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
) -> Cliente:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except InvalidTokenError:          # firma alterada, vencido, mal formado
        raise error
    cliente = buscar_por_email(session, payload.get("sub"))
    if cliente is None:
        raise error
    return cliente

ClienteActual = Annotated[Cliente, Depends(get_cliente_actual)]

def requiere_admin(cliente: ClienteActual) -> Cliente:
    if not cliente.es_admin:
        raise HTTPException(status_code=403, detail="Solo administradores")
    return cliente

@app.post("/token")
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep) -> Token:
    cliente = buscar_por_email(session, form.username)
    if not cliente or not password_hash.verify(form.password, cliente.hashed_password):
        raise HTTPException(401, "Usuario o contraseña incorrectos",
                            headers={"WWW-Authenticate": "Bearer"})
    return Token(access_token=crear_token(cliente.email), token_type="bearer")
```

## bad

```python
cliente.password = form.password                 # texto plano
token = jwt.encode({"sub": email, "password": pwd, "tarjeta": "..."}, "1234")
```

Unhashed password, sensitive data in the payload and a weak key in the code.

## good

```python
cliente.hashed_password = password_hash.hash(form.password)
token = jwt.encode({"sub": email, "exp": expira}, settings.secret_key,
                   algorithm="HS256")
```

Argon2, minimal payload with expiration and key from configuration (openssl rand -hex 32).

## bridge:typescript

On the frontend you stored the token and a function wrapping `fetch` added `Authorization: Bearer`; now you're on the other side. The frontend's **protected routes** resemble dependencies like `requiere_admin`, with a fundamental difference: frontend protection is user experience; the backend dependency is the real security.

## interview

Authentication is verifying identity and authorization is verifying permissions. In FastAPI I expose a token endpoint with the OAuth2 password flow: I verify the password against an Argon2 hash and issue a signed JWT with a short expiration and the identifier in sub. A dependency reads the Bearer token, decodes it with the expected key and algorithm, loads the user and responds 401 if anything fails. On top of that I add authorization dependencies that respond 403. The JWT payload is readable, so it carries no sensitive data.

## myths

- Confusing 401 (missing or invalid token) with 403 (valid token, no permission).
- Believing the payload is secret.
- Tokens without expiration or impossible to revoke: use short lifetimes and refresh tokens.
- `OAuth2PasswordRequestForm` expects form-data, not JSON (it needs python-multipart, included in `fastapi[standard]`).
