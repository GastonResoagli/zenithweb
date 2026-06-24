// Repository de movimientos de inventario.
const db = require('../db/connection');
const { ErrorNoEncontrado, ErrorConflicto } = require('../utils/errors');

// Historial de los últimos 100 movimientos, uniendo (JOIN) con producto y usuario
// para mostrar el nombre del producto y de quién lo registró (no solo los IDs).
exports.obtenerMovimientos = async () => {
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

// Registra una entrada de stock invocando el PROCEDURE almacenado registrar_entrada:
// sube el stock del producto y deja registrado el movimiento 'entrada' en
// registro_inventario. Lanza una excepción si el producto no existe.
exports.registrarEntrada = async ({ id_producto, cantidad, precio_compra, id_usuario }) => {
    try {
        await db.query(
            'CALL registrar_entrada($1, $2, $3, $4)',
            [parseInt(id_producto), parseInt(cantidad), parseFloat(precio_compra), parseInt(id_usuario)]
        );
    } catch (error) {
        if (error.message && error.message.includes('no encontrado')) {
            throw new ErrorNoEncontrado(error.message);
        }
        throw error;
    }
};

// Actualiza una entrada de stock existente invocando el PROCEDURE actualizar_entrada.
// Ese procedimiento ajusta el stock por la diferencia de cantidad, recalcula el total
// y valida que la entrada exista y sea de tipo 'entrada'.
exports.actualizarEntrada = async ({ id_registro, cantidad, precio_compra }) => {
    try {
        await db.query(
            'CALL actualizar_entrada($1, $2, $3)',
            [parseInt(id_registro), parseInt(cantidad), parseFloat(precio_compra)]
        );
    } catch (error) {
        const msg = error.message || '';
        if (msg.includes('no encontrado')) throw new ErrorNoEncontrado(msg);
        // Editar una 'salida' o dejar el stock en negativo -> conflicto (409)
        if (msg.includes('tipo entrada') || msg.includes('negativo')) throw new ErrorConflicto(msg);
        throw error;
    }
};
