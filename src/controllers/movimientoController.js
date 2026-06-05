// Controller de movimientos de inventario (historial de entradas/salidas).
const movimientoService = require('../services/movimientoService');

// Devuelve el historial de movimientos
exports.getAll = async (req, res) => {
    try {
        const data = await movimientoService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
