-- ============================================================================
-- RESET + SEED — Categorías, Productos y Ventas — ZenithWeb
-- ----------------------------------------------------------------------------
-- Limpia el contenido de categoria, producto y venta (con sus tablas
-- dependientes) y carga datos nuevos y CONSISTENTES para no tener errores.
--
-- Requisitos previos (correr UNA vez antes que este script):
--   1) Esquema de tablas creado (categoria, producto, venta, detalle_venta,
--      usuario, registro_inventario).
--   2) src/db/funciones.sql        (define registrar_venta, usada acá abajo)
--   3) src/db/constraints_unicidad.sql (índices únicos de nombre/descripcion)
--
-- Ejecutar (Supabase: pegar en el SQL Editor / o por psql):
--   psql "<DATABASE_URL>" -f src/db/reset_y_seed.sql
--
-- ADVERTENCIA: borra TODAS las ventas, productos y categorías existentes.
-- NO toca usuarios (solo los crea si la tabla está vacía, como red de seguridad).
-- ============================================================================
SET client_encoding TO 'UTF8';

BEGIN;

-- ----------------------------------------------------------------------------
-- 1) LIMPIEZA
-- Se truncan en bloque por las claves foráneas. RESTART IDENTITY reinicia los
-- contadores (los IDs vuelven a empezar en 1). CASCADE incluye dependientes.
-- ----------------------------------------------------------------------------
TRUNCATE detalle_venta, registro_inventario, venta, producto, categoria
    RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 2) USUARIOS (red de seguridad)
-- Las ventas necesitan un id_usuario válido. Si la tabla usuario quedó vacía,
-- se cargan los 4 usuarios estándar. Si ya existen, no se insertan de nuevo.
-- ----------------------------------------------------------------------------
INSERT INTO usuario (documento, nombre_completo, correo, clave, estado, rol)
SELECT v.documento, v.nombre_completo, v.correo, v.clave, v.estado, v.rol
FROM (VALUES
    ('00000001', 'Admin',    'admin@zenith.com',    'admin123',    true, 'vendedor'),
    (NULL,       'Gerente',  'gerente@zenith.com',  'gerente123',  true, 'gerente'),
    (NULL,       'Operador', 'operador@zenith.com', 'operador123', true, 'operador_stock'),
    (NULL,       'Vendedor', 'vendedor@zenith.com', 'vendedor123', true, 'vendedor')
) AS v(documento, nombre_completo, correo, clave, estado, rol)
WHERE NOT EXISTS (SELECT 1 FROM usuario u WHERE u.correo = v.correo);

-- ----------------------------------------------------------------------------
-- 3) CATEGORÍAS
-- ----------------------------------------------------------------------------
INSERT INTO categoria (descripcion, estado) VALUES
    ('Paneles Monocristalinos', true),
    ('Paneles Policristalinos', true),
    ('Inversores',              true),
    ('Baterías',                true),
    ('Controladores de Carga',  true),
    ('Estructuras de Montaje',  true),
    ('Cables y Conectores',     true);

-- ----------------------------------------------------------------------------
-- 4) PRODUCTOS
-- La categoría se resuelve por su descripción (no depende de IDs fijos).
-- ----------------------------------------------------------------------------
INSERT INTO producto (nombre, descripcion, id_categoria, stock, precio_compra, precio_venta, estado)
SELECT
    v.nombre,
    v.descripcion,
    (SELECT id_categoria FROM categoria c WHERE LOWER(c.descripcion) = LOWER(v.categoria)),
    v.stock,
    v.precio_compra,
    v.precio_venta,
    true
FROM (VALUES
    -- nombre, descripcion, categoria, stock, precio_compra, precio_venta
    ('Panel Monocristalino 450W',     'Panel solar monocristalino de 450W, alta eficiencia', 'Paneles Monocristalinos', 40,  85000, 120000),
    ('Panel Monocristalino 550W',     'Panel solar monocristalino de 550W, 144 celdas',      'Paneles Monocristalinos', 30, 110000, 155000),
    ('Panel Monocristalino 600W',     'Panel solar monocristalino de 600W, uso industrial',  'Paneles Monocristalinos', 18, 130000, 180000),
    ('Panel Policristalino 330W',     'Panel solar policristalino de 330W',                  'Paneles Policristalinos', 50,  60000,  90000),
    ('Panel Policristalino 400W',     'Panel solar policristalino de 400W',                  'Paneles Policristalinos', 35,  75000, 105000),
    ('Inversor On-Grid 5kW',          'Inversor de conexión a red de 5kW',                   'Inversores',              12, 250000, 340000),
    ('Inversor Híbrido 3kW',          'Inversor híbrido 3kW con entrada para baterías',      'Inversores',              15, 180000, 250000),
    ('Microinversor 600W',            'Microinversor para 1 o 2 paneles, 600W',              'Inversores',              25,  70000,  99000),
    ('Batería de Litio 48V 100Ah',    'Batería LiFePO4 48V 100Ah para respaldo',             'Baterías',                10, 400000, 560000),
    ('Batería Gel 12V 200Ah',         'Batería de gel 12V 200Ah de ciclo profundo',          'Baterías',                20, 120000, 165000),
    ('Controlador MPPT 60A',          'Controlador de carga solar MPPT 60A',                 'Controladores de Carga',  22,  65000,  95000),
    ('Controlador PWM 30A',           'Controlador de carga solar PWM 30A',                  'Controladores de Carga',  40,  18000,  28000),
    ('Estructura Aluminio 4 Paneles', 'Estructura de aluminio para montaje de 4 paneles',    'Estructuras de Montaje',  30,  45000,  70000),
    ('Riel de Montaje 2.2m',          'Riel de aluminio de 2.2m para montaje de paneles',    'Estructuras de Montaje', 100,   8000,  13000),
    ('Cable Solar 6mm Rollo 100m',    'Cable solar 6mm² en rollo de 100 metros',             'Cables y Conectores',     25,  55000,  80000),
    ('Conector MC4 Par',              'Par de conectores MC4 macho y hembra',                'Cables y Conectores',    200,   1500,   3000)
) AS v(nombre, descripcion, categoria, stock, precio_compra, precio_venta);

-- ----------------------------------------------------------------------------
-- 5) VENTAS
-- Se usan la función registrar_venta (de funciones.sql), que en una sola
-- operación atómica: crea la cabecera, inserta el detalle, DESCUENTA stock y
-- registra el movimiento de inventario 'salida'. Productos y usuario se
-- resuelven por nombre/correo (no se hardcodean IDs).
-- ----------------------------------------------------------------------------

-- Venta 1 — Admin — Factura — 2x Panel 450W + 1x Inversor On-Grid 5kW = 580.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'admin@zenith.com'),
        'tipo_documento',    'Factura',
        'documento_cliente', '20-12345678-9',
        'nombre_cliente',    'Juan Perez',
        'monto_pago',        600000,
        'monto_cambio',       20000,
        'monto_total',       580000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Panel Monocristalino 450W'), 'cantidad', 2, 'precio_venta', 120000),
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Inversor On-Grid 5kW'),      'cantidad', 1, 'precio_venta', 340000)
    )
);

-- Venta 2 — Vendedor — Boleta — 4x Panel Poli 330W + 1x Controlador MPPT 60A = 455.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'vendedor@zenith.com'),
        'tipo_documento',    'Boleta',
        'documento_cliente', '27-98765432-1',
        'nombre_cliente',    'Maria Gomez',
        'monto_pago',        455000,
        'monto_cambio',           0,
        'monto_total',       455000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Panel Policristalino 330W'), 'cantidad', 4, 'precio_venta', 90000),
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Controlador MPPT 60A'),      'cantidad', 1, 'precio_venta', 95000)
    )
);

-- Venta 3 — Gerente — Factura — 1x Batería Litio 48V + 2x Conector MC4 = 566.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'gerente@zenith.com'),
        'tipo_documento',    'Factura',
        'documento_cliente', '20-11222333-4',
        'nombre_cliente',    'Carlos Ruiz',
        'monto_pago',        600000,
        'monto_cambio',       34000,
        'monto_total',       566000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Batería de Litio 48V 100Ah'), 'cantidad', 1, 'precio_venta', 560000),
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Conector MC4 Par'),           'cantidad', 2, 'precio_venta',   3000)
    )
);

-- Venta 4 — Vendedor — Boleta — 3x Panel Mono 550W = 465.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'vendedor@zenith.com'),
        'tipo_documento',    'Boleta',
        'documento_cliente', '23-44556677-8',
        'nombre_cliente',    'Lucia Fernandez',
        'monto_pago',        465000,
        'monto_cambio',           0,
        'monto_total',       465000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Panel Monocristalino 550W'), 'cantidad', 3, 'precio_venta', 155000)
    )
);

-- Venta 5 — Admin — Factura — 5x Microinversor 600W + 2x Riel de Montaje = 521.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'admin@zenith.com'),
        'tipo_documento',    'Factura',
        'documento_cliente', '30-55667788-9',
        'nombre_cliente',    'Energia Solar SRL',
        'monto_pago',        521000,
        'monto_cambio',           0,
        'monto_total',       521000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Microinversor 600W'),  'cantidad', 5, 'precio_venta', 99000),
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Riel de Montaje 2.2m'), 'cantidad', 2, 'precio_venta', 13000)
    )
);

COMMIT;

-- ----------------------------------------------------------------------------
-- Verificación rápida (opcional):
--   SELECT COUNT(*) FROM categoria;  -- 7
--   SELECT COUNT(*) FROM producto;   -- 16
--   SELECT COUNT(*) FROM venta;      -- 5
--   SELECT nombre, stock FROM producto ORDER BY id_producto;  -- stock ya descontado
-- ----------------------------------------------------------------------------
