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

// Registra una entrada de stock invocando el PROCEDURE almacenado registrar_entrada
// (definido en src/db/funciones.sql). Ese procedimiento, en una única operación,
// sube el stock del producto y deja registrado el movimiento 'entrada' en
// registro_inventario. Lanza una excepción si el producto no existe.
exports.registrarEntrada = async ({ id_producto, cantidad, precio_compra, id_usuario }) => {
    await db.query(
        'CALL registrar_entrada($1, $2, $3, $4)',
        [parseInt(id_producto), parseInt(cantidad), parseFloat(precio_compra), parseInt(id_usuario)]
    );
};

// Actualiza una entrada de stock existente invocando el PROCEDURE actualizar_entrada.
// Ese procedimiento ajusta el stock por la diferencia de cantidad, recalcula el total
// y valida que la entrada exista y sea de tipo 'entrada'.
exports.actualizarEntrada = async ({ id_registro, cantidad, precio_compra }) => {
    await db.query(
        'CALL actualizar_entrada($1, $2, $3)',
        [parseInt(id_registro), parseInt(cantidad), parseFloat(precio_compra)]
    );
};
