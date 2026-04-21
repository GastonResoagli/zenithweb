const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());


//rutas
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', productoRoutes);

//server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor corriendo en puerto ${PORT}`);
})

