---
title: Closures and lambdas
short: Closures and lambdas
summary: A closure is a function that remembers the variables of the place where it was created; a lambda, a one-line function without a name.
concepts:
  closure:
    name: closure
    aliases: []
  lambda:
    name: lambda
    aliases: []
---

## definition

A closure is a function that **remembers variables from the place where it was created**, even after that place has finished running. It appears when you define a function inside another one and the inner one uses a variable from the outer one.

A **lambda** is a function without a name that is written in one line, to pass it to another function: `lambda p: p["precio"]` receives `p` and returns its price.

## analogy

A backpack. When the inner function (the closure) leaves the outer function, it takes in its backpack the outer variables it uses. Every time you call it, it opens the backpack (the remembered variables) and finds them just as it left them.

## problem

Without closures, for a function to remember something between calls (a counter, a setting) you need a global variable or a class. With a closure, that piece of data stays stored inside the function and nobody else can touch it. Without lambdas, to sort products by price you would have to write, with `def` and with a name, a one-line function that you only use there.

## code:example

### Step 1. An inner function can read variables from the outer one

```python
def crear_saludo(nombre):
    def saludar():
        print(f"hello, {nombre}")   # nombre is not saludar's: it is crear_saludo's
    return saludar                  # I return the function, without calling it

saludo_ana = crear_saludo("Ana")    # crear_saludo has already finished...
saludo_ana()                        # ...but saludar still remembers "Ana"
# hello, Ana
```

### Step 2. Each closure has its own backpack

```python
saludo_ana = crear_saludo("Ana")
saludo_luis = crear_saludo("Luis")

saludo_ana()
# hello, Ana
saludo_luis()      # they do not get mixed up: each call to crear_saludo created its own nombre
# hello, Luis
```

### Step 3. To change the remembered variable you need `nonlocal`

Reading the outer variable works with no extra step. Assigning it a new value does not: Python thinks you are creating a different local variable. `nonlocal` tells it "I mean the outer one".

```python
def crear_contador():
    total = 0
    def siguiente():
        nonlocal total     # without this line: UnboundLocalError on the line below
        total += 1         # changes the total of crear_contador, not a new one
        return total
    return siguiente

contar = crear_contador()
print(contar())
# 1
print(contar())            # the total was kept between calls
# 2
```

### Step 4. A lambda is a one-line function, without a name

`lambda p: p["precio"]` does the same as a function with `def` that only has `return p["precio"]`. It is used mostly to pass a short function to another one, like the `key` of `sorted`, which says what to look at in each element to sort.

```python
productos = [
    {"nombre": "molinillo", "precio": 120000},
    {"nombre": "café", "precio": 38000},
    {"nombre": "taza", "precio": 25000},
]

baratos_primero = sorted(productos, key=lambda p: p["precio"])   # sorts by price
print([p["nombre"] for p in baratos_primero])
# ['taza', 'café', 'molinillo']
```

### Step 5. The loop trap

The closure remembers the **variable**, not the value it had when it was created. If the variable changes later, the closure sees the new value. It happens a lot with lambdas created in a loop.

```python
funciones = []
for numero in range(3):
    funciones.append(lambda: numero)   # all three remember the same variable "numero"

print([f() for f in funciones])        # when they are called, the loop has already finished and numero is 2
# [2, 2, 2]

funciones = []
for numero in range(3):
    funciones.append(lambda n=numero: n)   # n=numero copies the value at that moment

print([f() for f in funciones])
# [0, 1, 2]
```

`n=numero` is a default value ([[funciones-y-parametros]]): it is calculated once, when each lambda is created, and that is why it keeps the value of that turn of the loop.

### Step 6. In the project: a discount that remembers its percentage

In the store, a closure is useful for creating discounts: `crear_descuento(10)` returns a function that keeps the 10 in its backpack and applies it to any total.

```python
# app/pedidos/service.py
def crear_descuento(porcentaje: int):
    def aplicar(total: int) -> int:
        return total * (100 - porcentaje) // 100   # porcentaje comes from the backpack; // leaves an integer
    return aplicar
```

This is how it is used, with the price of the café:

```python
diez_por_ciento = crear_descuento(10)
print(diez_por_ciento(38000))
# 34200
```

`crear_descuento` runs once for each discount that is created; `aplicar`, every time the discount has to be taken off a total. The store's prices are whole numbers in pesos, and that is why `//` divides without leaving decimals.

## bad

```python
descuentos = {}
for porcentaje in [5, 10, 20]:
    descuentos[porcentaje] = lambda total: total * (100 - porcentaje) // 100

print(descuentos[5](38000))     # expected the café with 5 % off: 36100
# 30400
```

The three lambdas look at the same `porcentaje` variable, which is 20 when the loop ends: the "5 %" discount takes off 20 %. There is no error; it shows up when someone checks what was charged.

## good

```python
descuentos = {}
for porcentaje in [5, 10, 20]:
    descuentos[porcentaje] = lambda total, porcentaje=porcentaje: total * (100 - porcentaje) // 100

print(descuentos[5](38000))
# 36100
```

`porcentaje=porcentaje` copies the value of each turn of the loop into a default argument, as in step 5. The `crear_descuento(porcentaje)` from step 6 also works: each call has its own backpack.

## bridge:typescript

In TypeScript closures work the same way: a function remembers the variables of the place where it was created. The first difference: to reassign an outer variable, Python requires `nonlocal`; in TypeScript you just assign it. Python's lambda is much more limited than an arrow function: only one expression, no braces and no several lines. And the loop trap is the one of `var`: with `let` or `const` inside the loop, each TypeScript closure sees its own variable, while Python's loop uses a single one, like `var`.

## interview

A closure is a function that remembers the variables of the place where it was created, even after the outer function has finished; it appears when you define a function inside another one that uses its variables. It can read them with no extra step, but to reassign them it needs `nonlocal`, because otherwise Python treats them as local and raises `UnboundLocalError`. It remembers the variable, not its value: in a loop, all the functions see the last value, unless you copy it with a default argument. A lambda is a function without a name made of a single expression, useful as the `key` of `sorted`.

## myths

- **"The closure keeps a copy of the value."** It keeps the variable. That is why in step 5 the three functions return 2: they all look at the same variable, which ends up as 2.
- **"I can modify the outer variable with no extra step."** You can read it. As soon as you write `total += 1` without `nonlocal`, Python treats `total` as a local variable, sees that it has no value and raises `UnboundLocalError: cannot access local variable 'total' where it is not associated with a value`.
- **"A lambda is a special kind of function."** It is a normal function: `type(lambda: 0)` is the same class as that of any `def`. Only two things change: it has no name (if you ask for its name, `__name__`, it answers `'<lambda>'`) and its body is a single expression, with no statements such as `return` or an `if` block.
- **"A closure is something odd that is hardly ever used."** Every decorator is a closure: the wrapper (`envoltura` in the code) remembers `func`, which is a variable of the outer function. See [[decoradores]].
