
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function fixMissingContract() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Checking for 'accepted' proposals without contracts...");

        // Find proposals that are Accepted but have NO contract
        const [orphaned] = await connection.query(`
            SELECT p.*, o.user_id as buyer_id 
            FROM proposals p
            JOIN opportunities o ON p.opportunity_id = o.id
            LEFT JOIN contracts c ON p.id = c.proposal_id
            WHERE p.status = 'accepted' AND c.id IS NULL
        `);

        console.log(`Found ${orphaned.length} orphaned accepted proposals.`);

        for (const p of orphaned) {
            console.log(`Creating contract for Proposal ${p.id}...`);
            await connection.query(`
                INSERT INTO contracts (proposal_id, seller_id, buyer_id, price, quantity, status, start_date)
                VALUES (?, ?, ?, ?, ?, 'active', NOW())
            `, [p.id, p.seller_id, p.buyer_id, p.price, p.quantity_offered]);
        }

        console.log("Fix complete.");

    } catch (error) {
        console.error("Fix Failed:", error);
    } finally {
        if (connection) await connection.end();
    }
}

fixMissingContract();
