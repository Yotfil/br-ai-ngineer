---
title: HTTPS y TLS
summary: HTTPS es HTTP dentro de un canal TLS.
concepts:
  tls:
    name: TLS
    aliases:
      - HTTPS
      - SSL
  certificado:
    name: certificado
    aliases:
      - certificate
---

## definition

HTTPS es HTTP dentro de un canal TLS. TLS garantiza **confidencialidad** (nadie lee el tráfico), **integridad** (nadie lo modifica sin que se note) y **autenticidad del servidor** (el certificado prueba que hablas con el dominio real).

## analogy

Una caja fuerte con candado. El servidor manda un **candado abierto** que solo él puede cerrar y abrir, junto con un **certificado notariado** (firmado por una autoridad certificadora) que dice «este candado es de api.tienda.co». Tú usas ese candado para enviar de forma segura una llave compartida, y desde ahí ambos usan esa llave, que es mucho más rápida.

## problem

Sin TLS, cualquiera en el Wi-Fi del café puede leer tokens, contraseñas y cookies, o inyectar contenido en la respuesta. Con HTTPS, la URL completa (ruta y query) también va cifrada; lo que sí queda visible es el dominio (por DNS y SNI) y la IP.

## code:wire

```http
# TLS 1.3 (alto nivel, 1 ida y vuelta)
Cliente → ClientHello: versiones, cifrados, clave efímera, SNI=api.tienda.co
Servidor → ServerHello: cifrado elegido, su clave efímera
           Certificate: api.tienda.co, emitido por Let's Encrypt R11
           CertificateVerify + Finished
Cliente: valida la cadena del certificado → deriva claves simétricas → Finished
# A partir de aquí viaja HTTP cifrado:
GET /v1/pagos/501 HTTP/1.1 ...
```

## code:server

```python
# Normalmente TLS NO se configura en FastAPI: lo termina el balanceador,
# Nginx o el CDN, y tu app recibe HTTP plano en la red interna.
# Si necesitas forzar HTTPS en la app:
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
app.add_middleware(HTTPSRedirectMiddleware)
# y en la respuesta, que el navegador recuerde usar siempre HTTPS:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## bridge:typescript

El candado del navegador y el error `NET::ERR_CERT_DATE_INVALID` son la validación del certificado. Por eso el certificado autofirmado del servidor de desarrollo muestra advertencias: ninguna autoridad de confianza lo respalda. La cookie con `Secure` solo se envía por HTTPS.

## interview

HTTPS es HTTP sobre TLS. En el handshake, el cliente y el servidor acuerdan la versión y los algoritmos; el servidor presenta un certificado firmado por una autoridad certificadora que el cliente valida contra sus raíces de confianza, y con un intercambio de claves tipo Diffie-Hellman derivan una clave simétrica de sesión. A partir de ahí todo el tráfico viaja cifrado y con integridad. Protege contra espionaje y manipulación en la red, y autentica al servidor; no protege contra vulnerabilidades de la aplicación. En producción suele terminarse en el balanceador o el CDN, y se complementa con HSTS.

## myths

- Creer que HTTPS oculta qué sitio visitas. El dominio queda visible.
- Pensar que HTTPS hace segura la API. Protege el transporte; no valida entradas ni permisos.
- Creer que TLS usa solo cifrado asimétrico. Lo asimétrico sirve para el intercambio de claves y la autenticación; los datos viajan con cifrado simétrico, que es más rápido.
