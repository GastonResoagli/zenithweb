const productoService = require('../services/productoService');

exports.getAll = async (req, res) => {
    try {
        const soloActivos = req.query.soloActivos === 'true';
        const data = await productoService.getAll(soloActivos);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await productoService.getById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await productoService.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const data = await productoService.update(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const data = await productoService.remove(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.setEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        if (typeof estado !== 'boolean') {
            return res.status(400).json({ error: 'El campo estado debe ser true o false' });
        }
        const data = await productoService.setEstado(req.params.id, estado);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

