const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'control_stock',
    password: 'rumble123',
    port: 5432,
})

module.exports = pool;