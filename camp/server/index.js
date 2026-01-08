const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrocore',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- ROUTES ---

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, profileType } = req.body;

    if (!name || !email || !password || !profileType) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Build hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, profile_type) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, profileType]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
        console.error('Error en registro:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
        }
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña requeridos' });
    }

    try {
        // Find user
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, name: user.name, profileType: user.profile_type },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profileType: user.profile_type
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// 3. GET PRODUCTS (Feed of "Mi Tienda")
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.name as seller_name, u.profile_type as seller_type 
            FROM products p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ message: 'Error obteniendo productos' });
    }
});

// 4. CREATE PRODUCT
app.post('/api/products', async (req, res) => {
    const { userId, name, description, price, unit, category, imageUrl } = req.body;

    // Simple validation
    if (!userId || !name || !price) {
        return res.status(400).json({ message: 'Faltan datos requeridos (userId, name, price)' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO products (user_id, name, description, price, unit, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, description, price, unit, category, imageUrl]
        );

        res.status(201).json({ message: 'Producto publicado', productId: result.insertId });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ message: 'Error al publicar producto' });
    }
});

// --- SOCIAL FEATURES ---

// 5. GET POSTS (Feed)
app.get('/api/posts', async (req, res) => {
    try {
        const userId = req.query.userId; // Optional filter by user (for profile)

        let query = `
            SELECT p.*, u.name as author_name, u.profile_type as author_type,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
        `;

        const params = [];
        if (userId) {
            query += ' WHERE p.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ message: 'Error obteniendo posts' });
    }
});

// 6. CREATE POST
app.post('/api/posts', async (req, res) => {
    const { userId, content, imageUrl } = req.body;

    if (!userId || !content) {
        return res.status(400).json({ message: 'userId y content son requeridos' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
            [userId, content, imageUrl]
        );
        res.status(201).json({ message: 'Post creado', postId: result.insertId });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creando post' });
    }
});

// 7. LIKE POST
app.post('/api/posts/:id/like', async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;

    try {
        // Check if already liked
        const [existing] = await pool.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);

        if (existing.length > 0) {
            // Unlike
            await pool.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
            return res.json({ message: 'Like removido', liked: false });
        } else {
            // Like
            await pool.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
            return res.json({ message: 'Post likeado', liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Error en like' });
    }
});

// 8. COMMENT ON POST
app.post('/api/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;
    const { userId, content } = req.body;

    if (!content) return res.status(400).json({ message: 'Comentario vacío' });

    try {
        const [result] = await pool.query(
            'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
            [userId, postId, content]
        );
        res.status(201).json({ message: 'Comentario agregado', commentId: result.insertId });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error agregando comentario' });
    }
});

// 9. GET COMMENTS
app.get('/api/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;
    try {
        const [rows] = await pool.query(`
            SELECT c.*, u.name as author_name 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ? 
            ORDER BY c.created_at ASC
        `, [postId]);
        res.json(rows);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ message: 'Error obteniendo comentarios' });
    }
});


// 10. GET USERS (Network)
app.get('/api/users', async (req, res) => {
    const currentUserId = req.query.currentUserId;
    try {
        // Get all users except current
        let query = 'SELECT id, name, email, profile_type FROM users';
        const params = [];

        if (currentUserId) {
            query += ' WHERE id != ?';
            params.push(currentUserId);
        }

        const [users] = await pool.query(query, params);

        // If currentUserId provided, check following status (inefficient n+1 but works for MVP)
        if (currentUserId) {
            for (let user of users) {
                const [rows] = await pool.query(
                    'SELECT 1 FROM connections WHERE follower_id = ? AND following_id = ?',
                    [currentUserId, user.id]
                );
                user.isFollowing = rows.length > 0;
            }
        }

        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
});

// 11. FOLLOW USER
app.post('/api/users/:id/follow', async (req, res) => {
    const followingId = req.params.id;
    const { followerId } = req.body;

    try {
        await pool.query(
            'INSERT IGNORE INTO connections (follower_id, following_id) VALUES (?, ?)',
            [followerId, followingId]
        );
        res.json({ message: 'Usuario seguido' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Error siguiendo usuario' });
    }
});

// 12. UNFOLLOW USER
app.delete('/api/users/:id/follow', async (req, res) => {
    const followingId = req.params.id;
    const { followerId } = req.body; // Use body or query for delete? Express DELETE supports body but standard is confusing. Let's assume body for JSON consistency or query.
    // Actually safer to pass followerId in body for auth context (eventually from token)

    // NOTE: For DELETE requests, some clients don't send body. Using query param might be safer if body fails. 
    // Let's check req.body first, fallback to req.query
    const finalFollowerId = followerId || req.query.followerId;

    try {
        await pool.query(
            'DELETE FROM connections WHERE follower_id = ? AND following_id = ?',
            [finalFollowerId, followingId]
        );
        res.json({ message: 'Dejado de seguir' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Error dejando de seguir' });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API de AgroCore funcionando 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

