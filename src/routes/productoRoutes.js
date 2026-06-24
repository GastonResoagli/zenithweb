// Rutas de productos (montadas en /api/productos).
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authorizeRoles = require('../middleware/roleMiddleware');

// Consulta pública: cualquier usuario autenticado puede ver el catálogo de productos
router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerPorId);

// Modificación restringida a gerentes y operadores de stock.
// La baja se hace con PATCH .../estado (baja lógica), no con DELETE.
router.post('/', authorizeRoles('gerente', 'operador_stock'), productoController.agregarProductos);
router.put('/:id', authorizeRoles('gerente', 'operador_stock'), productoController.actualizar);
router.patch('/:id/estado', authorizeRoles('gerente', 'operador_stock'), productoController.cambiarEstado);

module.exports = router;
