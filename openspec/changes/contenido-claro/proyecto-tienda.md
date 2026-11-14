# El proyecto de ejemplo: la API de la tienda

> Vinculante. Todo el código de ejemplo del contenido usa este proyecto. Si un tema necesita algo que aquí no está (una entidad, un campo, un archivo, una ruta), no se inventa: es una pregunta para Fable 5.2.

Parte de lo que el contenido ya usaba: el árbol `tienda-api/` del tema `estructura-del-proyecto` y las rutas `/v1/...` de la pista HTTP y REST.

## Qué es

Una API REST de una tienda en línea, hecha con FastAPI y SQLModel sobre PostgreSQL. Los clientes consultan productos, crean pedidos y los pagan.

## Entidades

| Entidad | Campos | Notas |
|---|---|---|
| `Producto` | `id`, `nombre`, `precio`, `stock` | `precio` es un entero en pesos, sin decimales (por ejemplo `38000`) |
| `Cliente` | `id`, `nombre`, `email`, `password_hash` | |
| `Pedido` | `id`, `cliente_id`, `estado`, `creado_en` | `estado`: `pendiente`, `pagado`, `enviado` o `cancelado` |
| `LineaPedido` | `pedido_id`, `producto_id`, `cantidad`, `precio_unitario` | el precio se copia del producto al crear el pedido |
| `Pago` | `id`, `pedido_id`, `monto`, `estado` | `estado`: `aprobado` o `rechazado` |

Modelos de entrada y salida, cuando hagan falta: `PedidoCrear`, `LineaCrear`, `PedidoPublico`, `ProductoPublico`, `ClientePublico`. Son los nombres que el contenido ya usa.

## Rutas

| Método y ruta | Qué hace | Respuesta normal |
|---|---|---|
| `GET /v1/productos` | Lista paginada de productos | 200 |
| `GET /v1/productos/{id}` | Un producto | 200, o 404 |
| `POST /v1/pedidos` | Crea un pedido del cliente autenticado | 201 |
| `GET /v1/pedidos` | Pedidos del cliente autenticado | 200 |
| `GET /v1/pedidos/{id}` | Un pedido suyo | 200, 403 o 404 |
| `DELETE /v1/pedidos/{id}` | Cancela un pedido pendiente | 204 |
| `POST /v1/pagos` | Paga un pedido; admite `Idempotency-Key` | 201 |
| `GET /v1/clientes/me` | Datos del cliente autenticado | 200 |
| `PATCH /v1/clientes/{id}` | Modifica datos del cliente | 200 |
| `POST /v1/login` | Devuelve el token de acceso | 200 |

Los ejemplos de "riesgoso" pueden mostrar rutas mal diseñadas (por ejemplo `POST /v1/crearPedido`): ese es su propósito. Fuera de ahí, las rutas son las de esta tabla.

## Carpetas

```text
tienda-api/
├── pyproject.toml
├── uv.lock
├── .env                    # nunca al repositorio
├── alembic.ini
├── migrations/
├── app/
│   ├── main.py             # crea la app e incluye los routers
│   ├── core/
│   │   ├── config.py       # Settings
│   │   ├── registro.py     # decorador registrar (logs)
│   │   └── security.py     # hash de contraseñas y JWT
│   ├── db.py               # engine y get_session
│   ├── deps.py             # SessionDep, ClienteActual
│   ├── pedidos/
│   │   ├── router.py       # endpoints
│   │   ├── schemas.py      # PedidoCrear, PedidoPublico
│   │   ├── models.py       # Pedido, LineaPedido
│   │   ├── service.py      # reglas de negocio
│   │   └── repository.py   # consultas
│   ├── productos/          # misma forma que pedidos/
│   ├── clientes/
│   └── pagos/
├── scripts/
│   └── importar_catalogo.py
└── tests/
```

## Convenciones de los ejemplos

1. **Nombres en español**, iguales en los dos idiomas: `Pedido`, `crear_pedido`, `precio_unitario`. En inglés solo cambian los comentarios y los textos que el código imprime o devuelve al usuario.
2. **Primero la idea, después el proyecto.** Los primeros pasos de un tema pueden usar código mínimo y aislado (una función `saludar`, una lista de tres números) para mostrar una sola idea. El último paso la muestra dentro de la tienda.
3. **El paso de proyecto dice dónde vive.** Su primer renglón es un comentario con la ruta del archivo (`# app/pedidos/service.py`), y la frase que lo acompaña dice quién llama a ese código o cuándo se ejecuta.
4. **En HTTP y REST**, el proyecto aparece en la conversación por la red (las rutas de la tabla) y en el bloque del servidor, que lleva también el comentario con la ruta del archivo.
5. **Cuándo no hay paso de proyecto.** Si el concepto no tiene un lugar natural en la tienda, el tema no lo fuerza. Hoy solo se prevé en `entornos-y-dependencias` (trata de herramientas, no de código) y en temas de HTTP y REST sin bloque de servidor. Cualquier otro caso se anota en `decisiones.md` con el motivo.
6. **Datos de ejemplo.** Clientes: Ana y Luis. Productos: café (38000), taza (25000), molinillo (120000). Así los resultados son comparables entre temas.
7. **Lo que se da por hecho se dice.** Si un bloque usa `engine`, `repo` o `settings` sin definirlos, un comentario dice de qué archivo salen.
