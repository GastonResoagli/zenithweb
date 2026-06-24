// Rutas de ventas (montadas en /api/ventas).
const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const authorizeRoles = require('../middleware/roleMiddleware');

// Solo gerentes y vendedores pueden acceder al módulo de ventas
router.get('/', authorizeRoles('gerente', 'vendedor'), ventaController.consultarVentas);
router.get('/:id', authorizeRoles('gerente', 'vendedor'), ventaController.obtenerPorId);
router.post('/', authorizeRoles('gerente', 'vendedor'), ventaController.agregarVenta);

module.exports = router;
