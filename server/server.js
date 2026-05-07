const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// DATABASE CONNECTIONS
// ============================================

// MySQL Connection (FIXED with SSL for Aiven)
const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }  // REQUIRED for Aiven MySQL
}).promise();

// PostgreSQL Connection
const pgPool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

// Test connections
async function testConnections() {
    try {
        await mysqlPool.query('SELECT 1');
        console.log('✅ MySQL connected successfully');
    } catch (err) {
        console.error('❌ MySQL error:', err.message);
    }
    
    try {
        await pgPool.query('SELECT NOW()');
        console.log('✅ PostgreSQL connected successfully');
    } catch (err) {
        console.error('❌ PostgreSQL error:', err.message);
    }
}
testConnections();

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// ============================================
// AUTH ENDPOINTS
// ============================================

// Customer Registration
app.post('/api/auth/register', async (req, res) => {
    console.log('📝 Registration request received');
    
    try {
        const { full_name, email, phone, address, district, password } = req.body;
        
        if (!full_name || !email || !phone || !address || !district || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const account_number = 'WASCO' + Date.now();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const [result] = await mysqlPool.query(
            `INSERT INTO customer (account_number, full_name, email, phone, address, district, registration_date, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
            [account_number, full_name, email, phone, address, district, password_hash]
        );
        
        console.log('✅ Registration successful, ID:', result.insertId);
        
        res.status(201).json({ 
            success: true, 
            customer_id: result.insertId, 
            account_number 
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Customer Login
app.post('/api/auth/customer-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [rows] = await mysqlPool.query('SELECT * FROM customer WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const customer = rows[0];
        const isValid = await bcrypt.compare(password, customer.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
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
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [rows] = await mysqlPool.query('SELECT * FROM admin WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const admin = rows[0];
        const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
        
        if (admin.password_hash !== hashedInput) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
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
        console.error('Admin login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CUSTOMER MANAGEMENT (ADMIN)
// ============================================

// Get all customers
app.get('/api/admin/customers', async (req, res) => {
    try {
        const [customers] = await mysqlPool.query(
            'SELECT customer_id, account_number, full_name, email, phone, address, district, registration_date FROM customer'
        );
        res.json(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
        res.json([]);
    }
});

// Add Customer
app.post('/api/admin/add-customer', async (req, res) => {
    try {
        const { full_name, email, phone, address, district, password } = req.body;
        
        const [existing] = await mysqlPool.query('SELECT email FROM customer WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        const account_number = 'WASCO' + Date.now();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const [result] = await mysqlPool.query(
            `INSERT INTO customer (account_number, full_name, email, phone, address, district, registration_date, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
            [account_number, full_name, email, phone, address, district, password_hash]
        );
        
        res.status(201).json({ success: true, customer_id: result.insertId, account_number });
    } catch (error) {
        console.error('Error adding customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Edit customer
app.put('/api/admin/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { full_name, email, phone, address, district } = req.body;
        
        await mysqlPool.query(
            'UPDATE customer SET full_name = ?, email = ?, phone = ?, address = ?, district = ? WHERE customer_id = ?',
            [full_name, email, phone, address, district, customerId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete customer
app.delete('/api/admin/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const [bills] = await pgPool.query(
            'SELECT COUNT(*) FROM bill_fragment_pgsql WHERE customer_id = $1',
            [customerId]
        );
        
        if (parseInt(bills[0].count) > 0) {
            return res.status(400).json({ error: 'Cannot delete customer with existing bills' });
        }
        
        await mysqlPool.query('DELETE FROM customer WHERE customer_id = ?', [customerId]);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// BILLING ENDPOINTS
// ============================================

// Get customer bills
app.get('/api/billing/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const pgResult = await pgPool.query(
            `SELECT b.bill_id, b.bill_month, b.total_units, b.grand_total, b.due_date, b.vat_amount
             FROM bill_fragment_pgsql b
             WHERE b.customer_id = $1
             ORDER BY b.bill_month DESC`,
            [customerId]
        );
        
        for (let bill of pgResult.rows) {
            const [mysqlResult] = await mysqlPool.query(
                'SELECT payment_status, outstanding_balance FROM bill_fragment_mysql WHERE bill_id = ?',
                [bill.bill_id]
            );
            if (mysqlResult.length > 0) {
                bill.payment_status = mysqlResult[0].payment_status;
                bill.outstanding_balance = mysqlResult[0].outstanding_balance;
            } else {
                bill.payment_status = 'Unpaid';
                bill.outstanding_balance = bill.grand_total;
            }
        }
        
        res.json(pgResult.rows);
    } catch (error) {
        console.error('Error loading bills:', error);
        res.json([]);
    }
});

// Get all bills for Admin
app.get('/api/billing/all', async (req, res) => {
    try {
        const pgResult = await pgPool.query(
            `SELECT b.bill_id, b.customer_id, b.bill_month, b.total_units, 
                    b.grand_total, b.due_date, b.vat_amount
             FROM bill_fragment_pgsql b
             ORDER BY b.bill_month DESC LIMIT 100`
        );
        
        for (let bill of pgResult.rows) {
            const [customer] = await mysqlPool.query(
                'SELECT full_name FROM customer WHERE customer_id = ?',
                [bill.customer_id]
            );
            bill.customer_name = customer[0]?.full_name || 'Unknown';
            
            const [mysqlResult] = await mysqlPool.query(
                'SELECT payment_status, outstanding_balance FROM bill_fragment_mysql WHERE bill_id = ?',
                [bill.bill_id]
            );
            if (mysqlResult.length > 0) {
                bill.payment_status = mysqlResult[0].payment_status;
                bill.outstanding_balance = mysqlResult[0].outstanding_balance;
            } else {
                bill.payment_status = 'Unpaid';
                bill.outstanding_balance = bill.grand_total;
            }
        }
        
        res.json(pgResult.rows);
    } catch (error) {
        console.error('Error loading all bills:', error);
        res.json([]);
    }
});

// Generate bill
app.post('/api/billing/generate/:customerId', async (req, res) => {
    const { customerId } = req.params;
    const { readingMonth } = req.body;
    
    try {
        const [customers] = await mysqlPool.query(
            'SELECT customer_id, full_name, district, account_number FROM customer WHERE customer_id = ?',
            [customerId]
        );
        
        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const existingBill = await pgPool.query(
            'SELECT bill_id FROM bill_fragment_pgsql WHERE customer_id = $1 AND bill_month = $2',
            [customerId, readingMonth + '-01']
        );
        
        if (existingBill.rows.length > 0) {
            return res.status(400).json({ error: 'Bill already exists for this month' });
        }
        
        const usageResult = await pgPool.query(
            `SELECT usage_id, COALESCE(consumption, 0) as consumption, reading_date
             FROM water_usage 
             WHERE customer_id = $1 AND reading_month = $2`,
            [customerId, readingMonth]
        );
        
        let consumption = 0;
        let usageId = null;
        
        if (usageResult.rows.length > 0) {
            consumption = parseFloat(usageResult.rows[0].consumption) || 0;
            usageId = usageResult.rows[0].usage_id;
        } else {
            const newUsage = await pgPool.query(
                `INSERT INTO water_usage (customer_id, reading_date, meter_reading, previous_reading, consumption, reading_month)
                 VALUES ($1, $2, 0, 0, 0, $3)
                 RETURNING usage_id`,
                [customerId, readingMonth + '-15', readingMonth]
            );
            usageId = newUsage.rows[0].usage_id;
            consumption = 0;
        }
        
        const rateResult = await pgPool.query(
            `SELECT rate_id, cost_per_unit, fixed_charge, rate_tier
             FROM billing_rate 
             WHERE customer_category = 'Residential' 
             AND $1 BETWEEN min_usage AND max_usage
             AND effective_from <= CURRENT_DATE
             AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
             LIMIT 1`,
            [consumption]
        );
        
        let rateId = 1;
        let costPerUnit = 5.50;
        let fixedCharge = 25.00;
        
        if (rateResult.rows.length > 0) {
            rateId = rateResult.rows[0].rate_id;
            costPerUnit = parseFloat(rateResult.rows[0].cost_per_unit);
            fixedCharge = parseFloat(rateResult.rows[0].fixed_charge);
        }
        
        const totalAmount = fixedCharge + (consumption * costPerUnit);
        const vatAmount = totalAmount * 0.15;
        const grandTotal = totalAmount + vatAmount;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        
        const pgResult = await pgPool.query(
            `INSERT INTO bill_fragment_pgsql 
             (customer_id, usage_id, rate_id, bill_month, total_units, 
              unit_price, fixed_charge, total_amount, vat_amount, grand_total, due_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING bill_id`,
            [customerId, usageId, rateId, readingMonth + '-01',
             consumption, costPerUnit, fixedCharge,
             totalAmount, vatAmount, grandTotal, dueDate]
        );
        
        const billId = pgResult.rows[0].bill_id;
        
        await mysqlPool.query(
            `INSERT INTO bill_fragment_mysql (bill_id, customer_id, payment_status, outstanding_balance)
             VALUES (?, ?, 'Unpaid', ?)`,
            [billId, customerId, grandTotal]
        );
        
        res.json({
            success: true,
            bill_id: billId,
            customer: customers[0],
            consumption: consumption,
            rate_tier: rateResult.rows[0]?.rate_tier || 'Standard',
            total_amount: totalAmount,
            vat: vatAmount,
            grand_total: grandTotal,
            due_date: dueDate
        });
        
    } catch (error) {
        console.error('Generate bill error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// PAYMENT ENDPOINTS
// ============================================

// Make a payment
app.post('/api/payments', async (req, res) => {
    try {
        const { bill_id, customer_id, amount_paid, payment_method, transaction_reference } = req.body;
        
        const [billStatus] = await mysqlPool.query(
            'SELECT outstanding_balance FROM bill_fragment_mysql WHERE bill_id = ? AND customer_id = ?',
            [bill_id, customer_id]
        );
        
        if (billStatus.length === 0) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        
        const newOutstanding = billStatus[0].outstanding_balance - amount_paid;
        const paymentStatus = newOutstanding <= 0 ? 'Paid' : 'Partial';
        
        await mysqlPool.query(
            `INSERT INTO payment (bill_id, customer_id, payment_date, amount_paid, payment_method, transaction_reference, payment_status)
             VALUES (?, ?, NOW(), ?, ?, ?, 'Completed')`,
            [bill_id, customer_id, amount_paid, payment_method, transaction_reference]
        );
        
        await mysqlPool.query(
            `UPDATE bill_fragment_mysql 
             SET payment_status = ?, outstanding_balance = ?, last_payment_date = NOW()
             WHERE bill_id = ? AND customer_id = ?`,
            [paymentStatus, Math.max(0, newOutstanding), bill_id, customer_id]
        );
        
        res.json({ success: true, message: 'Payment recorded successfully', new_balance: Math.max(0, newOutstanding) });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get payment history
app.get('/api/payments/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const [payments] = await mysqlPool.query(
            `SELECT p.*, bf.outstanding_balance
             FROM payment p
             JOIN bill_fragment_mysql bf ON p.bill_id = bf.bill_id
             WHERE p.customer_id = ?
             ORDER BY p.payment_date DESC`,
            [customerId]
        );
        
        res.json(payments);
    } catch (error) {
        console.error('Error loading payments:', error);
        res.json([]);
    }
});

// Get all payments
app.get('/api/payments/all', async (req, res) => {
    try {
        const [payments] = await mysqlPool.query(
            `SELECT p.*, c.full_name as customer_name
             FROM payment p
             JOIN customer c ON p.customer_id = c.customer_id
             ORDER BY p.payment_date DESC
             LIMIT 100`
        );
        res.json(payments);
    } catch (error) {
        console.error('Error loading payments:', error);
        res.json([]);
    }
});

// ============================================
// LEAKAGE ENDPOINTS
// ============================================

// Get leakages for a customer
app.get('/api/leakage/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const [rows] = await mysqlPool.query(
            'SELECT * FROM leakage_report WHERE customer_id = ? ORDER BY report_date DESC',
            [customerId]
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error loading leakages:', error);
        res.json([]);
    }
});

// Get all leakages
app.get('/api/leakage/all', async (req, res) => {
    try {
        const [rows] = await mysqlPool.query(
            `SELECT l.*, c.full_name as customer_name, c.email, c.phone
             FROM leakage_report l
             JOIN customer c ON l.customer_id = c.customer_id
             ORDER BY l.report_date DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error loading leakages:', error);
        res.json([]);
    }
});

// Report a leakage
app.post('/api/leakage', async (req, res) => {
    try {
        const { customer_id, location, description } = req.body;
        
        const [result] = await mysqlPool.query(
            `INSERT INTO leakage_report (customer_id, report_date, location, description, status)
             VALUES (?, NOW(), ?, ?, 'Reported')`,
            [customer_id, location, description]
        );
        
        res.status(201).json({ success: true, report_id: result.insertId });
    } catch (error) {
        console.error('Error reporting leakage:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update leakage status
app.put('/api/leakage/:reportId', async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, assigned_technician } = req.body;
        
        let completionDate = null;
        if (status === 'Fixed') {
            completionDate = new Date();
        }
        
        await mysqlPool.query(
            `UPDATE leakage_report 
             SET status = ?, assigned_technician = ?, completion_date = ?
             WHERE report_id = ?`,
            [status, assigned_technician, completionDate, reportId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating leakage:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// BILLING RATES MANAGEMENT
// ============================================

// Get all billing rates
app.get('/api/admin/billing-rates', async (req, res) => {
    try {
        const result = await pgPool.query(
            'SELECT rate_id, rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from, effective_to FROM billing_rate ORDER BY customer_category, min_usage'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error loading billing rates:', error);
        res.json([]);
    }
});

// Add billing rate
app.post('/api/admin/billing-rate', async (req, res) => {
    try {
        const { rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from, effective_to } = req.body;
        
        await pgPool.query(
            `INSERT INTO billing_rate (rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from, effective_to)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from, effective_to || null]
        );
        
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error adding billing rate:', error);
        res.status(500).json({ error: error.message });
    }
});

// Edit billing rate
app.put('/api/admin/billing-rate/:rateId', async (req, res) => {
    try {
        const { rateId } = req.params;
        const { rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from } = req.body;
        
        await pgPool.query(
            `UPDATE billing_rate 
             SET rate_tier = $1, customer_category = $2, min_usage = $3, max_usage = $4, 
                 cost_per_unit = $5, fixed_charge = $6, effective_from = $7
             WHERE rate_id = $8`,
            [rate_tier, customer_category, min_usage, max_usage, cost_per_unit, fixed_charge, effective_from, rateId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating rate:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete billing rate
app.delete('/api/admin/billing-rate/:rateId', async (req, res) => {
    try {
        const { rateId } = req.params;
        
        const result = await pgPool.query(
            'SELECT COUNT(*) FROM bill_fragment_pgsql WHERE rate_id = $1',
            [rateId]
        );
        
        if (parseInt(result.rows[0].count) > 0) {
            return res.status(400).json({ error: 'Cannot delete rate that is used in bills' });
        }
        
        await pgPool.query('DELETE FROM billing_rate WHERE rate_id = $1', [rateId]);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting rate:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// REPORT ENDPOINTS
// ============================================

// Daily report
app.get('/api/reports/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const reportDate = date || new Date().toISOString().slice(0, 10);
        
        const usageResult = await pgPool.query(
            `SELECT COALESCE(SUM(consumption), 0) as total_usage, COUNT(*) as total_readings
             FROM water_usage 
             WHERE reading_date = $1`,
            [reportDate]
        );
        
        const paymentResult = await mysqlPool.query(
            `SELECT COALESCE(SUM(amount_paid), 0) as total_collection, COUNT(*) as total_payments
             FROM payment 
             WHERE DATE(payment_date) = ?`,
            [reportDate]
        );
        
        res.json({
            date: reportDate,
            water_usage: usageResult.rows[0],
            collections: paymentResult[0][0]
        });
    } catch (error) {
        console.error('Daily report error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Monthly report
app.get('/api/reports/monthly', async (req, res) => {
    try {
        const { year, month } = req.query;
        
        const usageResult = await pgPool.query(
            `SELECT COALESCE(SUM(consumption), 0) as total_usage, COUNT(*) as total_readings
             FROM water_usage 
             WHERE reading_month = $1`,
            [`${year}-${month.padStart(2, '0')}`]
        );
        
        const paymentResult = await mysqlPool.query(
            `SELECT COALESCE(SUM(amount_paid), 0) as total_collection, COUNT(*) as total_payments
             FROM payment 
             WHERE YEAR(payment_date) = ? AND MONTH(payment_date) = ?`,
            [year, month]
        );
        
        const billsResult = await pgPool.query(
            `SELECT COUNT(*) as total_bills, COALESCE(SUM(grand_total), 0) as total_amount
             FROM bill_fragment_pgsql 
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
        console.error('Monthly report error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Yearly report
app.get('/api/reports/yearly', async (req, res) => {
    try {
        const { year } = req.query;
        
        const monthlyUsage = await pgPool.query(
            `SELECT reading_month, COALESCE(SUM(consumption), 0) as total_usage
             FROM water_usage 
             WHERE reading_month LIKE $1
             GROUP BY reading_month
             ORDER BY reading_month`,
            [`${year}-%`]
        );
        
        const monthlyCollections = await mysqlPool.query(
            `SELECT MONTH(payment_date) as month, COALESCE(SUM(amount_paid), 0) as total_collection
             FROM payment 
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
        console.error('Yearly report error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SERVE REACT FRONTEND
// ============================================

const path = require('path');
app.use(express.static(path.join(__dirname, '../build')));

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MySQL Database: ${process.env.MYSQL_DATABASE}`);
    console.log(`📈 PostgreSQL Database: ${process.env.PG_DATABASE}`);
});