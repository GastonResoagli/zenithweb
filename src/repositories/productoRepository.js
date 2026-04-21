const db = require('../db/connection');

exports.getAll = async () => {
    const result = await db.query('SELECT * FROM producto');
    return result.rows;
};

exports.getById = async (id) => {
    const result = await db.query('SELECT * FROM producto WHERE id_producto = $1', [id]);
    return result.rows[0];
}

exports.create = async (producto) => {
    const { nombre, descripcion, stock, precio_compra, precio_venta, id_categoria } = producto;

    const result = await db.query(`INSERT INTO producto
        (nombre, descripcion, stock, precio_compra, precio_venta, id_categoria)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nombre, descripcion, stock, precio_compra, precio_venta, id_categoria]
    );
    return result.rows[0];
}

exports.update = async (id, producto) => {
    const { nombre, descripcion, stock, precio_compra, precio_venta, id_categoria } = producto;

    const result = await db.query(
        `UPDATE producto SET
        nombre=$1, descripcion=$2, stock=$3, precio_compra=$4, precio_venta=$5, id_categoria=$6
        WHERE id_producto=$7 RETURNING *`,
        [nombre, descripcion, stock, precio_compra, precio_venta, id_categoria, id]
    );
    return result.rows[0];
};

exports.remove = async (id) => {
    await db.query('DELETE FROM producto WHERE id_producto = $1', [id]);
    return { message: 'Producto eliminado' }
}