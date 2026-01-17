
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkComments() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM comments ORDER BY created_at DESC LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkComments();
