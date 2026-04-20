const express = require('express');
const router = express.Router();

const prodcutroController = require('../controllers/productoController');

router.get('/', prodcutroController.getAll);
router.get('/:id', prodcutroController.getById);
router.post('/', prodcutroController.create);
router.put('/:id', prodcutroController.update);
router.delete('/:id', prodcutroController.remove);

module.export = router;