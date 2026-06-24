// Repository de autenticación: consultas a la tabla usuario.
const db = require('../db/connection');

// Busca un usuario activo por su correo. $1 es un parámetro posicional (previene SQL injection).
exports.buscarUsuarioPorCorreo = async (correo) => {
    const result = await db.query(
        'SELECT * FROM usuario WHERE correo = $1 AND estado = true',
        [correo]
    );
    return result.rows[0]; // undefined si no existe
};
