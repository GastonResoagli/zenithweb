// Rutas de clientes (montadas en /api/clientes).
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Consulta disponible para cualquier usuario autenticado (igual que productos/categorías)
router.get('/', clienteController.obtenerClientes);

module.exports = router;
