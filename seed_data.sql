-- Seed data masivo para SmartInventory 2.0
-- Ramas (Branches)
INSERT INTO branches (name, address, is_active) VALUES
('Central Principal', 'Av. Tecnológica 1000', 1),
('Sucursal Norte', 'Plaza Comercial Norte', 1),
('Almacén Sur', 'Zona Industrial 50', 1);


-- Productos (15 productos en 4 categorías)
INSERT INTO products (name, stock, price, category, description, traceable, is_active) VALUES
-- Electrónica (traceable)
('MacBook Pro M2 14"', 15, 1999.00, 'Electrónica', 'Laptop Apple', 1, 1),
('Dell XPS 13', 22, 1450.00, 'Electrónica', 'Laptop Dell de alto rendimiento', 1, 1),
('iPhone 14 Pro Max', 30, 1099.00, 'Electrónica', 'Smartphone Apple', 1, 1),
('Samsung Galaxy S23 Ultra', 25, 1199.00, 'Electrónica', 'Smartphone Samsung', 1, 1),
('Sony WH-1000XM5', 45, 348.00, 'Electrónica', 'Audífonos inalámbricos noise cancelling', 1, 1),
-- Accesorios (no traceable)
('Cable USB-C a Lightning 2m', 150, 19.99, 'Accesorios', 'Cable original trenzado', 0, 1),
('Hub USB-C multipuerto 7en1', 85, 45.00, 'Accesorios', 'Adaptador con HDMI, USB-A, SD', 0, 1),
('Mouse Inalámbrico Logitech MX Master 3S', 42, 99.99, 'Accesorios', 'Mouse ergonómico', 0, 1),
('Teclado Mecánico Keychron K2', 30, 89.00, 'Accesorios', 'Teclado Bluetooth RGB', 0, 1),
('Funda de silicona para iPhone', 200, 15.50, 'Accesorios', 'Fundas genéricas varios colores', 0, 1),
-- Mobiliario (no traceable)
('Silla Ergonómica Herman Miller', 4, 1200.00, 'Mobiliario', 'Silla de oficina premium', 0, 1),
('Escritorio Elevable Automático', 8, 450.00, 'Mobiliario', 'Standing desk motor dual', 0, 1),
-- Repuestos (no traceable)
('Batería de repuesto iPhone 14', 120, 25.00, 'Repuestos', 'Piezas de reparación', 0, 1),
('Pantalla OLED Samsung S23', 45, 150.00, 'Repuestos', 'Módulo de pantalla completo', 0, 1),
('Pasta térmica Arctic MX-4 4g', 300, 8.50, 'Repuestos', 'Pasta conductora para CPUs', 0, 1);

-- Generación masiva de movimientos (en el tiempo) utilizando los correos de los usuarios reales creados
-- Buscaremos dinámicamente el user_id correspondiente a los correos registrados:
-- 'maria@gmail.com', 'jose@gmail.com', 'rodrigo@gmail' y 'superadmin@ejemplo.com'

-- Mes 6 atrás (aprox 180 días)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(6, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 100, 'Compra masiva a proveedor', DATE_SUB(NOW(), INTERVAL 170 DAY)),
(7, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 50, 'Compra de inventario', DATE_SUB(NOW(), INTERVAL 165 DAY)),
(6, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 10, 'Venta cliente corporativo', DATE_SUB(NOW(), INTERVAL 160 DAY)),
(8, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'entrada', 20, 'Nuevos mouses recibidos', DATE_SUB(NOW(), INTERVAL 155 DAY));

-- Mes 5 atrás (aprox 150 días)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(15, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'entrada', 200, 'Pasta termica al por mayor', DATE_SUB(NOW(), INTERVAL 140 DAY)),
(15, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 20, 'Distribucion a tecnicos', DATE_SUB(NOW(), INTERVAL 135 DAY)),
(9, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 30, 'Lote de teclados Keychron', DATE_SUB(NOW(), INTERVAL 125 DAY));

-- Mes 4 atrás (aprox 120 días)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(11, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 10, 'Sillas para nueva oficina', DATE_SUB(NOW(), INTERVAL 115 DAY)),
(11, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 5, 'Entregadas a empleados', DATE_SUB(NOW(), INTERVAL 110 DAY)),
(10, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'entrada', 100, 'Lote fundas', DATE_SUB(NOW(), INTERVAL 105 DAY)),
(10, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 30, 'Ventas del mes', DATE_SUB(NOW(), INTERVAL 100 DAY));

-- Mes 3 atrás (aprox 90 días)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(12, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 15, 'Standing desks', DATE_SUB(NOW(), INTERVAL 85 DAY)),
(12, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 4, 'Venta directa', DATE_SUB(NOW(), INTERVAL 80 DAY)),
(13, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 100, 'Baterias repuesto', DATE_SUB(NOW(), INTERVAL 75 DAY)),
(14, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 50, 'Pantallas repuesto', DATE_SUB(NOW(), INTERVAL 70 DAY));

-- Mes 2 atrás (aprox 60 días)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(6, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 25, 'Cables vendidos', DATE_SUB(NOW(), INTERVAL 55 DAY)),
(7, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 15, 'Hubs vendidos', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(8, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 10, 'Mouses', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(9, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 5, 'Teclados', DATE_SUB(NOW(), INTERVAL 40 DAY)),
(10, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 40, 'Fundas rotacion rapida', DATE_SUB(NOW(), INTERVAL 35 DAY));

-- Últimos 30 días (Mes actual)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(13, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 15, 'Reparaciones locales', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(14, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 8, 'Cambios de pantalla', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(15, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 50, 'Mantenimiento preventivo', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 100, 'Restock cables', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(8, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 40, 'Restock mouses', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- Últimos 7 días (Alta actividad)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(6, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 5, 'Venta sucursal central', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(10, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 12, 'Accesorios', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(7, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 8, 'Hubs', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(13, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 10, 'Reparaciones', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(14, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 5, 'Pantallas', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(15, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 20, 'Pastas termicas usadas', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 4, 'Ventas mostrador', NOW());




-- MÁS PRODUCTOS (10 adicionales)
INSERT INTO products (name, stock, price, category, description, traceable, is_active) VALUES
-- Electrónica (traceable)
('iPad Pro 12.9"', 12, 1099.00, 'Electrónica', 'Tablet Apple', 1, 1),
('Monitor LG 27" 4K', 18, 350.00, 'Electrónica', 'Monitor IPS 4K', 1, 1),
('Smartwatch Garmin Fenix 7', 10, 699.00, 'Electrónica', 'Reloj deportivo GPS', 1, 1),
-- Accesorios (no traceable)
('Mochila para Laptop Targus', 60, 45.00, 'Accesorios', 'Mochila resistente al agua', 0, 1),
('Soporte para Monitor Doble', 25, 65.00, 'Accesorios', 'Brazo articulado doble', 0, 1),
('Disco Duro Externo 1TB WD', 40, 55.00, 'Accesorios', 'Almacenamiento portátil', 0, 1),
-- Mobiliario (no traceable)
('Archivero de Metal 3 Cajones', 5, 120.00, 'Mobiliario', 'Organizador de documentos', 0, 1),
('Lámpara de Escritorio LED', 35, 25.00, 'Mobiliario', 'Lámpara con ajuste de brillo', 0, 1),
-- Repuestos (no traceable)
('Memoria RAM 16GB DDR4 Corsair', 80, 40.00, 'Repuestos', 'Memoria para PC', 0, 1),
('SSD NVMe 1TB Samsung 980', 55, 85.00, 'Repuestos', 'Almacenamiento de alta velocidad', 0, 1);

-- MÁS MOVIMIENTOS (Asumiendo que los nuevos productos tienen IDs del 16 al 25)
-- Mes 1 atrás (aprox 30 días)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(16, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 15, 'Ingreso inicial iPads', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(17, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 20, 'Lote de monitores', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(19, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'entrada', 80, 'Mochilas stock', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(24, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 100, 'RAM repuestos', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(16, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 3, 'Venta iPads', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(17, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 2, 'Renovación oficina', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- Últimos 7 días para los productos nuevos
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(18, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 12, 'Relojes Garmin', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(21, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 50, 'Discos duros WD', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(19, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 15, 'Mochilas entregadas', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(24, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 20, 'Ensamblaje PCs', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(25, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 60, 'Lote SSD NVMe', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(25, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 5, 'Ventas repuestos', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(20, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 30, 'Soportes de monitor', NOW());


-- DENSIDAD ALTA PARA GRÁFICO DIARIO (Últimos 14 días)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(11, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 2, 'Venta mostrador', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(15, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 100, 'Reabastecimiento', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(16, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 1, 'Cliente corporativo', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(19, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 5, 'Venta sucursal', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(22, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 30, 'Lote archiveros', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(14, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 3, 'Reparaciones locales', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(7, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 10, 'Venta mostrador', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(6, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 50, 'Reabastecimiento urgente', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(18, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 2, 'Venta especial', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(23, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 8, 'Venta mayoreo', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(24, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 40, 'Lote memorias RAM', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(25, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 4, 'Venta mostrador', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(9, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 7, 'Venta corporativa', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(10, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 200, 'Fundas colores surtidos', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(13, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 6, 'Reparaciones locales', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(21, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 12, 'Venta sucursal', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(11, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 1, 'Mobiliario interno', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(12, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'entrada', 15, 'Standing desks', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(17, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 3, 'Venta monitores', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(20, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 5, 'Venta mostrador', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(22, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 2, 'Venta corporativa', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(23, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 60, 'Lámparas LED', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(15, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 30, 'Distribución técnicos', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(16, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 2, 'Venta iPads', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(19, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 8, 'Venta mochilas', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 150, 'Restock general', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 15, 'Venta mayoreo', NOW()),
(8, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 5, 'Venta mostrador', NOW());

-- DENSIDAD MEDIA PARA GRÁFICO SEMANAL/MENSUAL (Semanas 3 a 12)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, note, created_at) VALUES
(14, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 80, 'Pantallas OLED lote', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(18, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 4, 'Ventas especiales', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(20, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 40, 'Soportes de monitor', DATE_SUB(NOW(), INTERVAL 32 DAY)),
(24, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 15, 'Venta RAMs', DATE_SUB(NOW(), INTERVAL 38 DAY)),
(25, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 10, 'Venta SSDs', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(9, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 50, 'Teclados mecánicos', DATE_SUB(NOW(), INTERVAL 52 DAY)),
(10, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 60, 'Fundas masivo', DATE_SUB(NOW(), INTERVAL 65 DAY)),
(13, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'entrada', 120, 'Baterías repuesto', DATE_SUB(NOW(), INTERVAL 78 DAY)),
(21, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 20, 'Discos WD ventas', DATE_SUB(NOW(), INTERVAL 85 DAY)),
(22, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 20, 'Archiveros', DATE_SUB(NOW(), INTERVAL 92 DAY)),
(23, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 15, 'Lámparas ventas', DATE_SUB(NOW(), INTERVAL 105 DAY)),
(11, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 15, 'Sillas Herman Miller', DATE_SUB(NOW(), INTERVAL 112 DAY)),
(12, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'salida', 6, 'Standing desks', DATE_SUB(NOW(), INTERVAL 125 DAY)),
(16, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'entrada', 25, 'iPads Pro 12.9', DATE_SUB(NOW(), INTERVAL 138 DAY)),
(17, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'salida', 8, 'Monitores LG', DATE_SUB(NOW(), INTERVAL 145 DAY)),
(19, (SELECT id FROM users WHERE email LIKE 'jose@%' LIMIT 1), 'entrada', 100, 'Mochilas masivo', DATE_SUB(NOW(), INTERVAL 155 DAY)),
(24, (SELECT id FROM users WHERE email LIKE 'rodrigo@%' LIMIT 1), 'salida', 30, 'RAMs ventas', DATE_SUB(NOW(), INTERVAL 165 DAY)),
(25, (SELECT id FROM users WHERE email LIKE 'maria@%' LIMIT 1), 'entrada', 80, 'SSDs stock', DATE_SUB(NOW(), INTERVAL 175 DAY));

