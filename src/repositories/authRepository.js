const db = require('../db/connection');

exports.getUsuarioPorCorreo = async (correo) => {
    const result = await db.query(
        'SELECT * FROM usuario WHERE correo = $1 AND estado = true',
        [correo]
    );
    return result.rows[0];
};
