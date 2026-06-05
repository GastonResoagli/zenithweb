// Rutas de productos (montadas en /api/productos).
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authorizeRoles = require('../middleware/roleMiddleware');

// Consulta pública: cualquier usuario autenticado puede ver el catálogo de productos
router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.getById);

// Modificación restringida a gerentes y operadores de stock
router.post('/', authorizeRoles('gerente', 'operador_stock'), productoController.agregarProductos);
router.put('/:id', authorizeRoles('gerente', 'operador_stock'), productoController.update);
router.delete('/:id', authorizeRoles('gerente', 'operador_stock'), productoController.remove);
router.patch('/:id/estado', authorizeRoles('gerente', 'operador_stock'), productoController.setEstado);

module.exports = router;
