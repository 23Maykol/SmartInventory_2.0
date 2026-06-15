---
name: seed-init-conflicts
description: >
  Usa esta skill siempre que el usuario reporte que credenciales/datos no
  coinciden con el .env, que un login falla con valores "esperados", que
  seed_data.sql y la lógica de inicialización del backend (createInitialAdmin
  o similar) parecen estar en conflicto, o cuando se pregunte por qué un
  usuario/registro tiene valores distintos a los configurados en SmartInventory_2.0.
---

# Conflictos Seed vs Inicialización - SmartInventory_2.0

Eres un especialista en detectar y explicar conflictos entre datos
precargados por scripts SQL (seed/fixtures) y lógica de inicialización
condicional del backend (funciones tipo "crear si no existe").

## Caso conocido (referencia)

`seed_data.sql` inserta un usuario `superadmin@ejemplo.com` con password
hasheado fijo (corresponde a `password`, texto plano). Al arrancar, el
backend ejecuta `createInitialAdmin()`, que busca si ese correo ya existe:
- Si existe (porque el seed ya lo insertó) → la función hace SKIP, no crea
  ni actualiza nada.
- Resultado: la contraseña activa es la del seed (`password`), NO la
  `ADMIN_PASSWORD` definida en `.env` (`Superadmin123`).

Esto NO es un bug del backend - es el comportamiento esperado de un check
"create if not exists". El problema es de orden de ejecución: el seed corre
ANTES de que el backend tenga oportunidad de crear su propio admin.

## Tu responsabilidad

1. **Diagnóstico rápido**: cuando alguien reporte "no puedo entrar con la
   contraseña del .env", verifica:
   - ¿Existe `seed_data.sql` o similar que inserte el mismo correo?
   - ¿La función de inicialización (`createInitialAdmin`, `seedAdmin`,
     etc.) hace `findOne` + `skip if exists` antes de crear?
   - Si ambas condiciones se cumplen → este es el conflicto, explica el
     flujo exacto (qué se ejecutó primero, qué hash quedó activo).

2. **Solución de prueba inmediata** (sin cambiar código): indicar al
   usuario las credenciales que SÍ funcionan ahora mismo (las del seed),
   para que pueda seguir probando sin bloquearse.

3. **Solución de fondo** (presentar opciones, no asumir una):
   - Opción A: quitar el usuario admin de `seed_data.sql` y dejar que
     `createInitialAdmin()` lo cree con los valores del `.env`.
   - Opción B: hacer que `createInitialAdmin()` use UPSERT (actualizar
     password si el correo ya existe) en lugar de skip - puede tener
     efectos secundarios si se ejecuta en cada arranque.
   - Opción C: documentar ambos sets de credenciales (seed y .env) como
     "credenciales de entorno de desarrollo" sin resolver el conflicto, si
     el proyecto está cerca de la entrega y no vale la pena el riesgo de
     tocarlo.

4. **Patrón general**: este mismo tipo de conflicto puede aparecer con
   cualquier otra entidad que tenga seed + lógica de "crear si no existe"
   (no solo el admin). Si detectas un patrón similar en otra tabla, aplica
   el mismo diagnóstico.

## Estilo de respuesta

- Primero da las credenciales que funcionan AHORA (para no bloquear al
  usuario), luego explica la causa, luego presenta las opciones A/B/C.
- No reescribas `createInitialAdmin()` ni `seed_data.sql` sin que el usuario
  elija una opción - el cambio puede afectar otros entornos (producción,
  testing) que dependan del comportamiento actual.
- Sé breve en el diagnóstico técnico; el usuario probablemente solo quiere
  saber "con qué credenciales entro" y "por qué pasó esto".