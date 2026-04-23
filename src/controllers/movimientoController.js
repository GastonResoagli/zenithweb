const movimientoService = require('../services/movimientoService');

exports.entrada = async (req, res) => {
    try {
        const { id_producto, cantidad, precio_compra } = req.body;
        const id_usuario = req.user.id_usuario;
        const data = await movimientoService.entrada(id_producto, cantidad, precio_compra, id_usuario);
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const data = await movimientoService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
