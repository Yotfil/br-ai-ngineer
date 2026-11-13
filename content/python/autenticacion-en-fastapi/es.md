---
title: "Autenticación en FastAPI: OAuth2, JWT y hashing de contraseñas"
short: "Auth: OAuth2 y hashing"
summary: "Autenticación: quién eres."
concepts:
  hashing-de-contrasenas:
    name: hashing de contraseñas
    aliases:
      - password hashing
      - Argon2
      - pwdlib
      - hash
  oauth2-password-flow:
    name: flujo de contraseña de OAuth2
    aliases:
      - OAuth2 password flow
      - OAuth2PasswordBearer
exercises:
  - type: choice
    prompt: ¿Qué código de estado devuelve?
    items:
      - q: Alguien cambia un carácter del payload del JWT y lo envía.
        options:
          - "200"
          - "401"
          - "403"
          - "422"
        answer: 1
        why: "La firma ya no coincide: `InvalidSignatureError` → 401."
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: ¿El payload de un JWT es secreto?
        options:
          - Sí, está cifrado
          - No, está codificado en base64url y cualquiera lo lee; la firma solo garantiza que no se alteró
          - Solo si usas HS256
          - Solo en HTTPS
        answer: 1
        why: Firmar no es cifrar. No pongas datos sensibles en el payload.
---

## definition

**Autenticación**: quién eres. **Autorización**: qué puedes hacer. El flujo de la documentación de FastAPI: `POST /token` con usuario y contraseña (OAuth2 password flow) → JWT firmado → el cliente lo envía en `Authorization: Bearer` → una dependencia lo verifica en cada petición. Las contraseñas se guardan como hash con **Argon2** usando **pwdlib**, y los JWT se firman con **PyJWT**.

## analogy

El JWT es la manilla de un concierto: te la ponen en la entrada tras revisar tu boleta; adentro nadie vuelve a la taquilla, solo verifican que la manilla sea auténtica y no esté vencida. Pero cualquiera puede leer lo que dice la manilla.

## problem

Guardar contraseñas en texto plano o con un hash rápido (MD5, SHA-256 sin sal) permite recuperarlas si se filtra la base. Poner datos sensibles en el JWT los expone: el payload solo está codificado en base64, no cifrado.

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

Contraseña sin hash, datos sensibles en el payload y una clave débil en el código.

## good

```python
cliente.hashed_password = password_hash.hash(form.password)
token = jwt.encode({"sub": email, "exp": expira}, settings.secret_key,
                   algorithm="HS256")
```

Argon2, payload mínimo con expiración y clave desde configuración (openssl rand -hex 32).

## bridge:typescript

En el frontend guardabas el token y una función que envuelve `fetch` añadía `Authorization: Bearer`; ahora estás del otro lado. Las **rutas protegidas** del frontend se parecen a dependencias como `requiere_admin`, con una diferencia de fondo: la protección del frontend es experiencia de usuario; la dependencia del backend es la seguridad real.

## interview

Autenticación es verificar identidad y autorización es verificar permisos. En FastAPI expongo un endpoint de token con el flujo password de OAuth2: verifico la contraseña contra un hash Argon2 y emito un JWT firmado con expiración corta y el identificador en sub. Una dependencia lee el Bearer token, lo decodifica con la clave y algoritmo esperados, carga el usuario y responde 401 si algo falla. Encima pongo dependencias de autorización que responden 403. El payload del JWT es legible, así que no lleva datos sensibles.

## myths

- Confundir 401 (token ausente o inválido) con 403 (token válido, sin permiso).
- Creer que el payload es secreto.
- Tokens sin expiración o imposibles de revocar: usa vida corta y refresh tokens.
- `OAuth2PasswordRequestForm` espera form-data, no JSON (necesita python-multipart, incluido en `fastapi[standard]`).
