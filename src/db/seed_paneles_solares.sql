-- ============================================================================
-- Datos de ejemplo (seed) — Catálogo de paneles solares — ZenithWeb
-- ----------------------------------------------------------------------------
-- Inserta categorías y productos reales del rubro solar.
-- Es IDEMPOTENTE: si una categoría/producto ya existe (por nombre, sin distinguir
-- mayúsculas), no la vuelve a insertar. Se puede correr varias veces sin duplicar.
--
-- Ejecutar:  psql -U postgres -d control_stock -f src/db/seed_paneles_solares.sql
-- ============================================================================
SET client_encoding TO 'UTF8';

-- ---------- Categorías ----------
INSERT INTO categoria (descripcion, estado)
SELECT v.descripcion, true
FROM (VALUES
    ('Paneles Monocristalinos'),
    ('Paneles Policristalinos'),
    ('Inversores'),
    ('Baterías'),
    ('Controladores de Carga'),
    ('Estructuras de Montaje'),
    ('Cables y Conectores')
) AS v(descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM categoria c WHERE LOWER(c.descripcion) = LOWER(v.descripcion)
);

-- ---------- Productos ----------
-- La categoría se resuelve por su descripción, así el script no depende de IDs fijos.
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
    ('Panel Monocristalino 450W',      'Panel solar monocristalino de 450W, alta eficiencia',        'Paneles Monocristalinos', 40,  85000, 120000),
    ('Panel Monocristalino 550W',      'Panel solar monocristalino de 550W, 144 celdas',             'Paneles Monocristalinos', 30, 110000, 155000),
    ('Panel Monocristalino 600W',      'Panel solar monocristalino de 600W, uso industrial',         'Paneles Monocristalinos', 18, 130000, 180000),
    ('Panel Policristalino 330W',      'Panel solar policristalino de 330W',                         'Paneles Policristalinos', 50,  60000,  90000),
    ('Panel Policristalino 400W',      'Panel solar policristalino de 400W',                         'Paneles Policristalinos', 35,  75000, 105000),
    ('Inversor On-Grid 5kW',           'Inversor de conexión a red de 5kW',                          'Inversores',              12, 250000, 340000),
    ('Inversor Híbrido 3kW',           'Inversor híbrido 3kW con entrada para baterías',             'Inversores',              15, 180000, 250000),
    ('Microinversor 600W',             'Microinversor para 1 o 2 paneles, 600W',                     'Inversores',              25,  70000,  99000),
    ('Batería de Litio 48V 100Ah',     'Batería LiFePO4 48V 100Ah para respaldo',                    'Baterías',                10, 400000, 560000),
    ('Batería Gel 12V 200Ah',          'Batería de gel 12V 200Ah de ciclo profundo',                 'Baterías',                20, 120000, 165000),
    ('Controlador MPPT 60A',           'Controlador de carga solar MPPT 60A',                        'Controladores de Carga',  22,  65000,  95000),
    ('Controlador PWM 30A',            'Controlador de carga solar PWM 30A',                         'Controladores de Carga',  40,  18000,  28000),
    ('Estructura Aluminio 4 Paneles',  'Estructura de aluminio para montaje de 4 paneles',           'Estructuras de Montaje',  30,  45000,  70000),
    ('Riel de Montaje 2.2m',           'Riel de aluminio de 2.2m para montaje de paneles',           'Estructuras de Montaje', 100,   8000,  13000),
    ('Cable Solar 6mm Rollo 100m',     'Cable solar 6mm² en rollo de 100 metros',                    'Cables y Conectores',     25,  55000,  80000),
    ('Conector MC4 Par',               'Par de conectores MC4 macho y hembra',                       'Cables y Conectores',    200,   1500,   3000)
) AS v(nombre, descripcion, categoria, stock, precio_compra, precio_venta)
WHERE NOT EXISTS (
    SELECT 1 FROM producto p WHERE LOWER(p.nombre) = LOWER(v.nombre)
);
