---
title: HTTPS and TLS
summary: HTTPS is HTTP inside a TLS channel.
concepts:
  tls:
    name: TLS
    aliases:
      - HTTPS
      - SSL
  certificado:
    name: certificate
    aliases:
      - certificado
---

## definition

HTTPS is HTTP inside a TLS channel. TLS guarantees **confidentiality** (nobody reads the traffic), **integrity** (nobody modifies it unnoticed) and **server authenticity** (the certificate proves you are talking to the real domain).

## analogy

A safe with a padlock. The server sends an **open padlock** that only it can close and open, together with a **notarized certificate** (signed by a certificate authority) that says "this padlock belongs to api.tienda.co". You use that padlock to send a shared key securely, and from then on both use that key, which is much faster.

## problem

Without TLS, anyone on the café Wi-Fi can read tokens, passwords and cookies, or inject content into the response. With HTTPS, the full URL (path and query) is also encrypted; what does remain visible is the domain (through DNS and SNI) and the IP.

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

The browser padlock and the `NET::ERR_CERT_DATE_INVALID` error are the certificate validation. That is why the self-signed certificate of the development server shows warnings: no trusted authority backs it. A cookie with `Secure` is only sent over HTTPS.

## interview

HTTPS is HTTP over TLS. In the handshake, client and server agree on the version and algorithms; the server presents a certificate signed by a certificate authority that the client validates against its trusted roots, and with a Diffie-Hellman-style key exchange they derive a symmetric session key. From then on all traffic travels encrypted and with integrity. It protects against eavesdropping and tampering on the network, and authenticates the server; it does not protect against application vulnerabilities. In production it is usually terminated at the load balancer or the CDN, and it is complemented with HSTS.

## myths

- Believing HTTPS hides which site you visit. The domain stays visible.
- Thinking HTTPS makes the API secure. It protects the transport; it does not validate input or permissions.
- Believing TLS uses only asymmetric encryption. The asymmetric part is for key exchange and authentication; data travels with symmetric encryption, which is faster.
