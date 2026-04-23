const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());


//rutas
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const authenticateToken = require('./src/middleware/authMiddleware');
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', authenticateToken, productoRoutes);

const ventaRoutes = require('./src/routes/ventaRoutes');
app.use('/api/ventas', authenticateToken, ventaRoutes);

const movimientoRoutes = require('./src/routes/movimientoRoutes');
app.use('/api/movimientos', authenticateToken, movimientoRoutes);

const reporteRoutes = require('./src/routes/reporteRoutes');
app.use('/api/reportes', authenticateToken, reporteRoutes);

//server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor corriendo en puerto ${PORT}`);
})

