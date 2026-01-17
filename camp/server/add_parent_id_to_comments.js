const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'agrocore'
    });

    try {
        // Check if column exists first to avoid error
        const [columns] = await connection.execute(`
            SHOW COLUMNS FROM product_comments LIKE 'parent_id'
        `);

        if (columns.length === 0) {
            await connection.execute(`
                ALTER TABLE product_comments
                ADD COLUMN parent_id INT DEFAULT NULL AFTER product_id,
                ADD CONSTRAINT fk_comment_parent
                FOREIGN KEY (parent_id) REFERENCES product_comments(id) ON DELETE CASCADE
            `);
            console.log('Column parent_id added successfully');
        } else {
            console.log('Column parent_id already exists');
        }
    } catch (error) {
        console.error('Error altering table:', error);
    } finally {
        await connection.end();
    }
}

alterTable();
