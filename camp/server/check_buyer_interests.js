
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkBuyerData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        // Assuming current user ID is 8 from previous checks
        const [rows] = await connection.query("SELECT * FROM buyer_profiles WHERE user_id = 8");
        console.log('Buyer Profile for user 8:');
        console.log(rows);

        // Also check if 'seeking' is in users just in case
        const [uRows] = await connection.query("SELECT seeking FROM users WHERE id = 8");
        // Likely not there if it's specialized, but checking.
        if (uRows.length && uRows[0].seeking) {
            console.log('User Table Seeking: ', uRows[0].seeking);
        }

    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

checkBuyerData();
