
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function addQualityColumn() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // Check columns
        const [cols] = await connection.query("SHOW COLUMNS FROM opportunities LIKE 'quality'");
        if (cols.length === 0) {
            await connection.query("ALTER TABLE opportunities ADD COLUMN quality VARCHAR(255) AFTER quantity");
            console.log("Added 'quality' column.");
        } else {
            console.log("'quality' column already exists.");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

addQualityColumn();
