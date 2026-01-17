
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkProposals() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [rows] = await connection.query('SELECT seller_id, COUNT(*) as count FROM proposals GROUP BY seller_id');
        console.log('Proposals per Seller:');
        rows.forEach(r => console.log(`Seller ID ${r.seller_id}: ${r.count} proposals`));

        const [contractRows] = await connection.query('SELECT seller_id, COUNT(*) as count FROM contracts GROUP BY seller_id');
        console.log('Contracts per Seller:');
        contractRows.forEach(r => console.log(`Seller ID ${r.seller_id}: ${r.count} contracts`));

    } catch (error) {
        console.error('Error checking proposals:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkProposals();
