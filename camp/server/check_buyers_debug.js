
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function checkBuyers() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        // 1. Get all users with type Comercializadora
        const [users] = await connection.query('SELECT id, name, email, profile_type FROM users WHERE profile_type LIKE "%Comercializadora%"');
        console.log('--- USERS (Comercializadora) ---');
        console.table(users);

        if (users.length === 0) {
            console.log('No users found with profile_type "Comercializadora". Check casing?');
            const [allUsers] = await connection.query('SELECT id, name, profile_type FROM users LIMIT 10');
            console.log('First 10 users:', allUsers);
            return;
        }

        // 2. Check their profiles
        const userIds = users.map(u => u.id);
        if (userIds.length > 0) {
            const [profiles] = await connection.query(`SELECT * FROM buyer_profiles WHERE user_id IN (${userIds.join(',')})`);
            console.log('--- BUYER PROFILES ---');
            console.table(profiles);

            // 3. Find who is missing
            const profileUserIds = profiles.map(p => p.user_id);
            const missing = userIds.filter(id => !profileUserIds.includes(id));
            if (missing.length > 0) {
                console.log(`WARNING: Users with IDs ${missing.join(', ')} are missing buyer_profiles entries.`);
                console.log('This is why they do not appear in the directory (INNER JOIN).');
            } else {
                console.log('All Comercializadora users have profiles. Check API filtering/query.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkBuyers();
