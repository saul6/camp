
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function updateUsersTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const alterations = [
            "ADD COLUMN company_name VARCHAR(255) AFTER name",
            "ADD COLUMN phone VARCHAR(50) AFTER company_name"
        ];

        for (const alt of alterations) {
            try {
                await connection.query(`ALTER TABLE users ${alt}`);
                console.log(`Applied: ${alt}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${alt}`);
                } else {
                    console.error(`Error applying ${alt}:`, err.message);
                }
            }
        }
        console.log('Users schema update completed.');

    } catch (error) {
        console.error('Error updating users table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateUsersTable();
