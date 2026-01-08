const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function updateSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database...');

        // Verify connection to the right DB
        const [rows] = await connection.query('SELECT DATABASE()');
        console.log('Current DB:', rows[0]['DATABASE()']);

        // Alter table
        await connection.query('ALTER TABLE posts MODIFY COLUMN image_url LONGTEXT');
        console.log('Successfully changed posts.image_url to LONGTEXT');

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
