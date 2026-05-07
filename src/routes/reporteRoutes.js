const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authorizeRoles = require('../middleware/roleMiddleware');

// Solo el gerente puede consultar y generar reportes de movimientos de inventario
router.get('/', authorizeRoles('gerente'), reporteController.getMovimientos);
router.post('/', authorizeRoles('gerente'), reporteController.generarReportes);

module.exports = router;
