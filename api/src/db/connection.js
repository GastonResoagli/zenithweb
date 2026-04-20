const { Pool } = require('pg');
require('dotenv').config();

const Pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'control_stock',
    password: 'rumble123',
    port: 5432,
})

module.exports = Pool;