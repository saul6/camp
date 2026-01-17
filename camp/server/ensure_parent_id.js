
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkAndFixSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if parent_id exists in comments
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'parent_id'
        `, [dbConfig.database]);

        if (columns.length === 0) {
            console.log('Column parent_id missing. Adding it...');
            await connection.query(`
                ALTER TABLE comments
                ADD COLUMN parent_id INT DEFAULT NULL,
                ADD CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
            `);
            console.log('Column parent_id added successfully.');
        } else {
            console.log('Column parent_id already exists.');
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkAndFixSchema();
