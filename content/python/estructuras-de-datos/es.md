---
title: "Estructuras de datos: list, tuple, dict y set"
short: list, tuple, dict, set
summary: "list, tuple, dict y set: cuándo usar cada una según orden, mutabilidad, búsqueda por clave y elementos únicos."
concepts:
  list:
    name: list
    aliases: []
  tuple:
    name: tuple
    aliases: []
  dict:
    name: dict
    aliases: []
  set:
    name: set
    aliases: []
exercises:
  - type: classify
    prompt: Clasifica cada caso con la estructura más adecuada.
    categories:
      - list
      - tuple
      - dict
      - set
    items:
      - text: Historial de estados de un pedido, en orden
        category: list
        why: "Orden y crecimiento: list."
      - text: Precio de cada producto por su código SKU
        category: dict
        why: Búsqueda por clave.
      - text: Emails únicos que ya recibieron la promo
        category: set
        why: Pertenencia rápida y sin duplicados.
      - text: Latitud y longitud de una tienda
        category: tuple
        why: Dato fijo de dos valores.
  - type: choice
    prompt: ¿Qué imprime este código?
    items:
      - q: ¿Qué imprime?
        code: |-
          d = {"a": 1}
          print(d.get("b"), len({1, 1, 2}))
        options:
          - KeyError
          - None 3
          - None 2
          - 0 2
        answer: 2
        why: "`.get()` devuelve `None` si falta la clave, y el set `{1, 1, 2}` queda con dos elementos."
---

## definition

**list**: secuencia ordenada y mutable. **tuple**: secuencia ordenada e inmutable (hashable si su contenido lo es). **dict**: clave → valor, conserva el orden de inserción y busca en O(1). **set**: elementos únicos sin orden, pertenencia en O(1).

## analogy

list es la fila de pedidos en la barra; tuple, las coordenadas impresas en el recibo (no se reescriben); dict, el fichero de clientes por cédula; set, la lista de invitados donde nadie aparece dos veces.

## problem

Buscar con `in` en una lista recorre todo (O(n)); en un set o dict es casi instantáneo. Usar list para datos que no deben cambiar invita a modificarlos por error.

## code:example

```python
carrito = ["cafe", "taza", "cafe"]          # list: orden y duplicados
ubicacion = (4.4389, -75.2322)               # tuple: inmutable
stock = {"cafe": 12, "taza": 3}              # dict
categorias = {"bebidas", "accesorios"}       # set

stock.get("filtro", 0)     # 0, sin KeyError
"cafe" in stock            # True en O(1)
set(carrito)               # {'cafe', 'taza'}
precio, cantidad = (25_000, 2)   # desempaquetado de tupla
```

## bad

```python
ids_vip = [ ... 100_000 ids ... ]
for pedido in pedidos:
    if pedido.cliente_id in ids_vip:   # O(n) cada vez
        aplicar_descuento(pedido)
```

Con 10.000 pedidos son hasta mil millones de comparaciones.

## good

```python
ids_vip = set(lista_ids)
for pedido in pedidos:
    if pedido.cliente_id in ids_vip:   # O(1)
        aplicar_descuento(pedido)
```

Mismo código, otra estructura, órdenes de magnitud más rápido.

## bridge:typescript

**list** ≈ Array. **dict** ≈ objeto literal o `Map`, pero las claves deben ser hashables (no puedes usar una lista como clave). **set** ≈ `Set`. **tuple** ≈ una tupla `readonly` de TS, solo que la inmutabilidad existe de verdad en ejecución.

## interview

Uso lista cuando necesito una colección ordenada que va a cambiar, tupla cuando el dato es fijo, como un registro o una coordenada, y además puede ser clave de un diccionario. Diccionario para buscar por clave en tiempo constante y set cuando me importa la pertenencia o eliminar duplicados. La elección afecta el rendimiento: buscar en lista es O(n) y en set o dict es O(1) promedio.

## myths

- `stock["filtro"]` lanza `KeyError`; en JS darías con `undefined`. Usa `.get()` cuando la clave puede faltar.
- `(1)` es el número 1; la tupla de un elemento es `(1,)`.
- Se usa `len(x)`, no `x.length`.
- `{}` crea un dict vacío, no un set. El set vacío es `set()`.
