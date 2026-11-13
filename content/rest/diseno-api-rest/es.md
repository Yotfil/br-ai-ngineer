---
title: Diseño de una API REST
summary: Diseñar una API REST es modelar el dominio como recursos en plural, con rutas predecibles, filtros, paginación y versionado.
concepts:
  paginacion:
    name: paginación
    aliases:
      - pagination
  paginacion-por-cursor:
    name: paginación por cursor
    aliases:
      - cursor pagination
      - cursor
      - offset
  versionado-de-api:
    name: versionado de API
    aliases:
      - API versioning
exercises:
  - type: verdict
    prompt: "Revisa este diseño: ¿cada endpoint está bien o tiene un error?"
    items:
      - statement: GET /v1/clientes/7
        ok: true
        why: "Correcto: recurso en plural y un id."
      - statement: POST /v1/crearPedido
        ok: false
        why: Verbo en la URL. Debería ser POST /v1/pedidos.
      - statement: GET /v1/productos?categoria=cafe
        ok: true
        why: "Correcto: filtro en la query string."
      - statement: GET /v1/pedidos/1093/eliminar
        ok: false
        why: GET con efecto y verbo en la ruta. Debería ser DELETE /v1/pedidos/1093.
      - statement: PATCH /v1/clientes/7
        ok: true
        why: "Correcto: modificación parcial."
      - statement: GET /v1/cliente/7/pedido
        ok: false
        why: Mezcla singulares y no indica qué pedido. Debería ser /v1/clientes/7/pedidos.
      - statement: POST /v1/pedidos/1093/pagos
        ok: true
        why: "Correcto: crea un pago como sub-recurso del pedido."
      - statement: GET /v1/pedidos?page=999999
        ok: false
        why: Técnicamente válido, pero con offset a esa profundidad la consulta es costosa. En tablas grandes, cursor.
---

## definition

Diseñar una API REST es modelar el dominio como **recursos** (sustantivos en plural), con rutas predecibles, relaciones expresadas con anidamiento moderado, filtros y orden en la query string, paginación para colecciones y una estrategia de versionado desde el primer día.

## analogy

El sistema de señalización de un aeropuerto: nombres consistentes («Puertas A1–A20»), jerarquía clara («Terminal 2 → Puerta B5»), sin señales que digan «Camine-hacia-el-avión-ahora». Si cada terminal usara convenciones distintas, nadie llegaría a su vuelo.

## problem

Una API mal diseñada es difícil de aprender, de documentar y de evolucionar sin romper clientes. **Paginación por offset** (`?page=3`) es simple y permite saltar a una página, pero se vuelve lenta con tablas grandes y repite o salta elementos cuando se insertan datos. **Paginación por cursor** es estable y rápida, pero no permite saltar a la página 50. **Versionado** en la URL (`/v1`) es el más común y visible; por header es más «puro» pero menos práctico.

## code:wire

```http
GET    /v1/clientes                         listar
POST   /v1/clientes                         crear
GET    /v1/clientes/7                       obtener uno
GET    /v1/clientes/7/pedidos               pedidos de un cliente (anidado, 1 nivel)
GET    /v1/pedidos/1093                     acceso directo al pedido
GET    /v1/productos?categoria=cafe&precio_max=40000&orden=-precio&limit=20
GET    /v1/productos?limit=20&cursor=eyJpZCI6NDJ9
POST   /v1/pedidos/1093/cancelacion         acción como sub-recurso

HTTP/1.1 200 OK
{"data":[...],"next_cursor":"eyJpZCI6NjJ9","has_more":true}
```

## code:server

```python
from typing import Literal
from fastapi import Query

@app.get("/v1/productos")
def listar(categoria: str | None = None,
           precio_max: int | None = Query(default=None, gt=0),
           orden: Literal["precio", "-precio", "nombre"] = "nombre",
           limit: int = Query(default=20, le=100),
           cursor: str | None = None):
    ...

@app.get("/v1/clientes/{cliente_id}/pedidos")
def pedidos_de_cliente(cliente_id: int, estado: str | None = None): ...
```

## bad

```http
GET  /v1/getAllCustomers
POST /v1/cliente/crear
GET  /v1/clientes/7/pedidos/1093/items/3/producto/42   ← anidamiento excesivo
GET  /v1/productos            ← devuelve 80.000 registros sin paginar
```

## good

```http
GET  /v1/clientes
POST /v1/clientes
GET  /v1/pedidos/1093/items
GET  /v1/productos?limit=20&cursor=...
```

## bridge:typescript

Una tabla paginada funciona con offset porque necesita saltar entre páginas y mostrar el total. Un scroll infinito, en cambio, encaja con cursor. Cuando diseñes la API para tu propio frontend, elige la paginación según la UI.

## interview

Modelo el dominio como recursos con sustantivos en plural, por ejemplo /clientes, /pedidos y /productos, y dejo que el método HTTP exprese la acción. Uso anidamiento de un nivel para relaciones de pertenencia, como /clientes/7/pedidos, y acceso directo para todo lo demás. Filtros, ordenamiento y paginación van en la query string. Para paginar elijo offset cuando la UI necesita saltar entre páginas y la tabla es moderada, y cursor cuando hay mucho volumen o datos que cambian, porque es estable y eficiente. Versiono desde el inicio, normalmente en la URL como /v1, y solo subo de versión ante cambios incompatibles. Las acciones que no son CRUD las modelo como sub-recursos, por ejemplo POST /pedidos/1093/cancelacion.

## myths

- Mezclar singular y plural (`/cliente/7` y `/pedidos`). La convención es plural siempre.
- Creer que toda relación debe ir anidada. Más de un nivel suele indicar que el recurso merece ruta propia.
- Romper contratos sin versionar: renombrar un campo es un cambio incompatible.
