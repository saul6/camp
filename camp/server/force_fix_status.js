
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function forceFixSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        console.log("Checking current schema...");
        const [desc1] = await connection.query("SHOW COLUMNS FROM proposals LIKE 'status'");
        console.log("Current Type:", desc1[0].Type);

        console.log("Altering column...");
        // Using MODIFY COLUMN with the full definition
        await connection.query("ALTER TABLE proposals MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'negotiating', 'countered') NOT NULL DEFAULT 'pending'");

        console.log("Re-checking schema...");
        const [desc2] = await connection.query("SHOW COLUMNS FROM proposals LIKE 'status'");
        console.log("New Type:", desc2[0].Type);

    } catch (error) {
        console.error("Schema Update Failed:", error);
    } finally {
        if (connection) await connection.end();
    }
}

forceFixSchema();
