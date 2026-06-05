// Controller de ventas.
const ventaService = require('../services/ventaService');
const { validarVenta } = require('../utils/validators');

// GET /api/ventas -> listado de ventas (con cantidad de ítems por venta)
exports.consultarVentas = async (req, res) => {
    try {
        const data = await ventaService.consultarVentas();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/ventas/:id -> una venta con el detalle de sus productos
exports.getById = async (req, res) => {
    try {
        const data = await ventaService.getById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/ventas -> registra una venta nueva con sus líneas de detalle
exports.agregarVenta = async (req, res) => {
    try {
        validarVenta(req.body);
        // Separamos los detalles de línea del resto de los datos de la venta
        const { detalles, ...venta } = req.body;
        // El id_usuario se toma del token JWT para evitar suplantación de identidad
        venta.id_usuario = req.user.id_usuario;
        const data = await ventaService.creaVenta(venta, detalles);
        res.status(201).json(data);
    } catch (error) {
        if (error.message.includes('venta debe tener')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};
