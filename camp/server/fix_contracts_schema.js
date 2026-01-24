
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function fixContractsSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Adding price and quantity to contracts...");
        await connection.query("ALTER TABLE contracts ADD COLUMN price decimal(10,2), ADD COLUMN quantity VARCHAR(255)");
        console.log("Schema updated successfully.");
    } catch (error) {
        console.error("Schema Update Failed:", error);
    } finally {
        if (connection) await connection.end();
    }
}

fixContractsSchema();
