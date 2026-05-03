const express = require('express');
const router = express.Router();
const mysqlPromise = require('../config/db_mysql');
const pgPool = require('../config/db_pgsql');
const { authMiddleware } = require('../middleware/authMiddleware');

// Generate bill for a customer (uses BOTH databases!)
router.post('/generate/:customerId', authMiddleware, async (req, res) => {
    const { customerId } = req.params;
    const { readingMonth } = req.body;
    
    try {
        // 1. Get customer from MySQL
        const [customers] = await mysqlPromise.query(
            'SELECT customer_id, full_name, district, account_number FROM CUSTOMER WHERE customer_id = ?',
            [customerId]
        );
        
        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const customer = customers[0];
        
        // 2. Get water usage from PostgreSQL
        const usageResult = await pgPool.query(
            `SELECT usage_id, consumption, reading_date, meter_reading, previous_reading
             FROM WATER_USAGE 
             WHERE customer_id = $1 AND reading_month = $2`,
            [customerId, readingMonth]
        );
        
        if (usageResult.rows.length === 0) {
            return res.status(404).json({ error: 'No usage data found for this month' });
        }
        
        const usage = usageResult.rows[0];
        
        // 3. Get billing rate from PostgreSQL
        const rateResult = await pgPool.query(
            `SELECT rate_id, cost_per_unit, fixed_charge, rate_tier
             FROM BILLING_RATE 
             WHERE customer_category = 'Residential' 
             AND $1 BETWEEN min_usage AND max_usage
             AND effective_from <= CURRENT_DATE
             AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
             LIMIT 1`,
            [usage.consumption]
        );
        
        if (rateResult.rows.length === 0) {
            return res.status(404).json({ error: 'No billing rate found for this consumption' });
        }
        
        const rate = rateResult.rows[0];
        
        // 4. Calculate bill
        const totalAmount = parseFloat(rate.fixed_charge) + (parseFloat(usage.consumption) * parseFloat(rate.cost_per_unit));
        const vatAmount = totalAmount * 0.15;
        const grandTotal = totalAmount + vatAmount;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        // 5. Save to PostgreSQL fragment
        const pgResult = await pgPool.query(
            `INSERT INTO BILL_FRAGMENT_PGSQL 
             (customer_id, usage_id, rate_id, bill_month, total_units, 
              unit_price, fixed_charge, total_amount, vat_amount, grand_total, due_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING bill_id`,
            [customerId, usage.usage_id, rate.rate_id, readingMonth + '-01',
             usage.consumption, rate.cost_per_unit, rate.fixed_charge,
             totalAmount, vatAmount, grandTotal, dueDate]
        );
        
        const billId = pgResult.rows[0].bill_id;
        
        // 6. Save to MySQL fragment
        await mysqlPromise.query(
            `INSERT INTO BILL_FRAGMENT_MYSQL (bill_id, customer_id, payment_status, outstanding_balance)
             VALUES (?, ?, 'Unpaid', ?)`,
            [billId, customerId, grandTotal]
        );
        
        res.json({
            success: true,
            bill_id: billId,
            customer: customer,
            consumption: usage.consumption,
            rate_tier: rate.rate_tier,
            total_amount: totalAmount,
            vat: vatAmount,
            grand_total: grandTotal,
            due_date: dueDate
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Get customer bills (combines data from both databases)
router.get('/customer/:customerId', authMiddleware, async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const pgResult = await pgPool.query(
            `SELECT b.bill_id, b.bill_month, b.total_units, b.grand_total, b.due_date, b.vat_amount
             FROM BILL_FRAGMENT_PGSQL b
             WHERE b.customer_id = $1
             ORDER BY b.bill_month DESC`,
            [customerId]
        );
        
        for (let bill of pgResult.rows) {
            const [mysqlResult] = await mysqlPromise.query(
                'SELECT payment_status, outstanding_balance FROM BILL_FRAGMENT_MYSQL WHERE bill_id = ?',
                [bill.bill_id]
            );
            if (mysqlResult.length > 0) {
                bill.payment_status = mysqlResult[0].payment_status;
                bill.outstanding_balance = mysqlResult[0].outstanding_balance;
            }
        }
        
        res.json(pgResult.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;