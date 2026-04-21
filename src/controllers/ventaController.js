const ventaService = require('../services/ventaService');

exports.getAll = async (req, res) => {
    try {
        const data = await ventaService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await ventaService.getById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { detalles, ...venta } = req.body;
        venta.id_usuario = req.user.id_usuario;
        const data = await ventaService.create(venta, detalles);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
