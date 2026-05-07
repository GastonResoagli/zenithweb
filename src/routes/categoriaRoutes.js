const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, categoriaController.obtenerCategorias);

module.exports = router;
