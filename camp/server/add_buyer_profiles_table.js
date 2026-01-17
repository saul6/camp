
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function addBuyerProfilesTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS buyer_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                location VARCHAR(255),
                volume VARCHAR(100),
                seeking_tags TEXT,
                verified BOOLEAN DEFAULT FALSE,
                rating DECIMAL(3, 1) DEFAULT 0.0,
                reviews_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `;

        await connection.query(createTableQuery);
        console.log('Table \`buyer_profiles\` created or already exists.');

    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

addBuyerProfilesTable();
