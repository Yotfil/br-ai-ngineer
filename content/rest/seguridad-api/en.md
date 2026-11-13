---
title: Basic API security
summary: The basics are mandatory HTTPS, validating input, authenticating and authorizing every endpoint, rate limiting and guarding the token.
concepts:
  almacenamiento-del-token:
    name: token storage
    aliases:
      - dónde guardar el token
  xss:
    name: XSS
    aliases: []
  csrf:
    name: CSRF
    aliases: []
---

## definition

The basics are: mandatory HTTPS, **never trusting input** (validating it and using parameterized queries), authenticating and authorizing on every endpoint, protecting against CSRF when cookies are used, preventing the API from serving content that enables XSS, limiting requests and deciding carefully where the client stores the token.

## analogy

The layered security of a building: fences (**HTTPS**), a doorman who checks your ID on every floor, not just at the entrance (**authorization on every endpoint**), package inspection (**validation**) and not leaving the master keys under the doormat (**token storage**).

## problem

The most common vulnerability in APIs (OWASP API Top 10) is **broken object level authorization**: changing `/pedidos/1093` to `/pedidos/1094` and seeing someone else’s order. It is followed by weak authentication, excessive data exposure and lack of limits.

## code:wire

```http
# Inyección SQL: la entrada nunca se concatena
GET /v1/productos?nombre=café' OR '1'='1

# CSRF: otra página envía una petición a tu API usando las cookies del usuario
<form action="https://api.tienda.co/v1/clientes/me/email" method="POST">
  <input name="email" value="atacante@mal.co">
</form>
# Defensa: SameSite=Lax/Strict + token CSRF + verificar Origin

# Headers defensivos en las respuestas
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'none'
Set-Cookie: refresh=rt_8c1f; HttpOnly; Secure; SameSite=Strict; Path=/v1/auth
```

## code:server

```python
# 1. Validación con Pydantic: tipos, rangos y longitudes
class ClienteIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=80)
    email: EmailStr

# 2. Consultas parametrizadas (SQLAlchemy lo hace por ti)
session.execute(select(Producto).where(Producto.nombre == nombre))   # ✔
session.execute(text(f"SELECT * FROM productos WHERE nombre = '{nombre}'"))  # ✘

# 3. Autorización a nivel de objeto, no solo de ruta
if pedido.cliente_id != usuario.id: raise HTTPException(404)

# 4. No devolver campos sensibles: response_model filtra
@app.get("/v1/clientes/me", response_model=ClienteOut)   # sin password_hash
```

## bad

```http
# Token en localStorage + endpoint que confía en el id del body
localStorage.setItem("token", jwt)       ← cualquier XSS lo roba
PATCH /v1/clientes {"id": 8, "rol": "admin"}   ← mass assignment
```

## good

```http
# Access token corto en memoria + refresh en cookie HttpOnly/Secure/SameSite
# El id del usuario sale del token, nunca del body; response_model y modelos de entrada explícitos
```

## bridge:typescript

Storing the token in `localStorage` is the most common thing in SPAs and it is vulnerable to XSS: any injected script reads it. An `HttpOnly` cookie is not accessible from JavaScript, but it reopens the door to CSRF, which is mitigated with `SameSite` and CSRF tokens. A balanced pattern is the access token in memory (in an API client module) and the refresh token in an HttpOnly cookie. Frontend frameworks escape what they render by default, and that protects you from XSS, except when you insert unescaped HTML (for example with `innerHTML`); on the server side, the defense is validating input and returning JSON with the correct `Content-Type`, never HTML built with user data.

## interview

I start with mandatory HTTPS with HSTS. All input is validated on the server with types, ranges and lengths, and database queries are parameterized to prevent injection. I authenticate on every request and authorize at the object level, verifying that the resource belongs to the user, because it is the most common vulnerability in APIs. I return only the necessary fields with explicit response models, apply rate limiting and do not expose internal errors. If I use cookies to authenticate, I protect against CSRF with SameSite, CSRF tokens and Origin verification. About the token on the client: localStorage is vulnerable to XSS; I prefer a short access token in memory and the refresh token in an HttpOnly, Secure and SameSite cookie.

## myths

- Believing the frontend validates and therefore the backend does not need to. Anyone can call the API with curl.
- Thinking CSRF affects APIs with a Bearer token in a header. It affects them when the credential travels automatically, that is, with cookies.
- Believing HTTPS covers everything. It only protects the transport.
