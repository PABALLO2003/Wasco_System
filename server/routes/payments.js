const express = require('express');
const router = express.Router();
const mysqlPromise = require('../config/db_mysql');
const pgPool = require('../config/db_pgsql');
const { authMiddleware } = require('../middleware/authMiddleware');

// Make a payment
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { bill_id, customer_id, amount_paid, payment_method, transaction_reference } = req.body;
        
        // Get current outstanding balance
        const [billStatus] = await mysqlPromise.query(
            'SELECT outstanding_balance FROM BILL_FRAGMENT_MYSQL WHERE bill_id = ? AND customer_id = ?',
            [bill_id, customer_id]
        );
        
        if (billStatus.length === 0) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        
        const newOutstanding = billStatus[0].outstanding_balance - amount_paid;
        const paymentStatus = newOutstanding <= 0 ? 'Paid' : 'Partial';
        
        // Record payment
        await mysqlPromise.query(
            `INSERT INTO PAYMENT (bill_id, customer_id, payment_date, amount_paid, payment_method, transaction_reference, payment_status)
             VALUES (?, ?, NOW(), ?, ?, ?, 'Completed')`,
            [bill_id, customer_id, amount_paid, payment_method, transaction_reference]
        );
        
        // Update bill fragment
        await mysqlPromise.query(
            `UPDATE BILL_FRAGMENT_MYSQL 
             SET payment_status = ?, outstanding_balance = ?, last_payment_date = NOW()
             WHERE bill_id = ? AND customer_id = ?`,
            [paymentStatus, Math.max(0, newOutstanding), bill_id, customer_id]
        );
        
        res.json({ success: true, message: 'Payment recorded successfully', new_balance: Math.max(0, newOutstanding) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get payment history for a customer
router.get('/customer/:customerId', authMiddleware, async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const [payments] = await mysqlPromise.query(
            `SELECT p.*, bf.outstanding_balance
             FROM PAYMENT p
             JOIN BILL_FRAGMENT_MYSQL bf ON p.bill_id = bf.bill_id
             WHERE p.customer_id = ?
             ORDER BY p.payment_date DESC`,
            [customerId]
        );
        
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;