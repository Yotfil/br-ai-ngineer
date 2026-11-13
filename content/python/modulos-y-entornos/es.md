---
title: Módulos, paquetes, entornos virtuales y dependencias
short: Módulos, venv y uv
summary: Un módulo es un archivo .py; un paquete es una carpeta de módulos, normalmente con __init__.py.
concepts:
  modulo:
    name: módulo
    aliases:
      - module
  paquete:
    name: paquete
    aliases:
      - package
  entorno-virtual:
    name: entorno virtual
    aliases:
      - virtual environment
      - venv
      - virtualenv
  uv:
    name: uv
    aliases: []
exercises:
  - type: choice
    prompt: Pregunta rápida
    items:
      - q: ¿Qué archivo cumple el papel de `package-lock.json` con uv?
        options:
          - pyproject.toml
          - requirements.txt
          - uv.lock
          - .python-version
        answer: 2
        why: "`uv.lock` fija las versiones exactas de todo el árbol de dependencias."
      - q: ¿Cuándo corre el código dentro de `if __name__ == "__main__":`?
        options:
          - Siempre
          - Cuando el archivo se ejecuta directamente, no cuando se importa
          - Solo en producción
          - Cuando se importa por primera vez
        answer: 1
        why: Al importar, `__name__` es el nombre del módulo; al ejecutarlo directo vale `"__main__"`.
---

## definition

Un **módulo** es un archivo `.py`; un **paquete** es una carpeta de módulos (normalmente con `__init__.py`). Un **entorno virtual** aísla el intérprete y las librerías de cada proyecto. La documentación actual de FastAPI usa **uv** por defecto, con `pyproject.toml` y `uv.lock`.

## analogy

El entorno virtual es la despensa propia de cada proyecto: no sacas ingredientes del mercado común ni le cambias la receta al vecino.

## problem

Sin entorno virtual, dos proyectos que necesitan versiones distintas de una librería se rompen entre sí, y lo que instalaste en el Python del sistema puede romper herramientas del Mac.

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

Instalación global y un import con asterisco que llena el espacio de nombres sin saber qué trae.

## good

```python
uv add "fastapi[standard]"
from app.utilidades import calcular_iva
```

Dependencia registrada en pyproject.toml y bloqueada en uv.lock; import explícito.

## bridge:typescript

`pyproject.toml` ≈ `package.json`; `uv.lock` ≈ `package-lock.json`; `.venv` ≈ `node_modules`, pero además contiene el intérprete; PyPI ≈ registro de npm; `uv run` ≈ `npx`/`npm run`. Diferencia clave: Node busca `node_modules` solo; Python usa el entorno que esté activo, o el que `uv run` active por ti.

## interview

Cada archivo .py es un módulo y una carpeta de módulos es un paquete. Aíslo cada proyecto en un entorno virtual para que sus dependencias no choquen con otros proyectos ni con el sistema. Hoy uso uv: declara dependencias en pyproject.toml y fija versiones exactas en uv.lock, igual que package.json y el lockfile en Node. El bloque if name igual a main permite que un módulo sea importable y ejecutable a la vez.

## myths

- Instalar sin activar el venv y luego no encontrar el paquete.
- Llamar a tu archivo `fastapi.py` o `json.py`: tapa la librería real al importar.
- Imports circulares entre módulos (A importa B y B importa A).
- Commitear la carpeta `.venv` al repo.
