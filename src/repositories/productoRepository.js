// Repository de productos: todas las consultas SQL sobre la tabla producto.
const db = require('../db/connection');

// Lista de productos. Si soloActivos=true, excluye los dados de baja.
exports.obtenerProductos = async (soloActivos = false) => {
    // IS NOT FALSE incluye también NULLs: productos sin estado definido se tratan como activos
    const filtro = soloActivos ? 'WHERE estado IS NOT FALSE' : '';
    const result = await db.query(`SELECT * FROM producto ${filtro} ORDER BY nombre`);
    return result.rows;
};

// Un producto por su ID (undefined si no existe)
exports.getById = async (id) => {
    const result = await db.query('SELECT * FROM producto WHERE id_producto = $1', [id]);
    return result.rows[0];
}

// Busca un producto por su nombre (sin distinguir mayúsculas). undefined si no existe.
exports.getPorNombre = async (nombre) => {
    const result = await db.query(
        'SELECT * FROM producto WHERE LOWER(nombre) = LOWER($1)',
        [nombre.trim()]
    );
    return result.rows[0];
}

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
        if (error.code === '23505') throw new Error('Ya existe un producto con ese nombre');
        throw error;
    }
}

// Actualiza todos los campos editables de un producto existente
exports.update = async (id, producto) => {
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
        if (error.code === '23505') throw new Error('Ya existe un producto con ese nombre');
        throw error;
    }
};

// Baja lógica: se desactiva en lugar de eliminar para mantener integridad referencial con ventas.
// Reutiliza la función almacenada dar_baja_producto (src/db/funciones.sql), que pone estado=false
// y lanza una excepción si el id no existe.
exports.remove = async (id) => {
    await db.query('SELECT dar_baja_producto($1)', [parseInt(id)]);
    return { message: 'Producto dado de baja' };
}

// Activa o desactiva un producto (alta/baja según el booleano recibido)
exports.setEstado = async (id, estado) => {
    const result = await db.query(
        'UPDATE producto SET estado = $1 WHERE id_producto = $2 RETURNING *',
        [estado, parseInt(id)]
    );
    if (!result.rows[0]) throw new Error('Producto no encontrado');
    return result.rows[0];
}

// Resta unidades al stock. Usa "client" (no "db") porque corre dentro de la transacción de la venta.
exports.descuentaStock = async (client, id, cantidad) => {
    const result = await client.query(`
        UPDATE producto SET stock = stock - $1 WHERE id_producto = $2 RETURNING stock
    `, [parseInt(cantidad), parseInt(id)]);
    if (!result.rows[0]) throw new Error('Producto no encontrado');
    return result.rows[0].stock;
}
