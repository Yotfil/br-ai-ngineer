---
title: Anatomía de una URL
summary: "Una URL identifica un recurso y dónde encontrarlo: esquema, host, puerto, ruta, query y fragmento."
concepts:
  query-string:
    name: query string
    aliases: []
  parametro-de-ruta:
    name: parámetro de ruta
    aliases:
      - path parameter
  fragmento:
    name: fragmento
    aliases:
      - fragment
---

## definition

Una URL identifica un recurso y dónde encontrarlo: `esquema://host:puerto/ruta?query#fragmento`. El fragmento nunca viaja al servidor; todo lo demás sí.

## analogy

Una dirección postal completa: el **esquema** es el medio de envío (correo normal o certificado), el **host** es el edificio, el **puerto** la ventanilla, la **ruta** el apartamento, la **query** las instrucciones extra («entregar solo en la mañana») y el **fragmento** una nota que tú usas al llegar, pero que el cartero nunca lee.

## problem

Saber qué parte usar define el diseño de tu API: la **ruta** identifica el recurso (`/productos/42`) y la **query** lo filtra o modifica la vista (`?categoria=cafe`). Si mezclas los papeles terminas con rutas como `/productos/categoria/cafe/orden/precio`, imposibles de combinar.

## code:wire

```http
URL: https://api.tienda.co:443/v1/productos?categoria=cafe&orden=-precio#reseñas

# Lo que realmente viaja por la red:
GET /v1/productos?categoria=cafe&orden=-precio HTTP/1.1
Host: api.tienda.co
# El "#reseñas" nunca sale del navegador.
```

## code:server

```python
@app.get("/v1/productos")
def listar_productos(categoria: str | None = None,   # query param opcional
                     orden: str = "nombre"):          # query param con default
    ...

@app.get("/v1/productos/{producto_id}")              # path param
def obtener_producto(producto_id: int): ...
```

## bad

```http
GET /v1/productos/buscar/cafe/barato
GET /v1/getProductoById?id=42
```

## good

```http
GET /v1/productos?categoria=cafe&precio_max=40000
GET /v1/productos/42
```

## bridge:typescript

El fragmento es justo lo que usaban los routers de SPA en modo hash (`/#/pedidos`): como el servidor nunca lo ve, siempre servía el mismo `index.html`. Con rutas normales (el router de una SPA) el servidor sí recibe `/pedidos`, y por eso hay que configurarlo para que devuelva el `index.html` en cualquier ruta.

## interview

Una URL tiene esquema, que indica el protocolo; host, que es el dominio; puerto, que si se omite es 80 para HTTP o 443 para HTTPS; ruta, que identifica el recurso; query string, con parámetros clave-valor para filtrar o paginar; y fragmento, que solo usa el navegador y nunca se envía al servidor. En diseño REST, la ruta identifica el recurso y la query modifica la vista de la colección.

## myths

- Poner datos sensibles en la query string: quedan en logs del servidor, del proxy y en el historial del navegador, aunque uses HTTPS.
- Creer que el fragmento llega al backend.
- Olvidar codificar caracteres especiales: un espacio viaja como `%20` y la ñ como `%C3%B1`.
