const mysql = require('mysql2');
require('dotenv').config();

const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const mysqlPromise = mysqlPool.promise();

(async () => {
    try {
        const [rows] = await mysqlPromise.query('SELECT 1');
        console.log('✅ MySQL connected successfully');
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
    }
})();

module.exports = mysqlPromise;