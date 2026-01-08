const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function updateDatabase() {
    let connection;
    try {
        console.log('Connecting to database server...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema updates...');
        await connection.query(schemaSql);

        console.log('Database updated successfully!');
    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateDatabase();
