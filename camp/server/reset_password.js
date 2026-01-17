
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function resetPassword() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const newPassword = '123456';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await connection.query(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hashedPassword, 'moisesmed2482@gmail.com']
        );
        console.log('Password reset successfully. Affected rows:', result.affectedRows);
    } catch (error) {
        console.error(error);
    } finally {
        if (connection) await connection.end();
    }
}

resetPassword();
