import React, { useState, useEffect } from 'react';
import { getAllCustomers, getAllBillingRates, addBillingRate } from '../services/api';
import API from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
    const [customers, setCustomers] = useState([]);
    const [rates, setRates] = useState([]);
    const [payments, setPayments] = useState([]);
    const [bills, setBills] = useState([]);
    const [leakages, setLeakages] = useState([]);
    const [showRateForm, setShowRateForm] = useState(false);
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
    const [showEditCustomerModal, setShowEditCustomerModal] = useState(null);
    const [showEditRateModal, setShowEditRateModal] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [newRate, setNewRate] = useState({
        rate_tier: '', 
        customer_category: 'Residential', 
        min_usage: '', 
        max_usage: '', 
        cost_per_unit: '', 
        fixed_charge: '25', 
        effective_from: new Date().toISOString().slice(0, 10)
    });
    const [newCustomer, setNewCustomer] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        district: 'Maseru',
        password: 'password123'
    });
    const [editCustomerData, setEditCustomerData] = useState({
        customer_id: '',
        full_name: '',
        email: '',
        phone: '',
        address: '',
        district: ''
    });
    const [editRateData, setEditRateData] = useState({
        rate_id: '',
        rate_tier: '',
        customer_category: '',
        min_usage: '',
        max_usage: '',
        cost_per_unit: '',
        fixed_charge: '',
        effective_from: ''
    });

    useEffect(() => {
        loadAllData();
        loadLeakages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAllData = async () => {
        await Promise.all([loadCustomers(), loadRates(), loadPayments(), loadAllBills()]);
    };

    const loadCustomers = async () => {
        try {
            const response = await getAllCustomers();
            setCustomers(response.data || []);
        } catch (error) {
            console.error('Error loading customers:', error);
            setCustomers([]);
        }
    };

    const loadRates = async () => {
        try {
            const response = await getAllBillingRates();
            setRates(response.data || []);
        } catch (error) {
            console.error('Error loading rates:', error);
            setRates([]);
        }
    };

    const loadPayments = async () => {
        try {
            const response = await API.get('/payments/all');
            setPayments(response.data || []);
        } catch (error) {
            console.error('Error loading payments:', error);
            setPayments([]);
        }
    };

    const loadAllBills = async () => {
        try {
            const response = await API.get('/billing/all');
            setBills(response.data || []);
        } catch (error) {
            console.error('Error loading bills:', error);
            setBills([]);
        }
    };

    const loadLeakages = async () => {
        try {
            const response = await API.get('/leakage/all');
            setLeakages(response.data || []);
        } catch (error) {
            console.error('Error loading leakages:', error);
            setLeakages([]);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/admin/add-customer', newCustomer);
            await loadCustomers();
            setShowAddCustomerForm(false);
            setNewCustomer({
                full_name: '',
                email: '',
                phone: '',
                address: '',
                district: 'Maseru',
                password: 'password123'
            });
            alert('✅ Customer added successfully!');
        } catch (error) {
            alert('❌ Error adding customer: ' + (error.response?.data?.error || 'Unknown error'));
        }
        setLoading(false);
    };

    const handleEditCustomer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put(`/admin/customer/${editCustomerData.customer_id}`, {
                full_name: editCustomerData.full_name,
                email: editCustomerData.email,
                phone: editCustomerData.phone,
                address: editCustomerData.address,
                district: editCustomerData.district
            });
            await loadCustomers();
            setShowEditCustomerModal(null);
            alert('✅ Customer updated successfully!');
        } catch (error) {
            alert('❌ Error updating customer: ' + (error.response?.data?.error || 'Unknown error'));
        }
        setLoading(false);
    };

    const handleEditRate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put(`/admin/billing-rate/${editRateData.rate_id}`, {
                rate_tier: editRateData.rate_tier,
                customer_category: editRateData.customer_category,
                min_usage: parseFloat(editRateData.min_usage),
                max_usage: parseFloat(editRateData.max_usage),
                cost_per_unit: parseFloat(editRateData.cost_per_unit),
                fixed_charge: parseFloat(editRateData.fixed_charge),
                effective_from: editRateData.effective_from
            });
            await loadRates();
            setShowEditRateModal(null);
            alert('✅ Rate updated successfully!');
        } catch (error) {
            alert('❌ Error updating rate: ' + (error.response?.data?.error || 'Unknown error'));
        }
        setLoading(false);
    };

    const openEditCustomerModal = (customer) => {
        setEditCustomerData({
            customer_id: customer.customer_id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            district: customer.district
        });
        setShowEditCustomerModal(true);
    };

    const openEditRateModal = (rate) => {
        setEditRateData({
            rate_id: rate.rate_id,
            rate_tier: rate.rate_tier,
            customer_category: rate.customer_category,
            min_usage: rate.min_usage,
            max_usage: rate.max_usage,
            cost_per_unit: rate.cost_per_unit,
            fixed_charge: rate.fixed_charge,
            effective_from: rate.effective_from
        });
        setShowEditRateModal(true);
    };

    const updateLeakageStatus = async (reportId, status, technician) => {
        try {
            await API.put(`/leakage/${reportId}`, { status, assigned_technician: technician });
            await loadLeakages();
            alert('✅ Leakage report updated successfully!');
        } catch (error) {
            alert('❌ Error updating report: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const calculateMetrics = () => {
        const totalCustomers = customers.length;
        const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
        const paidBills = bills.filter(b => b.payment_status === 'Paid').length;
        const unpaidBills = bills.filter(b => b.payment_status !== 'Paid').length;
        const totalWaterUsage = bills.reduce((sum, b) => sum + parseFloat(b.total_units || 0), 0);
        const collectionRate = bills.length > 0 ? (paidBills / bills.length * 100).toFixed(1) : 0;

        return {
            totalCustomers,
            totalRevenue,
            paidBills,
            unpaidBills,
            totalWaterUsage,
            collectionRate
        };
    };

    const getWaterUsageData = () => {
        if (!bills.length) return [];
        const categoryUsage = {};
        bills.forEach(bill => {
            const category = 'Residential';
            categoryUsage[category] = (categoryUsage[category] || 0) + parseFloat(bill.total_units || 0);
        });
        return Object.entries(categoryUsage).map(([name, value]) => ({ name, usage: parseFloat(value.toFixed(2)) }));
    };

    const metrics = calculateMetrics();
    const waterUsageData = getWaterUsageData();

    const handleAddRate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addBillingRate(newRate);
            await loadRates();
            setShowRateForm(false);
            setNewRate({ 
                rate_tier: '', 
                customer_category: 'Residential', 
                min_usage: '', 
                max_usage: '', 
                cost_per_unit: '', 
                fixed_charge: '25', 
                effective_from: new Date().toISOString().slice(0, 10) 
            });
            alert('✅ Billing rate added successfully!');
        } catch (error) {
            alert('❌ Error adding rate: ' + (error.response?.data?.error || 'Unknown error'));
        }
        setLoading(false);
    };

    const handleDeleteRate = async (rateId) => {
        if (window.confirm('⚠️ Are you sure you want to delete this billing rate?')) {
            try {
                await API.delete(`/admin/billing-rate/${rateId}`);
                await loadRates();
                alert('✅ Rate deleted successfully!');
            } catch (error) {
                alert('❌ Error deleting rate: ' + (error.response?.data?.error || 'Unknown error'));
            }
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('⚠️ Are you sure you want to delete this customer?')) {
            try {
                await API.delete(`/admin/customer/${customerId}`);
                await loadCustomers();
                alert('✅ Customer deleted successfully!');
            } catch (error) {
                alert('❌ Error deleting customer: ' + (error.response?.data?.error || 'Unknown error'));
            }
        }
    };

    const districts = ['Maseru', 'Leribe', 'Berea', 'Mafeteng', "Mohale's Hoek", 'Quthing', "Qacha's Nek", 'Thaba-Tseka', 'Mokhotlong', 'Botha-Bothe'];
    const rateCategories = ['Residential', 'Commercial', 'Industrial', 'Government'];

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1a5f7a 0%, #2c8fa3 100%)',
                color: 'white',
                padding: '30px 40px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold' }}>🌊 WASCO Water Billing Dashboard</h1>
                <p style={{ margin: 0, opacity: 0.95, fontSize: '15px' }}>Real-time Analytics & System Management</p>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                background: 'white',
                borderBottom: '2px solid #e0e0e0',
                padding: '0 40px',
                display: 'flex',
                gap: '30px',
                overflowX: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {['overview', 'customers', 'rates', 'payments', 'bills', 'leakages'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '18px 0',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === tab ? '600' : '500',
                            color: activeTab === tab ? '#1a5f7a' : '#7f8c8d',
                            borderBottom: activeTab === tab ? '3px solid #1a5f7a' : 'none',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab === 'overview' && '📊 Overview'}
                        {tab === 'customers' && '👥 Customers'}
                        {tab === 'rates' && '💰 Rates'}
                        {tab === 'payments' && '💳 Payments'}
                        {tab === 'bills' && '📄 Bills'}
                        {tab === 'leakages' && '🚰 Leakages'}
                    </button>
                ))}
            </div>

            <div style={{ padding: '40px' }}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            {[
                                { icon: '👥', title: 'Total Customers', value: metrics.totalCustomers, color: '#9b59b6' },
                                { icon: '💰', title: 'Total Revenue', value: `M ${metrics.totalRevenue.toFixed(2)}`, color: '#e74c3c' },
                                { icon: '✅', title: 'Paid Bills', value: metrics.paidBills, color: '#27ae60' },
                                { icon: '⏳', title: 'Unpaid Bills', value: metrics.unpaidBills, color: '#f39c12' },
                                { icon: '💧', title: 'Total Water Usage', value: `${metrics.totalWaterUsage.toFixed(0)} m³`, color: '#3498db' },
                                { icon: '📊', title: 'Collection Rate', value: `${metrics.collectionRate}%`, color: '#16a085' }
                            ].map((stat, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    border: `1px solid ${stat.color}20`,
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#7f8c8d', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.title}</p>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {waterUsageData.length > 0 && (
                            <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>💧 Water Usage by Category</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={waterUsageData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="usage" fill="#3498db" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}

                {/* Customers Tab */}
                {activeTab === 'customers' && (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 30px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>👥 All Customers</h3>
                            <div>
                                <button onClick={() => setShowAddCustomerForm(true)} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>+ Add Customer</button>
                                <span style={{ background: '#1a5f7a', color: 'white', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{customers.length} customers</span>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto', padding: '0 30px 30px 30px' }}>
                            {customers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7f8c8d' }}>No customers found</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Account</th>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Phone</th>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Address</th>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>District</th>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map(c => (
                                            <tr key={c.customer_id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: '#1a5f7a' }}>{c.account_number}</td>
                                                <td style={{ padding: '16px', fontSize: '13px' }}>{c.full_name}</td>
                                                <td style={{ padding: '16px', fontSize: '13px', color: '#3498db' }}>{c.email}</td>
                                                <td style={{ padding: '16px', fontSize: '13px' }}>{c.phone}</td>
                                                <td style={{ padding: '16px', fontSize: '13px' }}>{c.address || '-'}</td>
                                                <td style={{ padding: '16px', fontSize: '13px' }}>{c.district}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <button onClick={() => openEditCustomerModal(c)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>✏️ Edit</button>
                                                    <button onClick={() => handleDeleteCustomer(c.customer_id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Edit Customer Modal */}
                {showEditCustomerModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowEditCustomerModal(null)}>
                        <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ margin: '0 0 20px 0' }}>✏️ Edit Customer</h3>
                            <form onSubmit={handleEditCustomer}>
                                <input type="text" placeholder="Full Name" value={editCustomerData.full_name} onChange={(e) => setEditCustomerData({...editCustomerData, full_name: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="email" placeholder="Email" value={editCustomerData.email} onChange={(e) => setEditCustomerData({...editCustomerData, email: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Phone" value={editCustomerData.phone} onChange={(e) => setEditCustomerData({...editCustomerData, phone: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <textarea placeholder="Address" value={editCustomerData.address} onChange={(e) => setEditCustomerData({...editCustomerData, address: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <select value={editCustomerData.district} onChange={(e) => setEditCustomerData({...editCustomerData, district: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                                    <button type="button" onClick={() => setShowEditCustomerModal(null)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Customer Modal */}
                {showAddCustomerForm && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddCustomerForm(false)}>
                        <div style={{ background: 'white', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ margin: '0 0 20px 0' }}>➕ Add New Customer</h3>
                            <form onSubmit={handleAddCustomer}>
                                <input type="text" placeholder="Full Name" value={newCustomer.full_name} onChange={(e) => setNewCustomer({...newCustomer, full_name: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="email" placeholder="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <textarea placeholder="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <select value={newCustomer.district} onChange={(e) => setNewCustomer({...newCustomer, district: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <input type="password" placeholder="Password (default: password123)" value={newCustomer.password} onChange={(e) => setNewCustomer({...newCustomer, password: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }} disabled={loading}>{loading ? 'Adding...' : 'Add Customer'}</button>
                                    <button type="button" onClick={() => setShowAddCustomerForm(false)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Rates Tab */}
                {activeTab === 'rates' && (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 30px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>💰 Billing Rates</h3>
                            <button onClick={() => setShowRateForm(!showRateForm)} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer' }}>+ Add New Rate</button>
                        </div>
                        <div style={{ padding: '30px' }}>
                            {showRateForm && (
                                <form onSubmit={handleAddRate} style={{ marginBottom: '30px', padding: '24px', background: '#f8f9fa', borderRadius: '8px' }}>
                                    <h4>Add New Billing Rate</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                                        <input type="text" placeholder="Rate Tier" value={newRate.rate_tier} onChange={(e) => setNewRate({ ...newRate, rate_tier: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                        <select value={newRate.customer_category} onChange={(e) => setNewRate({ ...newRate, customer_category: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                            {rateCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input type="number" placeholder="Min Usage" value={newRate.min_usage} onChange={(e) => setNewRate({ ...newRate, min_usage: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                        <input type="number" placeholder="Max Usage" value={newRate.max_usage} onChange={(e) => setNewRate({ ...newRate, max_usage: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                        <input type="number" step="0.01" placeholder="Cost per Unit" value={newRate.cost_per_unit} onChange={(e) => setNewRate({ ...newRate, cost_per_unit: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                        <input type="number" step="0.01" placeholder="Fixed Charge" value={newRate.fixed_charge} onChange={(e) => setNewRate({ ...newRate, fixed_charge: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                        <input type="date" value={newRate.effective_from} onChange={(e) => setNewRate({ ...newRate, effective_from: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                    </div>
                                    <button type="submit" style={{ marginTop: '15px', background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }} disabled={loading}>{loading ? 'Saving...' : 'Save Rate'}</button>
                                </form>
                            )}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Tier</th><th>Category</th><th>Min</th><th>Max</th><th>Rate</th><th>Fixed</th><th>From</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rates.map(r => (
                                            <tr key={r.rate_id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                <td style={{ padding: '16px' }}>{r.rate_tier}</td>
                                                <td style={{ padding: '16px' }}>{r.customer_category}</td>
                                                <td style={{ padding: '16px' }}>{r.min_usage}</td>
                                                <td style={{ padding: '16px' }}>{r.max_usage}</td>
                                                <td style={{ padding: '16px' }}>M {parseFloat(r.cost_per_unit).toFixed(2)}</td>
                                                <td style={{ padding: '16px' }}>M {parseFloat(r.fixed_charge).toFixed(2)}</td>
                                                <td style={{ padding: '16px' }}>{r.effective_from}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <button onClick={() => openEditRateModal(r)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>✏️ Edit</button>
                                                    <button onClick={() => handleDeleteRate(r.rate_id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Rate Modal */}
                {showEditRateModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowEditRateModal(null)}>
                        <div style={{ background: 'white', borderRadius: '12px', width: '550px', maxWidth: '90%', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ margin: '0 0 20px 0' }}>✏️ Edit Billing Rate</h3>
                            <form onSubmit={handleEditRate}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <input type="text" placeholder="Rate Tier" value={editRateData.rate_tier} onChange={(e) => setEditRateData({...editRateData, rate_tier: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                    <select value={editRateData.customer_category} onChange={(e) => setEditRateData({...editRateData, customer_category: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                        {rateCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <input type="number" step="0.01" placeholder="Min Usage" value={editRateData.min_usage} onChange={(e) => setEditRateData({...editRateData, min_usage: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                    <input type="number" step="0.01" placeholder="Max Usage" value={editRateData.max_usage} onChange={(e) => setEditRateData({...editRateData, max_usage: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                    <input type="number" step="0.01" placeholder="Cost per Unit (M)" value={editRateData.cost_per_unit} onChange={(e) => setEditRateData({...editRateData, cost_per_unit: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                    <input type="number" step="0.01" placeholder="Fixed Charge (M)" value={editRateData.fixed_charge} onChange={(e) => setEditRateData({...editRateData, fixed_charge: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                    <input type="date" value={editRateData.effective_from} onChange={(e) => setEditRateData({...editRateData, effective_from: e.target.value})} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                                    <button type="button" onClick={() => setShowEditRateModal(null)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 30px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>💳 Recent Payments ({payments.length})</h3>
                        </div>
                        <div style={{ padding: '30px', overflowX: 'auto' }}>
                            {payments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7f8c8d' }}>No payments recorded</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Date</th><th>Customer</th><th>Bill</th><th>Amount</th><th>Method</th><th>Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.payment_id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                <td style={{ padding: '16px' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                                                <td style={{ padding: '16px' }}>{p.customer_name || p.customer_id}</td>
                                                <td style={{ padding: '16px' }}>{p.bill_id}</td>
                                                <td style={{ fontWeight: '600', color: '#27ae60' }}>M {parseFloat(p.amount_paid).toFixed(2)}</td>
                                                <td style={{ padding: '16px' }}>{p.payment_method}</td>
                                                <td style={{ fontSize: '12px', color: '#999' }}>{p.transaction_reference}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Bills Tab */}
                {activeTab === 'bills' && (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 30px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>📄 All Customer Bills ({bills.length})</h3>
                        </div>
                        <div style={{ padding: '30px', overflowX: 'auto' }}>
                            {bills.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7f8c8d' }}>No bills generated yet</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                            <th style={{ padding: '16px', textAlign: 'left' }}>Bill ID</th><th>Customer</th><th>Month</th><th>Usage</th><th>Total</th><th>Due Date</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bills.map(b => (
                                            <tr key={b.bill_id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                <td style={{ padding: '16px', fontWeight: '500', color: '#1a5f7a' }}>{b.bill_id}</td>
                                                <td style={{ padding: '16px' }}>{b.customer_id}</td>
                                                <td style={{ padding: '16px' }}>{b.bill_month}</td>
                                                <td style={{ padding: '16px' }}>{parseFloat(b.total_units || 0).toFixed(1)} m³</td>
                                                <td style={{ padding: '16px' }}>M {parseFloat(b.grand_total || 0).toFixed(2)}</td>
                                                <td style={{ fontSize: '12px', color: '#999' }}>{b.due_date}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ background: b.payment_status === 'Paid' ? '#d4edda' : '#f8d7da', color: b.payment_status === 'Paid' ? '#155724' : '#721c24', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{b.payment_status || 'Unpaid'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Leakages Tab */}
                {activeTab === 'leakages' && (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 30px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>🚰 Leakage Reports Management</h3>
                        </div>
                        <div style={{ padding: '30px', overflowX: 'auto' }}>
                            {leakages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7f8c8d' }}>No leakage reports found</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Technician</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leakages.map(report => (
                                            <tr key={report.report_id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                <td style={{ padding: '12px' }}>{report.report_id}</td>
                                                <td style={{ padding: '12px' }}>{report.customer_name || report.customer_id}</td>
                                                <td style={{ padding: '12px' }}>{new Date(report.report_date).toLocaleDateString()}</td>
                                                <td style={{ padding: '12px' }}>{report.location}</td>
                                                <td style={{ padding: '12px' }}>{report.description}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <select value={report.status} onChange={(e) => updateLeakageStatus(report.report_id, e.target.value, report.assigned_technician)} style={{ padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd' }}>
                                                        <option value="Reported">📢 Reported</option>
                                                        <option value="In Progress">🔧 In Progress</option>
                                                        <option value="Fixed">✅ Fixed</option>
                                                    </select>
                                                 </td>
                                                <td style={{ padding: '12px' }}>
                                                    <input type="text" defaultValue={report.assigned_technician || ''} placeholder="Assign technician" onBlur={(e) => updateLeakageStatus(report.report_id, report.status, e.target.value)} style={{ padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd', width: '130px' }} />
                                                 </td>
                                                <td style={{ padding: '12px' }}>
                                                    <button onClick={() => updateLeakageStatus(report.report_id, 'In Progress', report.assigned_technician || 'Technician')} style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>Start</button>
                                                    <button onClick={() => updateLeakageStatus(report.report_id, 'Fixed', report.assigned_technician)} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Complete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;