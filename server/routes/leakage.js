const express = require('express');
const router = express.Router();
const mysqlPromise = require('../config/db_mysql');
const { authMiddleware } = require('../middleware/authMiddleware');

// Report a leakage
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { customer_id, location, description } = req.body;
        
        const [result] = await mysqlPromise.query(
            `INSERT INTO LEAKAGE_REPORT (customer_id, report_date, location, description, status)
             VALUES (?, NOW(), ?, ?, 'Reported')`,
            [customer_id, location, description]
        );
        
        res.status(201).json({ success: true, report_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get leakages for a customer
router.get('/customer/:customerId', authMiddleware, async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const [reports] = await mysqlPromise.query(
            `SELECT * FROM LEAKAGE_REPORT WHERE customer_id = ? ORDER BY report_date DESC`,
            [customerId]
        );
        
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update leakage status (Admin only)
router.put('/:reportId/status', authMiddleware, async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, assigned_technician } = req.body;
        
        await mysqlPromise.query(
            `UPDATE LEAKAGE_REPORT SET status = ?, assigned_technician = ? WHERE report_id = ?`,
            [status, assigned_technician, reportId]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;