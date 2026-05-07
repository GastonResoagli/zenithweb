const db = require('../db/connection');

exports.consultarVentas = async () => {
    const result = await db.query(`
        SELECT v.*, COUNT(dv.id_detalle_venta) AS cantidad_items
        FROM venta v
        LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
        GROUP BY v.id_venta
        ORDER BY v.fecha DESC
    `);
    return result.rows;
};

exports.getById = async (id) => {
    const venta = await db.query('SELECT * FROM venta WHERE id_venta = $1', [id]);
    if (!venta.rows[0]) return null;

    const detalles = await db.query(`
        SELECT dv.*, p.nombre AS nombre_producto
        FROM detalle_venta dv
        JOIN producto p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta = $1
    `, [id]);

    return { ...venta.rows[0], detalles: detalles.rows };
};

exports.crearVenta = async (client, venta, detalles) => {
    const { tipo_documento, documento_cliente, nombre_cliente, monto_pago, monto_cambio, monto_total, id_usuario } = venta;

    const ventaResult = await client.query(`
        INSERT INTO venta (id_usuario, tipo_documento, documento_cliente, nombre_cliente, monto_pago, monto_cambio, monto_total, fecha)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *
    `, [parseInt(id_usuario), tipo_documento, documento_cliente, nombre_cliente,
        parseFloat(monto_pago), parseFloat(monto_cambio), parseFloat(monto_total)]);

    const nuevaVenta = ventaResult.rows[0];

    for (const detalle of detalles) {
        const { id_producto, cantidad, precio_venta } = detalle;
        const subtotal = parseFloat(precio_venta) * parseInt(cantidad);

        await client.query(`
            INSERT INTO detalle_venta (id_venta, id_producto, precio_venta, cantidad, subtotal, fecha_registro)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [nuevaVenta.id_venta, parseInt(id_producto), parseFloat(precio_venta), parseInt(cantidad), subtotal]);

        // Registramos el movimiento como 'salida' para trazabilidad y generación de reportes
        await client.query(`
            INSERT INTO registro_inventario (id_producto, tipo, cantidad, total, id_venta, id_usuario, fecha)
            VALUES ($1, 'salida', $2, $3, $4, $5, NOW())
        `, [parseInt(id_producto), parseInt(cantidad), subtotal, nuevaVenta.id_venta, parseInt(id_usuario)]);
    }

    return nuevaVenta;
};
