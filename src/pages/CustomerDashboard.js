import React, { useState, useEffect } from 'react';
import { getCustomerBills, generateBill, makePayment, reportLeakage, getMyLeakages } from '../services/api';

function CustomerDashboard() {
    const customerId = localStorage.getItem('userId');
    const [bills, setBills] = useState([]);
    const [leakages, setLeakages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(null);
    const [showLeakageForm, setShowLeakageForm] = useState(false);
    const [leakageData, setLeakageData] = useState({ location: '', description: '' });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [activeTab, setActiveTab] = useState('bills');

    useEffect(() => {
        loadBills();
        loadLeakages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBills = async () => {
        try {
            const response = await getCustomerBills(customerId);
            setBills(response.data || []);
        } catch (error) {
            console.error('Error loading bills:', error);
            setBills([]);
        }
    };

    const loadLeakages = async () => {
        try {
            const response = await getMyLeakages(customerId);
            setLeakages(response.data || []);
        } catch (error) {
            console.error('Error loading leakages:', error);
            setLeakages([]);
        }
    };

    const handleGenerateBill = async () => {
        setLoading(true);
        try {
            const readingMonth = new Date().toISOString().slice(0, 7);
            await generateBill(customerId, readingMonth);
            await loadBills();
            alert('✅ Bill generated successfully!');
        } catch (error) {
            alert('❌ Error generating bill: ' + (error.response?.data?.error || 'Unknown error'));
        }
        setLoading(false);
    };

    const handlePayment = async (billId, amount) => {
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        try {
            await makePayment({
                bill_id: billId,
                customer_id: customerId,
                amount_paid: amount,
                payment_method: 'Card',
                transaction_reference: 'TXN' + Date.now()
            });
            await loadBills();
            setShowPayment(null);
            setPaymentAmount('');
            alert('✅ Payment successful!');
        } catch (error) {
            alert('❌ Payment failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const handleReportLeakage = async (e) => {
        e.preventDefault();
        try {
            await reportLeakage({
                customer_id: customerId,
                location: leakageData.location,
                description: leakageData.description
            });
            await loadLeakages();
            setShowLeakageForm(false);
            setLeakageData({ location: '', description: '' });
            alert('✅ Leakage reported successfully!');
        } catch (error) {
            alert('❌ Error reporting leakage: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const totalOutstanding = bills.reduce((sum, bill) => {
        if (bill.payment_status !== 'Paid') {
            return sum + parseFloat(bill.outstanding_balance || bill.grand_total || 0);
        }
        return sum;
    }, 0);

    if (!customerId) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Please login to continue</h2>
                <a href="/login">Go to Login</a>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>💧 Customer Dashboard</h1>
            
            {/* Stats Card */}
            <div style={{
                background: 'linear-gradient(135deg, #2980b9, #1a5f7a)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Total Outstanding Balance</p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>M {totalOutstanding.toFixed(2)}</p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                borderBottom: '2px solid #e0e0e0'
            }}>
                <button
                    onClick={() => setActiveTab('bills')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: activeTab === 'bills' ? 'bold' : 'normal',
                        color: activeTab === 'bills' ? '#2980b9' : '#7f8c8d',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'bills' ? '3px solid #2980b9' : 'none',
                        marginBottom: '-2px'
                    }}
                >
                    💰 Bills & Payments
                </button>
                <button
                    onClick={() => setActiveTab('leakage')}
                    style={{
                        padding: '12px 24px',
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: activeTab === 'leakage' ? 'bold' : 'normal',
                        color: activeTab === 'leakage' ? '#2980b9' : '#7f8c8d',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'leakage' ? '3px solid #2980b9' : 'none',
                        marginBottom: '-2px'
                    }}
                >
                    🚰 Leakage Reports
                </button>
            </div>

            {/* Bills Tab */}
            {activeTab === 'bills' && (
                <>
                    {/* Generate Bill Button */}
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>📄 Generate Bill</h3>
                        <button
                            onClick={handleGenerateBill}
                            disabled={loading}
                            style={{
                                background: '#2980b9',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? '⏳ Generating...' : 'Generate Current Month Bill'}
                        </button>
                    </div>

                    {/* Bills Table */}
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflowX: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>My Bills</h3>
                        {bills.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>No bills found</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Month</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Usage (m³)</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map(bill => (
                                        <tr key={bill.bill_id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px' }}>{bill.bill_month}</td>
                                            <td style={{ padding: '12px' }}>{parseFloat(bill.total_units || 0).toFixed(1)}</td>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>M {parseFloat(bill.grand_total || 0).toFixed(2)}</td>
                                            <td style={{ padding: '12px' }}>{bill.due_date}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    background: bill.payment_status === 'Paid' ? '#d4edda' : '#f8d7da',
                                                    color: bill.payment_status === 'Paid' ? '#155724' : '#721c24'
                                                }}>
                                                    {bill.payment_status || 'Unpaid'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {bill.payment_status !== 'Paid' && (
                                                    <button
                                                        onClick={() => setShowPayment(bill)}
                                                        style={{
                                                            background: '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* Leakage Tab */}
            {activeTab === 'leakage' && (
                <>
                    {/* Report Leakage Form */}
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>🚰 Report Water Leakage</h3>
                        <button
                            onClick={() => setShowLeakageForm(!showLeakageForm)}
                            style={{
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginBottom: showLeakageForm ? '15px' : '0'
                            }}
                        >
                            {showLeakageForm ? 'Cancel' : 'Report Leakage'}
                        </button>
                        {showLeakageForm && (
                            <form onSubmit={handleReportLeakage}>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={leakageData.location}
                                    onChange={(e) => setLeakageData({ ...leakageData, location: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        marginBottom: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <textarea
                                    placeholder="Description"
                                    value={leakageData.description}
                                    onChange={(e) => setLeakageData({ ...leakageData, description: e.target.value })}
                                    required
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        marginBottom: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        fontFamily: 'inherit',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        background: '#2980b9',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Submit Report
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Leakage Reports Table */}
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflowX: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>My Leakage Reports</h3>
                        {leakages.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>No leakage reports found</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Technician</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leakages.map(report => (
                                        <tr key={report.report_id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                            <td style={{ padding: '12px' }}>{new Date(report.report_date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px' }}>{report.location}</td>
                                            <td style={{ padding: '12px' }}>{report.description}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    background: report.status === 'Fixed' ? '#d4edda' : report.status === 'In Progress' ? '#fff3cd' : '#f8d7da',
                                                    color: report.status === 'Fixed' ? '#155724' : report.status === 'In Progress' ? '#856404' : '#721c24'
                                                }}>
                                                    {report.status === 'Reported' ? '📢 Reported' : report.status === 'In Progress' ? '🔧 In Progress' : '✅ Fixed'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>{report.assigned_technician || 'Not assigned'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* Payment Modal */}
            {showPayment && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowPayment(null)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '90%',
                        padding: '25px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 20px 0' }}>💳 Make Payment</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Bill Month</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{showPayment.bill_month}</p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Total Amount</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#2980b9' }}>M {parseFloat(showPayment.grand_total).toFixed(2)}</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Outstanding</p>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>M {parseFloat(showPayment.outstanding_balance || showPayment.grand_total).toFixed(2)}</p>
                        </div>
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                boxSizing: 'border-box',
                                fontSize: '16px'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handlePayment(showPayment.bill_id, parseFloat(paymentAmount) || parseFloat(showPayment.outstanding_balance || showPayment.grand_total))}
                                style={{
                                    flex: 1,
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowPayment(null)}
                                style={{
                                    flex: 1,
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomerDashboard;