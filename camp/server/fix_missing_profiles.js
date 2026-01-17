
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function fixMissingProfiles() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // 1. Find missing
        const [users] = await connection.query('SELECT id, name FROM users WHERE profile_type LIKE "%Comercializadora%"');
        const userIds = users.map(u => u.id);

        if (userIds.length === 0) {
            console.log('No Comercializadora users found.');
            return;
        }

        const [profiles] = await connection.query(`SELECT user_id FROM buyer_profiles WHERE user_id IN (${userIds.join(',')})`);
        const profileUserIds = profiles.map(p => p.user_id);

        const missingIds = userIds.filter(id => !profileUserIds.includes(id));

        if (missingIds.length === 0) {
            console.log('All users have profiles. Nothing to fix.');
            return;
        }

        console.log('Fixing users:', missingIds);

        // 2. Insert default profiles
        for (const uid of missingIds) {
            await connection.query(`
                INSERT INTO buyer_profiles (user_id, location, volume, seeking_tags, verified, rating, reviews_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [uid, 'Ubicación Pendiente', 'Nivel Inicial', '[]', 0, 5.0, 0]);
            console.log(`Created default profile for user ${uid}`);
        }

        console.log('Done.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixMissingProfiles();
