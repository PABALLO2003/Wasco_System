const express = require('express');
const router = express.Router();
const mysqlPromise = require('../config/db_mysql');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get customer profile
router.get('/profile/:customerId', authMiddleware, async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const [customers] = await mysqlPromise.query(
            'SELECT customer_id, account_number, full_name, email, phone, address, district, registration_date FROM CUSTOMER WHERE customer_id = ?',
            [customerId]
        );
        
        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(customers[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update customer profile
router.put('/profile/:customerId', authMiddleware, async (req, res) => {
    try {
        const { customerId } = req.params;
        const { phone, address } = req.body;
        
        await mysqlPromise.query(
            'UPDATE CUSTOMER SET phone = ?, address = ? WHERE customer_id = ?',
            [phone, address, customerId]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;