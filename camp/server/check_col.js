
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkColumn() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        const [rows] = await connection.query("SHOW COLUMNS FROM proposals LIKE 'quantity_offered'");
        if (rows.length > 0) {
            console.log('quantity_offered EXISTS');
        } else {
            console.log('quantity_offered MISSING');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkColumn();
