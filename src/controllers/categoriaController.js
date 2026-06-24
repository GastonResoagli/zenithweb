// Controller de categorías.
// Sin try/catch: Express 5 reenvía los errores al middleware central (errorHandler).
const categoriaService = require('../services/categoriaService');
const { validarCategoria } = require('../utils/validators');

// GET /api/categorias -> lista de categorías (la usa el frontend para clasificar productos)
exports.obtenerCategorias = async (req, res) => {
    const data = await categoriaService.obtenerCategorias();
    res.json(data);
};

// POST /api/categorias -> crea una categoría nueva (valida y evita duplicados)
exports.agregarCategoria = async (req, res) => {
    validarCategoria(req.body);
    const data = await categoriaService.crearCategoria(req.body.descripcion);
    res.status(201).json(data);
};
