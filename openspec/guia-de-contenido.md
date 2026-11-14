# Guía de redacción del contenido

Cómo se escribe cada tema de la app para que se entienda. Incluye las reglas, cuatro temas modelo completos y una lista de comprobación. Quien redacte o reescriba un tema (Opus o Sonnet) trabaja contra este documento.

## Estado

- **Acordado con el usuario el 2026-11-13:** el nivel de explicación (casi como para un junior), las seis reglas, el ejemplo de Decoradores como referencia de tono, el proyecto de ejemplo único y todas las decisiones de la sección [Decisiones tomadas](#decisiones-tomadas).
- **Se aplica mediante el cambio de OpenSpec `contenido-claro`** (`openspec/changes/contenido-claro/`), que cambia el formato, reescribe los temas de HTTP y REST y de Python y FastAPI, y añade las entradas de proyecto.
- **Esta guía no autoriza por sí sola a reescribir `content/`.** Se reescribe siguiendo las tareas de ese cambio, o de los cambios de las pistas siguientes.
- Solo Fable 5.2 modifica esta guía, con el usuario.

## Para quién se escribe

Para alguien que programa, pero que ve este tema por primera vez o lo olvidó. El usuario lo dijo así: "las explicaciones deben ser casi como si fueran para un junior". También dijo qué no quiere: textos extensos que aburran.

El lector debe poder entender el tema leyendo de arriba abajo una sola vez, sin buscar ninguna palabra fuera de la app y sin ejecutar el código en la cabeza.

## Qué fallaba en el contenido migrado

El contenido de las guías originales es una chuleta: recuerda las cosas a quien ya las sabe. Estos son los fallos concretos, con el tema donde se ven:

| Fallo | Dónde se ve |
|---|---|
| Usa palabras que nunca explica | `decoradores`: "azúcar sintáctico", "wrapper", "firma", "función de orden superior" |
| Junta varias ideas en un solo bloque de código | `funciones-y-closures`: `*args`, lambda y closure en 15 líneas |
| El código no muestra qué imprime | casi todos los `code:example` |
| Los comentarios dicen qué falta, no por qué importa | `decoradores`, sección `bad`: `# falta return` |
| Los malentendidos son frases sueltas | `decoradores`: "Olvidar `@functools.wraps`" |
| La analogía no se conecta con el código | `inyeccion-con-depends`: el chef y los ingredientes, sin decir quién es quién |
| La definición lo dice todo en una frase | `inyeccion-con-depends`: árbol, caché por petición y `yield` en dos oraciones |

## Las seis reglas

### 1. Una idea por paso, de la más simple a la real

El ejemplo principal se construye en pasos numerados. Cada paso añade una sola cosa a lo anterior. El primero es tan simple que parece obvio; el último es el código que se escribe de verdad.

- Entre 3 y 5 pasos por concepto.
- Cada paso lleva un título que dice qué se aprende ("La arroba es un atajo para esa asignación"), una o dos frases si hacen falta, y un bloque de código.
- Lo avanzado (por ejemplo, un decorador con argumentos) va al final, marcado como paso avanzado. No se mezcla en el primer ejemplo.

### 2. Cada término se explica la primera vez que aparece

Si una palabra no la usaría alguien que no conoce el tema, se explica en la misma frase, con palabras llanas.

- Mal: "`@deco` es azúcar sintáctico de `f = deco(f)`".
- Bien: "La arroba es un atajo: `@avisar` encima de `def saludar` hace lo mismo que escribir `saludar = avisar(saludar)`".

Los términos que el lector necesita reconocer en una entrevista (wrapper, closure, ETag) se nombran, pero después de haber explicado la idea: primero qué es, luego cómo se llama.

Si el tema depende de un concepto que vive en otro tema, se enlaza con `[[id]]` y se resume en una frase, para que el lector pueda seguir sin salir.

### 3. Código corto, ejecutable y con su salida

- Cada bloque se puede copiar y ejecutar tal cual, salvo que dependa de un servidor o una base de datos. En ese caso un comentario dice qué se da por hecho.
- 15 líneas como máximo por bloque. Si no cabe, es otro paso.
- Lo que imprime o devuelve va debajo, como comentario: `# hola`.
- Los nombres son del mundo real y están en español (`sumar`, `pedido`, `carrito`), no `f`, `x`, `foo`.
- Nada de `...` en lugar del cuerpo de una función si el lector necesita ver qué hace.

### 4. Los comentarios explican el porqué

Un comentario vale si responde a "¿por qué está esta línea?" o "¿qué pasaría sin ella?".

- Mal: `return resultado  # devuelve el resultado`
- Bien: `return resultado  # sin este return, quien llama recibe None`

Cuando el orden de ejecución no es evidente, los comentarios lo numeran (`# 1.`, `# 2.`…).

No se comenta cada línea: solo las que alguien nuevo no entendería.

### 5. Cada malentendido dice qué se cree, qué pasa y por qué

Formato fijo: la creencia entre comillas y en negrita, y después lo que ocurre de verdad, con la consecuencia.

- Mal: "Olvidar `@functools.wraps`."
- Bien: "**"`functools.wraps` es opcional."** Sin él, `sumar.__name__` devuelve `"envoltura"`. FastAPI lee el nombre y los parámetros de tu función para saber qué recibe el endpoint; sin `wraps` deja de verlos."

Tres o cuatro malentendidos por tema. Mejor tres bien explicados que seis en una línea.

### 6. El último paso lo sitúa en un proyecto real

El usuario lo pidió así: "ejemplos de la vida real en un proyecto cuando haga falta, no solo líneas de código suelto que no se entienden sin contexto".

Todo el contenido usa un mismo proyecto de ejemplo: la API de una tienda en línea, con productos, clientes, pedidos y pagos. Sus entidades, rutas, carpetas y datos están en `openspec/changes/contenido-claro/proyecto-tienda.md` (tras el archivado, en la carpeta del cambio archivado).

- Los primeros pasos pueden usar código mínimo y aislado, para mostrar una sola idea.
- El último paso muestra esa idea dentro de la tienda. Su primer renglón es un comentario con la ruta del archivo (`# app/pedidos/service.py`) y la frase que lo acompaña dice quién llama a ese código o cuándo se ejecuta.
- En un tema de HTTP y REST, el proyecto aparece en las rutas de la conversación por la red y en el bloque del servidor.
- Si el concepto no tiene un lugar natural en la tienda, no se fuerza: se omite el paso y se anota el motivo.

Ejemplo, para Decoradores:

```python
# app/pedidos/service.py
from app.core.registro import registrar   # el decorador de los pasos anteriores, con otro nombre

@registrar                                # cada cálculo de total queda en el log, sin tocar la función
def calcular_total(lineas: list[LineaPedido]) -> int:
    return sum(linea.cantidad * linea.precio_unitario for linea in lineas)
```

Esta función la llama el endpoint `POST /v1/pedidos` cada vez que un cliente crea un pedido.

Además, cada cierto número de temas hay una **entrada de proyecto**: una entrada propia en la lista de temas ("Proyecto: …") que muestra una funcionalidad completa de la tienda, parte por parte, y enlaza cada parte al tema donde se estudia. Su formato está en la sección [Entradas de proyecto](#entradas-de-proyecto).

## Cómo se escribe cada sección

| Sección | Qué debe lograr | Extensión |
|---|---|---|
| `definition` | Qué es y para qué sirve, sin jerga. Si hace falta una idea previa, se dice en un segundo párrafo. | 2 a 4 frases |
| `analogy` | Una situación cotidiana. Debe decir entre paréntesis qué parte de la analogía es qué parte del concepto. | 2 a 4 frases |
| `problem` | Qué pasa si no existe o si se usa mal, con un caso concreto. | 2 a 3 frases |
| `code:example` | El paso a paso de la regla 1, que termina con el paso de proyecto de la regla 6. | 3 a 5 pasos, más el de proyecto |
| `code:wire` | La conversación entre cliente y servidor, partida en momentos, cada uno con una frase que dice qué ocurre. | 2 a 4 momentos |
| `code:server` | El código del servidor, que es código de la tienda: empieza con un comentario con la ruta del archivo y lleva comentarios numerados que siguen el orden de ejecución. | 1 bloque |
| `bad` y `good` | El mismo código dos veces. La nota de `bad` dice qué sale mal y cuándo se nota; la de `good`, qué cambió. | 1 a 2 frases por nota |
| `bridge:typescript` | Una comparación con algo que el lector ya usa en TypeScript, y la diferencia que más confunde. | 2 a 4 frases |
| `interview` | Respuesta para decir en voz alta. Puede ser densa, pero solo con términos que el tema ya explicó. | 3 a 5 frases |
| `myths` | La regla 5. | 3 o 4 |

Además:

- Frases cortas. Una idea por frase.
- Se habla de tú al lector.
- Los ejercicios (`exercises`) no cambian de formato, pero su `why` sigue la regla 4: explica por qué, no repite la respuesta.

### Cómo se escriben los pasos en el archivo

Un paso es un encabezado de nivel 3 dentro de `code:example`, `code:wire` o `code:server`. Debajo lleva texto, bloques de código o ambos.

- Español: `### Paso 1. Título que dice qué se aprende`. Inglés: `### Step 1. …`.
- En la conversación por la red de un tema de HTTP y REST: `### Momento 1. …` y `### Moment 1. …`.
- El paso avanzado va al final y su título empieza por `### Avanzado. …` (`### Advanced. …`). Es un paso más, siempre visible.
- El paso de proyecto es el último paso numerado; su título empieza por "En el proyecto:" después del número (`### Paso 5. En el proyecto: registrar cada cálculo`; en inglés, "In the project:").

En los modelos de abajo los títulos aparecen en negrita por comodidad de lectura; en el archivo del tema son encabezados `###`.

### El inglés

Cada tema se escribe primero en español y después se traduce. La versión inglesa tiene la misma estructura, los mismos pasos y los mismos bloques. En el código se traducen los comentarios y los textos que el código imprime o devuelve al usuario; los nombres de variables, funciones, clases y rutas no se tocan.

## Entradas de proyecto

Una entrada de proyecto no explica un concepto: muestra varios temas trabajando juntos en la tienda. No tiene definición, analogía, entrevista ni malentendidos. Tiene dos secciones:

| Sección | Qué debe lograr | Extensión |
|---|---|---|
| `context` | Qué funcionalidad es, quién la usa y qué archivos se van a ver. Sin código. | 3 a 5 frases |
| `walkthrough` | El código real, dividido en partes (`### Parte 1. …`, `### Part 1. …`). Cada parte es un bloque de código que empieza con un comentario con la ruta del archivo, y una nota que explica qué hace y enlaza con `[[id]]` el tema donde se estudia. | 3 a 6 partes, bloques de 25 líneas como máximo, notas de 1 a 3 frases |

- Todo el código es de la tienda; aquí no hay pasos con código aislado.
- Cada tema que la entrada declara reunir aparece enlazado al menos una vez.
- La nota no vuelve a explicar el concepto: dice qué hace esa parte y envía al tema.
- Las reglas 2, 3 y 4 se aplican igual: términos explicados o enlazados, código corto y comentarios que dicen el porqué.

Ejemplo de una parte:

**Parte 2. Recibir y validar los datos del pedido**

```python
# app/pedidos/schemas.py
from pydantic import BaseModel, Field

class LineaCrear(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)        # un pedido con 0 unidades no tiene sentido: se rechaza solo

class PedidoCrear(BaseModel):
    lineas: list[LineaCrear] = Field(min_length=1)   # al menos un producto
```

FastAPI compara lo que envía el cliente con `PedidoCrear` antes de ejecutar el endpoint. Si falta un campo o la cantidad es 0, responde 422 sin que escribas una sola comprobación. Cómo funcionan estos modelos está en [[modelos-y-response-model]], y por qué el código es 422 y no 400, en [[codigos-de-estado]].

## Temas modelo

Cuatro temas completos, de cuatro tipos distintos. Un tema nuevo se escribe imitando el que más se le parezca.

| Modelo | Tipo | Sirve de referencia para |
|---|---|---|
| 1. Decoradores | Concepto del lenguaje que se construye por capas | Python (lenguaje), POO |
| 2. Closures | Concepto que hoy comparte tema con otros tres | Temas con varios conceptos |
| 3. Caché HTTP | Protocolo: lo importante es la conversación por la red | REST, y Git (secuencias de comandos) |
| 4. Inyección con `Depends` | Mecanismo de un framework: lo importante es quién llama a quién y cuándo | FastAPI, SQL con ORM |

Los modelos muestran las secciones Entender, En código y Malentendidos. Las secciones `bridge:typescript`, `interview`, `bad` y `good` siguen la tabla anterior. Los modelos se escribieron antes de acordar la regla 6: a cada uno le falta su paso de proyecto, que se añade al reescribir el tema.

---

### Modelo 1: Decoradores

#### definition

Un decorador es una función que **envuelve** a otra para hacer algo antes o después de ella, sin cambiar su código. Sirve para no repetir lo mismo (medir tiempo, escribir logs, comprobar permisos) en veinte funciones.

Solo necesitas una idea previa: en Python una función es un valor como cualquier otro. Se puede guardar en una variable, pasar como argumento y devolver desde otra función.

#### analogy

Un guardia en la puerta de una oficina. Tú vas a hablar con la contadora (la función original). El guardia (el decorador) te pide el carnet antes de entrar y anota la hora cuando sales. La contadora trabaja igual que siempre y no sabe que el guardia existe.

#### problem

Sin decoradores, el código de logs o de permisos se copia al principio de cada función, y el día que cambia hay que cambiarlo en todas. Con un decorador se escribe una vez y se aplica con una línea.

#### code:example

**Paso 1. Una función se puede pasar a otra función**

```python
def saludar():
    print("hola")

def ejecutar_dos_veces(func):   # func es una función, no su resultado
    func()
    func()

ejecutar_dos_veces(saludar)     # sin paréntesis: paso la función, no la llamo
# hola
# hola
```

**Paso 2. Un decorador hecho a mano**

`avisar` recibe una función y devuelve otra nueva que la llama por dentro. A esa función nueva se le suele llamar *wrapper* (envoltura).

```python
def avisar(func):            # 1. recibe la función original
    def envoltura():         # 2. crea una función nueva alrededor de ella
        print("antes")
        func()               # 3. llama a la original
        print("después")
    return envoltura         # 4. devuelve la nueva, sin ejecutarla

saludar = avisar(saludar)    # el nombre "saludar" ahora apunta a la envoltura
saludar()
# antes
# hola
# después
```

**Paso 3. La arroba es un atajo para esa última asignación**

```python
@avisar                      # igual que escribir: saludar = avisar(saludar)
def saludar():
    print("hola")
```

**Paso 4. La versión que se usa de verdad**

A la versión anterior le faltan tres cosas: aceptar argumentos, devolver el resultado y conservar el nombre de la función original.

```python
import functools

def avisar(func):
    @functools.wraps(func)                 # la envoltura conserva el nombre y los parámetros de func
    def envoltura(*args, **kwargs):        # acepta cualquier argumento...
        print(f"llamando a {func.__name__}")
        resultado = func(*args, **kwargs)  # ...y se lo pasa tal cual a la original
        return resultado                   # sin este return, quien llama recibe None
    return envoltura

@avisar
def sumar(a, b):
    return a + b

print(sumar(2, 3))
# llamando a sumar
# 5
```

**Paso avanzado. Un decorador que recibe argumentos**

Para escribir `@reintentar(3)` hace falta una capa más: `reintentar(3)` se ejecuta primero y devuelve el decorador de verdad.

```python
import functools

def reintentar(veces):                       # 1. recibe el argumento
    def decorador(func):                     # 2. este es el decorador de los pasos anteriores
        @functools.wraps(func)
        def envoltura(*args, **kwargs):
            for intento in range(veces):
                try:
                    return func(*args, **kwargs)   # si sale bien, termina aquí
                except ConnectionError:
                    if intento == veces - 1:       # era el último intento:
                        raise                      # deja salir el error
        return envoltura
    return decorador

@reintentar(3)               # igual que: consultar = reintentar(3)(consultar)
def consultar():
    ...                      # aquí iría una llamada a la red que puede fallar
```

#### myths

- **"El decorador se ejecuta cada vez que llamo a la función."** No: `avisar` se ejecuta una sola vez, cuando Python lee el `def`. Lo que se ejecuta en cada llamada es `envoltura`.
- **"`functools.wraps` es opcional."** Sin él, `sumar.__name__` devuelve `"envoltura"`. FastAPI lee el nombre y los parámetros de tu función para saber qué recibe el endpoint; sin `wraps` deja de verlos.
- **"`@avisar` y `@avisar()` son lo mismo."** El segundo llama primero a `avisar` y usa lo que devuelva como decorador. Solo funciona si el decorador fue escrito para recibir argumentos, como el del paso avanzado.

---

### Modelo 2: Closures

Hoy este concepto vive dentro de `funciones-y-closures`, junto con `*args`/`**kwargs`, lambdas y el valor por defecto mutable. Este modelo muestra cómo se explica **un** concepto de un tema que tiene varios: con su propia definición corta, su analogía y sus pasos. El usuario decidió partir ese tema en dos: `funciones-y-parametros` y `closures-y-lambdas`.

#### definition

Un closure es una función que **recuerda variables del lugar donde fue creada**, aunque ese lugar ya haya terminado de ejecutarse.

Aparece cuando defines una función dentro de otra y la de dentro usa una variable de la de fuera.

#### analogy

Una mochila. Cuando la función de dentro sale de la función de fuera, se lleva en la mochila las variables de fuera que usa. Cada vez que la llamas, abre la mochila y las encuentra tal como las dejó.

#### problem

Sin closures, para que una función recuerde algo entre llamadas (un contador, una configuración) necesitas una variable global o una clase. Con un closure, ese dato queda guardado dentro de la función y nadie más lo puede tocar.

#### code:example

**Paso 1. Una función de dentro puede leer variables de la de fuera**

```python
def crear_saludo(nombre):
    def saludar():
        print(f"hola, {nombre}")   # nombre no es de saludar: es de crear_saludo
    return saludar                 # devuelvo la función, sin llamarla

saludo_ana = crear_saludo("Ana")   # crear_saludo ya terminó...
saludo_ana()                       # ...pero saludar todavía recuerda "Ana"
# hola, Ana
```

**Paso 2. Cada closure tiene su propia mochila**

```python
saludo_ana = crear_saludo("Ana")
saludo_luis = crear_saludo("Luis")

saludo_ana()
# hola, Ana
saludo_luis()      # no se mezclan: cada llamada a crear_saludo creó su propio nombre
# hola, Luis
```

**Paso 3. Para cambiar la variable recordada hace falta `nonlocal`**

Leer la variable de fuera funciona sin más. Asignarle un valor nuevo, no: Python cree que estás creando una variable local distinta. `nonlocal` le dice "me refiero a la de fuera".

```python
def crear_contador():
    total = 0
    def siguiente():
        nonlocal total     # sin esta línea: UnboundLocalError en la línea de abajo
        total += 1         # cambia el total de crear_contador, no uno nuevo
        return total
    return siguiente

contar = crear_contador()
print(contar())
# 1
print(contar())            # el total se conservó entre llamadas
# 2
```

**Paso 4. La trampa del bucle**

El closure recuerda la **variable**, no el valor que tenía cuando se creó. Si la variable cambia después, el closure ve el valor nuevo.

```python
funciones = []
for numero in range(3):
    funciones.append(lambda: numero)   # las tres recuerdan la misma variable "numero"

print([f() for f in funciones])        # al llamarlas, el bucle ya terminó y numero vale 2
# [2, 2, 2]

funciones = []
for numero in range(3):
    funciones.append(lambda n=numero: n)   # n=numero copia el valor en ese momento

print([f() for f in funciones])
# [0, 1, 2]
```

#### myths

- **"El closure guarda una copia del valor."** Guarda la variable. Por eso en el paso 4 las tres funciones devuelven 2: todas miran la misma variable, que al final vale 2.
- **"Puedo modificar la variable de fuera sin más."** Puedes leerla. En cuanto escribes `total += 1` sin `nonlocal`, Python trata `total` como variable local, ve que no tiene valor y lanza `UnboundLocalError`.
- **"Un closure es algo raro que casi no se usa."** Todo decorador es un closure: la envoltura recuerda `func`, que es una variable de la función de fuera. Ver [[decoradores]].

---

### Modelo 3: Caché HTTP

En un tema de protocolo, el ejemplo principal no es código que se ejecuta sino una conversación entre el navegador y el servidor. Se parte en momentos y cada uno dice quién habla y qué decide.

#### definition

El caché HTTP permite que el navegador **guarde una respuesta y la reutilice**, en lugar de pedirla otra vez al servidor.

El servidor lo controla con dos cabeceras de la respuesta. `Cache-Control` dice si se puede guardar, quién puede guardarla y durante cuánto tiempo. `ETag` es un identificador de la versión del contenido: si el contenido cambia, el `ETag` cambia.

#### analogy

El menú del día de un restaurante, escrito en un tablero que dice "válido hasta las 3 p. m." (`max-age`). Antes de las 3 no le preguntas nada al mesero: ya lo leíste. Después de las 3 preguntas "¿sigue siendo el menú número 7?" (`If-None-Match` con el `ETag`). Si te responde "sí, el mismo" (`304`), no te lo vuelve a leer entero.

#### problem

Sin caché, cada visita descarga otra vez el mismo catálogo, aunque no haya cambiado: más espera para el usuario y más trabajo para el servidor.

Mal usado es peligroso. Si marcas como `public` una respuesta con datos personales, un servidor intermedio puede guardarla y entregarle a Pedro los pedidos de Ana.

#### code:wire

**Momento 1. Primera petición: el servidor responde y da permiso para guardar**

```http
GET /v1/productos/42 HTTP/1.1

HTTP/1.1 200 OK
Cache-Control: public, max-age=60    # cualquiera puede guardarla, durante 60 segundos
ETag: "a1b2c3"                       # identificador de esta versión del producto
{"id":42,"precio":38000}
```

**Momento 2. A los 30 segundos: no hay petición**

El navegador necesita el producto otra vez. Aún no pasaron los 60 segundos, así que usa su copia y **no envía nada al servidor**. En la pestaña Network aparece como `(disk cache)`.

**Momento 3. A los 2 minutos: la copia caducó y el navegador pregunta si sigue valiendo**

```http
GET /v1/productos/42 HTTP/1.1
If-None-Match: "a1b2c3"              # "tengo la versión a1b2c3, ¿sigue siendo la actual?"

HTTP/1.1 304 Not Modified            # "sí, no cambió"
ETag: "a1b2c3"
                                     # sin cuerpo: el navegador reutiliza su copia
```

Si el producto hubiera cambiado, el servidor respondería `200 OK` con el producto nuevo y un `ETag` distinto, como en el momento 1.

#### code:server

```python
import hashlib, json
from fastapi import Request, Response

@app.get("/v1/productos/{id}")
def obtener(id: int, request: Request, response: Response):
    producto = repo.buscar(id)       # se da por hecho que devuelve un dict

    # 1. Calcula el ETag: una huella del contenido. Si el producto cambia, la huella cambia.
    huella = hashlib.md5(json.dumps(producto).encode()).hexdigest()
    etag = f'"{huella}"'             # el estándar pide que vaya entre comillas dobles

    # 2. ¿El navegador ya tiene esta misma versión? Entonces 304 y nada más.
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag})

    # 3. Si no la tiene (o cambió), envía el producto con sus instrucciones de caché.
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=60"
    return producto
```

#### bad

```http
GET /v1/clientes/me
Cache-Control: public, max-age=3600
```

`public` permite que la guarden servidores intermedios (un CDN, por ejemplo), que atienden a muchos usuarios. Durante una hora, quien pida `/v1/clientes/me` puede recibir los datos del primer cliente que la pidió.

#### good

```http
GET /v1/clientes/me
Cache-Control: private, no-cache
```

`private`: solo la guarda el navegador de ese usuario. `no-cache`: antes de reutilizarla, pregunta al servidor si sigue valiendo.

#### myths

- **"`no-cache` significa que no se guarda."** Sí se guarda. Significa "pregunta al servidor antes de usar la copia", como en el momento 3. La que prohíbe guardar es `no-store`.
- **"Solo el navegador guarda respuestas."** También las guardan los servidores que hay en el camino: CDN y proxies. Por eso `public` y `private` importan.
- **"Un 304 es un error."** Es la respuesta buena: quiere decir que tu copia sigue valiendo y que te ahorraste descargarla otra vez.

---

### Modelo 4: Inyección con `Depends`

En un tema de framework, lo que cuesta entender es lo que el framework hace sin que lo veas. Los pasos lo hacen visible: quién llama a quién y en qué momento.

#### definition

`Depends` sirve para decirle a FastAPI: "antes de ejecutar mi endpoint, ejecuta esta otra función y pásame lo que devuelva".

Esa otra función se llama **dependencia**. Se usa para lo que muchos endpoints necesitan por igual: abrir la conexión a la base de datos, leer el usuario del token o calcular la paginación.

#### analogy

Un cirujano y su instrumentista. El cirujano (tu endpoint) no va al almacén a buscar el bisturí ni lo esteriliza al terminar. El instrumentista (FastAPI) lo prepara antes de la operación, se lo pone en la mano y lo recoge al final. El cirujano solo dice qué necesita.

#### problem

Sin dependencias, cada endpoint repite las mismas líneas para abrir la sesión de base de datos o leer el token. Y en los tests no puedes cambiar la base de datos real por una de prueba, porque está escrita dentro de cada endpoint.

#### code:example

**Paso 1. Una dependencia es una función normal**

```python
from fastapi import Depends, FastAPI

app = FastAPI()

def paginacion(pagina: int = 1, tamano: int = 20) -> dict:
    # FastAPI saca pagina y tamano de la URL: /pedidos?pagina=2&tamano=10
    return {"offset": (pagina - 1) * tamano, "limit": tamano}

@app.get("/pedidos")
def listar_pedidos(pag: dict = Depends(paginacion)):   # sin paréntesis: le doy la función
    return pag    # FastAPI ya llamó a paginacion y dejó aquí su resultado

# GET /pedidos?pagina=2&tamano=10
# {"offset": 10, "limit": 10}
```

En cada petición el orden es: llega la petición, FastAPI ejecuta `paginacion`, y después ejecuta `listar_pedidos` con ese resultado.

**Paso 2. Una dependencia que abre algo y lo cierra al final**

Con `yield` en lugar de `return`, la función se queda en pausa mientras el endpoint trabaja y continúa cuando termina. Así se cierran recursos sin que el endpoint se entere.

```python
from sqlmodel import Session

def get_session():
    with Session(engine) as session:   # 1. abre la sesión (engine: la conexión ya configurada)
        yield session                  # 2. se la entrega al endpoint y espera
                                       # 3. al terminar la petición, el with cierra la sesión

@app.get("/pedidos")
def listar_pedidos(session: Session = Depends(get_session)):
    return session.exec(select(Pedido)).all()   # usa la sesión; no la abre ni la cierra
```

**Paso 3. Un nombre corto para no repetir `Depends(...)`**

`Annotated` junta el tipo y la dependencia en un solo nombre que puedes reutilizar.

```python
from typing import Annotated

SessionDep = Annotated[Session, Depends(get_session)]   # "una Session que sale de get_session"

@app.get("/pedidos")
def listar_pedidos(session: SessionDep):     # igual que el paso 2, más corto
    return session.exec(select(Pedido)).all()

@app.get("/clientes")
def listar_clientes(session: SessionDep):    # se reutiliza en todos los endpoints
    return session.exec(select(Cliente)).all()
```

**Paso 4. En los tests se cambia la dependencia por otra**

```python
def get_session_de_prueba():
    with Session(engine_de_prueba) as session:   # una base de datos aparte, solo para tests
        yield session

# "cada vez que alguien pida get_session, usa esta otra función"
app.dependency_overrides[get_session] = get_session_de_prueba
```

Los endpoints no cambian ni una línea: siguen pidiendo `SessionDep` y reciben la sesión de prueba.

#### myths

- **"`Depends(get_session())` y `Depends(get_session)` son lo mismo."** Con paréntesis ejecutas la función tú, una sola vez al arrancar, y le pasas el resultado. FastAPI necesita la función sin llamar, para ejecutarla él en cada petición.
- **"La dependencia se crea una vez y se comparte."** Se ejecuta de nuevo en cada petición: cada petición recibe su propia sesión. Solo dentro de una misma petición, si dos piezas piden la misma dependencia, FastAPI la ejecuta una vez y les da el mismo resultado.
- **"Es magia del framework."** Es una función normal que FastAPI llama antes que la tuya. Puedes ponerle un `print` y verás que se ejecuta primero.

---

## Lista de comprobación de un tema

Antes de dar un tema por terminado, quien lo redacta comprueba cada punto. Si alguno es "no", el tema no está listo.

1. ¿La definición se entiende sin conocer ninguna otra palabra del tema?
2. ¿Cada término técnico está explicado la primera vez que aparece?
3. ¿La analogía dice qué parte corresponde a qué parte del concepto?
4. ¿El primer paso del ejemplo es más simple que el código real?
5. ¿Cada paso añade una sola idea?
6. ¿Ningún bloque pasa de 15 líneas?
7. ¿Cada bloque que imprime o devuelve algo muestra el resultado debajo?
8. ¿Los comentarios explican el porqué, y no repiten lo que dice la línea?
9. ¿Cada malentendido dice qué se cree, qué pasa de verdad y por qué?
10. ¿La respuesta de entrevista usa solo términos que el tema ya explicó?
11. ¿Sigue siendo corto? Si una frase se puede quitar sin que se entienda menos, se quita.
12. ¿El último paso muestra el concepto dentro de la tienda, con la ruta del archivo y quién lo llama? (O, si no tiene lugar natural en la tienda, ¿está anotado el motivo?)

Además, lo que el tema afirma tiene que ser correcto: quien redacta ejecuta cada bloque de Python ejecutable y pega la salida real, no la que supone.

## Decisiones tomadas

Tomadas por el usuario el 2026-11-13. El detalle técnico de cada una está en `design.md` del cambio `contenido-claro`.

| Decisión | Qué se decidió |
|---|---|
| Texto entre los bloques de código | Sí. Las secciones de código admiten pasos con título y texto. |
| Comentarios de código por idioma | Se traducen. La compilación comprueba que ambos idiomas tienen los mismos bloques y pasos. |
| Temas con varios conceptos | Caso por caso. Se parten ocho temas de Python; el resto quedan enteros. |
| Alcance de la reescritura | Los 41 temas, dentro de `contenido-claro`, con un piloto de siete piezas que el usuario lee antes de seguir. |
| Pistas que faltan (SQL, POO, Git) | Se redactan directamente con esta guía, usando la guía original solo como fuente de temas y datos. No se migran tal cual. |
| Verificación | Quien redacta ejecuta el código ejecutable y pasa la lista de comprobación. El usuario lee solo el piloto. |
| Paso avanzado | Un paso más al final, con el título "Avanzado", siempre visible. |
| Ejemplos de proyecto real | Un solo proyecto, la tienda en línea. Último paso de cada tema en el proyecto (regla 6) y entradas de proyecto cada cierto número de temas. |
| Dónde van las entradas de proyecto | Cinco en la pista Python y FastAPI; ninguna en HTTP y REST, que explica el protocolo y cuyo código real es la API. En las pistas siguientes se decide al definir cada una. |

## Para quien retome esto

- **Opus:** el trabajo está en `openspec/changes/contenido-claro/tasks.md`. Cada tema se escribe imitando el modelo de su tipo y se pasa por la lista de comprobación. Si una regla de esta guía no encaja en un tema, no la adaptes: es una pregunta para Fable 5.2.
- **Fable, al definir una pista nueva:** el `content-map.md` de la pista nace con esta guía. Decide con el usuario qué temas llevan entrada de proyecto y amplía `proyecto-tienda.md` con lo que la pista necesite (por ejemplo, las tablas y consultas de la tienda en SQL).
