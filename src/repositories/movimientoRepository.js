// Repository de movimientos de inventario.
const db = require('../db/connection');

// Historial de los últimos 100 movimientos, uniendo (JOIN) con producto y usuario
// para mostrar el nombre del producto y de quién lo registró (no solo los IDs).
exports.getAll = async () => {
    const result = await db.query(`
        SELECT ri.*, p.nombre AS nombre_producto, u.nombre_completo AS nombre_usuario
        FROM registro_inventario ri
        JOIN producto p ON ri.id_producto = p.id_producto
        JOIN usuario u ON ri.id_usuario = u.id_usuario
        ORDER BY ri.fecha DESC
        LIMIT 100
    `);
    return result.rows;
};
