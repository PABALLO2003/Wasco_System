const express = require('express');
const router = express.Router();
const mysqlPromise = require('../config/db_mysql');
const pgPool = require('../config/db_pgsql');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Get all customers
router.get('/customers', authMiddleware, adminOnly, async (req, res) => {
    try {
        const [customers] = await mysqlPromise.query(
            'SELECT customer_id, account_number, full_name, email, phone, district, registration_date FROM CUSTOMER'
        );
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add billing rate
router.post('/billing-rate', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from } = req.body;
        
        await pgPool.query(
            `INSERT INTO BILLING_RATE (rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from]
        );
        
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all billing rates
router.get('/billing-rates', authMiddleware, adminOnly, async (req, res) => {
    try {
        const result = await pgPool.query(
            'SELECT rate_id, rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from FROM BILLING_RATE ORDER BY customer_category, min_usage'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;