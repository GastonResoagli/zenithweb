const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const authorizeRoles = require('../middleware/roleMiddleware');

router.get('/', authorizeRoles('gerente', 'operador_stock'), movimientoController.getAll);

module.exports = router;
