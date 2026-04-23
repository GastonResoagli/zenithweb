const db = require('../db/connection');

exports.getMovimientos = async ({ fechaDesde, fechaHasta, tipo, id_producto }) => {
    let query = `
        SELECT ri.id_registro, ri.tipo, ri.cantidad, ri.total, ri.fecha,
               p.nombre AS nombre_producto,
               u.nombre_completo AS nombre_usuario,
               CASE WHEN ri.tipo = 'salida' THEN v.nombre_cliente ELSE u.nombre_completo END AS nombre_actor
        FROM registro_inventario ri
        JOIN producto p ON ri.id_producto = p.id_producto
        JOIN usuario u ON ri.id_usuario = u.id_usuario
        LEFT JOIN venta v ON ri.id_venta = v.id_venta
        WHERE 1=1
    `;
    const params = [];
    let i = 1;

    if (fechaDesde) { query += ` AND ri.fecha >= $${i++}`; params.push(fechaDesde); }
    if (fechaHasta) { query += ` AND ri.fecha <= $${i++}`; params.push(fechaHasta + ' 23:59:59'); }
    if (tipo) { query += ` AND ri.tipo = $${i++}`; params.push(tipo); }
    if (id_producto) { query += ` AND ri.id_producto = $${i++}`; params.push(id_producto); }

    query += ' ORDER BY ri.fecha DESC';

    const result = await db.query(query, params);
    return result.rows;
};
