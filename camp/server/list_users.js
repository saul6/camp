const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log("--- Users in DB ---");
        const [users] = await pool.query('SELECT id, name, email FROM users');
        console.log(users);
        console.log("-------------------");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

checkUsers();
