const categoriaRepository = require('../repositories/categoriaRepository');

exports.obtenerCategorias = () => {
    return categoriaRepository.obtenerCategorias();
};
