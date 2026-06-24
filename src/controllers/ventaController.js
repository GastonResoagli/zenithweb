// Controller de ventas.
// Sin try/catch: Express 5 reenvía los errores al middleware central (errorHandler).
const ventaService = require('../services/ventaService');
const { validarVenta } = require('../utils/validators');
const { ErrorNoEncontrado } = require('../utils/errors');

// GET /api/ventas -> listado de ventas (con cantidad de ítems por venta)
exports.consultarVentas = async (req, res) => {
    const data = await ventaService.consultarVentas();
    res.json(data);
};

// GET /api/ventas/:id -> una venta con el detalle de sus productos
exports.obtenerPorId = async (req, res) => {
    const data = await ventaService.obtenerPorId(req.params.id);
    if (!data) throw new ErrorNoEncontrado('Venta no encontrada');
    res.json(data);
};

// POST /api/ventas -> registra una venta nueva con sus líneas de detalle
exports.agregarVenta = async (req, res) => {
    validarVenta(req.body);
    // Separamos los detalles de línea del resto de los datos de la venta
    const { detalles, ...venta } = req.body;
    // El id_usuario se toma del token JWT para evitar suplantación de identidad
    venta.id_usuario = req.user.id_usuario;
    const data = await ventaService.crearVenta(venta, detalles);
    res.status(201).json(data);
};
