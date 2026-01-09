const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function updateTable() {
    try {
        console.log('Modifying notifications table...');
        // Alter type column to include 'message'
        await pool.query(`
            ALTER TABLE notifications 
            MODIFY COLUMN type ENUM('like', 'comment', 'follow', 'message') NOT NULL
        `);
        console.log('✅ Notifications table updated successfully.');
    } catch (error) {
        console.error('❌ Error updating table:', error);
    } finally {
        pool.end();
    }
}

updateTable();
