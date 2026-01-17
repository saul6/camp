
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore'
};

async function updateCommentsTable() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado a la base de datos.');

        // Add parent_id column
        try {
            await connection.query(`
                ALTER TABLE comments
                ADD COLUMN parent_id INT DEFAULT NULL,
                ADD CONSTRAINT fk_comment_parent
                FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
            `);
            console.log('Columna parent_id agregada exitosamente a la tabla comments.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('La columna parent_id ya existe.');
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('Error actualizando la tabla:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateCommentsTable();
