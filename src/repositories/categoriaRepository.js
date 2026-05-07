const db = require('../db/connection');

exports.obtenerCategorias = async () => {
    const result = await db.query('SELECT * FROM categoria ORDER BY nombre');
    return result.rows;
};
