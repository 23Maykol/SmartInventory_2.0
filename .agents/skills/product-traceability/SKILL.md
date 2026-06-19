---
name: product-traceability
description: >
  Usa esta skill siempre que la tarea involucre identificadores únicos de
  producto, números de serie, códigos de barras, trazabilidad para
  devoluciones/reclamos, o el manejo de stock por unidad vs por cantidad
  agregada en SmartInventory_2.0.
---

# Trazabilidad de Producto para Devoluciones - SmartInventory_2.0

Eres responsable de garantizar que el sistema pueda identificar una unidad
específica de producto cuando un cliente la devuelve, tal como se acordó
con el cliente ("cada producto tiene su propio identificador... ejemplo:
auricular 202").

## Requisito real (lo único que importa)
Cuando alguien devuelve un producto, el sistema debe poder responder:
"¿qué unidad es esta, cuándo entró, y a qué movimiento de salida/despacho corresponde?"

## Enfoque: híbrido, no "todo por unidad"
NO conviertas todo el inventario a tracking individual - eso es
sobre-ingeniería para un proyecto de esta escala. En su lugar:

- Productos de bajo valor / sin serial de fábrica (cables, fundas,
  accesorios genéricos) → mantienen stock agregado simple (como ya existe
  en `products.stock`). NO se usa tracking individual para estos.
- Productos con serial/código de barras de fábrica (electrónica: audífonos,
  parlantes, dispositivos) → se captura ese código al momento de la entrada.
  Esto es CAPTURA, no GENERACIÓN: el identificador ya existe físicamente en
  el producto.

## Implementación mínima recomendada
1. Tabla nueva `product_units` (SOLO para productos de alto valor/con serial):
   - `id`, `product_id` (FK), `serial_code` VARCHAR UNIQUE NOT NULL,
     `status` ENUM('en_stock','vendido','devuelto'), `created_at`.
   - Para productos de bajo valor, NO insertes registros aquí. Simplemente 
     actualiza la columna `stock` en la tabla principal de productos.
2. Al registrar una "entrada" en `inventory_movements`, si el producto es de 
   la categoría con serial, exige capturarlo (input de texto / lector de barras USB, 
   que funciona como teclado normal - no requiere hardware especial).
3. Al registrar una "salida" (despacho de almacén) o devolución, exige buscar por `serial_code`
   para descontar la unidad exacta y vincularla a ese movimiento/venta.

## Lo que NO hacer
- No generes correlativos propios por defecto - usa el serial real del
  fabricante cuando exista.
- No fuerces `product_units` para TODOS los productos. Los productos baratos
  solo usan el stock agregado.
- No implementes impresión de etiquetas propias (fuera de alcance, requiere
  hardware adicional no mencionado por el cliente).

## Estilo de respuesta
- Si la tarea no aclara si el producto en cuestión tiene serial de fábrica,
  pregunta brevemente antes de decidir si aplica `product_units` o stock
  agregado simple.
- Implementa directamente (migraciones SQL + TypeScript) cuando el caso esté
  claro.
- Coordina con `scope-guard-movements`: una devolución es un tipo de
  movimiento que debe poder vincularse a `serial_code` cuando exista.