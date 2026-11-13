---
title: Seguridad básica de una API
summary: Las bases son HTTPS obligatorio, validar la entrada, autenticar y autorizar en cada endpoint, limitar peticiones y cuidar el token.
concepts:
  almacenamiento-del-token:
    name: dónde guardar el token
    aliases:
      - token storage
  xss:
    name: XSS
    aliases: []
  csrf:
    name: CSRF
    aliases: []
---

## definition

Las bases son: HTTPS obligatorio, **nunca confiar en la entrada** (validarla y usar consultas parametrizadas), autenticar y autorizar en cada endpoint, protegerse de CSRF cuando se usan cookies, evitar que la API sirva contenido que permita XSS, limitar peticiones y decidir con cuidado dónde guarda el cliente el token.

## analogy

La seguridad de un edificio por capas: rejas (**HTTPS**), portero que revisa el carné en cada piso, no solo en la entrada (**autorización en cada endpoint**), revisión de paquetes (**validación**) y no dejar las llaves maestras debajo del tapete (**almacenamiento de tokens**).

## problem

La vulnerabilidad más común en APIs (OWASP API Top 10) es la **autorización rota a nivel de objeto**: cambiar `/pedidos/1093` por `/pedidos/1094` y ver el pedido de otro. Le siguen la autenticación débil, la exposición excesiva de datos y la falta de límites.

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

Guardar el token en `localStorage` es lo más común en SPAs y es vulnerable a XSS: cualquier script inyectado lo lee. Una cookie `HttpOnly` no es accesible desde JavaScript, pero reabre la puerta a CSRF, que se mitiga con `SameSite` y tokens CSRF. Un patrón equilibrado es el access token en memoria (en un módulo cliente de la API) y el refresh token en cookie HttpOnly. Los frameworks de frontend escapan por defecto lo que renderizan y eso te protege del XSS, salvo cuando insertas HTML sin escapar (por ejemplo con `innerHTML`); del lado del servidor, la defensa es validar entradas y devolver JSON con el `Content-Type` correcto, nunca HTML armado con datos del usuario.

## interview

Empiezo por HTTPS obligatorio con HSTS. Toda entrada se valida en el servidor con tipos, rangos y longitudes, y las consultas a la base de datos son parametrizadas para evitar inyección. Autentico en cada petición y autorizo a nivel de objeto, verificando que el recurso pertenece al usuario, porque es la vulnerabilidad más común en APIs. Devuelvo solo los campos necesarios con modelos de respuesta explícitos, aplico rate limiting y no expongo errores internos. Si uso cookies para autenticar, me protejo de CSRF con SameSite, tokens CSRF y verificación de Origin. Sobre el token en el cliente: localStorage es vulnerable a XSS; prefiero un access token corto en memoria y el refresh token en una cookie HttpOnly, Secure y SameSite.

## myths

- Creer que el frontend valida y por eso el backend no necesita hacerlo. Cualquiera llama la API con curl.
- Pensar que CSRF afecta a APIs con Bearer token en header. Afecta cuando la credencial viaja automáticamente, es decir, con cookies.
- Creer que HTTPS cubre todo. Solo protege el transporte.
