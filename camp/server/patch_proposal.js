
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function patchProposal() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Patching proposal for Melon Verde...");
        // Update the specific proposal that has price 4.50 to 4.10
        const [result] = await connection.query(
            "UPDATE proposals SET price = '4.10', quantity_offered = '10 Toneladas' WHERE price = '4.50' AND status = 'countered'"
        );
        console.log(`Updated ${result.affectedRows} offers.`);

    } catch (error) {
        console.error("Patch Failed:", error);
    } finally {
        if (connection) await connection.end();
    }
}

patchProposal();
