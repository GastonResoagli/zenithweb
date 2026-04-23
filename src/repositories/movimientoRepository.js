const db = require('../db/connection');

exports.entrada = async (id_producto, cantidad, precio_compra, id_usuario) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const total = cantidad * precio_compra;
        await client.query(`
            INSERT INTO registro_inventario (id_producto, tipo, cantidad, precio_compra, total, id_usuario, fecha)
            VALUES ($1, 'entrada', $2, $3, $4, $5, NOW())
        `, [id_producto, cantidad, precio_compra, total, id_usuario]);

        const result = await client.query(`
            UPDATE producto
            SET stock = stock + $1,
                precio_compra = ROUND(((stock * precio_compra) + ($1 * $2)) / (stock + $1), 2)
            WHERE id_producto = $3
            RETURNING *
        `, [cantidad, precio_compra, id_producto]);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

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
