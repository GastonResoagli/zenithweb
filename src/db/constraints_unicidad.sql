-- ============================================================================
-- Restricciones de UNICIDAD — ZenithWeb
-- ----------------------------------------------------------------------------
-- Evita productos y categorías duplicados a nivel BASE DE DATOS (garantía dura).
-- La comparación es CASE-INSENSITIVE: "Panel" y "panel" se consideran iguales.
--
-- Ejecutar:  psql -U <usuario> -d <base> -f src/db/constraints_unicidad.sql
--
-- IMPORTANTE: si ya hay duplicados cargados, el CREATE UNIQUE INDEX fallará.
-- Antes de ejecutar, detectá y resolvé los duplicados con estas consultas:
--
--   SELECT LOWER(descripcion) AS dup, COUNT(*) FROM categoria
--   GROUP BY LOWER(descripcion) HAVING COUNT(*) > 1;
--
--   SELECT LOWER(nombre) AS dup, COUNT(*) FROM producto
--   GROUP BY LOWER(nombre) HAVING COUNT(*) > 1;
-- ============================================================================

-- Una categoría no puede repetir su descripción
CREATE UNIQUE INDEX IF NOT EXISTS ux_categoria_descripcion
    ON categoria (LOWER(descripcion));

-- Un producto no puede repetir su nombre
CREATE UNIQUE INDEX IF NOT EXISTS ux_producto_nombre
    ON producto (LOWER(nombre));

-- Un cliente no puede repetir su documento (habilita buscar/crear por dni en la venta)
CREATE UNIQUE INDEX IF NOT EXISTS ux_cliente_dni
    ON cliente (dni);
