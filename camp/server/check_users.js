require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsers() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'campconnect'
    });

    try {
        const [rows] = await connection.execute('SELECT * FROM users');
        console.log('--- USUARIOS REGISTRADOS ---');
        console.table(rows);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkUsers();
