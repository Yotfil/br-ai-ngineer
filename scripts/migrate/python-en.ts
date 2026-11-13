import type { TopicText } from './migrate-python.ts'

/**
 * Traducción al inglés de la prosa de los 21 temas (tarea 3.6 de pista-python). El código de los ejemplos no se traduce:
 * el script lo copia de la guía para que sea idéntico en ambos idiomas. Los textos de rewrites.md se traducen de forma directa.
 */
export const PYTHON_EN: Record<string, TopicText> = {
  "tipado-y-type-hints": {
    "title": "Dynamic typing and type hints",
    "short": "Typing and type hints",
    "summary": "Python is dynamically and strongly typed: values have types, variables don't, and there are no implicit conversions.",
    "def": "Python is **dynamically and strongly typed**: variables have no type, values do, and there are no implicit conversions (`\"1\" + 1` raises `TypeError`). **Type hints** are annotations the interpreter does not enforce; tools like mypy or pyright check them and, above all, FastAPI and Pydantic read them at runtime to validate.",
    "analogy": "They are like the labels on moving boxes: the truck doesn't read them and carries the box anyway, but whoever unpacks (the IDE, mypy, FastAPI) does use them to know what to do with each one.",
    "problem": "Without hints you lose autocompletion and, in FastAPI, automatic validation: FastAPI doesn't know that `id` must be an integer. The typical misuse is believing the hint protects you at runtime.",
    "badNote": "Nobody knows what it receives or what it returns; FastAPI would treat id as str.",
    "goodNote": "The contract is clear, the IDE helps and FastAPI validates that id is an integer.",
    "bridge": "**TypeScript:** types are erased at compile time and the compiler blocks the build if they don't match. **Python:** there is no step that blocks (mypy is optional), but hints *do exist at runtime* (`func.__annotations__`). That's why FastAPI turns `producto_id: int` into validation and documentation, something that in TS requires Zod or class-validator. Also, TS is structural; Python classes are nominal (for structural typing there is `typing.Protocol`).",
    "pitfalls": [
      "Expecting `x: int = \"hola\"` to fail: Python accepts it silently.",
      "Thinking `\"1\" + 1` gives `\"11\"`: in Python it's a `TypeError`, you convert explicitly with `int()` or `str()`.",
      "Different truthiness: `[]`, `{}`, `\"\"` and `0` are falsy. In JS `[]` is truthy.",
      "There is only `None`: there are no separate `null` and `undefined`."
    ],
    "answer": "Python is dynamic but strong: values have types and are not converted on their own. Type hints are not enforced at runtime; a tool like mypy or pyright checks them. The difference from TypeScript is that in TS types disappear at compile time, while in Python they remain available at runtime, and that's why Pydantic and FastAPI use them to validate data and generate the API documentation.",
    "ex": [
      {
        "q": "What does it print?",
        "opts": [
          "TypeError",
          "haha",
          "0",
          "None"
        ],
        "exp": "The hint is not enforced at runtime. `\"ha\" * 2` is a valid operation that repeats the string."
      },
      {
        "q": "What does it print?",
        "opts": [
          "False False False",
          "False True True",
          "True True True",
          "False False True"
        ],
        "exp": "Only the empty string is falsy. `\"0\"` is a string with one character and `[0]` is a list with one element: both truthy."
      }
    ]
  },
  "estructuras-de-datos": {
    "title": "Data structures: list, tuple, dict and set",
    "short": "list, tuple, dict, set",
    "summary": "list, tuple, dict and set: when to use each one based on order, mutability, key lookup and uniqueness.",
    "def": "**list**: ordered, mutable sequence. **tuple**: ordered, immutable sequence (hashable if its contents are). **dict**: key → value, preserves insertion order and looks up in O(1). **set**: unique, unordered elements, membership in O(1).",
    "analogy": "list is the line of orders at the counter; tuple, the coordinates printed on the receipt (they don't get rewritten); dict, the customer file indexed by ID number; set, the guest list where nobody appears twice.",
    "problem": "Searching with `in` in a list scans everything (O(n)); in a set or dict it's almost instant. Using list for data that shouldn't change invites modifying it by mistake.",
    "badNote": "With 10,000 orders that's up to a billion comparisons.",
    "goodNote": "Same code, different structure, orders of magnitude faster.",
    "bridge": "**list** ≈ Array. **dict** ≈ object literal or `Map`, but keys must be hashable (you can't use a list as a key). **set** ≈ `Set`. **tuple** ≈ a TS `readonly` tuple, except the immutability really exists at runtime.",
    "pitfalls": [
      "`stock[\"filtro\"]` raises `KeyError`; in JS you'd get `undefined`. Use `.get()` when the key may be missing.",
      "`(1)` is the number 1; the one-element tuple is `(1,)`.",
      "You use `len(x)`, not `x.length`.",
      "`{}` creates an empty dict, not a set. The empty set is `set()`."
    ],
    "answer": "I use a list when I need an ordered collection that will change, a tuple when the data is fixed, like a record or a coordinate, and it can also be a dictionary key. A dictionary to look up by key in constant time and a set when I care about membership or removing duplicates. The choice affects performance: searching a list is O(n) and a set or dict is O(1) on average.",
    "ex": [
      {
        "q": "Classify each case with the most suitable structure.",
        "cats": [
          "list",
          "tuple",
          "dict",
          "set"
        ],
        "items": [
          {
            "t": "History of an order's statuses, in order",
            "why": "Order and growth: list."
          },
          {
            "t": "Price of each product by its SKU code",
            "why": "Lookup by key."
          },
          {
            "t": "Unique emails that already received the promo",
            "why": "Fast membership and no duplicates."
          },
          {
            "t": "Latitude and longitude of a store",
            "why": "Fixed two-value data."
          }
        ]
      },
      {
        "q": "What does it print?",
        "opts": [
          "KeyError",
          "None 3",
          "None 2",
          "0 2"
        ],
        "exp": "`.get()` returns `None` if the key is missing, and the set `{1, 1, 2}` ends up with two elements."
      }
    ]
  },
  "comprehensions-y-generadores": {
    "title": "Comprehensions and generators",
    "short": "Comprehensions and generators",
    "summary": "A comprehension builds a list, dict or set in a single expression.",
    "def": "A **comprehension** builds a list, dict or set in a single expression. A **generator** produces values one at a time on demand with `yield`: it doesn't keep everything in memory (lazy evaluation).",
    "analogy": "The comprehension is preparing all the orders and putting them on the counter at once. The generator is a barista who makes the next coffee only when you ask for it.",
    "problem": "Loading millions of rows into a list to iterate over them once wastes memory needlessly. The generator processes them in streaming fashion.",
    "badNote": "All the data lives in memory at the same time.",
    "goodNote": "Constant memory, same result.",
    "bridge": "The comprehension is equivalent to chained `.filter().map()`. Generators exist the same way in JS (`function*` and `yield`). Compared to a stream that *pushes* values to you (push), like an `EventEmitter` or a `ReadableStream`, a generator delivers them when you ask for them (pull).",
    "pitfalls": [
      "A generator gets exhausted: the second time you iterate over it, it's empty.",
      "`(x for x in datos)` is a generator, not a tuple.",
      "Three-level nested comprehensions: if it can't be read aloud, use a normal for.",
      "Calling the generator function runs nothing until the first `next()`."
    ],
    "answer": "A list comprehension creates the whole list in memory; a generator expression or a function with yield produces the values lazily, one per iteration, and keeps its state between calls. I use generators to process large files or paginated results without loading them completely. You have to remember that a generator can only be iterated once.",
    "ex": [
      {
        "q": "What does it print?",
        "opts": [
          "[0, 2, 4] and [0, 2, 4]",
          "[0, 2, 4] and []",
          "[2, 4, 6] and []",
          "Error"
        ],
        "exp": "The generator is exhausted after the first full read."
      },
      {
        "q": "What does it print?",
        "opts": [
          "[0, 1, 4]",
          "{0, 1, 4}",
          "{0: 0, 1: 1, 2: 4}",
          "{1: 1, 2: 4, 3: 9}"
        ],
        "exp": "Dict comprehension. `range(3)` goes from 0 to 2."
      }
    ]
  },
  "funciones-y-closures": {
    "title": "Functions: *args, **kwargs, defaults, lambdas and closures",
    "short": "Functions and closures",
    "summary": "Python accepts positional, keyword and default-valued parameters.",
    "def": "Python accepts positional, keyword and default-valued parameters. `*args` collects extra positional arguments into a tuple and `**kwargs` collects extra keyword arguments into a dict. **Lambdas** are single-expression functions and **closures** are functions that remember variables from the scope where they were created.",
    "analogy": "`*args` is a bag that fits as many products as you want; `**kwargs` is the “notes” box on the form: optional named fields.",
    "problem": "The default value is evaluated **only once**, when the function is defined. If it's mutable (list, dict), all calls share the same object.",
    "badNote": "Every call without a cart reuses the same list and drags along the previous items.",
    "goodNote": "A new list is created on every call.",
    "bridge": "`*args` ≈ rest `...args`; `**kwargs` ≈ options object; `f(*lista)` and `f(**dic)` ≈ spread. Closures work like in JS, but to *reassign* an outer variable you need `nonlocal`. In JS defaults are evaluated on every call; in Python they aren't.",
    "pitfalls": [
      "Mutable default: Python's most famous interview bug.",
      "Forgetting `nonlocal` when reassigning inside a closure.",
      "Lambdas only allow one expression, no statements or annotations.",
      "Closures in a loop capture the variable, not the value (like `var` in JS)."
    ],
    "answer": "args collects extra positional arguments as a tuple and kwargs the keyword ones as a dictionary; they're used for flexible functions or to forward arguments, as decorators do. A classic bug is putting a list as a default value: it's evaluated only once when the function is defined and shared between calls, so the correct pattern is to use None and create the list inside.",
    "ex": [
      {
        "q": "What does it print?",
        "opts": [
          "[2]",
          "[1, 2]",
          "[1]",
          "Error"
        ],
        "exp": "The default list was created once and keeps the 1 from the previous call."
      },
      {
        "q": "What does it print?",
        "opts": [
          "[1, 2] {'x': 3}",
          "(1, 2) {'x': 3}",
          "(1, 2, 3) {}",
          "1 2 x=3"
        ],
        "exp": "`*a` is a tuple and `**k` a dict."
      }
    ]
  },
  "decoradores": {
    "title": "Decorators",
    "short": "Decorators",
    "summary": "A decorator is a function that takes another function and returns one that wraps it to add behavior without touching its code.",
    "def": "A decorator is a function that takes a function and returns another that wraps it, to add behavior before or after without touching its code. `@deco` above `def f` is syntactic sugar for `f = deco(f)`.",
    "analogy": "Gift wrap: the product is the same, but before reaching it you go through the wrapping (logs, permissions, timing).",
    "problem": "Without decorators you repeat the same logging, caching or permission code in every function. Badly written, they break the function: they return None or erase its signature.",
    "badNote": "The decorated function returns None and loses its name and signature. FastAPI reads the signature to know the parameters: without wraps it breaks.",
    "goodNote": "It returns the result and keeps the metadata.",
    "bridge": "In TypeScript, a class decorator (like `@Entity` in TypeORM) usually attaches *metadata* to the class for a library to read later. In Python the decorator is a normal function that runs at definition time and *replaces* the object with whatever it returns. `@app.get(\"/productos\")` in FastAPI registers your function in the router and hands it back to you unchanged.",
    "pitfalls": [
      "Forgetting `return resultado` in the wrapper.",
      "Forgetting `@functools.wraps`.",
      "Confusing `@deco` with `@deco()`: the second requires a decorator with arguments.",
      "Believing the decorator runs on every call: the decorator runs once at definition; the wrapper runs on every call."
    ],
    "answer": "A decorator is a higher-order function: it takes a function and returns another that wraps it. The at-sign syntax is equivalent to reassigning the function with the decorator's result. Inside I define a wrapper that accepts args and kwargs, do something before, call the original, do something after and return its result, using functools.wraps so as not to lose the name or the signature. FastAPI uses them to register routes.",
    "ex": [
      {
        "q": "In what order is it printed?",
        "opts": [
          "B hola C",
          "A B hola C",
          "A hola",
          "B A hola C"
        ],
        "exp": "\"A\" is printed at decoration time, before anything is called. Then the call runs the wrapper: B, hola, C."
      },
      {
        "q": "What is `@cache` above `def precio()` equivalent to?",
        "opts": [
          "`precio = cache`",
          "`precio = cache(precio)`",
          "`cache = precio(cache)`",
          "`precio()` runs on import"
        ],
        "exp": "The at sign applies the decorator and reassigns the name with whatever it returns."
      }
    ]
  },
  "errores-y-context-managers": {
    "title": "Error handling and context managers",
    "short": "Errors and with",
    "summary": "try / except / else / finally handles errors: else runs if there was no exception and finally always runs.",
    "def": "`try / except / else / finally` handles errors: `else` runs if there was no exception and `finally` always runs. Custom exceptions inherit from `Exception`. A **context manager** (`with`) guarantees setup and cleanup, through `__enter__`/`__exit__` or the `@contextmanager` decorator.",
    "analogy": "The `with` is signing out the storeroom keys: whatever happens inside, when you leave you return the keys.",
    "problem": "Swallowing errors hides bugs and leaves data half-done. Without `with`, an error midway leaves files open or transactions unclosed.",
    "badNote": "It catches everything, even Ctrl+C (KeyboardInterrupt), and nobody finds out about the failure.",
    "goodNote": "You catch what you expect and keep the original cause with `from e`.",
    "bridge": "`try/catch/finally` ≈ `try/except/finally`; `throw` → `raise`; `catch (e)` → `except Tipo as e`. `with` has no classic equivalent in JS; the closest is `using` (explicit resource management, TS 5.2+). Python prefers the EAFP style: try and catch, instead of checking everything beforehand.",
    "pitfalls": [
      "A bare `except:` without a type also catches `SystemExit` and `KeyboardInterrupt`.",
      "Not knowing the try's `else`: it separates the code that can fail from the code that only runs if everything went well.",
      "Re-raising with `raise e` instead of a bare `raise` changes the traceback's point of origin.",
      "Inheriting from `BaseException` instead of `Exception`."
    ],
    "answer": "I catch specific exceptions, never a bare except. I use else for code that should only run if there was no error and finally for mandatory cleanup. For business errors I create custom exceptions that inherit from Exception, and I chain causes with raise from. For resources like files, connections or transactions I use context managers with with, which guarantee release even if there's an exception.",
    "ex": [
      {
        "q": "What does it print?",
        "opts": [
          "1 2 3 5",
          "1 3 5",
          "1 3 4 5",
          "1 5"
        ],
        "exp": "The 2 never runs; else is skipped because there was an exception; finally always runs."
      },
      {
        "q": "What does `with open(\"pedidos.csv\") as f:` guarantee?",
        "opts": [
          "That the file exists",
          "That it's closed when leaving the block, even on error",
          "That the read is async",
          "That there are no exceptions"
        ],
        "exp": "The context manager always calls `__exit__`, and that's where the file is closed."
      }
    ]
  },
  "modulos-y-entornos": {
    "title": "Modules, packages, virtual environments and dependencies",
    "short": "Modules, venv and uv",
    "summary": "A module is a .py file; a package is a folder of modules, usually with __init__.py.",
    "def": "A **module** is a `.py` file; a **package** is a folder of modules (usually with `__init__.py`). A **virtual environment** isolates each project's interpreter and libraries. The current FastAPI documentation uses **uv** by default, with `pyproject.toml` and `uv.lock`.",
    "analogy": "The virtual environment is each project's own pantry: you don't take ingredients from the common market or change your neighbor's recipe.",
    "problem": "Without a virtual environment, two projects that need different versions of a library break each other, and what you installed into the system Python can break Mac tools.",
    "badNote": "Global installation and a star import that fills the namespace without knowing what it brings in.",
    "goodNote": "Dependency recorded in pyproject.toml and locked in uv.lock; explicit import.",
    "bridge": "`pyproject.toml` ≈ `package.json`; `uv.lock` ≈ `package-lock.json`; `.venv` ≈ `node_modules`, but it also contains the interpreter; PyPI ≈ npm registry; `uv run` ≈ `npx`/`npm run`. Key difference: Node finds `node_modules` on its own; Python uses whichever environment is active, or the one `uv run` activates for you.",
    "pitfalls": [
      "Installing without activating the venv and then not finding the package.",
      "Naming your file `fastapi.py` or `json.py`: it shadows the real library on import.",
      "Circular imports between modules (A imports B and B imports A).",
      "Committing the `.venv` folder to the repo."
    ],
    "answer": "Each .py file is a module and a folder of modules is a package. I isolate each project in a virtual environment so its dependencies don't clash with other projects or with the system. Today I use uv: it declares dependencies in pyproject.toml and pins exact versions in uv.lock, just like package.json and the lockfile in Node. The if name equals main block lets a module be both importable and executable.",
    "ex": [
      {
        "q": "Which file plays the role of `package-lock.json` with uv?",
        "opts": [
          "pyproject.toml",
          "requirements.txt",
          "uv.lock",
          ".python-version"
        ],
        "exp": "`uv.lock` pins the exact versions of the whole dependency tree."
      },
      {
        "q": "When does the code inside `if __name__ == \"__main__\":` run?",
        "opts": [
          "Always",
          "When the file is run directly, not when it's imported",
          "Only in production",
          "When it's imported for the first time"
        ],
        "exp": "On import, `__name__` is the module's name; when run directly it's `\"__main__\"`."
      }
    ]
  },
  "concurrencia": {
    "title": "Concurrency: async/await, event loop, threads, processes and GIL",
    "short": "async, threads and GIL",
    "summary": "async/await gives cooperative concurrency on a single thread with an event loop (asyncio), ideal for I/O waits.",
    "def": "**async/await** gives cooperative concurrency on a single thread with an event loop (asyncio): ideal for I/O waits. **Threads** are managed by the operating system, but in CPython the **GIL** lets only one thread execute Python bytecode at a time: they help with I/O, they don't speed up computation. **Processes** give real parallelism for CPU work. Python 3.13+ offers an optional build without the GIL (free-threaded), but the standard installation still has it.",
    "analogy": "The event loop is a waiter serving several tables: he takes an order and, while the kitchen prepares it (await), serves another table. Threads are several waiters sharing a single notepad (the GIL): only one writes at a time. Processes are several independent kitchens.",
    "problem": "A `time.sleep()` or a blocking library inside a coroutine freezes the whole event loop: no other task makes progress.",
    "badNote": "It looks async, but it handles one thing at a time.",
    "goodNote": "Every wait yields control to the event loop.",
    "bridge": "The syntax is almost the same as JS and `asyncio.gather` ≈ `Promise.all`. Key difference: in JS a Promise starts running as soon as it is created; in Python a coroutine **does nothing** until you await it or turn it into a Task. Node also has a single thread with an event loop, but it has no GIL because it never had JS threads sharing memory. In JS you cancel with `AbortController`; asyncio has cancellable Tasks and async generators.",
    "pitfalls": [
      "Calling an async function without `await`: you get a coroutine object and the \"was never awaited\" warning.",
      "Using blocking libraries (requests, psycopg2, time.sleep) inside `async def`.",
      "Believing async speeds up CPU computation: it only helps you wait better.",
      "Using threads to parallelize heavy computation: the GIL serializes it."
    ],
    "answer": "Async is concurrency on a single thread: the event loop switches between tasks every time one awaits on I/O, so it works for many network or database waits. Threads also work for I/O, but because of the GIL only one runs Python at a time, so they don't speed up computation. For CPU work I use processes. In FastAPI the important thing is not to block the event loop inside an async endpoint.",
    "ex": [
      {
        "q": "Which concurrency tool would you use?",
        "cats": [
          "async",
          "threads",
          "processes"
        ],
        "items": [
          {
            "t": "Calling 50 supplier APIs with httpx.AsyncClient",
            "why": "Many network waits with an async library."
          },
          {
            "t": "Resizing 10,000 product photos",
            "why": "Heavy CPU: the GIL blocks threads."
          },
          {
            "t": "Using a blocking legacy SDK with no async version",
            "why": "Blocking I/O: a thread (or asyncio.to_thread) avoids freezing the loop."
          },
          {
            "t": "Computing sales statistics in pure Python over millions of rows",
            "why": "CPU computation."
          }
        ]
      },
      {
        "q": "What does it print?",
        "opts": [
          "1",
          "&lt;coroutine object f at 0x...> and a RuntimeWarning",
          "Promise { 1 }",
          "None"
        ],
        "exp": "Calling an async function creates a coroutine but doesn't run it. You need `await f()` or `asyncio.run(f())`."
      }
    ]
  },
  "dataclasses-y-pydantic": {
    "title": "Dataclasses and Pydantic",
    "short": "Dataclasses and Pydantic",
    "summary": "@dataclass generates __init__, __repr__ and __eq__ from the annotations, without validating.",
    "def": "`@dataclass` generates `__init__`, `__repr__` and `__eq__` from the annotations, **without validating**. **Pydantic** (`BaseModel`, v2) validates and converts data at runtime, serializes to dict or JSON and generates JSON Schema. FastAPI is built on top of Pydantic.",
    "analogy": "The dataclass is a printed form: it has boxes, but nobody checks what you write. Pydantic is the clerk at the counter who checks every box and hands the form back to you with the list of errors.",
    "problem": "External data (a client's JSON, environment variables) is not trustworthy. A dataclass accepts it as is; Pydantic validates it at the boundary of your system.",
    "badNote": "v1 syntax that still shows up in old tutorials.",
    "goodNote": "Pydantic v2: model_config, field_validator, model_dump.",
    "bridge": "The dataclass ≈ an `interface` plus a class with an automatic constructor. Pydantic ≈ **Zod**: `Cliente(**datos)` or `Cliente.model_validate(datos)` ≈ `schema.parse(datos)`. The difference is that in Zod you define the schema and *derive* the type with `z.infer`; in Pydantic the class with type hints is both schema and type.",
    "pitfalls": [
      "Writing `notas: list = []` in a dataclass: error, use `field(default_factory=list)`.",
      "Mixing Pydantic v1 and v2 syntax copied from different tutorials.",
      "Being surprised that `\"30\"` gets converted to `30`: that's the default lax mode; `strict=True` exists.",
      "Using `EmailStr` without having email-validator installed (it comes included in `fastapi[standard]`)."
    ],
    "answer": "A dataclass generates the boilerplate of a data class but validates nothing. Pydantic validates and converts data at runtime using the type hints, returns detailed errors and knows how to serialize to JSON and generate JSON Schema. I use dataclasses for internal structures and Pydantic at the boundaries: requests, responses and configuration. It's similar to Zod, but the schema is the class itself.",
    "ex": [
      {
        "q": "In Pydantic v2, how do you convert a model to a dict?",
        "opts": [
          "`.dict()`",
          "`.model_dump()`",
          "`dict(modelo)` is the recommended way",
          "`.to_json()`"
        ],
        "exp": "`.dict()` is from v1 and is deprecated. In v2 you use `model_dump()` and `model_dump_json()`."
      },
      {
        "q": "What happens with `ItemCarrito(producto_id=\"abc\")` if it's a dataclass?",
        "opts": [
          "ValidationError",
          "TypeError",
          "It's created without error with producto_id = \"abc\"",
          "Converts to int"
        ],
        "exp": "Dataclasses don't validate types. That's what Pydantic is for, or Pydantic dataclasses."
      }
    ]
  },
  "identidad-copias-mutabilidad": {
    "title": "Classic comparisons: is vs ==, copies, mutability",
    "short": "is, ==, copies",
    "summary": "== compares value (calls __eq__); is compares identity: whether it's the same object in memory.",
    "def": "`==` compares value (calls `__eq__`); `is` compares identity, that is, whether it's the same object in memory. Mutable: list, dict, set and most objects. Immutable: int, float, str, tuple, frozenset. A **shallow copy** duplicates the container but shares what's inside; a **deep** copy copies everything recursively.",
    "analogy": "`is` asks whether it's the same physical cup; `==` asks whether both cups have the same coffee.",
    "problem": "Confusing a reference with a copy produces ghost bugs: you modify one customer's order and another's changes. Using `is` to compare values sometimes works by chance and fails in production.",
    "badNote": "== None can be overridden; is with strings depends on interpreter details; the last line creates three references to the same row.",
    "goodNote": "is only for None, True and False (singletons); a comprehension for independent rows.",
    "bridge": "`is` is similar to `===` between objects (same reference). But `==` in Python compares content: `[1] == [1]` is True, whereas in JS `[1] === [1]` is false. JS's spread `{...obj}` is a shallow copy, just like `dict.copy()`, and `structuredClone` ≈ `copy.deepcopy`.",
    "pitfalls": [
      "`a = b = []` creates a single list with two names.",
      "`[[0] * 3] * 3`: changing one row changes all three.",
      "`is` with small integers (-5 to 256) \"works\" because of CPython's cache and is misleading.",
      "Tuples are immutable, but if they contain a list, that list can change."
    ],
    "answer": "== compares values and is compares identity. I use is only with singletons like None. Lists, dictionaries and sets are mutable; numbers, strings and tuples are immutable, which is why tuples can be dictionary keys. Assigning doesn't copy: it creates another reference. A shallow copy duplicates the container and shares the inner objects; if there are nested structures I'm going to modify, I use deepcopy.",
    "ex": [
      {
        "q": "What does it print?",
        "opts": [
          "True True",
          "True False",
          "False False",
          "False True"
        ],
        "exp": "Same content, different objects."
      },
      {
        "q": "What does it print?",
        "opts": [
          "[[9, 0], [0, 0]]",
          "[[9, 0], [9, 0]]",
          "[[9, 9], [0, 0]]",
          "Error"
        ],
        "exp": "`* 2` on the outer list repeats the same reference to the row."
      },
      {
        "q": "Mutable or immutable?",
        "cats": [
          "mutable",
          "immutable"
        ],
        "items": [
          {
            "t": "list",
            "why": "append, pop and assignment by index."
          },
          {
            "t": "tuple",
            "why": "You can't reassign an element."
          },
          {
            "t": "str",
            "why": "Every operation creates a new string."
          },
          {
            "t": "dict",
            "why": "Keys are added and changed."
          },
          {
            "t": "frozenset",
            "why": "Immutable version of set."
          }
        ]
      }
    ]
  },
  "rutas-y-parametros": {
    "title": "Routes, path parameters, query params and body",
    "short": "Routes and parameters",
    "summary": "A path operation is method + path + function.",
    "def": "A **path operation** is method + path + function. FastAPI decides where each parameter comes from based on its declaration: if its name appears in the path it's a **path param**; if it's a simple type that isn't in the path, it's a **query param**; if it's a Pydantic model, it's the **body**. With `Annotated` and `Path`/`Query` you add constraints.",
    "analogy": "A delivery address: the path is the street and number (it identifies the resource), the query params are the optional instructions (\"leave it at the front desk\") and the body is the package.",
    "problem": "Routes are evaluated in order. If the dynamic one comes first, `/productos/destacados` tries to convert \"destacados\" to int and responds 422.",
    "badNote": "GET /productos/destacados → 422 int_parsing.",
    "goodNote": "Specific first, generic after.",
    "bridge": "In Express you'd write `app.get('/productos/:id', (req, res) => ...)` and convert `req.params.id` by hand. Here the conversion and validation come from the type hint. It's the same idea as `:id` in a SPA router, but without parsing the value yourself.",
    "pitfalls": [
      "Route order matters.",
      "Query params arrive as text; FastAPI converts them according to the hint (`?activo=true` → `True`).",
      "A parameter without a default is required, even if it's a query param.",
      "`/productos/` with a trailing slash redirects with a 307 to `/productos` if that's how you defined it."
    ],
    "answer": "FastAPI infers where each parameter comes from: if the name is in the path it's a path param, if it's a simple type outside the path it's a query param, and if it's a Pydantic model it's the body. The type hints convert and validate, and with Annotated plus Path or Query I add constraints like minimums and maximums. If something doesn't comply, it responds 422 without me writing validations. Watch the order: fixed routes go before routes with parameters.",
    "ex": [
      {
        "q": "With the path `/productos/{producto_id}` and the signature `def f(producto_id: int, categoria: str, datos: ProductoCrear)`, where does `categoria` come from?",
        "opts": [
          "From the path",
          "From the query string",
          "From the body",
          "From the headers"
        ],
        "exp": "Simple type that doesn't appear in the path: query param, and required because it has no default."
      },
      {
        "q": "`GET /productos/0` with `producto_id: Annotated[int, Path(gt=0)]`.",
        "opts": [
          "200",
          "400",
          "404",
          "422"
        ],
        "exp": "0 doesn't satisfy gt=0: `greater_than` validation error, 422."
      }
    ]
  },
  "modelos-y-response-model": {
    "title": "Input and output models, validation and response_model",
    "short": "Models and response_model",
    "summary": "Separate the schemas: what comes in, what goes out and what gets stored.",
    "def": "Separate the schemas: what **comes in** (`ClienteCrear`), what **goes out** (`ClientePublico`) and what gets **stored**. The endpoint's return type, or `response_model`, validates and **filters** the response: only the fields of the output model go out.",
    "analogy": "The menu the customer sees doesn't show the cost of the ingredients or the supplier, even though the kitchen knows them.",
    "problem": "With a single model for everything you end up returning the password hash or letting the client send fields it shouldn't, like `es_admin`.",
    "badNote": "The input model is used as the output.",
    "goodNote": "Separate input and output; inheritance avoids repeating fields.",
    "bridge": "It's the idea of DTOs: having a `CreateClienteDto` type for what comes in and a `ClienteResponse` for what goes out. The difference is that here the output model isn't just a type: it's validated and filtered at runtime. Pydantic versus a TS interface: the interface disappears at compile time; the model acts.",
    "pitfalls": [
      "Using the same model for input, output and the table.",
      "Returning an ORM object without `from_attributes=True`.",
      "If your response doesn't match the output model, the error is a **500** (your bug), not a 422.",
      "By default extra fields are ignored; with `model_config = ConfigDict(extra=\"forbid\")` you reject them."
    ],
    "answer": "I define different models for input and output, usually with a shared base class. The input validates what the client can send and the output controls what I expose: if I annotate the return type or use response_model, FastAPI filters the fields, so a password hash never leaks. If the body doesn't comply, the client gets a 422 with the details; if my response doesn't comply, it's a 500 because it's a server error.",
    "ex": [
      {
        "q": "The handler returns a dict without the `id` field, which is required in `ClientePublico`.",
        "opts": [
          "200 without id",
          "422",
          "500",
          "204"
        ],
        "exp": "Response validation fails (ResponseValidationError). It's a server error: 500."
      },
      {
        "q": "What does FastAPI do with fields that aren't in the output model?",
        "opts": [
          "Returns them anyway",
          "Filters them out",
          "Raises 422",
          "Converts them to null"
        ],
        "exp": "The response model works as a filter: only what's declared goes out."
      }
    ]
  },
  "inyeccion-con-depends": {
    "title": "Dependency injection with Depends",
    "short": "Depends",
    "summary": "Depends declares that a parameter's value is provided by a function FastAPI runs before the handler, on every request.",
    "def": "`Depends` declares that a parameter's value is provided by a function that FastAPI runs **before the handler, on every request**. Dependencies can have their own dependencies (a tree), their result is cached within the same request, and if they use `yield` they run cleanup after responding.",
    "analogy": "Mise en place: before the chef cooks, someone leaves the ingredients ready and measured. The chef doesn't go to the storeroom or wash the dishes at the end.",
    "problem": "Without dependencies you repeat in every endpoint how to open the session, read the token or paginate, and you can't replace those pieces in tests.",
    "badNote": "A session shared by all requests: mixed-up data and unclosed connections.",
    "goodNote": "One session per request, closed at the end and replaceable in tests.",
    "bridge": "It resembles a TypeScript dependency injection container (like InversifyJS or tsyringe), but there are differences worth mentioning in the interview. Those containers resolve by **type or token** and usually hand out singletons. FastAPI resolves by **function**, runs it on every request, and its parameters can come from the request itself (query, headers, body). For tests, `app.dependency_overrides` ≈ `jest.mock` on a module.",
    "pitfalls": [
      "Writing `Depends(get_session())` with parentheses: you pass the result, not the function.",
      "Expecting a singleton: each request creates its own value.",
      "Putting heavy business logic inside dependencies.",
      "Not creating aliases with `Annotated` and repeating `Depends(...)` in every endpoint."
    ],
    "answer": "Depends tells FastAPI that a parameter is produced by another function. FastAPI resolves the dependency tree before the handler, on every request, and caches the results within that request. With yield I can open and close resources like the database session. Unlike classic injection containers, there are no singletons by default nor resolution by type, and in tests I replace dependencies with dependency_overrides.",
    "ex": [
      {
        "q": "Two dependencies of the same endpoint ask for `SessionDep`. How many times does `get_session` run in that request?",
        "opts": [
          "Once",
          "Twice",
          "Once per endpoint in the app",
          "Just once when the app starts"
        ],
        "exp": "FastAPI caches the result of each dependency within the same request."
      },
      {
        "q": "What's wrong with `session: Session = Depends(get_session())`?",
        "opts": [
          "Nothing",
          "async is missing",
          "It passes the result of calling the function, not the function",
          "Depends only accepts classes"
        ],
        "exp": "Depends expects the callable: `Depends(get_session)`."
      }
    ]
  },
  "errores-y-httpexception": {
    "title": "Error handling and HTTPException",
    "short": "HTTPException",
    "summary": "raise HTTPException(status_code, detail) stops execution and FastAPI responds with a JSON with detail and that code.",
    "def": "`raise HTTPException(status_code, detail)` stops execution and FastAPI responds with a JSON `{\"detail\": ...}` with that code. For domain errors, the clean approach is to create your own exceptions and translate them to HTTP with `@app.exception_handler`.",
    "analogy": "It's the cashier who tells you \"that dish doesn't exist\" instead of staying silent (500) or serving you an empty plate (200 with null).",
    "problem": "Returning errors as 200 responses misleads the frontend and retries. Raising HTTPException from business logic ties it to HTTP and makes it hard to reuse.",
    "badNote": "The client gets a 200 and has to guess.",
    "goodNote": "raise, not return, and the correct code.",
    "bridge": "It's equivalent to throwing an error with a status code in Express and letting an error middleware turn it into a response. On the other side, it's what your frontend receives after `await fetch(...)`: a response with `response.ok` set to `false` and the reason in the `detail` field of the body. The `exception_handler` is the equivalent of Express's global error middleware.",
    "pitfalls": [
      "Writing `return HTTPException(...)` instead of `raise`.",
      "Catching `Exception` in the handler and hiding the real error.",
      "Raising HTTPException from services or repositories: better a domain exception and a handler.",
      "Leaking internal stack traces in the `detail` of a 500."
    ],
    "answer": "For expected errors I raise HTTPException with the code and a clear detail, for example 404 if the resource doesn't exist. For business rules I prefer domain exceptions, like StockInsuficiente, that know nothing about HTTP, and I register an exception handler that translates them to the appropriate response, for example 409. That way the logic is reusable and testable, and unhandled errors end up as 500 without exposing internal details.",
    "ex": [
      {
        "q": "What does the client get with `raise HTTPException(404, \"Pedido no encontrado\")`?",
        "opts": [
          "200 with null",
          "404 and `{\"detail\": \"Pedido no encontrado\"}`",
          "404 and `{\"error\": \"Pedido no encontrado\"}`",
          "500"
        ],
        "exp": "FastAPI uses the `detail` key in the error JSON."
      },
      {
        "q": "An endpoint divides by zero and nobody catches the exception.",
        "opts": [
          "400",
          "422",
          "500",
          "503"
        ],
        "exp": "Every unhandled exception ends up as a 500 Internal Server Error."
      }
    ]
  },
  "endpoints-async-vs-sync": {
    "title": "Async vs sync endpoints",
    "short": "async def vs def",
    "summary": "An async def endpoint runs on the event loop: use it when everything it does inside is awaitable.",
    "def": "An `async def` endpoint runs on the event loop: use it when everything it does inside is awaitable (async driver, httpx). A regular `def` endpoint is run by FastAPI in a **threadpool**, so a blocking call does not freeze the server. The only truly bad thing is putting blocking code inside `async def`. The documentation itself says: if you don't know, use a regular `def`.",
    "analogy": "An async waiter who stands in front of the kitchen waiting for a dish blocks the whole restaurant. If the task is about waiting with no way to get notified, better hire a helper (the threadpool).",
    "problem": "With `async def` and a blocking call, all concurrent requests are served one at a time. Under real load, latency skyrockets.",
    "badNote": "It looks modern and it is the slowest of the three.",
    "goodNote": "Or you switch to an async driver and use async def with await.",
    "bridge": "In Node everything runs on a single thread: blocking in a handler blocks the entire server, always. FastAPI gives you a way out that Node doesn't have: declare the endpoint with `def` and let it run on a separate thread.",
    "pitfalls": [
      "async def with `requests`, `time.sleep` or a sync driver.",
      "Believing async is always faster.",
      "Doing heavy computation inside an endpoint: move it to a process or a task queue.",
      "The threadpool is limited (40 threads by default in AnyIO): it is not infinite."
    ],
    "answer": "If inside the endpoint I only use async libraries, I declare it with async def and use await; if I use blocking libraries, I declare it with a regular def and FastAPI runs it in a threadpool. The serious mistake is calling blocking code inside async def, because it freezes the event loop and serializes all requests. For heavy CPU work I use neither: I send it to another process or to a queue.",
    "ex": [
      {
        "q": "Would you declare the endpoint with async def or with def?",
        "cats": [
          "async def",
          "def"
        ],
        "items": [
          {
            "t": "Uses httpx.AsyncClient to query a provider",
            "why": "Async library: await inside async def."
          },
          {
            "t": "Uses requests to query a provider",
            "why": "requests is blocking: threadpool."
          },
          {
            "t": "Uses SQLModel's synchronous Session",
            "why": "Blocking session."
          },
          {
            "t": "Uses AsyncSession with asyncpg",
            "why": "Async driver."
          },
          {
            "t": "You don't know whether the library is async",
            "why": "It is the literal recommendation of the FastAPI docs."
          }
        ]
      }
    ]
  },
  "base-de-datos": {
    "title": "Database: SQLAlchemy or SQLModel, sessions and migrations",
    "short": "DB, sessions and Alembic",
    "summary": "An ORM maps classes to tables.",
    "def": "An **ORM** maps classes to tables. SQLAlchemy 2.0 is the standard in Python; **SQLModel**, by the same author as FastAPI, combines SQLAlchemy and Pydantic and is what the official documentation uses. The **Session** is the unit of work of a request: you accumulate changes and they are applied with `commit()`. **Alembic** versions the schema with migrations.",
    "analogy": "The Session is a shopping cart: you add, change and remove, but nothing is charged until the commit. Migrations are the records of each remodel of the store: numbered, in order and reversible.",
    "problem": "The N+1 problem (one query per row when accessing a relationship) and concatenating text into SQL are the two most-asked mistakes. And `create_all()` is no good for evolving the schema in production.",
    "badNote": "N+1 queries and SQL injection.",
    "goodNote": "Eager loading and parameters bound by the ORM.",
    "bridge": "SQLModel or SQLAlchemy ≈ TypeORM or Prisma; Alembic ≈ `prisma migrate` or TypeORM migrations. The Session resembles TypeORM's `EntityManager`: a unit of work that groups changes.",
    "pitfalls": [
      "Forgetting `commit()`: nothing gets saved.",
      "Sharing a global session across requests.",
      "Not reviewing the `--autogenerate` script: Alembic does not detect everything (for example, renames).",
      "Mixing AsyncSession with a synchronous driver."
    ],
    "answer": "I use SQLAlchemy or SQLModel to map models to tables, with one database session per request injected as a dependency, which is closed when it finishes. I add objects to the session, commit and refresh to get the generated values. To avoid N+1 I load relationships with selectinload or joinedload, I never concatenate SQL, and I evolve the schema with hand-reviewed Alembic migrations, not with create_all in production.",
    "ex": [
      {
        "q": "You did `session.add(producto)` and responded 201, but the product does not show up in the database. What was missing?",
        "opts": [
          "refresh()",
          "commit()",
          "flush()",
          "close()"
        ],
        "exp": "Without commit the transaction is discarded when the session closes."
      },
      {
        "q": "What does `alembic revision --autogenerate` do?",
        "opts": [
          "Applies the migrations",
          "Compares your models with the current schema and generates a script to review",
          "Drops and recreates the tables",
          "Generates the models from the DB"
        ],
        "exp": "It generates the migration; you apply it with `alembic upgrade head` after reviewing it."
      }
    ]
  },
  "autenticacion-en-fastapi": {
    "title": "Authentication in FastAPI: OAuth2, JWT and password hashing",
    "short": "Auth: OAuth2 and hashing",
    "summary": "Authentication: who you are.",
    "def": "**Authentication**: who you are. **Authorization**: what you can do. The flow from the FastAPI documentation: `POST /token` with username and password (OAuth2 password flow) → signed JWT → the client sends it in `Authorization: Bearer` → a dependency verifies it on every request. Passwords are stored as a hash with **Argon2** using **pwdlib**, and JWTs are signed with **PyJWT**.",
    "analogy": "The JWT is a concert wristband: they put it on you at the entrance after checking your ticket; inside, nobody goes back to the box office, they only check that the wristband is authentic and not expired. But anyone can read what the wristband says.",
    "problem": "Storing passwords in plain text or with a fast hash (MD5, SHA-256 without salt) lets them be recovered if the database leaks. Putting sensitive data in the JWT exposes it: the payload is only base64-encoded, not encrypted.",
    "badNote": "Unhashed password, sensitive data in the payload and a weak key in the code.",
    "goodNote": "Argon2, minimal payload with expiration and key from configuration (openssl rand -hex 32).",
    "bridge": "On the frontend you stored the token and a function wrapping `fetch` added `Authorization: Bearer`; now you're on the other side. The frontend's **protected routes** resemble dependencies like `requiere_admin`, with a fundamental difference: frontend protection is user experience; the backend dependency is the real security.",
    "pitfalls": [
      "Confusing 401 (missing or invalid token) with 403 (valid token, no permission).",
      "Believing the payload is secret.",
      "Tokens without expiration or impossible to revoke: use short lifetimes and refresh tokens.",
      "`OAuth2PasswordRequestForm` expects form-data, not JSON (it needs python-multipart, included in `fastapi[standard]`)."
    ],
    "answer": "Authentication is verifying identity and authorization is verifying permissions. In FastAPI I expose a token endpoint with the OAuth2 password flow: I verify the password against an Argon2 hash and issue a signed JWT with a short expiration and the identifier in sub. A dependency reads the Bearer token, decodes it with the expected key and algorithm, loads the user and responds 401 if anything fails. On top of that I add authorization dependencies that respond 403. The JWT payload is readable, so it carries no sensitive data.",
    "ex": [
      {
        "q": "Someone changes one character of the JWT payload and sends it.",
        "opts": [
          "200",
          "401",
          "403",
          "422"
        ],
        "exp": "The signature no longer matches: `InvalidSignatureError` → 401."
      },
      {
        "q": "Is a JWT's payload secret?",
        "opts": [
          "Yes, it is encrypted",
          "No, it is base64url-encoded and anyone can read it; the signature only guarantees it was not altered",
          "Only if you use HS256",
          "Only over HTTPS"
        ],
        "exp": "Signing is not encrypting. Don't put sensitive data in the payload."
      }
    ]
  },
  "middleware-cors-background": {
    "title": "Middleware, CORS and background tasks",
    "short": "Middleware, CORS, background",
    "summary": "A middleware wraps every request and response (logs, timings, headers).",
    "def": "A **middleware** wraps every request and response (logs, timings, headers). **CORS** is a browser rule: it blocks responses from another origin unless the server allows it with headers; it is configured with `CORSMiddleware`. **BackgroundTasks** runs something after the response is sent, like a confirmation email.",
    "analogy": "The middleware is the building's doorman: everyone goes past him on the way in and on the way out. The background task is “we'll email you the receipt”: you leave with your coffee and the email goes out afterwards.",
    "problem": "Without CORS configured, your frontend on `localhost:4200` cannot read the responses from the API on `localhost:8000`. Without background tasks, the user waits for an email to go out before seeing their order.",
    "badNote": "Any website could make requests with your users' credentials. The CORS specification does not allow * when there are credentials.",
    "goodNote": "Explicit origins from configuration.",
    "bridge": "Middleware resembles Express's `(req, res, next)`: `await call_next(request)` ≈ `next()`. On the client side, it is the same idea as a function wrapping `fetch` to touch every request. And the CORS error you used to see in the browser console gets fixed here, not on the frontend (in development you also dodged it with the dev server's proxy).",
    "pitfalls": [
      "Believing CORS protects your API: only browsers enforce it; curl or Postman ignore it.",
      "Using BackgroundTasks for heavy or critical jobs: if the process restarts, they are lost. Use a queue (Celery, ARQ, RQ).",
      "Forgetting that requests with JSON or Authorization trigger an OPTIONS preflight.",
      "Registering CORS after other middlewares that may respond first."
    ],
    "answer": "Middleware intercepts all requests and responses; I use it for logs, metrics or headers, like a function wrapping `fetch` on the client, but on the server. CORS is a browser protection: I configure CORSMiddleware with an explicit list of origins, never an asterisk with credentials, knowing it does not protect against non-browser clients. For work that must not delay the response, like sending an email, I use BackgroundTasks; if it is heavy or cannot be lost, a task queue.",
    "ex": [
      {
        "q": "When does a task added with `tareas.add_task(...)` run?",
        "opts": [
          "Before the handler",
          "In parallel with the handler",
          "After the response is sent",
          "When the server restarts"
        ],
        "exp": "The client receives the response and then the task runs."
      },
      {
        "q": "What is the Express middleware equivalent of `await call_next(request)`?",
        "opts": [
          "`req.clone()`",
          "`next()`",
          "`res.send()`",
          "`app.use()`"
        ],
        "exp": "Both pass the request to the next link in the chain. In FastAPI, in addition, `call_next` returns the response to you so you can modify it."
      }
    ]
  },
  "estructura-del-proyecto": {
    "title": "Structure of a real project",
    "short": "Project structure",
    "summary": "Split by responsibility: routers, services, repositories, schemas, models and configuration with pydantic-settings.",
    "def": "Split by responsibility: **routers** (HTTP), **services** (business rules), **repositories** (data access), **schemas** (Pydantic), **models** (tables) and **configuration** with pydantic-settings. `APIRouter` modularizes the routes and `lifespan` handles startup and shutdown (the `on_event` events are deprecated).",
    "analogy": "In a restaurant, the waiter (router) takes the order, the chef (service) decides how to prepare it and the storekeeper (repository) brings the ingredients. The waiter doesn't cook and the chef doesn't wait tables.",
    "problem": "With everything in `main.py`, business logic ends up mixed with HTTP and SQL: it cannot be tested without starting the API nor reused from a script or a worker.",
    "badNote": "Credentials in the code, no validation, rules and SQL in the handler.",
    "goodNote": "The router only translates HTTP; the service holds the rule and is tested on its own.",
    "bridge": "It is the organization by *features* you already use on the frontend: each folder with its router (like the feature's routes), its services and its models. `Settings` ≈ a per-environment configuration file or `import.meta.env`, but it is read from environment variables at runtime, not at build time.",
    "pitfalls": [
      "Overengineering: a repository for a three-table CRUD may be overkill. Start simple.",
      "Committing the `.env` with secrets.",
      "Using `@app.on_event(\"startup\")`: it is deprecated, use `lifespan`.",
      "Circular imports between modules of different features."
    ],
    "answer": "I organize by features, and within each one I separate router, schemas, models, service and, if needed, repository. The router only handles HTTP; the service has the business rules and knows nothing about HTTP; the repository encapsulates the queries. Configuration comes from environment variables with pydantic-settings, common dependencies live in a deps module, and I use lifespan for startup and shutdown. I adjust the number of layers to the size of the project.",
    "ex": [
      {
        "q": "Which layer does each thing go in?",
        "cats": [
          "router",
          "service",
          "repository",
          "schemas",
          "config"
        ],
        "items": [
          {
            "t": "Validate there is stock before creating the order",
            "why": "Business rule."
          },
          {
            "t": "Define prefix /pedidos and status_code 201",
            "why": "HTTP detail."
          },
          {
            "t": "Run a SELECT with filters and pagination",
            "why": "Data access."
          },
          {
            "t": "Read DATABASE_URL from the environment",
            "why": "pydantic-settings."
          },
          {
            "t": "Declare which fields the POST accepts",
            "why": "Pydantic input model."
          }
        ]
      }
    ]
  },
  "pytest-y-testclient": {
    "title": "Testing with pytest and TestClient",
    "short": "pytest and TestClient",
    "summary": "pytest discovers test_* functions in test_*.py files, uses plain assert and sets up context with fixtures injected by name.",
    "def": "**pytest** discovers `test_*` functions in `test_*.py` files, uses plain `assert` and sets up context with **fixtures**, which are injected by parameter name. **TestClient** (based on HTTPX) makes requests to your app without starting a server. `app.dependency_overrides` replaces the DB or the current user.",
    "analogy": "A dress rehearsal with props: the stage and the actors are real, but the food is plastic.",
    "problem": "Without tests, every change to a model or a dependency can silently break endpoints. With tests that use the development DB, results depend on the order and on stale data.",
    "badNote": "Slow, fragile and leaves junk in the database.",
    "goodNote": "No server, with a DB isolated per fixture.",
    "bridge": "pytest ≈ Jest or Vitest, and `assert` ≈ `expect`. A fixture ≈ `beforeEach`, but it is injected by the **parameter name** (dependency injection again). `dependency_overrides` ≈ `jest.mock` on a module, and TestClient ≈ supertest.",
    "pitfalls": [
      "Not clearing `dependency_overrides` and contaminating other tests.",
      "Testing only the happy path: 401, 404 and 422 are part of the contract too.",
      "Not using `with TestClient(app)`: without the with, lifespan does not run.",
      "Files or functions without the `test_` prefix: pytest doesn't find them."
    ],
    "answer": "I use pytest with fixtures to set up an isolated database, usually in-memory SQLite or a test Postgres, and TestClient to call the endpoints without a server. With dependency_overrides I replace the database session and the authenticated user. I test the happy path and the errors: 422 validation, 401, 403 and 404. With parametrize I cover several cases without duplicating code, and I test the services' business rules with unit tests without HTTP.",
    "ex": [
      {
        "q": "How does a test receive a fixture called `client`?",
        "opts": [
          "With an import",
          "By declaring a parameter called client",
          "With the @use(\"client\") decorator",
          "By calling client()"
        ],
        "exp": "pytest injects the fixture by parameter name."
      },
      {
        "q": "What is `app.dependency_overrides` for?",
        "opts": [
          "Changing routes",
          "Replacing dependencies like the session or the current user in tests",
          "Disabling validation",
          "Caching responses"
        ],
        "exp": "It is the official mechanism for injecting test doubles."
      }
    ]
  },
  "openapi-y-despliegue": {
    "title": "Automatic OpenAPI and deployment with Uvicorn and Docker",
    "short": "OpenAPI, Uvicorn and Docker",
    "summary": "FastAPI generates an OpenAPI schema from routes, type hints and models, and serves it at /docs, /redoc and /openapi.json.",
    "def": "FastAPI generates an **OpenAPI** schema from routes, type hints and models, and serves it at `/docs` (Swagger UI), `/redoc` and `/openapi.json`. In production it runs on **Uvicorn**, an ASGI server; `fastapi run` uses it under the hood. The official documentation packages it in Docker with the `python:3.14` image.",
    "analogy": "OpenAPI is the restaurant menu that reprints itself every time you change a recipe.",
    "problem": "Hand-written documentation goes stale at the first change. In deployment, using dev mode or the shell form of CMD causes problems: unnecessary reloading and a shutdown that does not run the lifespan.",
    "badNote": "Dev mode in production, CMD in shell form (no clean shutdown) and localhost inside the container, which is the container itself.",
    "goodNote": "Exec form and the Compose service name as host.",
    "bridge": "`fastapi dev` vs `fastapi run` ≈ the development server (`vite dev`) vs serving the build. Uvicorn takes the place of Node's HTTP server. With `/openapi.json` you can generate the typed TypeScript client with openapi-generator and stop writing interfaces by hand.",
    "pitfalls": [
      "Using `localhost` for the DB inside Docker Compose: use the service name.",
      "Putting secrets in the image instead of environment variables.",
      "Leaving `/docs` public on an internal API without thinking about it.",
      "Several workers in one container when you already scale with replicas: the docs recommend one process per container in that case."
    ],
    "answer": "FastAPI generates OpenAPI automatically from the type hints and the Pydantic models, so Swagger always reflects the code and I can generate typed clients. For production I use fastapi run, which runs Uvicorn without reloading, inside a Docker container with CMD in exec form for a clean shutdown. Configuration arrives through environment variables, and with Docker Compose I bring up the API alongside PostgreSQL using the service name as host.",
    "ex": [
      {
        "q": "Inside Docker Compose, which host goes in DATABASE_URL to reach Postgres?",
        "opts": [
          "localhost",
          "127.0.0.1",
          "db (the service name)",
          "0.0.0.0"
        ],
        "exp": "Compose creates a network where each service is resolved by its name."
      },
      {
        "q": "What sets `fastapi run` apart from `fastapi dev`?",
        "opts": [
          "None",
          "run is for production: no reloading and listens on 0.0.0.0",
          "run does not use Uvicorn",
          "dev does not generate /docs"
        ],
        "exp": "dev reloads on save and listens on 127.0.0.1; run is meant for production."
      }
    ]
  }
}
