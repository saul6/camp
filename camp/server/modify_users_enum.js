
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function modifyProfileType() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Verify current state is ENUM or whatever, but just brute force modify to VARCHAR to be safe for diverse inputs
        await connection.query("ALTER TABLE users MODIFY COLUMN profile_type VARCHAR(50) NOT NULL");
        console.log('Modified profile_type to VARCHAR(50).');

    } catch (error) {
        console.error('Error modifying users table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

modifyProfileType();
