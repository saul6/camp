const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'agrocore'
    });

    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS product_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('Table product_comments created successfully');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await connection.end();
    }
}

createTable();
