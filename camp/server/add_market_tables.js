
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function addMarketTables() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Proposals Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS proposals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                opportunity_id INT NOT NULL,
                seller_id INT NOT NULL,
                price VARCHAR(100),
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('Table \`proposals\` verified.');

        // Contracts Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contracts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                proposal_id INT NOT NULL,
                buyer_id INT NOT NULL,
                seller_id INT NOT NULL,
                status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
                start_date DATE,
                end_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
                FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
        console.log('Table \`contracts\` verified.');

    } catch (error) {
        console.error('Error creating market tables:', error);
    } finally {
        if (connection) await connection.end();
    }
}

addMarketTables();
