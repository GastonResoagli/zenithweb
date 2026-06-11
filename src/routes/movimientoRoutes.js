// Rutas de movimientos de inventario (montadas en /api/movimientos).
const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET /api/movimientos -> solo gerente y operador de stock pueden ver el historial
router.get('/', authorizeRoles('gerente', 'operador_stock'), movimientoController.getAll);

// POST /api/movimientos/entrada -> registra un ingreso de stock (mismos roles que el historial)
router.post('/entrada', authorizeRoles('gerente', 'operador_stock'), movimientoController.registrarEntrada);

// PUT /api/movimientos/entrada/:id -> corrige una entrada de stock existente
router.put('/entrada/:id', authorizeRoles('gerente', 'operador_stock'), movimientoController.actualizarEntrada);

module.exports = router;
