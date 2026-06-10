// Rutas de categorías (montadas en /api/categorias).
const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET /api/categorias -> cualquier usuario autenticado puede listarlas
router.get('/', authenticateToken, categoriaController.obtenerCategorias);

// POST /api/categorias -> solo gerentes y operadores de stock pueden crear categorías
router.post('/', authenticateToken, authorizeRoles('gerente', 'operador_stock'), categoriaController.agregarCategoria);

module.exports = router;
