// Punto de entrada del servidor: crea la app Express, registra middlewares y monta las rutas de la API.
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // carga las variables de entorno definidas en el archivo .env

// Sin JWT_SECRET no se pueden firmar/verificar tokens de forma segura: abortamos el arranque.
if (!process.env.JWT_SECRET) {
    console.error('Falta la variable de entorno JWT_SECRET. Definila en el archivo .env antes de iniciar el servidor.');
    process.exit(1);
}

const app = express();

// Middlewares globales
// En producción se restringe el CORS al dominio del frontend (FRONTEND_URL, ej: la URL de Vercel).
// En local, si FRONTEND_URL no está definida, se permiten todos los orígenes.
app.use(cors(process.env.FRONTEND_URL ? { origin: process.env.FRONTEND_URL } : {}));
app.use(express.json());    // parsea el body JSON de las peticiones entrantes


// Rutas de la API
// Login: única ruta pública, no requiere token
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// A partir de acá todas las rutas pasan primero por authenticateToken (requieren JWT válido)
const authenticateToken = require('./src/middleware/authMiddleware');
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', authenticateToken, productoRoutes);

const ventaRoutes = require('./src/routes/ventaRoutes');
app.use('/api/ventas', authenticateToken, ventaRoutes);

const movimientoRoutes = require('./src/routes/movimientoRoutes');
app.use('/api/movimientos', authenticateToken, movimientoRoutes);

const reporteRoutes = require('./src/routes/reporteRoutes');
app.use('/api/reportes', authenticateToken, reporteRoutes);

const categoriaRoutes = require('./src/routes/categoriaRoutes');
app.use('/api/categorias', authenticateToken, categoriaRoutes);

// Middleware central de manejo de errores (debe ir DESPUÉS de las rutas).
// Express 5 reenvía acá los errores lanzados en los controllers (incluso async).
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// Arranque del servidor: usa el puerto del entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor corriendo en puerto ${PORT}`);
})

