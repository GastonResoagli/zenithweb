// Rutas de movimientos de inventario (montadas en /api/movimientos).
const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET /api/movimientos -> solo gerente y operador de stock pueden ver el historial
router.get('/', authorizeRoles('gerente', 'operador_stock'), movimientoController.getAll);

module.exports = router;
