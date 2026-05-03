const express = require('express');
const router = express.Router();
const mysqlPromise = require('../config/db_mysql');
const pgPool = require('../config/db_pgsql');
const { authMiddleware, branchManagerOnly } = require('../middleware/authMiddleware');

// Daily report
router.get('/daily', authMiddleware, branchManagerOnly, async (req, res) => {
    try {
        const { date } = req.query;
        const reportDate = date || new Date().toISOString().slice(0, 10);
        
        const usageResult = await pgPool.query(
            `SELECT COALESCE(SUM(consumption), 0) as total_usage, COUNT(*) as total_readings
             FROM WATER_USAGE 
             WHERE reading_date = $1`,
            [reportDate]
        );
        
        const paymentResult = await mysqlPromise.query(
            `SELECT COALESCE(SUM(amount_paid), 0) as total_collection, COUNT(*) as total_payments
             FROM PAYMENT 
             WHERE DATE(payment_date) = ?`,
            [reportDate]
        );
        
        res.json({
            date: reportDate,
            water_usage: usageResult.rows[0],
            collections: paymentResult[0][0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Monthly report
router.get('/monthly', authMiddleware, branchManagerOnly, async (req, res) => {
    try {
        const { year, month } = req.query;
        
        const usageResult = await pgPool.query(
            `SELECT COALESCE(SUM(consumption), 0) as total_usage, COUNT(*) as total_readings
             FROM WATER_USAGE 
             WHERE reading_month = $1`,
            [`${year}-${month.padStart(2, '0')}`]
        );
        
        const paymentResult = await mysqlPromise.query(
            `SELECT COALESCE(SUM(amount_paid), 0) as total_collection, COUNT(*) as total_payments
             FROM PAYMENT 
             WHERE YEAR(payment_date) = ? AND MONTH(payment_date) = ?`,
            [year, month]
        );
        
        const billsResult = await pgPool.query(
            `SELECT COUNT(*) as total_bills, COALESCE(SUM(grand_total), 0) as total_amount
             FROM BILL_FRAGMENT_PGSQL 
             WHERE EXTRACT(YEAR FROM bill_month) = $1 AND EXTRACT(MONTH FROM bill_month) = $2`,
            [year, month]
        );
        
        res.json({
            year,
            month,
            water_usage: usageResult.rows[0],
            collections: paymentResult[0][0],
            bills: billsResult.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Yearly report
router.get('/yearly', authMiddleware, branchManagerOnly, async (req, res) => {
    try {
        const { year } = req.query;
        
        const monthlyUsage = await pgPool.query(
            `SELECT reading_month, COALESCE(SUM(consumption), 0) as total_usage
             FROM WATER_USAGE 
             WHERE reading_month LIKE $1
             GROUP BY reading_month
             ORDER BY reading_month`,
            [`${year}-%`]
        );
        
        const monthlyCollections = await mysqlPromise.query(
            `SELECT MONTH(payment_date) as month, COALESCE(SUM(amount_paid), 0) as total_collection
             FROM PAYMENT 
             WHERE YEAR(payment_date) = ?
             GROUP BY MONTH(payment_date)
             ORDER BY month`,
            [year]
        );
        
        res.json({
            year,
            monthly_usage: monthlyUsage.rows,
            monthly_collections: monthlyCollections[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;