---
title: Modules, packages, virtual environments and dependencies
short: Modules, venv and uv
summary: A module is a .py file; a package is a folder of modules, usually with __init__.py.
concepts:
  modulo:
    name: module
    aliases:
      - módulo
  paquete:
    name: package
    aliases:
      - paquete
  entorno-virtual:
    name: virtual environment
    aliases:
      - entorno virtual
      - venv
      - virtualenv
  uv:
    name: uv
    aliases: []
exercises:
  - type: choice
    prompt: Quick question
    items:
      - q: Which file plays the role of `package-lock.json` with uv?
        options:
          - pyproject.toml
          - requirements.txt
          - uv.lock
          - .python-version
        answer: 2
        why: "`uv.lock` pins the exact versions of the whole dependency tree."
      - q: When does the code inside `if __name__ == "__main__":` run?
        options:
          - Always
          - When the file is run directly, not when it's imported
          - Only in production
          - When it's imported for the first time
        answer: 1
        why: On import, `__name__` is the module's name; when run directly it's `"__main__"`.
---

## definition

A **module** is a `.py` file; a **package** is a folder of modules (usually with `__init__.py`). A **virtual environment** isolates each project's interpreter and libraries. The current FastAPI documentation uses **uv** by default, with `pyproject.toml` and `uv.lock`.

## analogy

The virtual environment is each project's own pantry: you don't take ingredients from the common market or change your neighbor's recipe.

## problem

Without a virtual environment, two projects that need different versions of a library break each other, and what you installed into the system Python can break Mac tools.

## code:example

```python
# Terminal (recomendado: uv)
uv init tienda-api && cd tienda-api
uv add "fastapi[standard]"
uv run fastapi dev app/main.py

# Alternativa clásica con venv + pip
python3 -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]"

# Estructura e imports
# app/
#   __init__.py
#   main.py
#   productos/
#     __init__.py
#     router.py
from app.productos.router import router as productos_router

if __name__ == "__main__":     # solo si ejecutas el archivo directamente
    print("modo script")
```

## bad

```python
sudo pip install fastapi
from utilidades import *
```

Global installation and a star import that fills the namespace without knowing what it brings in.

## good

```python
uv add "fastapi[standard]"
from app.utilidades import calcular_iva
```

Dependency recorded in pyproject.toml and locked in uv.lock; explicit import.

## bridge:typescript

`pyproject.toml` ≈ `package.json`; `uv.lock` ≈ `package-lock.json`; `.venv` ≈ `node_modules`, but it also contains the interpreter; PyPI ≈ npm registry; `uv run` ≈ `npx`/`npm run`. Key difference: Node finds `node_modules` on its own; Python uses whichever environment is active, or the one `uv run` activates for you.

## interview

Each .py file is a module and a folder of modules is a package. I isolate each project in a virtual environment so its dependencies don't clash with other projects or with the system. Today I use uv: it declares dependencies in pyproject.toml and pins exact versions in uv.lock, just like package.json and the lockfile in Node. The if name equals main block lets a module be both importable and executable.

## myths

- Installing without activating the venv and then not finding the package.
- Naming your file `fastapi.py` or `json.py`: it shadows the real library on import.
- Circular imports between modules (A imports B and B imports A).
- Committing the `.venv` folder to the repo.
