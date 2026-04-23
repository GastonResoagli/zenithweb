const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/', authorizeRoles('gerente'), reporteController.generar);

module.exports = router;
