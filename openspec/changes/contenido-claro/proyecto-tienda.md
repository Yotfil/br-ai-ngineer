# El proyecto de ejemplo: la API de la tienda

> Vinculante. Todo el código de ejemplo del contenido usa este proyecto. Si un tema necesita algo que aquí no está (una entidad, un campo, un archivo, una ruta), no se inventa: es una pregunta para Fable 5.2.

Parte de lo que el contenido ya usaba: el árbol `tienda-api/` del tema `estructura-del-proyecto` y las rutas `/v1/...` de la pista HTTP y REST.

## Qué es

Una API REST de una tienda en línea, hecha con FastAPI y SQLModel sobre PostgreSQL. Los clientes consultan productos, crean pedidos y los pagan.

Su dominio es `api.tienda.co` (decidido por el usuario el 2026-11-14).

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
| `POST /v1/pedidos` | Crea un pedido del cliente autenticado | 201, con `Location` |
| `GET /v1/pedidos` | Pedidos del cliente autenticado | 200 |
| `GET /v1/pedidos/{id}` | Un pedido suyo | 200, 403 o 404 |
| `DELETE /v1/pedidos/{id}` | Cancela un pedido pendiente | 204 |
| `POST /v1/pagos` | Paga un pedido; admite `Idempotency-Key`. El `monto` es lo que devuelve `calcular_total` | 201 |
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
│   │   └── security.py     # hash de contraseñas, JWT y get_cliente_actual
│   ├── db.py               # engine y get_session
│   ├── deps.py             # SessionDep, ClienteActual
│   ├── pedidos/
│   │   ├── router.py       # endpoints
│   │   ├── schemas.py      # PedidoCrear, PedidoPublico
│   │   ├── models.py       # Pedido, LineaPedido
│   │   ├── service.py      # reglas de negocio: calcular_total, crear_descuento
│   │   └── repository.py   # consultas
│   ├── productos/          # misma forma que pedidos/
│   ├── clientes/           # models.py tiene Cliente
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
8. **La cabecera `Host` solo cuando hace falta** (decidido por el usuario el 2026-11-14). Las peticiones de ejemplo llevan `Host: api.tienda.co` en los temas que explican esa cabecera o la necesitan para lo que cuentan (por ejemplo la anatomía de una petición, la de una URL, CORS o TLS). En los demás se omite, para ahorrar líneas.

## Detalles ya fijados por el contenido publicado

El piloto (grupo 4) fijó estos detalles al escribir sus siete piezas, y el usuario las leyó. Los temas y las entradas de proyecto que vengan después deben coincidir con ellos; cambiarlos es una pregunta para Fable 5.2.

| Detalle | Dónde se ve | Quién debe coincidir |
|---|---|---|
| `calcular_total(lineas: list[LineaPedido]) -> int` vive en `app/pedidos/service.py` y lleva el decorador `registrar`. La llama `POST /v1/pagos` para saber cuánto cobrar (decidido por el usuario el 2026-11-14). El pedido no guarda ningún total. | `decoradores`, paso de proyecto | `proyecto-total-del-pedido` (5.4), `proyecto-pedidos-con-login` (9.4) |
| `crear_descuento(porcentaje)` vive en `app/pedidos/service.py`: el porcentaje es un entero y el descuento se calcula con división entera, porque los precios son enteros en pesos. | `closures-y-lambdas`, paso de proyecto | `proyecto-total-del-pedido` (5.4), que usa esta misma función |
| `GET /v1/productos` está en `app/productos/router.py`, con `pagina: int = 1` y `tamano: int = 20`, y llama a `repository.listar(pagina, tamano)`. | `funciones-y-parametros`, paso de proyecto; `inyeccion-con-depends`, paso 1 | `proyecto-api-completa` (10.4) |
| Cada router se crea sin prefijo, `router = APIRouter()`, y cada decorador lleva la ruta completa (`@router.get("/v1/productos")`). | `funciones-y-parametros`, `cache-http`, `proyecto-crear-pedido` | todos los temas de FastAPI y `estructura-del-proyecto` (10.1) |
| `ClienteActual` responde 401 si el token falta o no vale. La función que lo produce, `get_cliente_actual`, vive en `app/core/security.py`. | `codigos-de-estado`, bloque del servidor; `proyecto-crear-pedido`, parte 2 | `autenticacion-en-fastapi` (9.2), `proyecto-pedidos-con-login` (9.4) |
| El modelo `Pedido` pone `creado_en` él solo al crearse. `PedidoPublico` lleva `id`, `estado` y `creado_en`. | `proyecto-crear-pedido`, partes 1 y 4 | `orm-y-sesiones` (9.1), `proyecto-pedidos-con-login` (9.4) |
| Los endpoints responden sus errores con `HTTPException`, cuyo cuerpo es `{"detail": …}`. El manejador que convierte esos errores al formato Problem Details vive en `app/main.py` y se muestra en `proyecto-api-completa`, que lo presenta como el paso que cambia el formato de los errores vistos hasta entonces (decidido por el usuario el 2026-11-14). | `codigos-de-estado`, `proyecto-crear-pedido`, parte 3 | `errores-y-httpexception` (8.3), `proyecto-api-completa` (10.4), `errores-problem-details` (13.2) |
