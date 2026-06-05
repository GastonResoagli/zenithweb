// Rutas de autenticación (montadas en /api/auth).
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login -> única ruta pública del sistema
router.post('/login', authController.login);

module.exports = router;
