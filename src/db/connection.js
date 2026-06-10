// Configuración de la conexión a PostgreSQL.
// Usa un Pool de conexiones (reutiliza conexiones en lugar de abrir una nueva por consulta).
const { Pool } = require('pg');
require('dotenv').config();

// Dos modos de conexión:
//  - PRODUCCIÓN (Supabase/Render): se define DATABASE_URL (connection string del pooler).
//    Supabase exige SSL, por eso se habilita ssl cuando se usa este modo.
//  - LOCAL (desarrollo): se usan las variables sueltas DB_USER, DB_HOST, etc. del .env.
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        }
)

// Se exporta el pool para que los repositorios ejecuten consultas con db.query(...)
module.exports = pool;
