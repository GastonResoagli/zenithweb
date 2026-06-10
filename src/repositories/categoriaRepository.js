// Repository de categorías.
const db = require('../db/connection');

// Trae todas las categorías ordenadas alfabéticamente por su descripción
exports.obtenerCategorias = async () => {
    const result = await db.query('SELECT * FROM categoria ORDER BY descripcion');
    return result.rows;
};

// Busca una categoría por su descripción (sin distinguir mayúsculas). undefined si no existe.
exports.getPorDescripcion = async (descripcion) => {
    const result = await db.query(
        'SELECT * FROM categoria WHERE LOWER(descripcion) = LOWER($1)',
        [descripcion.trim()]
    );
    return result.rows[0];
};

// Inserta una categoría nueva (activa por defecto) y devuelve la fila creada.
// Si el índice único de la base detecta un duplicado, lanza un error claro.
exports.crearCategoria = async (descripcion) => {
    try {
        const result = await db.query(
            'INSERT INTO categoria (descripcion, estado) VALUES ($1, true) RETURNING *',
            [descripcion.trim()]
        );
        return result.rows[0];
    } catch (error) {
        // 23505 = unique_violation (garantía a nivel base de datos)
        if (error.code === '23505') throw new Error('Ya existe una categoría con esa descripción');
        throw error;
    }
};
