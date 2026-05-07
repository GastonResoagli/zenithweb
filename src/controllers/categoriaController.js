const categoriaService = require('../services/categoriaService');

exports.obtenerCategorias = async (req, res) => {
    try {
        const data = await categoriaService.obtenerCategorias();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
