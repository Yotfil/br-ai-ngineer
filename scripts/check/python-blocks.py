"""Comprueba los bloques de código de un tema: líneas por bloque y, en Python, la salida real frente a la escrita.

Uso: python3 scripts/check/python-blocks.py content/python/decoradores/es.md [más archivos]

- Límite de líneas por bloque, contando todas (también las vacías y las de salida): 15; en `walkthrough`, 25.
- En `code:example` los bloques se ejecutan acumulados: cada paso ve lo definido en los anteriores.
  Los bloques de las demás secciones se ejecutan solos.
- Un bloque que importa de `app.`, FastAPI, SQLModel u otro paquete externo no se ejecuta: solo se revisa su sintaxis.
  Tampoco uno que no escribe salida y falla solo por un nombre de otro paso o del proyecto (NameError).
- La salida escrita son las líneas que empiezan en la columna 0 por "# ", salvo la ruta del archivo (`# app/...`).
  De un error se compara solo la última línea del traceback. Una aclaración final "   (...)" se ignora.
- Ejecuta con el mismo intérprete que lanza este script, en modo aislado (-I).
"""
import ast
import re
import subprocess
import sys

NO_EJECUTABLE = re.compile(
    r"^\s*(from|import)\s+(app\b|fastapi|sqlmodel|pydantic|sqlalchemy|starlette|httpx|alembic|jwt|pwdlib|passlib)",
    re.M,
)
RUTA = re.compile(r"# (app|tests|scripts|migrations)/")
LIMITE = {"walkthrough": 25}


def run(code: str) -> list[str]:
    r = subprocess.run([sys.executable, "-I", "-c", code], capture_output=True, text=True, timeout=20)
    out = r.stdout.rstrip("\n").split("\n") if r.stdout.strip() else []
    if r.returncode != 0 and r.stderr.strip():
        out.append(r.stderr.strip().split("\n")[-1])
    return out


def expected(lines: list[str]) -> list[str]:
    return [line[2:] for line in lines if line.startswith("# ") and not RUTA.match(line)]


def clean(xs: list[str]) -> list[str]:
    return [x.split("   (")[0].rstrip() for x in xs]


def body_of(path: str) -> str:
    text = open(path, encoding="utf-8").read()
    m = re.match(r"---\n.*?\n---\n", text, re.S)
    return text[m.end():] if m else text


def check(path: str) -> int:
    bad = 0
    for sec in re.split(r"^## ", body_of(path), flags=re.M)[1:]:
        name = sec.split("\n", 1)[0].strip()
        limit = LIMITE.get(name, 15)
        acc = ""
        for i, (lang, b) in enumerate(re.findall(r"^```(\w*)\n(.*?)^```", sec, re.S | re.M)):
            lines = b.rstrip("\n").split("\n")
            n = len(lines)
            flag = f"  <-- MÁS DE {limit}" if n > limit else ""
            bad += bool(flag)
            where = f"{path} {name} #{i}"
            if lang not in ("python", "py"):
                print(f"{where}: {lang or 'sin lenguaje'}, {n} líneas{flag}")
                continue
            if NO_EJECUTABLE.search(b):
                try:
                    ast.parse(b)
                    syntax = "sintaxis OK"
                except SyntaxError as e:
                    syntax = f"SINTAXIS MAL: {e}"
                    bad += 1
                print(f"{where}: {n} líneas, no ejecutable, {syntax}{flag}")
                continue
            if name == "code:example":
                before = run(acc) if acc else []
                acc += b + "\n"
                out = run(acc)[len(before):]
            else:
                out = run(b)
            exp = expected(lines)
            if not exp and out and out[-1].startswith("NameError"):
                ast.parse(b)
                print(f"{where}: {n} líneas, no ejecutable ({out[-1]}), sintaxis OK{flag}")
                continue
            ok = clean(out) == clean(exp)
            print(f"{where}: {n} líneas, salida {'OK' if ok else 'DISTINTA'}{flag}")
            if not ok:
                print(f"    real    = {out}\n    escrita = {exp}")
                bad += 1
    return bad


if __name__ == "__main__":
    print(f"python {sys.version.split()[0]}")
    total = sum(check(p) for p in sys.argv[1:])
    print("TODO OK" if total == 0 else f"{total} PROBLEMAS")
    sys.exit(1 if total else 0)
