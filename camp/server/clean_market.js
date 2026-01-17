
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function cleanMarket() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Delete seeded proposals (price = 1200)
        const [res] = await connection.query("DELETE FROM proposals WHERE price = '1200'");
        console.log(`Deleted ${res.affectedRows} seeded proposals.`);

        // Delete seeded contracts (linked to those proposals? access via proposal_id if cascading... but contracts table has proposal_id)
        // Actually, if ON DELETE CASCADE is set, deleting proposals deletes contracts.
        // Let's check if contracts remain.
        // Seeding contracts used accepted proposals... which had price 1200.
        // So cascading should handle it.
        // But just in case, seed script inserted 'active' status directly?
        // Let's just check count afterwards.

        const [pCount] = await connection.query('SELECT COUNT(*) as c FROM proposals');
        const [cCount] = await connection.query('SELECT COUNT(*) as c FROM contracts');

        console.log(`Remaining Proposals: ${pCount[0].c}`);
        console.log(`Remaining Contracts: ${cCount[0].c}`);

    } catch (error) {
        console.error('Error cleaning market:', error);
    } finally {
        if (connection) await connection.end();
    }
}

cleanMarket();
