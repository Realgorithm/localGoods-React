import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { getShopConnection, masterPool } from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { asyncHandler, AppError } from './utils.js';
import { getShopSchema } from './schema.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(helmet()); // Set security-related HTTP headers

const allowedOrigins = ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent
}));
app.use(cookieParser()); // To parse cookies
app.use(express.json()); // To parse incoming JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// JWT Authentication Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expected format: "Bearer TOKEN"
    const tokenFromCookie = req.cookies.token;

    if (token == null && tokenFromCookie == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token || tokenFromCookie, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden (invalid token)
        req.user = user;
        next();
    });
};

// Admin check middleware
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admins only' });
    }
};

// --- Helper to get DB name from a simulated session ---
const getShopDbNameFromRequest = (req) => {
    // For authenticated requests, use the shopName from the JWT payload.
    if (req.user && req.user.shopName) {
        return req.user.shopName;
    }
    // This should not happen for authenticated routes. Throw an error to make it explicit.
    throw new AppError('Could not determine shop database. User may not be properly authenticated.', 500);
};

// --- Security Middleware ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

// --- API Routes ---
app.post('/api/auth/register', asyncHandler(async (req, res, next) => {
    const { name, email, password, shopName } = req.body;

    if (!name || !email || !password || !shopName) {
        return next(new AppError('All fields are required.', 400));
    }

    // Validate shopName to be a valid database name (simple validation)
    if (!/^[a-zA-Z0-9_]+$/.test(shopName)) {
        return next(new AppError('Shop name can only contain letters, numbers, and underscores.', 400));
    }

    let connection;
    try {
        // 1. Create the database for the new shop
        await masterPool.query(`CREATE DATABASE IF NOT EXISTS \`${shopName}\``);

        // 2. Get a connection to the newly created database
        const shopPool = await getShopConnection(shopName);
        connection = await shopPool.getConnection();

        // 3. Create all the necessary tables
        const schemaQueries = getShopSchema();
        for (const query of schemaQueries) {
            await connection.query(query);
        }

        // 4. Insert the new user into the 'users' table
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await connection.query(
            'INSERT INTO users (name, email, password, shop_name, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, shopName, 'admin'] // The first user of a shop is an admin
        );

        res.status(201).json({ message: 'Registration successful! Your shop has been created.' });

    } catch (error) { // Catch specific DB errors
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new AppError('An account with this email already exists in this shop.', 409));
        }
        next(error);
    } finally {
        if (connection) connection.release();
    }
}));

app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res, next) => {
    const { email, password, shopName } = req.body;

    if (!email || !password || !shopName) {
        return next(new AppError('Email, password, and shop name are required.', 400));
    }

    const shopPool = await getShopConnection(shopName);
    const [users] = await shopPool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
        // Security best practice: use a generic message to avoid revealing if an email is registered.
        return next(new AppError('Invalid credentials.', 401));
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(new AppError('Invalid credentials.', 401));
    }

    // Create JWT Payload
    const payload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        shopName: user.shop_name,
        role: user.role,
    };

    // Sign the token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_COOKIE_EXPIRES_IN || '1d' });

    res.cookie('token', token, {
        httpOnly: true, // The cookie is not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict', // Mitigate CSRF attacks
        maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

    res.json({
        message: 'Logged in successfully!',
        // We no longer send the token in the body
        user: payload
    });
}));

app.get('/api/auth/me', authenticateToken, asyncHandler(async (req, res, next) => {
    // If authenticateToken middleware passes, req.user is populated.
    // We can re-fetch the user from DB if we want fresh data, but for now, the token data is sufficient.
    res.status(200).json({
        user: req.user
    });
}));

app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({ message: 'Logged out successfully.' });
});

app.post('/api/auth/forgot-password', authLimiter, asyncHandler(async (req, res, next) => {
    const { email, shopName } = req.body;
    if (!email || !shopName) {
        return next(new AppError('Email and shop name are required.', 400));
    }

    const shopPool = await getShopConnection(shopName);
    const [users] = await shopPool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
        // Security: Don't reveal if the user exists or not.
        return res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    const user = users[0];

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiry to 1 hour from now
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await shopPool.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [hashedToken, tokenExpiry, user.id]
    );

    // In a real application, you would use a service like Nodemailer to send an email.
    // For this example, we'll log the reset link to the console.
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    console.log('--- PASSWORD RESET LINK (SIMULATED EMAIL) ---');
    console.log(`Password reset link for ${user.email}: ${resetUrl}`);
    console.log('-------------------------------------------');

    res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });

}));

app.post('/api/auth/reset-password', authLimiter, asyncHandler(async (req, res, next) => {
    const { token, password, shopName } = req.body;
    if (!token || !password || !shopName) {
        return next(new AppError('Token, new password, and shop name are required.', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const shopPool = await getShopConnection(shopName);

    const [users] = await shopPool.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()', [hashedToken]);
    if (users.length === 0) {
        return next(new AppError('Password reset token is invalid or has expired.', 400));
    }
    const user = users[0];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await shopPool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [hashedPassword, user.id]);

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
}));

app.get('/api/users', authenticateToken, isAdmin, asyncHandler(async (req, res, next) => {
    const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
    // Select all users except the one making the request to prevent self-modification
    const [users] = await shopPool.query(
        'SELECT id, name, email, role FROM users WHERE id != ?',
        [req.user.userId]
    );
    res.json(users);
}));

// --- User Management API (Admin only) ---
app.post('/api/users', authenticateToken, isAdmin, asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const shopName = req.user.shopName; // Get shop name from the admin making the request

    if (!name || !email || !password || !role) {
        return next(new AppError('Name, email, password, and role are required.', 400));
    }

    try {
        const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await shopPool.query(
            'INSERT INTO users (name, email, password, shop_name, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, shopName, role]
        );
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new AppError('An account with this email already exists.', 409));
        }
        next(error);
    }
}));

app.put('/api/users/:id', authenticateToken, isAdmin, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return next(new AppError('Name, email, and role are required.', 400));
    }
    if (!['admin', 'user'].includes(role)) {
        return next(new AppError('Invalid role specified.', 400));
    }
    // Prevent admin from demoting themselves
    if (parseInt(id, 10) === req.user.userId && role !== 'admin') {
        return next(new AppError('Admins cannot demote themselves.', 403));
    }

    try {
        const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
        const [result] = await shopPool.query(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role, id]
        );
        if (result.affectedRows === 0) {
            return next(new AppError('User not found.', 404));
        }
        res.json({ message: 'User updated successfully.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new AppError('This email is already in use by another account.', 409));
        }
        next(error);
    }
}));

app.delete('/api/users/:id', authenticateToken, isAdmin, asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id, 10) === req.user.userId) {
        return next(new AppError('Admins cannot delete their own account.', 403));
    }

    const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
    const [result] = await shopPool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return next(new AppError('User not found.', 404));
    }

    res.json({ message: 'User deleted successfully.' });
}));

// --- Dashboard Stats ---
// All routes below this point are protected
app.get('/api/stats/summary', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);

    // Optimization: Run all summary queries in parallel for better performance.
    const [
        [[salesResult]],
        [[customersResult]],
        [[productsResult]],
        [[supplierCreditResult]],
        [[creditResult]],
        [[profitResult]]
    ] = await Promise.all([
        shopPool.query('SELECT SUM(total_amount) as totalSales FROM sales WHERE paymode != 0'),
        shopPool.query('SELECT COUNT(id) as totalCustomers FROM customers'),
        shopPool.query('SELECT SUM(stock) as productsInStock FROM products'),
        shopPool.query('SELECT SUM(balance) as totalSupplierCredit FROM suppliers WHERE balance > 0'),
        shopPool.query('SELECT SUM(balance) as totalCredit FROM customers WHERE balance > 0'),
        shopPool.query(`SELECT SUM(si.quantity * (si.price - si.cost_price)) as totalProfit FROM sales_items si JOIN sales s ON si.sale_id = s.id WHERE s.paymode != 0`)
    ]);

    res.json({
        totalSales: salesResult.totalSales || 0,
        totalCustomers: customersResult.totalCustomers || 0,
        productsInStock: productsResult.productsInStock || 0,
        totalProfit: profitResult.totalProfit || 0,
        totalCredit: creditResult.totalCredit || 0,
        totalSupplierCredit: supplierCreditResult.totalSupplierCredit || 0,
    });
}));

// --- Customers API ---
// GET /api/customers - Fetches all customers
app.get('/api/customers', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    if (!shopDbName) {
        return next(new AppError('Unauthorized: Shop not identified.', 401));
    }
    const shopPool = await getShopConnection(shopDbName);
    const [rows] = await shopPool.query('SELECT * FROM customers ORDER BY id ASC');
    res.json(rows);
}));

// POST /api/customers - Saves or updates a customer
app.post('/api/customers', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id, name, contact, address } = req.body;
    const shopDbName = getShopDbNameFromRequest(req);
    if (!shopDbName) return next(new AppError('Unauthorized', 401));

    const shopPool = await getShopConnection(shopDbName);

    if (id) {
        const sql = 'UPDATE customers SET name = ?, contact = ?, address = ? WHERE id = ?';
        await shopPool.query(sql, [name, contact, address, id]);
        res.json({ status: 2, message: 'Customer updated successfully!' });
    } else {
        const sql = 'INSERT INTO customers (name, contact, address) VALUES (?, ?, ?)';
        const [result] = await shopPool.query(sql, [name, contact, address]);
        res.status(201).json({ status: 1, message: 'Customer added successfully!', newId: result.insertId });
    }
}));

// DELETE /api/customers/:id - Deletes a customer
app.delete('/api/customers/:id', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const shopDbName = getShopDbNameFromRequest(req);
    if (!shopDbName) return next(new AppError('Unauthorized', 401));

    const shopPool = await getShopConnection(shopDbName);
    const sql = 'DELETE FROM customers WHERE id = ?';
    const [result] = await shopPool.query(sql, [id]);

    if (result.affectedRows > 0) {
        res.json({ status: 1, message: 'Customer deleted successfully!' });
    } else {
        next(new AppError('Customer not found.', 404));
    }
}));

// --- Products API ---
app.get('/api/products', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const [rows] = await shopPool.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.name ASC
    `);
    res.json(rows);
}));

app.post('/api/products', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id, name, sku, description, price, stock, category_id } = req.body;
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const catId = category_id ? parseInt(category_id, 10) : null;

    if (id) {
        const sql = 'UPDATE products SET name = ?, sku = ?, description = ?, price = ?, stock = ?, category_id = ? WHERE id = ?';
        await shopPool.query(sql, [name, sku, description, price, stock, catId, id]);
        res.json({ status: 2, message: 'Product updated successfully!' });
    } else {
        const sql = 'INSERT INTO products (name, sku, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await shopPool.query(sql, [name, sku, description, price, stock, catId]);
        res.status(201).json({ status: 1, message: 'Product added successfully!', newId: result.insertId });
    }
}));

app.delete('/api/products/:id', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const [result] = await shopPool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.json({ status: 1, message: 'Product deleted successfully!' });
    } else {
        next(new AppError('Product not found.', 404));
    }
}));

// --- Products API (Continued) ---
app.get('/api/products/low-stock', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    // Assuming a low stock threshold of 10
    const [rows] = await shopPool.query('SELECT id, name, stock FROM products WHERE stock <= 10 AND stock > 0 ORDER BY stock ASC');
    res.json(rows);
}));

// --- Categories API ---
app.get('/api/categories', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
    const [rows] = await shopPool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
}));

app.post('/api/categories', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id, name } = req.body;
    if (!name) {
        return next(new AppError('Category name is required.', 400));
    }
    const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
    if (id) {
        await shopPool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        res.json({ status: 2, message: 'Category updated successfully!' });
    } else {
        const [result] = await shopPool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ status: 1, message: 'Category added successfully!', newId: result.insertId });
    }
}));

app.delete('/api/categories/:id', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
    const [result] = await shopPool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.json({ status: 1, message: 'Category deleted successfully!' });
    } else {
        next(new AppError('Category not found.', 404));
    }
}));

// --- Suppliers API ---
app.get('/api/suppliers', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const [rows] = await shopPool.query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(rows);
}));

app.post('/api/suppliers', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id, name, contact, address } = req.body;
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    if (id) {
        const sql = 'UPDATE suppliers SET name = ?, contact = ?, address = ? WHERE id = ?';
        await shopPool.query(sql, [name, contact, address, id]);
        res.json({ status: 2, message: 'Supplier updated successfully!' });
    } else {
        const sql = 'INSERT INTO suppliers (name, contact, address) VALUES (?, ?, ?)';
        const [result] = await shopPool.query(sql, [name, contact, address]);
        res.status(201).json({ status: 1, message: 'Supplier added successfully!', newId: result.insertId });
    }
}));

app.delete('/api/suppliers/:id', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const [result] = await shopPool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.json({ status: 1, message: 'Supplier deleted successfully!' });
    } else {
        next(new AppError('Supplier not found.', 404));
    }
}));

// --- Receiving API (Purchases from Suppliers) ---
app.get('/api/receiving', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const sql = `
            SELECT r.id, r.ref_no, r.total_amount, r.status, r.date_created, s.name as supplier_name
            FROM receiving r
            JOIN suppliers s ON r.supplier_id = s.id
            ORDER BY r.date_created DESC
        `;
    const [records] = await shopPool.query(sql);
    res.json(records);
}));

app.post('/api/receiving', authenticateToken, asyncHandler(async (req, res, next) => {
    const { supplier_id, items, total_amount, amount_paid } = req.body;

    if (!supplier_id || !items || items.length === 0) {
        return next(new AppError('Supplier and items are required.', 400));
    }

    const shopDbName = getShopDbNameFromRequest(req);
    let connection;
    try {
        const shopPool = await getShopConnection(shopDbName);
        connection = await shopPool.getConnection();
        await connection.beginTransaction();

        const ref_no = `RECV-${Date.now()}`;
        const paid = parseFloat(amount_paid) || 0;
        const total = parseFloat(total_amount);
        const credit_owed = total - paid;
        let status = 1; // 1=Paid
        if (credit_owed > 0 && paid > 0) status = 2; // 2=Partial
        if (paid === 0) status = 3; // 3=Unpaid
        const receivingSql = 'INSERT INTO receiving (ref_no, supplier_id, total_amount, status) VALUES (?, ?, ?, ?)';
        const [receivingResult] = await connection.query(receivingSql, [ref_no, supplier_id, total, status]);
        const receivingId = receivingResult.insertId;

        for (const item of items) {
            // Insert into receiving_items
            const itemSql = 'INSERT INTO receiving_items (receiving_id, product_id, quantity, cost_price) VALUES (?, ?, ?, ?)';
            await connection.query(itemSql, [receivingId, item.product_id, item.quantity, item.cost_price]);

            // Update product stock and average cost price
            const stockSql = `
                UPDATE products 
                SET 
                    stock = stock + ?, 
                    cost_price = ((cost_price * stock) + (? * ?)) / (stock + ?)
                WHERE id = ?
            `;
            await connection.query(stockSql, [item.quantity, item.cost_price, item.quantity, item.quantity, item.product_id]);
        }

        await connection.commit();

        if (credit_owed > 0) {
            await shopPool.query('UPDATE suppliers SET balance = balance + ? WHERE id = ?', [credit_owed, supplier_id]);
        }

        res.status(201).json({ message: 'Purchase recorded successfully!', receivingId });

    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
}));

// --- Sales API ---

// GET /api/sales - Fetches all completed sales with details
app.get('/api/sales', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const sql = `
            SELECT 
                s.id, s.ref_no, s.total_amount, s.status, s.date_created,
                c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.paymode != 0
            ORDER BY s.date_created DESC
        `;
    const [sales] = await shopPool.query(sql);
    res.json(sales);
}));

// POST /api/sales - Creates a new sale in a pending state and decrements stock
app.post('/api/sales', authenticateToken, asyncHandler(async (req, res, next) => {
    const { customer_id, items, actual_amount, total_amount } = req.body;

    if (!customer_id || !items || items.length === 0) {
        return next(new AppError('Customer and items are required.', 400));
    }

    const shopDbName = getShopDbNameFromRequest(req);
    let connection;
    try {
        const shopPool = await getShopConnection(shopDbName);
        connection = await shopPool.getConnection();
        await connection.beginTransaction();

        // 1. Create a reference number
        const ref_no = `SALE-${Date.now()}`;

        // 2. Insert into sales table
        const saleSql = 'INSERT INTO sales (ref_no, customer_id, actual_amount, total_amount, amount_tendered, amount_change, paymode, status) VALUES (?, ?, ?, ?, 0, 0, 0, 0)'; // paymode 0 = pending, status 0 = pending
        const [saleResult] = await connection.query(saleSql, [ref_no, customer_id, actual_amount, total_amount]);
        const saleId = saleResult.insertId;

        // 3. Insert into sales_items and update product stock
        for (const item of items) {
            // Insert item
            const [[product]] = await connection.query('SELECT cost_price FROM products WHERE id = ?', [item.product_id]);
            const itemSql = 'INSERT INTO sales_items (sale_id, product_id, quantity, price, cost_price) VALUES (?, ?, ?, ?, ?)';
            await connection.query(itemSql, [saleId, item.product_id, item.quantity, item.price, product.cost_price || 0]);

            // Decrement stock
            const stockSql = 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?';
            const [updateResult] = await connection.query(stockSql, [item.quantity, item.product_id, item.quantity]);

            if (updateResult.affectedRows === 0) {
                throw new AppError(`Insufficient stock for product ID ${item.product_id}.`, 400);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Sale created, proceeding to transaction.', saleId });

    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
}));

// DELETE /api/sales/:id - Deletes a sale and restores stock
app.delete('/api/sales/:id', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const shopDbName = getShopDbNameFromRequest(req);
    let connection;
    try {
        const shopPool = await getShopConnection(shopDbName);
        connection = await shopPool.getConnection();
        await connection.beginTransaction();

        const [items] = await connection.query('SELECT product_id, quantity FROM sales_items WHERE sale_id = ?', [id]);
        for (const item of items) {
            await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
        await connection.query('DELETE FROM sales_items WHERE sale_id = ?', [id]);
        const [saleDeleteResult] = await connection.query('DELETE FROM sales WHERE id = ?', [id]);
        if (saleDeleteResult.affectedRows === 0) throw new AppError('Sale not found.', 404);
        await connection.commit();
        res.json({ status: 1, message: 'Sale deleted and stock restored successfully!' });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
}));

// GET /api/sales/:id - Fetches a single sale for transaction page
app.get('/api/sales/:id', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const sql = `
            SELECT 
                s.id, s.ref_no, s.actual_amount, s.total_amount, s.date_created,
                c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.id = ?
        `;
    const itemsSql = `
            SELECT p.name, si.quantity, si.price
            FROM sales_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = ?
        `;

    // Fix: Correctly destructure the results from Promise.all
    const [[saleRows], [items]] = await Promise.all([
        shopPool.query(sql, [id]),
        shopPool.query(itemsSql, [id])
    ]);
    if (!saleRows || saleRows.length === 0) {
        return next(new AppError('Sale not found.', 404));
    }
    const sale = saleRows[0];
    res.json({ sale, items });
}));

// POST /api/sales/:id/complete - Finalizes a transaction
app.post('/api/sales/:id/complete', authenticateToken, asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { amount_tendered } = req.body;

    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);

    const [[sale]] = await shopPool.query('SELECT total_amount, customer_id FROM sales WHERE id = ?', [id]);
    if (!sale) {
        return next(new AppError('Sale not found.', 404));
    }

    const total_amount = parseFloat(sale.total_amount);
    const tendered = parseFloat(amount_tendered) || 0;
    const credit_amount = total_amount - tendered;
    const amount_change = tendered > total_amount ? tendered - total_amount : 0;

    let status = 1; // 1=Paid
    if (tendered < total_amount && tendered > 0) status = 2; // 2=Partial
    if (tendered === 0) status = 3; // 3=Unpaid

    const paymode = (status === 2 || status === 3) ? 2 : 1; // 2 for credit, 1 for cash/full

    if (credit_amount > 0) {
        await shopPool.query('UPDATE customers SET balance = balance + ? WHERE id = ?', [credit_amount, sale.customer_id]);
    }

    const sql = 'UPDATE sales SET amount_tendered = ?, amount_change = ?, paymode = ?, status = ? WHERE id = ?';
    await shopPool.query(sql, [tendered, amount_change, paymode, status, id]);

    res.json({ message: 'Transaction completed successfully!', amount_change });
}));


// --- Customer Payments API ---
app.post('/api/payments/customers', authenticateToken, asyncHandler(async (req, res, next) => {
    const { customer_id, amount_paid } = req.body;

    if (!customer_id || !amount_paid || parseFloat(amount_paid) <= 0) {
        return next(new AppError('Customer and a valid payment amount are required.', 400));
    }

    const shopDbName = getShopDbNameFromRequest(req);
    let connection;
    try {
        const shopPool = await getShopConnection(shopDbName);
        connection = await shopPool.getConnection();
        await connection.beginTransaction();

        // 1. Record the payment
        const paymentSql = 'INSERT INTO customer_payments (customer_id, amount_paid) VALUES (?, ?)';
        await connection.query(paymentSql, [customer_id, amount_paid]);

        // 2. Update the customer's balance
        const balanceSql = 'UPDATE customers SET balance = balance - ? WHERE id = ?';
        await connection.query(balanceSql, [amount_paid, customer_id]);

        await connection.commit();
        res.status(201).json({ message: 'Payment recorded successfully!' });

    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
}));

app.get('/api/payments/customers', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const sql = `
            SELECT cp.id, cp.amount_paid, cp.date_created, c.name as customer_name
            FROM customer_payments cp
            JOIN customers c ON cp.customer_id = c.id
            ORDER BY cp.date_created DESC
            LIMIT 50
        `;
    const [payments] = await shopPool.query(sql);
    res.json(payments);
}));


// --- Supplier Payments API ---
app.post('/api/payments/suppliers', authenticateToken, asyncHandler(async (req, res, next) => {
    const { supplier_id, amount_paid } = req.body;

    if (!supplier_id || !amount_paid || parseFloat(amount_paid) <= 0) {
        return next(new AppError('Supplier and a valid payment amount are required.', 400));
    }

    const shopDbName = getShopDbNameFromRequest(req);
    let connection;
    try {
        const shopPool = await getShopConnection(shopDbName);
        connection = await shopPool.getConnection();
        await connection.beginTransaction();

        // 1. Record the payment
        const paymentSql = 'INSERT INTO supplier_payments (supplier_id, amount_paid) VALUES (?, ?)';
        await connection.query(paymentSql, [supplier_id, amount_paid]);

        // 2. Update the supplier's balance
        const balanceSql = 'UPDATE suppliers SET balance = balance - ? WHERE id = ?';
        await connection.query(balanceSql, [amount_paid, supplier_id]);

        await connection.commit();
        res.status(201).json({ message: 'Payment to supplier recorded successfully!' });

    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
}));

app.get('/api/payments/suppliers', authenticateToken, asyncHandler(async (req, res, next) => {
    const shopDbName = getShopDbNameFromRequest(req);
    const shopPool = await getShopConnection(shopDbName);
    const sql = `
            SELECT sp.id, sp.amount_paid, sp.date_created, s.name as supplier_name
            FROM supplier_payments sp
            JOIN suppliers s ON sp.supplier_id = s.id
            ORDER BY sp.date_created DESC
            LIMIT 50
        `;
    const [payments] = await shopPool.query(sql);
    res.json(payments);
}));


// --- Reports API ---
app.get('/api/reports/sales', authenticateToken, asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return next(new AppError('Start date and end date are required.', 400));
    }

    const shopPool = await getShopConnection(getShopDbNameFromRequest(req));

    // Ensure endDate includes the whole day for accurate filtering
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const salesQuery = `
            SELECT 
                s.id, s.ref_no, s.total_amount, s.date_created,
                c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.paymode != 0 AND s.date_created BETWEEN ? AND ?
            ORDER BY s.date_created DESC
        `;

    const summaryQuery = `
            SELECT
                SUM(s.total_amount) as totalSales,
                SUM(si.quantity * (si.price - si.cost_price)) as totalProfit
            FROM sales s
            JOIN sales_items si ON s.id = si.sale_id
            WHERE s.paymode != 0 AND s.date_created BETWEEN ? AND ?
        `;

    const [salesResult, summaryResult] = await Promise.all([
        shopPool.query(salesQuery, [startDate, endOfDay]),
        shopPool.query(summaryQuery, [startDate, endOfDay])
    ]);

    const sales = salesResult[0];
    const summary = summaryResult[0][0];

    res.json({ sales, summary });

}));

app.get('/api/reports/sales-over-time', authenticateToken, asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return next(new AppError('Start date and end date are required.', 400));
    }

    const shopPool = await getShopConnection(getShopDbNameFromRequest(req));
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
            SELECT
                DATE(s.date_created) as date,
                SUM(s.total_amount) as totalSales,
                SUM(si.quantity * (si.price - si.cost_price)) as totalProfit
            FROM sales s
            JOIN sales_items si ON s.id = si.sale_id
            WHERE s.paymode != 0 AND s.date_created BETWEEN ? AND ?
            GROUP BY DATE(s.date_created)
            ORDER BY date ASC
        `;

    const [results] = await shopPool.query(query, [startDate, endOfDay]);

    const formattedResults = results.map(row => ({ ...row, date: new Date(row.date).toISOString().split('T')[0] }));

    res.json(formattedResults);
}));

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // In development, send detailed error. In production, a generic one.
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥', err);
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else { // Production
        // For operational errors, send a clear message to the client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // 1) Log error
            console.error('ERROR 💥', err);
            // 2) Send generic message
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!'
            });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});