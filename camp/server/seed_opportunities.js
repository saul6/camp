
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

const opportunitiesData = [
    {
        buyer_email: "contact@freshmarket.com",
        product: "Tomate",
        quantity: "20 toneladas",
        price: "3,500/kg",
        deadline: "15 días",
        requirements: "Calidad Premium, certificación GLOBALG.A.P.",
    },
    {
        buyer_email: "info@exportagro.mx",
        product: "Aguacate Hass",
        quantity: "50 toneladas",
        price: "8,000/kg",
        deadline: "30 días",
        requirements: "Calibre 16-20, madurez óptima para exportación",
    },
    {
        buyer_email: "compras@jugosvalle.com",
        product: "Naranja Valencia",
        quantity: "100 toneladas",
        price: "1,200/kg",
        deadline: "20 días",
        requirements: "Alto contenido de jugo, mínimo 12° Brix",
    },
    {
        buyer_email: "supply@restpremium.com",
        product: "Lechuga Romana",
        quantity: "5 toneladas",
        price: "800/kg",
        deadline: "7 días",
        requirements: "Frescura garantizada, entrega en frío",
    }
];

async function seedOpportunities() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        for (const opp of opportunitiesData) {
            // Find User ID by email
            const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [opp.buyer_email]);

            if (users.length > 0) {
                const userId = users[0].id;

                // Check if opportunity exists (simple check by product/user)
                const [existing] = await connection.query(
                    'SELECT id FROM opportunities WHERE user_id = ? AND product_name = ?',
                    [userId, opp.product]
                );

                if (existing.length === 0) {
                    await connection.query(
                        'INSERT INTO opportunities (user_id, product_name, quantity, price, deadline, requirements) VALUES (?, ?, ?, ?, ?, ?)',
                        [userId, opp.product, opp.quantity, opp.price, opp.deadline, opp.requirements]
                    );
                    console.log(`Created opportunity: ${opp.product} for user ${userId}`);
                } else {
                    console.log(`Opportunity ${opp.product} already exists for user ${userId}`);
                }
            } else {
                console.warn(`User ${opp.buyer_email} not found. Skipping opportunity.`);
            }
        }
        console.log('Seeding completed.');

    } catch (error) {
        console.error('Error seeding opportunities:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedOpportunities();
