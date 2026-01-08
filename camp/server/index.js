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
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campconnect',
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

// Basic Route
app.get('/', (req, res) => {
    res.send('API de AgroLink funcionando 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

