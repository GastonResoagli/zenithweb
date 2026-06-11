// Repository de ventas: consultas sobre venta, detalle_venta y registro_inventario.
const db = require('../db/connection');

// Listado de ventas con la cantidad de líneas (ítems) de cada una.
// LEFT JOIN + COUNT + GROUP BY para contar los detalles asociados a cada venta.
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

// Una venta con su detalle completo (dos consultas: la venta y luego sus líneas)
exports.getById = async (id) => {
    const venta = await db.query('SELECT * FROM venta WHERE id_venta = $1', [id]);
    if (!venta.rows[0]) return null; // no existe la venta

    // Trae las líneas de la venta incluyendo el nombre del producto
    const detalles = await db.query(`
        SELECT dv.*, p.nombre AS nombre_producto
        FROM detalle_venta dv
        JOIN producto p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta = $1
    `, [id]);

    // Devuelve la venta con el array de detalles anidado
    return { ...venta.rows[0], detalles: detalles.rows };
};

// Registra una venta completa invocando la función almacenada registrar_venta
// (definida en src/db/funciones.sql). Esa función, en una única operación atómica,
// inserta la cabecera, recorre el detalle, descuenta el stock (validándolo) y deja
// registrado el movimiento de inventario 'salida'. Si algo falla, PostgreSQL revierte
// todo el statement automáticamente (no quedan datos a medias).
exports.crearVenta = async (venta, detalles) => {
    // Los parámetros JSONB se envían como texto y se castean a jsonb dentro de la consulta.
    const result = await db.query(
        'SELECT registrar_venta($1::jsonb, $2::jsonb) AS id_venta',
        [JSON.stringify(venta), JSON.stringify(detalles)]
    );

    // La función devuelve solo el id de la venta creada; devolvemos la venta completa con su detalle.
    return exports.getById(result.rows[0].id_venta);
};
