const productoService = require('../services/productoService');
const { validarProducto } = require('../utils/validators');

exports.obtenerProductos = async (req, res) => {
    try {
        // soloActivos=true lo usan vendedores para ver solo productos disponibles para vender
        const soloActivos = req.query.soloActivos === 'true';
        const data = await productoService.obtenerProductos(soloActivos);
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

exports.agregarProductos = async (req, res) => {
    try {
        validarProducto(req.body);
        const data = await productoService.crearProducto(req.body);
        res.status(201).json(data);
    } catch (error) {
        if (error.message.includes('requerido') || error.message.includes('válido')) {
            return res.status(400).json({ error: error.message });
        }
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
        // Validamos explícitamente el tipo boolean para evitar conversiones implícitas de strings
        if (typeof estado !== 'boolean') {
            return res.status(400).json({ error: 'El campo estado debe ser true o false' });
        }
        const data = await productoService.setEstado(req.params.id, estado);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
