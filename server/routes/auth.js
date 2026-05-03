const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysqlPromise = require('../config/db_mysql');

// Customer Registration
router.post('/register', async (req, res) => {
    try {
        const { full_name, email, phone, address, district, password } = req.body;
        const account_number = 'WASCO' + Date.now();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const [result] = await mysqlPromise.query(
            `INSERT INTO CUSTOMER (account_number, full_name, email, phone, address, district, registration_date, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
            [account_number, full_name, email, phone, address, district, password_hash]
        );
        
        res.status(201).json({ success: true, customer_id: result.insertId, account_number });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Customer Login
router.post('/customer-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await mysqlPromise.query('SELECT * FROM CUSTOMER WHERE email = ?', [email]);
        
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const customer = rows[0];
        const isValid = await bcrypt.compare(password, customer.password_hash);
        
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: customer.customer_id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: customer.customer_id, 
                name: customer.full_name, 
                email: customer.email, 
                role: 'customer',
                account_number: customer.account_number,
                district: customer.district
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await mysqlPromise.query('SELECT * FROM ADMIN WHERE username = ?', [username]);
        
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        
        const admin = rows[0];
        const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
        
        if (admin.password_hash !== hashedInput) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: admin.admin_id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: admin.admin_id, 
                username: admin.username, 
                role: admin.role, 
                branch_district: admin.branch_district 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;