
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
        const [rows] = await connection.query('DESCRIBE opportunities');
        console.log('--- OPPORTUNITIES ---');
        console.log(JSON.stringify(rows.map(r => ({ Field: r.Field, Type: r.Type })), null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
