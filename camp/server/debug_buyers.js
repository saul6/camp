
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkBuyers() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        const [users] = await connection.query("SELECT id, name, profile_type FROM users WHERE profile_type = 'Comercializadora'");
        console.log('Comercializadora Users:', users.length);
        users.forEach(u => console.log(`- ${u.name} (${u.id})`));

        const [profiles] = await connection.query("SELECT * FROM buyer_profiles");
        console.log('Buyer Profiles:', profiles.length);
        profiles.forEach(p => console.log(`- For User ${p.user_id}: ${p.location}`));

    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkBuyers();
