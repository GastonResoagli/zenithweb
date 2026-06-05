// Repository de categorías.
const db = require('../db/connection');

// Trae todas las categorías ordenadas alfabéticamente por nombre
exports.obtenerCategorias = async () => {
    const result = await db.query('SELECT * FROM categoria ORDER BY nombre');
    return result.rows;
};
