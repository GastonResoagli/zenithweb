-- ============================================================================
-- MIGRACIÓN — Integración de la tabla cliente — ZenithWeb
-- ----------------------------------------------------------------------------
-- Aplica la normalización de cliente sobre una base YA EXISTENTE, sin romper
-- nada (enfoque aditivo). Es idempotente: se puede correr más de una vez.
--
-- Ejecutar:  psql "<DATABASE_URL>" -f src/db/agregar_cliente.sql
-- ============================================================================
SET client_encoding TO 'UTF8';

-- 1) Relación venta -> cliente (columna opcional: no afecta las ventas existentes)
ALTER TABLE venta ADD COLUMN IF NOT EXISTS id_cliente INTEGER REFERENCES cliente(id_cliente);

-- 2) Un cliente no puede repetir su documento (permite buscar/crear por dni)
CREATE UNIQUE INDEX IF NOT EXISTS ux_cliente_dni ON cliente (dni);

-- 3) registrar_venta ahora resuelve (busca o crea) el cliente por su documento
CREATE OR REPLACE FUNCTION registrar_venta(p_venta JSONB, p_detalles JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta   INTEGER;
    v_id_usuario INTEGER := (p_venta->>'id_usuario')::INT;
    v_id_cliente INTEGER;
    v_dni        VARCHAR := NULLIF(p_venta->>'documento_cliente', '');
    detalle      JSONB;
    v_id_prod    INTEGER;
    v_cantidad   INTEGER;
    v_precio     NUMERIC;
    v_subtotal   NUMERIC;
BEGIN
    -- 0) resolver el cliente por documento: si no existe, se crea (todo dentro de la transaccion)
    IF v_dni IS NOT NULL THEN
        INSERT INTO cliente (dni, nombre, estado)
        VALUES (v_dni, p_venta->>'nombre_cliente', true)
        ON CONFLICT (dni) DO NOTHING;
        SELECT id_cliente INTO v_id_cliente FROM cliente WHERE dni = v_dni;
    END IF;

    -- 1) cabecera de la venta
    INSERT INTO venta
        (id_usuario, id_cliente, tipo_documento, documento_cliente, nombre_cliente,
         monto_pago, monto_cambio, monto_total, fecha)
    VALUES
        (v_id_usuario,
         v_id_cliente,
         p_venta->>'tipo_documento',
         p_venta->>'documento_cliente',
         p_venta->>'nombre_cliente',
         (p_venta->>'monto_pago')::NUMERIC,
         (p_venta->>'monto_cambio')::NUMERIC,
         (p_venta->>'monto_total')::NUMERIC,
         NOW())
    RETURNING id_venta INTO v_id_venta;

    -- 2) recorre cada renglon del detalle
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

-- ----------------------------------------------------------------------------
-- (Opcional) Backfill de ventas viejas: crea los clientes a partir del documento
-- ya guardado en venta y completa el id_cliente. Descomentar para ejecutarlo.
-- ----------------------------------------------------------------------------
-- INSERT INTO cliente (dni, nombre, estado)
-- SELECT DISTINCT documento_cliente, nombre_cliente, true FROM venta
--  WHERE documento_cliente IS NOT NULL AND documento_cliente <> ''
-- ON CONFLICT (dni) DO NOTHING;
--
-- UPDATE venta v SET id_cliente = c.id_cliente
--   FROM cliente c
--  WHERE v.id_cliente IS NULL AND v.documento_cliente = c.dni;
