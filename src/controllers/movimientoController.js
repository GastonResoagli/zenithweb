// Controller de movimientos de inventario (historial de entradas/salidas).
// Sin try/catch: Express 5 reenvía los errores al middleware central (errorHandler).
const movimientoService = require('../services/movimientoService');
const { validarEntrada, validarActualizacionEntrada } = require('../utils/validators');

// GET /api/movimientos -> historial de movimientos
exports.obtenerMovimientos = async (req, res) => {
    const data = await movimientoService.obtenerMovimientos();
    res.json(data);
};

// POST /api/movimientos/entrada -> registra un ingreso de stock (reposición/compra)
exports.registrarEntrada = async (req, res) => {
    validarEntrada(req.body);
    const { id_producto, cantidad, precio_compra } = req.body;
    // El id_usuario se toma del token JWT para evitar suplantación de identidad
    const id_usuario = req.user.id_usuario;
    await movimientoService.registrarEntrada({ id_producto, cantidad, precio_compra, id_usuario });
    res.status(201).json({ message: 'Entrada registrada' });
};

// PUT /api/movimientos/entrada/:id -> corrige una entrada de stock ya registrada
exports.actualizarEntrada = async (req, res) => {
    validarActualizacionEntrada(req.body);
    const { cantidad, precio_compra } = req.body;
    await movimientoService.actualizarEntrada({ id_registro: req.params.id, cantidad, precio_compra });
    res.json({ message: 'Entrada actualizada' });
};
