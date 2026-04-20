const db = require('../db/connection');

exports.getAll = async () => {
    const result = await db.query('SELECT * FROM producto');
    return result.rows;
};

exports.getById = async (id) => {
    const result = await db.query('SELECT * FROM producto WHERE idproducto = $1', [id]);
    return result.rows[0];
}

exports.create = async (producto) => {
    const { nombre, descripcion, stock, preciocompra, precioventa, idcategoria } = producto;

    const result = await db.query(`INSERT INTO producto
        (nombre, descripcion, stock, preciocompra, precioventa, idcategoria)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nombre, descripcion, stock, preciocompra, precioventa, idcategoria]
    );
    return result.rows[0];
}

exports.update = async (id, producto) => {
    const { nombre, descripcion, stock, preciocompra, precioventa, idcategoria } = producto;

    const result = await db.query(
        `UPDATE producto SET
        nombre=$1, descripcion=$2, stock=$3, preciocompra=$4, precioventa=$5, idcategoria=$6
        WHERE idproducto=$7 RETURNING *`,
        [nombre, descripcion, stock, preciocompra, precioventa, idcategoria, id]
    );
    return result.rows[0];
};

exports.remove = async (id) => {
    await db.query('DELETE FROM producto WHERE idproducto = $1', [id]);
    return { message: 'Producto eliminado' }
}