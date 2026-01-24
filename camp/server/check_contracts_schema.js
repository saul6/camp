
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkContractsSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('DESCRIBE contracts');
        rows.filter(r => ['price', 'quantity'].includes(r.Field)).forEach(r => console.log(`${r.Field}: ${r.Type}`));
        if (rows.filter(r => ['price', 'quantity'].includes(r.Field)).length === 0) console.log("Missing price/quantity columns!");
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkContractsSchema();
