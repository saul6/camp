
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function fixSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a la base de datos.');

        // 1. Check if column exists
        const [columns] = await connection.query(`SHOW COLUMNS FROM comments LIKE 'parent_id'`);

        if (columns.length === 0) {
            console.log('Columna parent_id NO existe. Agregándola...');
            await connection.query(`ALTER TABLE comments ADD COLUMN parent_id INT DEFAULT NULL`);
            console.log('Columna parent_id agregada.');
        } else {
            console.log('Columna parent_id YA existe.');
        }

        // 2. Try to add FK (separately)
        try {
            await connection.query(`
                ALTER TABLE comments
                ADD CONSTRAINT fk_comment_parent
                FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
            `);
            console.log('Constraint fk_comment_parent agregada.');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME' || error.sqlMessage.includes('Duplicate')) {
                console.log('Constraint fk_comment_parent YA existe.');
            } else {
                console.warn('Error al agregar constraint (puede que ya exista o haya otro problema):', error.message);
            }
        }

    } catch (error) {
        console.error('Error crítico:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixSchema();
