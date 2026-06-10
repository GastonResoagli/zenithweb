// Service de categorías.
const categoriaRepository = require('../repositories/categoriaRepository');

exports.obtenerCategorias = () => {
    return categoriaRepository.obtenerCategorias();
};

// Crea una categoría evitando duplicados. El chequeo previo da un mensaje claro;
// el índice único de la base es la garantía final (ver crearCategoria del repository).
exports.crearCategoria = async (descripcion) => {
    const existente = await categoriaRepository.getPorDescripcion(descripcion);
    if (existente) throw new Error('Ya existe una categoría con esa descripción');
    return categoriaRepository.crearCategoria(descripcion);
};
