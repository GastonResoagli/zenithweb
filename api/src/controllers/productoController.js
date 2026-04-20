const productoService = require('../services/productoService');

exports.getAll = async (req, res) => {
    const data = await productoService.getAll();
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await productoService.getById(req.params.id);
    res.json(data);
}

exports.create = async (req, res) => {
    const data = await productoService.create(req.body);
    res.json(data);
}

exports.update = async (req, res) => {
    const data = await productoService.update(req.params.id);
    res.json(data);
}

exports.remove = async (req, res) => {
    const data = await productoService.remove(req.params.id);
    res.json(data);
}

