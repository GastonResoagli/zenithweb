const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authorizeRoles = require('../middleware/roleMiddleware');

router.get('/', productoController.getAll);
router.get('/:id', productoController.getById);
router.post('/', authorizeRoles('gerente', 'operador_stock'), productoController.create);
router.put('/:id', authorizeRoles('gerente', 'operador_stock'), productoController.update);
router.delete('/:id', authorizeRoles('gerente', 'operador_stock'), productoController.remove);

module.exports = router;