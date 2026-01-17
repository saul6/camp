
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function seedMarket() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Get an existing opportunity
        const [opps] = await connection.query('SELECT id, user_id FROM opportunities LIMIT 1');
        if (opps.length === 0) {
            console.log('No opportunities found. Cannot seed proposals.');
            return;
        }
        const opportunity = opps[0];
        const buyerId = opportunity.user_id;

        // 2. Get a seller (different from buyer)
        const [sellers] = await connection.query('SELECT id FROM users WHERE id != ? LIMIT 1', [buyerId]);
        if (sellers.length === 0) {
            console.log('No eligible sellers found.');
            return;
        }
        const sellerId = sellers[0].id;

        // 3. Create active proposals (34 to match mockup?)
        // Let's create small number around 34? Or just a few to verify it works. 
        // User wants "real", so let's make 34 random proposals across opportunities

        const [allOpps] = await connection.query('SELECT id, user_id FROM opportunities');

        let proposalCount = 0;
        // Check existing count
        const [countRow] = await connection.query('SELECT COUNT(*) as count FROM proposals');
        if (countRow[0].count < 34) {
            console.log('Seeding proposals...');
            for (let i = 0; i < 34; i++) {
                const randOpp = allOpps[Math.floor(Math.random() * allOpps.length)];
                await connection.query(
                    'INSERT INTO proposals (opportunity_id, seller_id, price, status) VALUES (?, ?, ?, ?)',
                    [randOpp.id, sellerId, '1200', i % 5 === 0 ? 'accepted' : 'pending']
                );
                proposalCount++;
            }
            console.log(`Added ${proposalCount} proposals.`);
        } else {
            console.log('Proposals already exist.');
        }

        // 4. Create contracts (12 to match mockup)
        const [contractCountRow] = await connection.query('SELECT COUNT(*) as count FROM contracts');
        if (contractCountRow[0].count < 12) {
            console.log('Seeding contracts...');
            // Need accepted proposals
            const [acceptedProposals] = await connection.query('SELECT id, opportunity_id, seller_id FROM proposals WHERE status = "accepted" LIMIT 12');

            for (const prop of acceptedProposals) {
                // Get buyer from opp
                const [o] = await connection.query('SELECT user_id FROM opportunities WHERE id = ?', [prop.opportunity_id]);
                const bId = o[0].user_id;

                await connection.query(
                    'INSERT INTO contracts (proposal_id, buyer_id, seller_id, status) VALUES (?, ?, ?, ?)',
                    [prop.id, bId, prop.seller_id, 'active']
                );
            }
            console.log(`Added contracts.`);
        } else {
            console.log('Contracts already exist.');
        }

        console.log('Seeding completed.');

    } catch (error) {
        console.error('Error seeding market:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedMarket();
