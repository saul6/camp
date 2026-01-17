
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function addColumn() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        // Add seeking_tags if not exists (MySQL < 8.0 doesn't support IF NOT EXISTS in ADD COLUMN directly usually, but we can try or catch)
        // A safer way is checking first or just running it and catching duplicate column error.
        try {
            await connection.query('ALTER TABLE buyer_profiles ADD COLUMN seeking_tags TEXT');
            console.log('Column added.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists.');
            } else {
                throw e;
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

addColumn();
