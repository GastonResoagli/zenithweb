// Configuración de la conexión a PostgreSQL.
// Usa un Pool de conexiones (reutiliza conexiones en lugar de abrir una nueva por consulta).
const { Pool } = require('pg');
require('dotenv').config();

// Credenciales tomadas de las variables de entorno (.env), nunca hardcodeadas
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

// Se exporta el pool para que los repositorios ejecuten consultas con db.query(...)
module.exports = pool;
