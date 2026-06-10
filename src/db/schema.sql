-- ============================================================================
-- ESQUEMA DE TABLAS — ZenithWeb (extraído de backup.sql, limpio para Supabase)
-- ----------------------------------------------------------------------------
-- Crea todas las tablas con sus claves primarias y foráneas, en el orden
-- correcto de dependencias. Usa SERIAL (autoincremental) en vez de las
-- secuencias manuales del dump, y omite los "OWNER TO postgres".
--
-- Es el PASO 1 del setup de base de datos. Después correr, en este orden:
--   2) src/db/crear_registro_inventario.sql
--   3) src/db/funciones.sql
--   4) src/db/constraints_unicidad.sql
--   5) src/db/reset_y_seed.sql
--
-- Ejecutar:  psql "<DATABASE_URL>" -f src/db/schema.sql
--            (o pegar en el SQL Editor de Supabase)
-- ============================================================================
SET client_encoding TO 'UTF8';

-- ---------- rol ----------
CREATE TABLE IF NOT EXISTS rol (
    id_rol         SERIAL PRIMARY KEY,
    descripcion    VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- usuario ----------
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

-- ---------- categoria ----------
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    descripcion  VARCHAR(100),
    estado       BOOLEAN
);

-- ---------- producto ----------
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

-- ---------- venta ----------
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

-- ---------- detalle_venta ----------
CREATE TABLE IF NOT EXISTS detalle_venta (
    id_detalle_venta SERIAL PRIMARY KEY,
    id_venta         INTEGER REFERENCES venta(id_venta),
    id_producto      INTEGER REFERENCES producto(id_producto),
    precio_venta     NUMERIC(10,2),
    cantidad         INTEGER,
    subtotal         NUMERIC(10,2),
    fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- cliente ----------
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente SERIAL PRIMARY KEY,
    dni        VARCHAR(20),
    nombre     VARCHAR(100),
    correo     VARCHAR(100),
    telefono   VARCHAR(20),
    estado     BOOLEAN
);

-- ---------- permiso ----------
CREATE TABLE IF NOT EXISTS permiso (
    id_permiso  SERIAL PRIMARY KEY,
    id_rol      INTEGER REFERENCES rol(id_rol),
    nombre_menu VARCHAR(100)
);
