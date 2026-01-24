const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Safe filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext)
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room for private notifications
    socket.on('join_user', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined user_${userId}`);
        }
    });

    // Typing Indicators
    socket.on('typing_start', ({ toUserId, fromUserId }) => {
        io.to(`user_${toUserId}`).emit('typing_start', { fromUserId });
    });

    socket.on('typing_stop', ({ toUserId, fromUserId }) => {
        io.to(`user_${toUserId}`).emit('typing_stop', { fromUserId });
    });

    // Mark Messages as Read
    socket.on('mark_read', async ({ senderId, receiverId }) => {
        // senderId is the one who sent the messages (the OTHER person)
        // receiverId is ME (the one reading them)
        try {
            await pool.query(
                'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
                [senderId, receiverId]
            );
            // Notify the sender that their messages were read
            io.to(`user_${senderId}`).emit('messages_read', { byUserId: receiverId });
        } catch (error) {
            console.error('Error marking read via socket:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Helper to send notification
async function sendNotification(userId, actorId, type, referenceId) {
    if (userId == actorId) return; // Don't notify self

    try {
        // 1. Save to DB
        await pool.query(
            'INSERT INTO notifications (user_id, actor_id, type, reference_id) VALUES (?, ?, ?, ?)',
            [userId, actorId, type, referenceId]
        );

        // 2. Emit to Socket Room
        io.to(`user_${userId}`).emit('new_notification', {
            type,
            actorId,
            referenceId,
            createdAt: new Date()
        });
        console.log(`Notification sent to user_${userId}`);

    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// --- ROUTES ---

// 1. REGISTER USER
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, profileType, companyName, phone, crops } = req.body;

    if (!name || !email || !password || !profileType) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Check if user exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (name, company_name, phone, email, password_hash, profile_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name, companyName || null, phone || null, email, hashedPassword, profileType]
        );
        const userId = result.insertId;

        // Auto-create Buyer Profile for Comercializadoras
        if (profileType === 'comercializadora') {
            await pool.query(
                `INSERT INTO buyer_profiles (user_id, location, verified, rating, reviews_count, volume, seeking_tags) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, 'Ubicación Pendiente', false, 0, 0, 'Volumen Pendiente', JSON.stringify(crops || [])]
            );
        } else if (profileType === 'agricola') {
            await pool.query(
                `INSERT INTO producer_profiles (user_id, crops, location, hectares) 
                 VALUES (?, ?, ?, ?)`,
                [userId, JSON.stringify(crops || []), 'Ubicación Pendiente', 'No especificado']
            );
        }

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: userId });

    } catch (error) {
        console.error('Error in register:', error);
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
        const userId = req.query.userId;
        let query = `
            SELECT p.*, u.name as seller_name, u.profile_type as seller_type 
            FROM products p 
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
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ message: 'Error obteniendo productos' });
    }
});

// 4. CREATE PRODUCT
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { userId, name, description, price, unit, category } = req.body;
        const imageUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : req.body.imageUrl;

        // Simple validation
        if (!userId || !name || !price) {
            return res.status(400).json({ message: 'Faltan datos requeridos (userId, name, price)' });
        }

        const [result] = await pool.query(
            'INSERT INTO products (user_id, name, description, price, unit, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, description, price, unit, category, imageUrl]
        );

        res.status(201).json({ message: 'Producto publicado', productId: result.insertId, imageUrl });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ message: 'Error al publicar producto' });
    }
});

// 4.5 GET SINGLE PRODUCT DETAILS
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const [rows] = await pool.query(`
            SELECT p.*, u.name as seller_name, u.email as seller_email, u.profile_type as seller_type, u.id as seller_id
            FROM products p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `, [productId]);

        if (rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ message: 'Error obteniendo detalles del producto' });
    }
});

// 4.6 ADD COMMENT TO PRODUCT
app.post('/api/products/:id/comments', async (req, res) => {
    try {
        const productId = req.params.id;
        const { userId, content, parentId } = req.body;

        if (!userId || !content) return res.status(400).json({ message: 'Faltan datos' });

        const [result] = await pool.query(
            'INSERT INTO product_comments (user_id, product_id, content, parent_id) VALUES (?, ?, ?, ?)',
            [userId, productId, content, parentId || null]
        );

        // Notify Logic
        let notifiedUsers = new Set();

        // 1. Check for @Mentions (Case insensitive, accents)
        // Capture up to 2 words after @. Matches "Name" or "Name Surname"
        const mentionMatch = content.match(/@([a-zA-Z0-9À-ÿ]+(?: [a-zA-Z0-9À-ÿ]+)?)/);
        if (mentionMatch) {
            const mentionedName = mentionMatch[1].trim();
            console.log(`[NOTIF] Checking mention for: '${mentionedName}'`);

            const [mentionedUser] = await pool.query('SELECT id FROM users WHERE name = ?', [mentionedName]);
            if (mentionedUser.length > 0) {
                const targetId = mentionedUser[0].id;
                if (targetId !== userId) {
                    await sendNotification(targetId, userId, 'product_reply', productId);
                    notifiedUsers.add(targetId);
                    console.log(`[NOTIF] Sent mention notification to user ${targetId}`);
                }
            } else {
                console.log(`[NOTIF] User '${mentionedName}' not found`);
            }
        }

        // 2. Notify Parent Author (if exists and wasn't just notified)
        if (parentId) {
            const [parentComment] = await pool.query('SELECT user_id FROM product_comments WHERE id = ?', [parentId]);
            if (parentComment.length > 0) {
                const parentAuthorId = parentComment[0].user_id;
                if (parentAuthorId !== userId && !notifiedUsers.has(parentAuthorId)) {
                    await sendNotification(parentAuthorId, userId, 'product_reply', productId);
                    notifiedUsers.add(parentAuthorId);
                    console.log(`[NOTIF] Sent reply notification to parent author ${parentAuthorId}`);
                }
            }
        }

        // 3. Notify Seller (if it's a root comment, or maybe even if it's a reply but seller wants to know?)
        // Usually seller wants to know only if it's a direct question (root) or if they are mentioned/replied to.
        // Let's stick to: Root comment -> Notify Seller.
        if (!parentId) {
            const [product] = await pool.query('SELECT user_id FROM products WHERE id = ?', [productId]);
            if (product.length > 0) {
                const sellerId = product[0].user_id;
                if (sellerId !== userId && !notifiedUsers.has(sellerId)) {
                    await sendNotification(sellerId, userId, 'product_comment', productId);
                    console.log(`[NOTIF] Sent new question notification to seller ${sellerId}`);
                }
            }
        }


        // --- NEW: Real-time Comment Update ---
        // Fetch the inserted comment with user details to broadcast it
        const [newCommentData] = await pool.query(`
            SELECT c.*, u.name as user_name 
            FROM product_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        if (newCommentData.length > 0) {
            io.emit('new_comment', {
                productId: productId,
                comment: newCommentData[0]
            });
            console.log(`[SOCKET] Broadcasted new_comment for product ${productId}`);
        }
        // -------------------------------------

        res.status(201).json({ message: 'Comentario enviado', commentId: result.insertId });
    } catch (error) {
        console.error('Error comentando producto:', error);
        res.status(500).json({ message: 'Error al enviar comentario' });
    }
});

// 4.7 GET PRODUCT COMMENTS
app.get('/api/products/:id/comments', async (req, res) => {
    try {
        const productId = req.params.id;
        const [rows] = await pool.query(`
            SELECT c.*, u.name as user_name 
            FROM product_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.product_id = ?
            ORDER BY c.created_at ASC
        `, [productId]);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo comentarios de producto:', error);
        res.status(500).json({ message: 'Error obteniendo preguntas' });
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
// 6. CREATE POST
app.post('/api/posts', upload.single('image'), async (req, res) => {
    try {
        // Multer parses body after file
        const { userId, content } = req.body;
        const imageUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : req.body.imageUrl;

        if (!userId || (!content && !imageUrl)) {
            return res.status(400).json({ message: 'userId y content/image son requeridos' });
        }

        const [result] = await pool.query(
            'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
            [userId, content, imageUrl]
        );
        res.status(201).json({ message: 'Post creado', postId: result.insertId, imageUrl });
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

            // NOTIFICATION
            // Get post owner
            const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
            if (post.length > 0) {
                sendNotification(post[0].user_id, userId, 'like', postId);
            }

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
    const { userId, content, parentId } = req.body;

    if (!content) return res.status(400).json({ message: 'Comentario vacío' });

    try {
        const [result] = await pool.query(
            'INSERT INTO comments (user_id, post_id, content, parent_id) VALUES (?, ?, ?, ?)',
            [userId, postId, content, parentId || null]
        );

        // NOTIFICATION
        if (parentId) {
            // It's a reply, notify the author of the parent comment
            const [parentComment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [parentId]);
            if (parentComment.length > 0) {
                const parentAuthorId = parentComment[0].user_id;
                if (parentAuthorId !== userId) {
                    sendNotification(parentAuthorId, userId, 'reply', postId); // 'reply' type for post comments replies? Or reuse 'product_reply'? 
                    // Let's use 'comment_reply' or just generic 'reply' if the frontend handles it. 
                    // Previously we used 'product_reply'. For posts, maybe 'post_reply'?
                    // Looking at NotificationDropdown.tsx might be needed, but for now let's stick to 'comment' or add 'post_reply'
                }
            }
        }

        // Notify post owner logic (always or only if root?) 
        // Usually, post owner wants to know about all comments on their post.
        const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
        if (post.length > 0) {
            const postOwnerId = post[0].user_id;
            // Don't notify if I am the owner
            if (postOwnerId !== userId) {
                // Check if we already notified this user as a parent author
                let alreadyNotified = false;
                if (parentId) {
                    const [parentComment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [parentId]);
                    if (parentComment.length > 0 && parentComment[0].user_id === postOwnerId) {
                        alreadyNotified = true;
                    }
                }

                if (!alreadyNotified) {
                    sendNotification(postOwnerId, userId, 'comment', postId);
                }
            }
        }

        res.status(201).json({ message: 'Comentario agregado', commentId: result.insertId });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error agregando comentario' });
    }
});

// 9. GET COMMENTS
app.get('/api/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;
    const currentUserId = req.query.userId || 0;
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.*, 
                u.name as author_name,
                (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
                (SELECT COUNT(*) > 0 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as is_liked
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ? 
            ORDER BY c.created_at ASC
        `, [currentUserId, postId]);

        // Convert is_liked to boolean (MySQL returns 1/0)
        const comments = rows.map(c => ({
            ...c,
            is_liked: !!c.is_liked
        }));

        res.json(comments);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ message: 'Error obteniendo comentarios' });
    }
});

// LIKE COMMENT
app.post('/api/comments/:id/like', async (req, res) => {
    const commentId = req.params.id;
    const { userId } = req.body;

    try {
        // Check if already liked
        const [existing] = await pool.query(
            'SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?',
            [userId, commentId]
        );

        let liked = false;
        if (existing.length > 0) {
            // Unlike
            await pool.query(
                'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
                [userId, commentId]
            );
        } else {
            // Like
            await pool.query(
                'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
                [userId, commentId]
            );
            liked = true;

            // Notification
            const [commentRows] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [commentId]);
            if (commentRows.length > 0) {
                const commentAuthorId = commentRows[0].user_id;
                sendNotification(commentAuthorId, userId, 'like_comment', commentId);
            }
        }

        res.json({ liked });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ message: 'Error dando like al comentario' });
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

// 10.5. GET BUYERS DIRECTORY
app.get('/api/buyers', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id, u.name, u.profile_type as type, 
                bp.location, bp.rating, bp.reviews_count as reviews, 
                bp.volume, bp.seeking_tags, bp.verified
            FROM users u
            JOIN buyer_profiles bp ON u.id = bp.user_id
            WHERE u.profile_type = 'Comercializadora'
        `);

        const buyers = rows.map(b => ({
            ...b,
            seeking: b.seeking_tags ? JSON.parse(b.seeking_tags) : [],
            verified: !!b.verified,
            rating: parseFloat(b.rating)
        }));

        res.json(buyers);
    } catch (error) {
        console.error('Error fetching buyers:', error);
        res.status(500).json({ message: 'Error obteniendo compradores' });
    }
});

// 10.6 GET OPPORTUNITIES
app.get('/api/opportunities', async (req, res) => {
    const userId = req.query.userId;
    try {
        let query = `
            SELECT 
                o.id, o.product_name as product, o.quantity, o.quality, o.price, o.deadline, o.requirements, o.status,
                u.name as buyer
            FROM opportunities o
            JOIN users u ON o.user_id = u.id
        `;
        const params = [];

        // Filter by userId if provided (Mis Ofertas)
        // Otherwise only ACTIVE (Public Marketplace)
        if (userId) {
            query += ` WHERE o.user_id = ? ORDER BY o.created_at DESC`;
            params.push(userId);
        } else {
            query += ` WHERE o.status = 'active' ORDER BY o.created_at DESC`;
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({ message: 'Error obteniendo oportunidades' });
    }
});

// 10.6.5 CREATE OPPORTUNITY
app.post('/api/opportunities', async (req, res) => {
    const { product, quantity, quality, price, deadline, requirements, userId } = req.body;
    try {
        await pool.query(
            `INSERT INTO opportunities (user_id, product_name, quantity, quality, price, deadline, requirements, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
            [userId, product, quantity, quality, price, deadline, requirements]
        );
        res.status(201).json({ message: 'Oportunidad creada' });
    } catch (error) {
        console.error('Error creating opportunity:', error);
        res.status(500).json({ message: 'Error creando oportunidad' });
    }
});

// 10.6.6 UPDATE OPPORTUNITY
app.put('/api/opportunities/:id', async (req, res) => {
    const { status, product, quantity, quality, price, deadline, requirements } = req.body;
    const oppId = req.params.id;

    try {
        // Build update query dynamically
        if (status) {
            await pool.query('UPDATE opportunities SET status = ? WHERE id = ?', [status, oppId]);
        } else {
            await pool.query(
                `UPDATE opportunities SET product_name=?, quantity=?, quality=?, price=?, deadline=?, requirements=? WHERE id=?`,
                [product, quantity, quality, price, deadline, requirements, oppId]
            );
        }
        res.json({ message: 'Oportunidad actualizada' });
    } catch (error) {
        console.error('Error updating opportunity:', error);
        res.status(500).json({ message: 'Error actualizando oportunidad' });
    }
});

// 10.7 GET MARKET STATS
app.get('/api/market/stats', async (req, res) => {
    const userId = req.query.userId;
    try {
        // Global Market Stats
        const [buyers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE profile_type="Comercializadora"');
        const [opportunities] = await pool.query('SELECT COUNT(*) as count FROM opportunities WHERE status="active"');

        // User Specific Stats
        let proposalsCount = 0;
        let contractsCount = 0;

        if (userId) {
            // Count Sent (Seller) AND Received (Buyer - via Opportunity ownership)
            const [proposals] = await pool.query(`
                SELECT COUNT(*) as count 
                FROM proposals p
                LEFT JOIN opportunities o ON p.opportunity_id = o.id
                WHERE p.seller_id = ? OR o.user_id = ?
            `, [userId, userId]);

            // Count Contracts (Seller or Buyer)
            const [contracts] = await pool.query('SELECT COUNT(*) as count FROM contracts WHERE (seller_id = ? OR buyer_id = ?) AND status="active"', [userId, userId]);

            proposalsCount = proposals[0].count;
            contractsCount = contracts[0].count;
        }

        res.json({
            buyers: buyers[0].count,
            opportunities: opportunities[0].count,
            proposals: proposalsCount,
            contracts: contractsCount
        });
    } catch (error) {
        console.error('Error fetching market stats:', error);
        res.status(500).json({ message: 'Error obteniendo estadisticas de mercado' });
    }
});

// 10.8 CREATE PROPOSAL
app.post('/api/proposals', async (req, res) => {
    console.log('Received POST /api/proposals');
    console.log('Body:', req.body);

    const { opportunityId, sellerId, price, message, quantityOffered, quality, deliveryDate, paymentTerms, transportIncluded } = req.body;

    if (!opportunityId || !sellerId || !price) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Faltan datos requeridos (opportunityId, sellerId, price)' });
    }

    try {
        console.log('Executing INSERT query...');
        // 1. Create Proposal
        const [result] = await pool.query(
            `INSERT INTO proposals 
            (opportunity_id, seller_id, price, quantity_offered, quality, delivery_date, payment_terms, transport_included, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [opportunityId, sellerId, price, quantityOffered || null, quality || null, deliveryDate || null, paymentTerms || null, transportIncluded ? 1 : 0, 'pending']
        );
        console.log('Insert success. ID:', result.insertId);
        const proposalId = result.insertId;

        // 2. Notify Buyer (Opportunity Owner)
        // Get buyerId from opportunity
        const [opps] = await pool.query('SELECT user_id, product_name FROM opportunities WHERE id = ?', [opportunityId]);
        if (opps.length > 0) {
            const buyerId = opps[0].user_id;
            sendNotification(buyerId, sellerId, 'proposal_received', proposalId);
        }

        res.status(201).json({ message: 'Propuesta enviada exitosamente', id: proposalId });

    } catch (error) {
        console.error('Error creating proposal:', error); // This log is crucial
        console.error('SQL Message:', error.sqlMessage);
        res.status(500).json({ message: 'Error enviando propuesta: ' + error.message }); // Return error to client for visibility
    }
});

// 10.9 GET PROPOSALS (Filtered)
app.get('/api/proposals', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    try {
        // Fetch proposals where user is seller (sent) OR user is buyer (received via opportunity ownership)
        const [rows] = await pool.query(`
            SELECT 
                p.*,
                o.product_name, o.user_id as buyer_id,
                u_seller.name as seller_name,
                u_buyer.name as buyer_name
            FROM proposals p
            JOIN opportunities o ON p.opportunity_id = o.id
            JOIN users u_seller ON p.seller_id = u_seller.id
            JOIN users u_buyer ON o.user_id = u_buyer.id
            WHERE p.seller_id = ? OR o.user_id = ?
            ORDER BY p.created_at DESC
        `, [userId, userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error getting proposals:', error);
        res.status(500).json({ message: 'Error obteniendo propuestas' });
    }
});

// 10.10 UPDATE PROPOSAL STATUS
app.put('/api/proposals/:id/status', async (req, res) => {
    const { status, price } = req.body;
    const proposalId = req.params.id;

    try {
        // Update Status
        await pool.query('UPDATE proposals SET status = ? WHERE id = ?', [status, proposalId]);

        // If Accepted, create Contract
        if (status === 'accepted') {
            // Fetch proposal details to create contract
            const [props] = await pool.query('SELECT * FROM proposals WHERE id = ?', [proposalId]);
            if (props.length > 0) {
                const p = props[0];
                // Check if contract already exists
                const [exists] = await pool.query('SELECT 1 FROM contracts WHERE proposal_id = ?', [proposalId]);
                if (exists.length === 0) {
                    await pool.query(`
                        INSERT INTO contracts (proposal_id, seller_id, buyer_id, price, quantity, status, start_date)
                        SELECT ?, ?, o.user_id, ?, ?, 'active', NOW()
                        FROM proposals pr
                        JOIN opportunities o ON pr.opportunity_id = o.id
                        WHERE pr.id = ?
                    `, [proposalId, p.seller_id, p.price, p.quantity_offered, proposalId]);
                }
            }
        }

        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        console.error('Error updating proposal:', error);
        res.status(500).json({ message: 'Error actualizando propuesta' });
    }
});

// 10.10.1 COUNTER PROPOSAL
app.put('/api/proposals/:id/counter', async (req, res) => {
    const proposalId = req.params.id;
    const { price, quantity, message } = req.body;

    try {
        // Update proposal: Set status to 'countered', update price/qty
        await pool.query(
            'UPDATE proposals SET price = ?, quantity_offered = ?, status = ? WHERE id = ?',
            [price, quantity, 'countered', proposalId]
        );

        // Notify Original Seller (The Producer)
        const [proposal] = await pool.query('SELECT seller_id FROM proposals WHERE id = ?', [proposalId]);
        if (proposal.length > 0) {
            // Ideally we should pass actorId in body but for now we skip strict notification actor check
            // sendNotification(proposal[0].seller_id, 0, 'proposal_countered', proposalId);
        }

        res.json({ message: 'Contra-oferta enviada' });
    } catch (error) {
        console.error('Error countering proposal:', error);
        res.status(500).json({ message: 'Error enviando contra-oferta' });
    }
});

// 10.11 GET CONTRACTS
app.get('/api/contracts', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    try {
        const [rows] = await pool.query(`
            SELECT 
                c.*,
                u_seller.name as seller_name,
                u_buyer.name as buyer_name,
                o.product_name
            FROM contracts c
            JOIN proposals p ON c.proposal_id = p.id
            JOIN opportunities o ON p.opportunity_id = o.id
            JOIN users u_seller ON c.seller_id = u_seller.id
            JOIN users u_buyer ON c.buyer_id = u_buyer.id
            WHERE c.seller_id = ? OR c.buyer_id = ?
            ORDER BY c.created_at DESC
        `, [userId, userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error getting contracts:', error);
        res.status(500).json({ message: 'Error obteniendo contratos' });
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

        // NOTIFICATION
        sendNotification(followingId, followerId, 'follow', followerId);

        res.json({ message: 'Usuario seguido' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Error siguiendo usuario' });
    }
});

// 12. UNFOLLOW USER
app.delete('/api/users/:id/follow', async (req, res) => {
    const followingId = req.params.id;
    const { followerId } = req.body;
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

// 13. GET NOTIFICATIONS
app.get('/api/notifications', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'Falta userId' });

    try {
        const [rows] = await pool.query(`
            SELECT n.*, u.name as actor_name, u.email as actor_email
            FROM notifications n
            JOIN users u ON n.actor_id = u.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT 50
        `, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ message: 'Error obteniendo notificaciones' });
    }
});

// 13.5 DELETE ALL NOTIFICATIONS
app.delete('/api/notifications', async (req, res) => {
    const userId = req.query.userId;

    if (!userId || userId === 'undefined' || userId === 'null') {
        return res.status(400).json({ message: 'Falta userId valido' });
    }

    try {
        const [result] = await pool.query('DELETE FROM notifications WHERE user_id = ?', [userId]);
        res.json({ message: 'Notificaciones eliminadas', deleted: result.affectedRows });
    } catch (error) {
        console.error('Error deleting notifications:', error);
        res.status(500).json({ message: 'Error eliminando notificaciones' });
    }
});

// 14. GET USER DETAILS (Profile + Stats)
app.get('/api/users/:id', async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.query.currentUserId;

    try {
        // Get Basic Info
        const [users] = await pool.query('SELECT id, name, email, profile_type, phone, company_name FROM users WHERE id = ?', [targetUserId]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        const user = users[0];

        // Fetch Extended Profile Info
        if (user.profile_type === 'comercializadora') {
            const [details] = await pool.query('SELECT location, volume, seeking_tags, verified, rating, reviews_count FROM buyer_profiles WHERE user_id = ?', [targetUserId]);
            if (details.length > 0) {
                Object.assign(user, details[0]);
            }
        } else if (user.profile_type === 'agricola') {
            const [details] = await pool.query('SELECT location, hectares, crops FROM producer_profiles WHERE user_id = ?', [targetUserId]);
            if (details.length > 0) {
                Object.assign(user, details[0]);
            }
        }

        // Get Stats
        const [followers] = await pool.query('SELECT COUNT(*) as count FROM connections WHERE following_id = ?', [targetUserId]);
        const [following] = await pool.query('SELECT COUNT(*) as count FROM connections WHERE follower_id = ?', [targetUserId]);

        // Mutual connections: Users I follow who also follow me
        const [connections] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM connections c1
            JOIN connections c2 ON c1.following_id = c2.follower_id 
            WHERE c1.follower_id = ? AND c2.following_id = ?
        `, [targetUserId, targetUserId]);

        user.followersCount = followers[0].count;
        user.followingCount = following[0].count;
        user.connectionsCount = connections[0].count;

        // Check if current user is following target user
        user.isFollowing = false;
        if (currentUserId && currentUserId != targetUserId) {
            const [rows] = await pool.query('SELECT 1 FROM connections WHERE follower_id = ? AND following_id = ?', [currentUserId, targetUserId]);
            user.isFollowing = rows.length > 0;
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting user details:', error);
        res.status(500).json({ message: 'Error obteniendo detalles del usuario' });
    }
});

// 14.5 UPDATE USER PROFILE
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, location, volume, seeking_tags, crops, hectares } = req.body;

    try {
        // Update basic user info
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);

        // Get profile type to know which table to update
        const [users] = await pool.query('SELECT profile_type FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const profileType = users[0].profile_type;

        if (profileType === 'comercializadora') {
            // Check if profile exists
            const [exists] = await pool.query('SELECT 1 FROM buyer_profiles WHERE user_id = ?', [userId]);
            const tags = Array.isArray(seeking_tags) ? JSON.stringify(seeking_tags) : seeking_tags;

            if (exists.length > 0) {
                await pool.query(
                    'UPDATE buyer_profiles SET location = ?, volume = ?, seeking_tags = ? WHERE user_id = ?',
                    [location, volume, tags, userId]
                );
            } else {
                await pool.query(
                    'INSERT INTO buyer_profiles (user_id, location, volume, seeking_tags) VALUES (?, ?, ?, ?)',
                    [userId, location, volume, tags]
                );
            }
        } else if (profileType === 'agricola') {
            // Check if profile exists
            const [exists] = await pool.query('SELECT 1 FROM producer_profiles WHERE user_id = ?', [userId]);
            const cropsJson = Array.isArray(crops) ? JSON.stringify(crops) : crops;

            if (exists.length > 0) {
                await pool.query(
                    'UPDATE producer_profiles SET location = ?, hectares = ?, crops = ? WHERE user_id = ?',
                    [location, hectares, cropsJson, userId]
                );
            } else {
                await pool.query(
                    'INSERT INTO producer_profiles (user_id, location, hectares, crops) VALUES (?, ?, ?, ?)',
                    [userId, location, hectares, cropsJson]
                );
            }
        }

        res.json({ message: 'Perfil actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error actualizando el perfil' });
    }
});

// 15. GET USER FOLLOWERS
app.get('/api/users/:id/followers', async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.query.currentUserId;

    try {
        const query = `
            SELECT u.id, u.name, u.email, u.profile_type,
            (SELECT 1 FROM connections WHERE follower_id = ? AND following_id = u.id) as isFollowing
            FROM connections c
            JOIN users u ON c.follower_id = u.id
            WHERE c.following_id = ?
        `;
        const [rows] = await pool.query(query, [currentUserId || 0, targetUserId]);
        res.json(rows);
    } catch (error) {
        console.error('Error getting followers:', error);
        res.status(500).json({ message: 'Error obteniendo seguidores' });
    }
});

// 16. GET USER FOLLOWING
app.get('/api/users/:id/following', async (req, res) => {
    const targetUserId = req.params.id;
    const currentUserId = req.query.currentUserId;

    try {
        const query = `
            SELECT u.id, u.name, u.email, u.profile_type,
            (SELECT 1 FROM connections WHERE follower_id = ? AND following_id = u.id) as isFollowing
            FROM connections c
            JOIN users u ON c.following_id = u.id
            WHERE c.follower_id = ?
        `;
        const [rows] = await pool.query(query, [currentUserId || 0, targetUserId]);
        res.json(rows);
    } catch (error) {
        console.error('Error getting following:', error);
        res.status(500).json({ message: 'Error obteniendo seguidos' });
    }
});

// 16.5 GET TRENDS (Popular Hashtags)
app.get('/api/trends', async (req, res) => {
    try {
        console.log('[TRENDS] Request received');
        // Fetch recent posts to extract tags
        const [rows] = await pool.query('SELECT content FROM posts ORDER BY created_at DESC LIMIT 100');

        console.log(`[TRENDS] Analysing ${rows.length} posts`);

        const tagCounts = {};
        rows.forEach(row => {
            const content = row.content || "";
            // Regex to find hashtags: #word (alphanumeric includes accents)
            const matches = content.match(/#[a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ]+/g);
            if (matches) {
                // console.log(`[TRENDS] Found tags in "${content}":`, matches);
                matches.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        console.log('[TRENDS] Counts:', tagCounts);

        // Convert to array, sort by count, take top 5
        const sortedTrends = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        console.log('[TRENDS] Sorted Result:', sortedTrends);

        // If not enough trends, add some defaults
        if (sortedTrends.length < 3) {
            if (!tagCounts['#AgroCore']) sortedTrends.push({ tag: '#AgroCore', count: 1 });
            if (!tagCounts['#Agricultura']) sortedTrends.push({ tag: '#Agricultura', count: 1 });
        }

        res.json(sortedTrends);
    } catch (error) {
        console.error('Error getting trends:', error);
        res.status(500).json({ message: 'Error obteniendo tendencias' });
    }
});

// 17. GLOBAL SEARCH (Users & Posts)
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
        return res.json({ users: [], posts: [] });
    }

    // console.log(`Searching for: ${q}`);

    try {
        const terms = q.trim().split(/\s+/);

        // Build Users Query ensuring all terms are checked against name/email
        // Using "OR" between terms to be permissive (match ANY word)
        const userConditions = terms.map(() => `(name LIKE ? OR email LIKE ?)`).join(' AND ');
        const userParams = [];
        terms.forEach(term => {
            userParams.push(`%${term}%`, `%${term}%`);
        });

        // Try strict AND first, if no results, maybe we could try OR? 
        // For now, let's stick to permissive OR for broader results or strict AND?
        // "Saul Luviano" -> saulluvianos. 'Saul' matches, 'Luviano' might not.
        // If I use AND, "Saul Luviano" will fail against "saulluvianos" if Luviano is not in it.
        // Let's use OR for maximum discoverability, or modify the split to key off keywords.

        // BETTER APPROACH for "Saul Luviano" vs "saulluvianos":
        // just search for the whole string first, then individual words.
        // But simpler: just OR the terms.

        const permissiveUserConditions = terms.map(() => `(name LIKE ? OR email LIKE ?)`).join(' OR ');
        const permissiveParams = [];
        terms.forEach(term => {
            permissiveParams.push(`%${term}%`, `%${term}%`);
        });

        const [users] = await pool.query(
            `SELECT id, name, email, profile_type FROM users WHERE ${permissiveUserConditions} LIMIT 5`,
            permissiveParams
        );

        // Search Posts (JOIN with users to search by author name correctly if needed, or just select name)
        // Adjusting query to join users to get author_name and filter by it
        const permissivePostConditions = terms.map(() => `(p.content LIKE ? OR u.name LIKE ?)`).join(' OR ');
        const permissivePostParams = [];
        terms.forEach(term => {
            permissivePostParams.push(`%${term}%`, `%${term}%`);
        });

        const [posts] = await pool.query(
            `SELECT p.id, p.content, u.name as author_name, p.created_at, p.user_id 
             FROM posts p 
             JOIN users u ON p.user_id = u.id 
             WHERE ${permissivePostConditions} 
             LIMIT 5`,
            permissivePostParams
        );

        res.json({ users, posts });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'Error en búsqueda' });
    }
});

// 18. SEND MESSAGE
// 18. SEND MESSAGE
app.post('/api/messages', upload.single('image'), async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        const imageUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : req.body.imageUrl;

        // Save to DB
        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content, image_url) VALUES (?, ?, ?, ?)',
            [senderId, receiverId, content, imageUrl]
        );

        const newMessage = {
            id: result.insertId,
            sender_id: parseInt(senderId),
            receiver_id: parseInt(receiverId),
            content,
            image_url: imageUrl,
            created_at: new Date(),
            is_read: false
        };

        // Emit to Socket Room of Receiver
        io.to(`user_${receiverId}`).emit('new_message', newMessage);

        // Notify receiver with a general notification too
        await sendNotification(receiverId, senderId, 'message', result.insertId);

        res.json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error enviando mensaje' });
    }
});

// 19. GET CONVERSATIONS (Last message for each contact)
app.get('/api/messages/conversations', async (req, res) => {
    const currentUserId = req.query.userId;
    if (!currentUserId) return res.status(400).json({ message: 'userId required' });

    try {
        // Complex query to get the last message for every user interacted with
        // We find all unique pairs, then get the User details and the last message content
        const query = `
            SELECT 
                u.id, u.name, u.email, 
                m.content as last_message, 
                m.created_at,
                (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = FALSE) as unread_count
            FROM users u
            JOIN (
                SELECT 
                    CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as contact_id,
                    MAX(id) as max_id
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY contact_id
            ) last_msg ON u.id = last_msg.contact_id
            JOIN messages m ON m.id = last_msg.max_id
            ORDER BY m.created_at DESC
        `;

        const [conversations] = await pool.query(query, [
            currentUserId,
            currentUserId,
            currentUserId, currentUserId
        ]);

        res.json(conversations);
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ message: 'Error obteniendo conversaciones' });
    }
});

// 20. GET MESSAGE HISTORY WITH USER
app.get('/api/messages/:otherUserId', async (req, res) => {
    const currentUserId = req.query.currentUserId;
    const otherUserId = req.params.otherUserId;

    if (!currentUserId) return res.status(400).json({ message: 'currentUserId required' });

    try {
        const [messages] = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
                OR (sender_id = ? AND receiver_id = ?)
             ORDER BY created_at ASC`,
            [currentUserId, otherUserId, otherUserId, currentUserId]
        );

        // Mark as read (optional, can be done via separate endpoint or here implicitly)
        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
            [otherUserId, currentUserId]
        );

        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Error obteniendo mensajes' });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API de AgroCore funcionando 🚀');
});

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
