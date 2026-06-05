// Controller de categorías.
const categoriaService = require('../services/categoriaService');

// Devuelve la lista de categorías (se usa para poblar selects en el frontend)
exports.obtenerCategorias = async (req, res) => {
    try {
        const data = await categoriaService.obtenerCategorias();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
