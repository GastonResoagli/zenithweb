const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const authorizeRoles = require('../middleware/roleMiddleware');

router.get('/', authorizeRoles('gerente', 'vendedor'), ventaController.getAll);
router.get('/:id', authorizeRoles('gerente', 'vendedor'), ventaController.getById);
router.post('/', authorizeRoles('gerente', 'vendedor'), ventaController.create);

module.exports = router;
