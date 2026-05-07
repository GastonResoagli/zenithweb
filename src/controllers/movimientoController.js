const movimientoService = require('../services/movimientoService');

exports.getAll = async (req, res) => {
    try {
        const data = await movimientoService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
