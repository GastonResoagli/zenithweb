// Controller de categorías.
const categoriaService = require('../services/categoriaService');
const { validarCategoria } = require('../utils/validators');

// Devuelve la lista de categorías (se usa para poblar selects en el frontend)
exports.obtenerCategorias = async (req, res) => {
    try {
        const data = await categoriaService.obtenerCategorias();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/categorias -> crea una categoría nueva (valida y evita duplicados)
exports.agregarCategoria = async (req, res) => {
    try {
        validarCategoria(req.body);
        const data = await categoriaService.crearCategoria(req.body.descripcion);
        res.status(201).json(data);
    } catch (error) {
        // Datos inválidos -> 400 ; duplicado -> 409 (conflicto) ; resto -> 500
        if (error.message.includes('requerida')) return res.status(400).json({ error: error.message });
        if (error.message.includes('Ya existe')) return res.status(409).json({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};
