// Rutas de categorías (montadas en /api/categorias).
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/categorias -> cualquier usuario autenticado puede listarlas
router.get('/', authenticateToken, categoriaController.obtenerCategorias);

module.exports = router;
