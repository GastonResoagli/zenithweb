// Controller de movimientos de inventario (historial de entradas/salidas).
const movimientoService = require('../services/movimientoService');
const { validarEntrada, validarActualizacionEntrada } = require('../utils/validators');

// Devuelve el historial de movimientos
exports.getAll = async (req, res) => {
    try {
        const data = await movimientoService.getAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/movimientos/entrada -> registra un ingreso de stock (reposición/compra)
exports.registrarEntrada = async (req, res) => {
    try {
        validarEntrada(req.body);
        const { id_producto, cantidad, precio_compra } = req.body;
        // El id_usuario se toma del token JWT para evitar suplantación de identidad
        const id_usuario = req.user.id_usuario;
        await movimientoService.registrarEntrada({ id_producto, cantidad, precio_compra, id_usuario });
        res.status(201).json({ message: 'Entrada registrada' });
    } catch (error) {
        // Datos inválidos -> 400; producto inexistente (lo lanza el procedure) -> 404
        if (error.message.includes('requerido') || error.message.includes('cantidad') || error.message.includes('precio de compra')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/movimientos/entrada/:id -> corrige una entrada de stock ya registrada
exports.actualizarEntrada = async (req, res) => {
    try {
        validarActualizacionEntrada(req.body);
        const { cantidad, precio_compra } = req.body;
        await movimientoService.actualizarEntrada({ id_registro: req.params.id, cantidad, precio_compra });
        res.json({ message: 'Entrada actualizada' });
    } catch (error) {
        if (error.message.includes('cantidad') || error.message.includes('precio de compra')) {
            return res.status(400).json({ error: error.message });
        }
        // Movimiento inexistente -> 404; editar una 'salida' o dejar stock negativo -> 409
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('tipo entrada') || error.message.includes('stock en negativo')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};
