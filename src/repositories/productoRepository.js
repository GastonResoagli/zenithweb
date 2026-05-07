const db = require('../db/connection');

exports.getAll = async (soloActivos = false) => {
    const filtro = soloActivos ? 'WHERE estado IS NOT FALSE' : '';
    const result = await db.query(`SELECT * FROM producto ${filtro} ORDER BY nombre`);
    return result.rows;
};

exports.getById = async (id) => {
    const result = await db.query('SELECT * FROM producto WHERE id_producto = $1', [id]);
    return result.rows[0];
}

exports.create = async (producto) => {
    const { nombre, descripcion, stock, precio_compra, precio_venta, id_categoria } = producto;

    const result = await db.query(`INSERT INTO producto
        (nombre, descripcion, stock, precio_compra, precio_venta, id_categoria, estado)
        VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
        [nombre, descripcion, parseInt(stock), parseFloat(precio_compra), parseFloat(precio_venta), parseInt(id_categoria)]
    );
    return result.rows[0];
}

exports.update = async (id, producto) => {
    const { nombre, descripcion, stock, precio_compra, precio_venta, id_categoria } = producto;

    const result = await db.query(
        `UPDATE producto SET
        nombre=$1, descripcion=$2, stock=$3, precio_compra=$4, precio_venta=$5, id_categoria=$6
        WHERE id_producto=$7 RETURNING *`,
        [nombre, descripcion, parseInt(stock), parseFloat(precio_compra), parseFloat(precio_venta), parseInt(id_categoria), parseInt(id)]
    );
    return result.rows[0];
};

exports.remove = async (id) => {
    const result = await db.query(
        'UPDATE producto SET estado = false WHERE id_producto = $1 RETURNING id_producto',
        [parseInt(id)]
    );
    if (!result.rows[0]) throw new Error('Producto no encontrado');
    return { message: 'Producto dado de baja' };
}

exports.setEstado = async (id, estado) => {
    const result = await db.query(
        'UPDATE producto SET estado = $1 WHERE id_producto = $2 RETURNING *',
        [estado, parseInt(id)]
    );
    if (!result.rows[0]) throw new Error('Producto no encontrado');
    return result.rows[0];
}