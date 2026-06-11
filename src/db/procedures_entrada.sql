-- ============================================================================
-- Procedures de ENTRADA de stock — para ejecutar en PRODUCCIÓN (Supabase)
-- ----------------------------------------------------------------------------
-- Pegar este contenido en el SQL Editor de Supabase y ejecutar (Run).
-- Ambos usan CREATE OR REPLACE: se pueden volver a correr sin error y sin
-- afectar datos (solo definen la lógica de los procedimientos).
-- Es un subconjunto de src/db/funciones.sql (procedures 3 y 4).
-- ============================================================================

-- 1) registrar_entrada(id_producto, cantidad, precio_compra, id_usuario)
--    Ingreso de stock: sube el stock del producto y deja el movimiento 'entrada'.
CREATE OR REPLACE PROCEDURE registrar_entrada(
    p_id_producto   INT,
    p_cantidad      INT,
    p_precio_compra NUMERIC,
    p_id_usuario    INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- sube el stock
    UPDATE producto
       SET stock = stock + p_cantidad
     WHERE id_producto = p_id_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no encontrado', p_id_producto;
    END IF;

    -- registra el movimiento (trazabilidad / reportes)
    INSERT INTO registro_inventario
        (id_producto, tipo, cantidad, precio_compra, total, id_usuario, fecha)
    VALUES
        (p_id_producto, 'entrada', p_cantidad, p_precio_compra,
         p_cantidad * p_precio_compra, p_id_usuario, NOW());
END;
$$;


-- 2) actualizar_entrada(id_registro, cantidad, precio_compra)
--    Corrige una entrada existente: ajusta el stock por la diferencia de
--    cantidad y recalcula el total. Solo aplica a movimientos de tipo 'entrada'.
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
    -- recupera la entrada original y bloquea la fila (evita carreras)
    SELECT id_producto, cantidad, tipo
      INTO v_id_producto, v_cantidad_ant, v_tipo
      FROM registro_inventario
     WHERE id_registro = p_id_registro
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Movimiento % no encontrado', p_id_registro;
    END IF;

    -- solo se pueden editar entradas (las salidas vienen de ventas)
    IF v_tipo <> 'entrada' THEN
        RAISE EXCEPTION 'Solo se pueden actualizar movimientos de tipo entrada';
    END IF;

    -- ajusta el stock por la diferencia (cantidad nueva - anterior)
    UPDATE producto
       SET stock = stock + (p_cantidad - v_cantidad_ant)
     WHERE id_producto = v_id_producto
    RETURNING stock INTO v_stock;

    IF v_stock < 0 THEN
        RAISE EXCEPTION 'La actualizacion dejaria el stock en negativo';
    END IF;

    -- actualiza el registro y recalcula el total
    UPDATE registro_inventario
       SET cantidad      = p_cantidad,
           precio_compra = p_precio_compra,
           total         = p_cantidad * p_precio_compra
     WHERE id_registro = p_id_registro;
END;
$$;
