const express = require('express');
const bcrypt = require('bcrypt');
const { getShopConnection } = require('../db').default;

const router = express.Router();
const saltRounds = 10;

// --- Helper to get DB name ---
const getShopDbNameFromRequest = (req) => {
    // In a real app, you'd get this from a JWT token or a session cookie.
    // ================== IMPORTANT ==================
    // Replace 'your_database_name_here' with the actual name of the database you created.
    return 'shop';
};

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const shopDbName = getShopDbNameFromRequest(req);
        const shopPool = await getShopConnection(shopDbName);

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const sql = 'INSERT INTO users (name, username, password, type) VALUES (?, ?, ?, 1)';
        await shopPool.query(sql, [name, username, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/auth/login - Log in a user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const shopDbName = getShopDbNameFromRequest(req);
        const shopPool = await getShopConnection(shopDbName);

        const [rows] = await shopPool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = { id: rows[0].id, name: rows[0].name, username: rows[0].username };
        res.json({ message: 'Login successful!', user });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;