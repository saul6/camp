
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function createProducerProfiles() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS producer_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                crops JSON,
                location VARCHAR(255),
                hectares VARCHAR(50),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        await connection.query(createTableQuery);
        console.log('Created producer_profiles table.');

    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createProducerProfiles();
