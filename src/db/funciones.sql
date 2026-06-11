-- ============================================================================
-- Funciones y procedimientos almacenados (PL/pgSQL) — ZenithWeb
-- ----------------------------------------------------------------------------
-- Ejecutar una vez contra la base:
--   psql -U <usuario> -d <base> -f src/db/funciones.sql
-- Todas usan CREATE OR REPLACE: se pueden volver a correr sin error.
-- ============================================================================


-- ============================================================================
-- 1) descontar_stock(id_producto, cantidad) -> stock resultante
-- ----------------------------------------------------------------------------
-- FUNCION: resta unidades al stock de un producto y devuelve el stock final.
-- Valida que el producto exista y que no quede stock negativo.
-- ============================================================================
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
-- Uso: SELECT descontar_stock(5, 3);


-- ============================================================================
-- 2) dar_baja_producto(id_producto) -> id_producto dado de baja
-- ----------------------------------------------------------------------------
-- FUNCION: baja LOGICA del producto (estado = false). No borra el registro,
-- para preservar el historial de ventas y movimientos.
-- ============================================================================
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
-- Uso: SELECT dar_baja_producto(5);


-- ============================================================================
-- 3) registrar_entrada(id_producto, cantidad, precio_compra, id_usuario)
-- ----------------------------------------------------------------------------
-- PROCEDIMIENTO: ingreso de stock (compra/reposicion). Sube el stock del
-- producto y deja registrado el movimiento de inventario como 'entrada'.
-- ============================================================================
CREATE OR REPLACE PROCEDURE registrar_entrada(
    p_id_producto   INT,
    p_cantidad      INT,
    p_precio_compra NUMERIC,
    p_id_usuario    INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- 1) sube el stock
    UPDATE producto
       SET stock = stock + p_cantidad
     WHERE id_producto = p_id_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    -- 2) registra el movimiento (trazabilidad / reportes)
    INSERT INTO registro_inventario
        (id_producto, tipo, cantidad, precio_compra, total, id_usuario, fecha)
    VALUES
        (p_id_producto, 'entrada', p_cantidad, p_precio_compra,
         p_cantidad * p_precio_compra, p_id_usuario, NOW());
END;
$$;
-- Uso: CALL registrar_entrada(5, 10, 1500.00, 2);


-- ============================================================================
-- 4) actualizar_entrada(id_registro, cantidad, precio_compra)
-- ----------------------------------------------------------------------------
-- PROCEDIMIENTO: corrige una entrada de stock ya registrada. Ajusta el stock
-- del producto por la DIFERENCIA entre la cantidad nueva y la anterior, y
-- recalcula el total. Solo aplica a movimientos de tipo 'entrada' (las
-- 'salidas' provienen de ventas y no se editan desde acá).
-- ============================================================================
CREATE OR REPLACE PROCEDURE actualizar_entrada(
    p_id_registro   INT,
    p_cantidad      INT,
    p_precio_compra NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_producto  INT;
    v_cantidad_ant INT;
    v_tipo         VARCHAR(10);
    v_stock        INT;
BEGIN
    -- 1) recupera la entrada original y bloquea la fila (evita carreras)
    SELECT id_producto, cantidad, tipo
      INTO v_id_producto, v_cantidad_ant, v_tipo
      FROM registro_inventario
     WHERE id_registro = p_id_registro
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Movimiento % no encontrado', p_id_registro;
    END IF;

    -- 2) solo se pueden editar entradas (las salidas vienen de ventas)
    IF v_tipo <> 'entrada' THEN
        RAISE EXCEPTION 'Solo se pueden actualizar movimientos de tipo entrada';
    END IF;

    -- 3) ajusta el stock por la diferencia (cantidad nueva - anterior)
    UPDATE producto
       SET stock = stock + (p_cantidad - v_cantidad_ant)
     WHERE id_producto = v_id_producto
    RETURNING stock INTO v_stock;

    IF v_stock < 0 THEN
        RAISE EXCEPTION 'La actualizacion dejaria el stock en negativo';
    END IF;

    -- 4) actualiza el registro y recalcula el total
    UPDATE registro_inventario
       SET cantidad      = p_cantidad,
           precio_compra = p_precio_compra,
           total         = p_cantidad * p_precio_compra
     WHERE id_registro = p_id_registro;
END;
$$;
-- Uso: CALL actualizar_entrada(12, 8, 1600.00);


-- ============================================================================
-- 5) registrar_venta(datos_venta JSONB, detalles JSONB) -> id_venta
-- ----------------------------------------------------------------------------
-- FUNCION ESTRELLA: registra una venta completa en una sola operacion atomica.
-- Por cada detalle: inserta la linea, descuenta stock y registra la 'salida'
-- de inventario. Si algo falla, toda la operacion se revierte (transaccion).
--
-- Estructura esperada:
--   datos_venta = {
--     "id_usuario": 2, "tipo_documento": "Factura",
--     "documento_cliente": "20-12345678-9", "nombre_cliente": "Juan Perez",
--     "monto_pago": 5000, "monto_cambio": 0, "monto_total": 5000
--   }
--   detalles = [ { "id_producto": 5, "cantidad": 2, "precio_venta": 1500 }, ... ]
-- ============================================================================
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
    -- 1) cabecera de la venta
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

    -- 2) recorre cada renglon del detalle
    FOR detalle IN SELECT * FROM jsonb_array_elements(p_detalles)
    LOOP
        v_id_prod  := (detalle->>'id_producto')::INT;
        v_cantidad := (detalle->>'cantidad')::INT;
        v_precio   := (detalle->>'precio_venta')::NUMERIC;
        v_subtotal := v_precio * v_cantidad;

        -- 2.a) linea de detalle
        INSERT INTO detalle_venta
            (id_venta, id_producto, precio_venta, cantidad, subtotal, fecha_registro)
        VALUES
            (v_id_venta, v_id_prod, v_precio, v_cantidad, v_subtotal, NOW());

        -- 2.b) descuenta stock (reutiliza la funcion 1, que valida stock)
        PERFORM descontar_stock(v_id_prod, v_cantidad);

        -- 2.c) movimiento de inventario como 'salida'
        INSERT INTO registro_inventario
            (id_producto, tipo, cantidad, total, id_venta, id_usuario, fecha)
        VALUES
            (v_id_prod, 'salida', v_cantidad, v_subtotal, v_id_venta, v_id_usuario, NOW());
    END LOOP;

    RETURN v_id_venta;
END;
$$;
-- Uso:
-- SELECT registrar_venta(
--   '{"id_usuario":2,"tipo_documento":"Factura","documento_cliente":"20-1-9",
--     "nombre_cliente":"Juan Perez","monto_pago":5000,"monto_cambio":0,"monto_total":5000}'::jsonb,
--   '[{"id_producto":5,"cantidad":2,"precio_venta":1500},
--     {"id_producto":8,"cantidad":1,"precio_venta":2000}]'::jsonb
-- );
