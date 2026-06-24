// Repository de clientes.
const db = require('../db/connection');

// Lista de clientes ordenada por nombre (para autocompletar en ventas y filtrar reportes)
exports.obtenerClientes = async () => {
    const result = await db.query('SELECT * FROM cliente ORDER BY nombre');
    return result.rows;
};
