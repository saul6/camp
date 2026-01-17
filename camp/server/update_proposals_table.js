
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function updateProposalsTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const alterations = [
            "ADD COLUMN quantity_offered VARCHAR(100) AFTER price",
            "ADD COLUMN quality VARCHAR(50) AFTER quantity_offered",
            "ADD COLUMN delivery_date DATE AFTER quality",
            "ADD COLUMN payment_terms VARCHAR(100) AFTER delivery_date",
            "ADD COLUMN transport_included BOOLEAN DEFAULT FALSE AFTER payment_terms"
        ];

        // Apply one by one to avoid syntax errors if some exist (though ADD COLUMN IF NOT EXISTS is not standard MySQL 5.7, we'll try/catch)

        for (const alt of alterations) {
            try {
                await connection.query(`ALTER TABLE proposals ${alt}`);
                console.log(`Applied: ${alt}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${alt}`);
                } else {
                    console.error(`Error applying ${alt}:`, err.message);
                }
            }
        }

        console.log('Schema update completed.');

    } catch (error) {
        console.error('Error updating proposals table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateProposalsTable();
