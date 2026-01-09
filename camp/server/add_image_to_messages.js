const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore',
});

async function migrate() {
    try {
        console.log('Adding image_url to messages table...');
        await pool.query("ALTER TABLE messages ADD COLUMN image_url TEXT DEFAULT NULL");
        console.log('Success!');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error(e);
        }
    }
    process.exit();
}

migrate();
