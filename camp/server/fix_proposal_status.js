
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function fixSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Updating proposals status column...");
        await connection.query("ALTER TABLE proposals MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'negotiating', 'countered') DEFAULT 'pending'");
        console.log("Schema updated successfully.");
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();
