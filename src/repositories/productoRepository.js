// Repository de productos: todas las consultas SQL sobre la tabla producto.
const db = require('../db/connection');
const { ErrorConflicto, ErrorNoEncontrado } = require('../utils/errors');

// Lista de productos. Si soloActivos=true, excluye los dados de baja.
exports.obtenerProductos = async (soloActivos = false) => {
    // IS NOT FALSE incluye también NULLs: productos sin estado definido se tratan como activos
    const filtro = soloActivos ? 'WHERE estado IS NOT FALSE' : '';
    const result = await db.query(`SELECT * FROM producto ${filtro} ORDER BY nombre`);
    return result.rows;
};

// Un producto por su ID (undefined si no existe)
exports.obtenerPorId = async (id) => {
    const result = await db.query('SELECT * FROM producto WHERE id_producto = $1', [id]);
    return result.rows[0];
};

// Busca un producto por su nombre (sin distinguir mayúsculas). undefined si no existe.
exports.buscarPorNombre = async (nombre) => {
    const result = await db.query(
        'SELECT * FROM producto WHERE LOWER(nombre) = LOWER($1)',
        [nombre.trim()]
    );
    return result.rows[0];
};

// Inserta un producto nuevo y devuelve la fila creada (RETURNING *)
exports.crearProducto = async (producto) => {
    const { nombre, descripcion, stock, precio_compra, precio_venta, id_categoria } = producto;

    try {
        // Todo producto nuevo se crea activo (estado = true) por defecto
        const result = await db.query(`INSERT INTO producto
            (nombre, descripcion, stock, precio_compra, precio_venta, id_categoria, estado)
            VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
            [nombre, descripcion, parseInt(stock), parseFloat(precio_compra), parseFloat(precio_venta), parseInt(id_categoria)]
        );
        return result.rows[0];
    } catch (error) {
        // 23505 = unique_violation: el índice único de la base detectó un nombre repetido
        if (error.code === '23505') throw new ErrorConflicto('Ya existe un producto con ese nombre');
        throw error;
    }
};

// Actualiza todos los campos editables de un producto existente
exports.actualizar = async (id, producto) => {
    const { nombre, descripcion, stock, precio_compra, precio_venta, id_categoria } = producto;

    try {
        const result = await db.query(
            `UPDATE producto SET
            nombre=$1, descripcion=$2, stock=$3, precio_compra=$4, precio_venta=$5, id_categoria=$6
            WHERE id_producto=$7 RETURNING *`,
            [nombre, descripcion, parseInt(stock), parseFloat(precio_compra), parseFloat(precio_venta), parseInt(id_categoria), parseInt(id)]
        );
        return result.rows[0];
    } catch (error) {
        // 23505 = unique_violation: renombrar a un nombre que ya usa otro producto
        if (error.code === '23505') throw new ErrorConflicto('Ya existe un producto con ese nombre');
        throw error;
    }
};

// Activa o desactiva un producto (alta/baja lógica según el booleano recibido).
// Se desactiva en lugar de eliminar para mantener integridad referencial con ventas.
exports.cambiarEstado = async (id, estado) => {
    const result = await db.query(
        'UPDATE producto SET estado = $1 WHERE id_producto = $2 RETURNING *',
        [estado, parseInt(id)]
    );
    if (!result.rows[0]) throw new ErrorNoEncontrado('Producto no encontrado');
    return result.rows[0];
};
