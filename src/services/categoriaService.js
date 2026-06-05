// Service de categorías: por ahora solo reenvía la consulta al repository.
const categoriaRepository = require('../repositories/categoriaRepository');

exports.obtenerCategorias = () => {
    return categoriaRepository.obtenerCategorias();
};
