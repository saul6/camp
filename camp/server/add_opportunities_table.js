
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function addOpportunitiesTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS opportunities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                quantity VARCHAR(100),
                price VARCHAR(100),
                deadline VARCHAR(100),
                requirements TEXT,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `;

        await connection.query(createTableQuery);
        console.log('Table \`opportunities\` created or already exists.');

    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

addOpportunitiesTable();
