
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [columns] = await connection.query('DESCRIBE proposals');
        console.log('Columns:');
        columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
