
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

const buyersData = [
    {
        name: "FreshMarket Corp",
        email: "contact@freshmarket.com",
        profile_type: "Comercializadora", // Using existing ENUM type
        location: "Zamora, México",
        rating: 4.8,
        reviews: 245,
        seeking: ["Frutas", "Hortalizas", "Tubérculos"],
        volume: "500+ ton/mes",
        verified: true,
    },
    {
        name: "ExportAgro S.A.",
        email: "info@exportagro.mx",
        profile_type: "Comercializadora",
        location: "Jacona, México",
        rating: 4.9,
        reviews: 189,
        seeking: ["Café", "Aguacate", "Flores"],
        volume: "1000+ ton/mes",
        verified: true,
    },
    {
        name: "Jugos Naturales del Valle",
        email: "compras@jugosvalle.com",
        profile_type: "Comercializadora",
        location: "Chilchota, México",
        rating: 4.7,
        reviews: 134,
        seeking: ["Cítricos", "Frutas Tropicales"],
        volume: "300+ ton/mes",
        verified: true,
    },
    {
        name: "Restaurantes Premium",
        email: "supply@restpremium.com",
        profile_type: "Comercializadora",
        location: "Chavinda, México",
        rating: 4.6,
        reviews: 98,
        seeking: ["Vegetales Orgánicos", "Hierbas"],
        volume: "50+ ton/mes",
        verified: false,
    }
];

async function seedBuyers() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const passwordHash = await bcrypt.hash('password123', 10);

        for (const buyer of buyersData) {
            // 1. Check/Insert User
            let userId;
            const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [buyer.email]);

            if (users.length > 0) {
                userId = users[0].id;
                console.log(`User ${buyer.name} already exists (ID: ${userId})`);
            } else {
                const [result] = await connection.query(
                    'INSERT INTO users (name, email, password_hash, profile_type) VALUES (?, ?, ?, ?)',
                    [buyer.name, buyer.email, passwordHash, buyer.profile_type]
                );
                userId = result.insertId;
                console.log(`Created user ${buyer.name} (ID: ${userId})`);
            }

            // 2. Check/Insert Profile
            const [profiles] = await connection.query('SELECT id FROM buyer_profiles WHERE user_id = ?', [userId]);

            if (profiles.length === 0) {
                await connection.query(
                    'INSERT INTO buyer_profiles (user_id, location, volume, seeking_tags, verified, rating, reviews_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        userId,
                        buyer.location,
                        buyer.volume,
                        JSON.stringify(buyer.seeking), // Store as JSON string
                        buyer.verified,
                        buyer.rating,
                        buyer.reviews
                    ]
                );
                console.log(`Created profile for ${buyer.name}`);
            } else {
                console.log(`Profile for ${buyer.name} already exists`);
            }
        }

        console.log('Seeding completed.');

    } catch (error) {
        console.error('Error seeding buyers:', error);
    } finally {
        if (connection) await connection.end();
    }
}

seedBuyers();
