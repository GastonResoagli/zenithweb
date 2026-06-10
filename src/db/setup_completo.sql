-- ============================================================================
-- SETUP COMPLETO — ZenithWeb — Base de datos de cero (Supabase / PostgreSQL)
-- ----------------------------------------------------------------------------
-- Junta los 5 pasos en orden, para correr TODO de una sola vez:
--   1) Tablas (schema)
--   2) Tabla registro_inventario
--   3) Funciones y procedimientos (registrar_venta, etc.)
--   4) Restricciones de unicidad
--   5) Reset + datos de ejemplo (categorías, productos, ventas)
--
-- Ejecutar:  psql "<DATABASE_URL>" -f src/db/setup_completo.sql
--            (o pegar entero en el SQL Editor de Supabase y Run)
--
-- Es seguro re-ejecutarlo: las tablas/funciones usan IF NOT EXISTS / OR REPLACE
-- y el paso 5 limpia y vuelve a cargar los datos.
-- ============================================================================
SET client_encoding TO 'UTF8';


-- ############################################################################
-- PASO 1 — TABLAS
-- ############################################################################

CREATE TABLE IF NOT EXISTS rol (
    id_rol         SERIAL PRIMARY KEY,
    descripcion    VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario      SERIAL PRIMARY KEY,
    documento       VARCHAR(20),
    nombre_completo VARCHAR(100),
    correo          VARCHAR(100),
    clave           TEXT,
    id_rol          INTEGER REFERENCES rol(id_rol),
    estado          BOOLEAN,
    rol             VARCHAR(20) NOT NULL DEFAULT 'vendedor'
);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    descripcion  VARCHAR(100),
    estado       BOOLEAN
);

CREATE TABLE IF NOT EXISTS producto (
    id_producto   SERIAL PRIMARY KEY,
    codigo        VARCHAR(50),
    nombre        VARCHAR(100),
    descripcion   TEXT,
    id_categoria  INTEGER REFERENCES categoria(id_categoria),
    stock         INTEGER,
    precio_compra NUMERIC(10,2),
    precio_venta  NUMERIC(10,2),
    estado        BOOLEAN
);

CREATE TABLE IF NOT EXISTS venta (
    id_venta          SERIAL PRIMARY KEY,
    id_usuario        INTEGER REFERENCES usuario(id_usuario),
    tipo_documento    VARCHAR(50),
    documento_cliente VARCHAR(20),
    nombre_cliente    VARCHAR(100),
    monto_pago        NUMERIC(10,2),
    monto_cambio      NUMERIC(10,2),
    monto_total       NUMERIC(10,2),
    fecha             TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle_venta SERIAL PRIMARY KEY,
    id_venta         INTEGER REFERENCES venta(id_venta),
    id_producto      INTEGER REFERENCES producto(id_producto),
    precio_venta     NUMERIC(10,2),
    cantidad         INTEGER,
    subtotal         NUMERIC(10,2),
    fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente SERIAL PRIMARY KEY,
    dni        VARCHAR(20),
    nombre     VARCHAR(100),
    correo     VARCHAR(100),
    telefono   VARCHAR(20),
    estado     BOOLEAN
);

CREATE TABLE IF NOT EXISTS permiso (
    id_permiso  SERIAL PRIMARY KEY,
    id_rol      INTEGER REFERENCES rol(id_rol),
    nombre_menu VARCHAR(100)
);


-- ############################################################################
-- PASO 2 — TABLA registro_inventario
-- ############################################################################

CREATE TABLE IF NOT EXISTS registro_inventario (
    id_registro   SERIAL PRIMARY KEY,
    id_producto   INTEGER NOT NULL REFERENCES producto(id_producto),
    tipo          VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    cantidad      INTEGER NOT NULL CHECK (cantidad > 0),
    precio_compra NUMERIC(10,2),
    total         NUMERIC(10,2),
    id_venta      INTEGER REFERENCES venta(id_venta),
    id_usuario    INTEGER NOT NULL REFERENCES usuario(id_usuario),
    fecha         TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ############################################################################
-- PASO 3 — FUNCIONES Y PROCEDIMIENTOS (PL/pgSQL)
-- ############################################################################

-- 1) descontar_stock(id_producto, cantidad) -> stock resultante
CREATE OR REPLACE FUNCTION descontar_stock(p_id_producto INT, p_cantidad INT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock INTEGER;
BEGIN
    UPDATE producto
       SET stock = stock - p_cantidad
     WHERE id_producto = p_id_producto
    RETURNING stock INTO v_stock;

    IF v_stock IS NULL THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    IF v_stock < 0 THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %', p_id_producto;
    END IF;

    RETURN v_stock;
END;
$$;

-- 2) dar_baja_producto(id_producto) -> id_producto dado de baja (baja lógica)
CREATE OR REPLACE FUNCTION dar_baja_producto(p_id_producto INT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id INTEGER;
BEGIN
    UPDATE producto
       SET estado = false
     WHERE id_producto = p_id_producto
    RETURNING id_producto INTO v_id;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    RETURN v_id;
END;
$$;

-- 3) registrar_entrada(id_producto, cantidad, precio_compra, id_usuario)
CREATE OR REPLACE PROCEDURE registrar_entrada(
    p_id_producto   INT,
    p_cantidad      INT,
    p_precio_compra NUMERIC,
    p_id_usuario    INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE producto
       SET stock = stock + p_cantidad
     WHERE id_producto = p_id_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    INSERT INTO registro_inventario
        (id_producto, tipo, cantidad, precio_compra, total, id_usuario, fecha)
    VALUES
        (p_id_producto, 'entrada', p_cantidad, p_precio_compra,
         p_cantidad * p_precio_compra, p_id_usuario, NOW());
END;
$$;

-- 4) registrar_venta(datos_venta JSONB, detalles JSONB) -> id_venta
CREATE OR REPLACE FUNCTION registrar_venta(p_venta JSONB, p_detalles JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta   INTEGER;
    v_id_usuario INTEGER := (p_venta->>'id_usuario')::INT;
    detalle      JSONB;
    v_id_prod    INTEGER;
    v_cantidad   INTEGER;
    v_precio     NUMERIC;
    v_subtotal   NUMERIC;
BEGIN
    INSERT INTO venta
        (id_usuario, tipo_documento, documento_cliente, nombre_cliente,
         monto_pago, monto_cambio, monto_total, fecha)
    VALUES
        (v_id_usuario,
         p_venta->>'tipo_documento',
         p_venta->>'documento_cliente',
         p_venta->>'nombre_cliente',
         (p_venta->>'monto_pago')::NUMERIC,
         (p_venta->>'monto_cambio')::NUMERIC,
         (p_venta->>'monto_total')::NUMERIC,
         NOW())
    RETURNING id_venta INTO v_id_venta;

    FOR detalle IN SELECT * FROM jsonb_array_elements(p_detalles)
    LOOP
        v_id_prod  := (detalle->>'id_producto')::INT;
        v_cantidad := (detalle->>'cantidad')::INT;
        v_precio   := (detalle->>'precio_venta')::NUMERIC;
        v_subtotal := v_precio * v_cantidad;

        INSERT INTO detalle_venta
            (id_venta, id_producto, precio_venta, cantidad, subtotal, fecha_registro)
        VALUES
            (v_id_venta, v_id_prod, v_precio, v_cantidad, v_subtotal, NOW());

        PERFORM descontar_stock(v_id_prod, v_cantidad);

        INSERT INTO registro_inventario
            (id_producto, tipo, cantidad, total, id_venta, id_usuario, fecha)
        VALUES
            (v_id_prod, 'salida', v_cantidad, v_subtotal, v_id_venta, v_id_usuario, NOW());
    END LOOP;

    RETURN v_id_venta;
END;
$$;


-- ############################################################################
-- PASO 4 — RESTRICCIONES DE UNICIDAD (case-insensitive)
-- ############################################################################

CREATE UNIQUE INDEX IF NOT EXISTS ux_categoria_descripcion
    ON categoria (LOWER(descripcion));

CREATE UNIQUE INDEX IF NOT EXISTS ux_producto_nombre
    ON producto (LOWER(nombre));


-- ############################################################################
-- PASO 5 — RESET + DATOS DE EJEMPLO
-- ############################################################################

BEGIN;

-- 5.1) Limpieza (orden por FKs; RESTART IDENTITY reinicia los contadores)
TRUNCATE detalle_venta, registro_inventario, venta, producto, categoria
    RESTART IDENTITY CASCADE;

-- 5.2) Usuarios (red de seguridad: solo se cargan si no existen por correo)
INSERT INTO usuario (documento, nombre_completo, correo, clave, estado, rol)
SELECT v.documento, v.nombre_completo, v.correo, v.clave, v.estado, v.rol
FROM (VALUES
    ('00000001', 'Admin',    'admin@zenith.com',    'admin123',    true, 'vendedor'),
    (NULL,       'Gerente',  'gerente@zenith.com',  'gerente123',  true, 'gerente'),
    (NULL,       'Operador', 'operador@zenith.com', 'operador123', true, 'operador_stock'),
    (NULL,       'Vendedor', 'vendedor@zenith.com', 'vendedor123', true, 'vendedor')
) AS v(documento, nombre_completo, correo, clave, estado, rol)
WHERE NOT EXISTS (SELECT 1 FROM usuario u WHERE u.correo = v.correo);

-- 5.3) Categorías
INSERT INTO categoria (descripcion, estado) VALUES
    ('Paneles Monocristalinos', true),
    ('Paneles Policristalinos', true),
    ('Inversores',              true),
    ('Baterías',                true),
    ('Controladores de Carga',  true),
    ('Estructuras de Montaje',  true),
    ('Cables y Conectores',     true);

-- 5.4) Productos (categoría resuelta por descripción)
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

-- 5.5) Ventas (usan registrar_venta: descuentan stock y registran inventario)
-- Venta 1 — Admin — Factura — 580.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'admin@zenith.com'),
        'tipo_documento',    'Factura',
        'documento_cliente', '20-12345678-9',
        'nombre_cliente',    'Juan Perez',
        'monto_pago',        600000, 'monto_cambio', 20000, 'monto_total', 580000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Panel Monocristalino 450W'), 'cantidad', 2, 'precio_venta', 120000),
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Inversor On-Grid 5kW'),      'cantidad', 1, 'precio_venta', 340000)
    )
);

-- Venta 2 — Vendedor — Boleta — 455.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'vendedor@zenith.com'),
        'tipo_documento',    'Boleta',
        'documento_cliente', '27-98765432-1',
        'nombre_cliente',    'Maria Gomez',
        'monto_pago',        455000, 'monto_cambio', 0, 'monto_total', 455000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Panel Policristalino 330W'), 'cantidad', 4, 'precio_venta', 90000),
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Controlador MPPT 60A'),      'cantidad', 1, 'precio_venta', 95000)
    )
);

-- Venta 3 — Gerente — Factura — 566.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'gerente@zenith.com'),
        'tipo_documento',    'Factura',
        'documento_cliente', '20-11222333-4',
        'nombre_cliente',    'Carlos Ruiz',
        'monto_pago',        600000, 'monto_cambio', 34000, 'monto_total', 566000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Batería de Litio 48V 100Ah'), 'cantidad', 1, 'precio_venta', 560000),
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Conector MC4 Par'),           'cantidad', 2, 'precio_venta',   3000)
    )
);

-- Venta 4 — Vendedor — Boleta — 465.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'vendedor@zenith.com'),
        'tipo_documento',    'Boleta',
        'documento_cliente', '23-44556677-8',
        'nombre_cliente',    'Lucia Fernandez',
        'monto_pago',        465000, 'monto_cambio', 0, 'monto_total', 465000
    ),
    jsonb_build_array(
        jsonb_build_object('id_producto', (SELECT id_producto FROM producto WHERE nombre = 'Panel Monocristalino 550W'), 'cantidad', 3, 'precio_venta', 155000)
    )
);

-- Venta 5 — Admin — Factura — 521.000
SELECT registrar_venta(
    jsonb_build_object(
        'id_usuario',        (SELECT id_usuario FROM usuario WHERE correo = 'admin@zenith.com'),
        'tipo_documento',    'Factura',
        'documento_cliente', '30-55667788-9',
        'nombre_cliente',    'Energia Solar SRL',
        'monto_pago',        521000, 'monto_cambio', 0, 'monto_total', 521000
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
-- ----------------------------------------------------------------------------
