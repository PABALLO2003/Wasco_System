import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Auth
export const registerCustomer = (data) => API.post('/auth/register', data);
export const customerLogin = (email, password) => API.post('/auth/customer-login', { email, password });
export const adminLogin = (username, password) => API.post('/auth/admin-login', { username, password });

// Billing
export const generateBill = (customerId, readingMonth) => API.post(`/billing/generate/${customerId}`, { readingMonth });
export const getCustomerBills = (customerId) => API.get(`/billing/customer/${customerId}`);

// Payments
export const makePayment = (data) => API.post('/payments', data);
export const getPaymentHistory = (customerId) => API.get(`/payments/customer/${customerId}`);

// Reports
export const getDailyReport = (date) => API.get(`/reports/daily?date=${date}`);
export const getMonthlyReport = (year, month) => API.get(`/reports/monthly?year=${year}&month=${month}`);
export const getYearlyReport = (year) => API.get(`/reports/yearly?year=${year}`);

// Leakage
export const reportLeakage = (data) => API.post('/leakage', data);
export const getMyLeakages = (customerId) => API.get(`/leakage/customer/${customerId}`);

// Admin
export const getAllCustomers = () => API.get('/admin/customers');
export const addBillingRate = (data) => API.post('/admin/billing-rate', data);
export const getAllBillingRates = () => API.get('/admin/billing-rates');

export default API;