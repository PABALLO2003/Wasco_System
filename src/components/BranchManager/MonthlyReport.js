import React, { useState } from 'react';
import { getMonthlyReport } from '../../services/api';

function MonthlyReport() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadReport = async () => {
        setLoading(true);
        setError('');
        try {
            const [year, month] = selectedMonth.split('-');
            const response = await getMonthlyReport(year, month);
            setReport(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load report');
        }
        setLoading(false);
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e9ecef'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '25px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: '#2c3e50' }}>
                    📊 Monthly Report
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)} 
                        style={{
                            padding: '10px 15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                    <button 
                        onClick={loadReport} 
                        disabled={loading}
                        style={{
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? '⏳ Loading...' : '🔍 Generate Report'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {report && (
                <div>
                    <div style={{
                        background: 'linear-gradient(135deg, #1a5f7a 0%, #2980b9 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        color: 'white'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Report Period</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>
                            {report.year}-{report.month}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💧</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Water Usage</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                                {report.water_usage?.total_usage || 0} m³
                            </p>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Bills Generated</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#9b59b6' }}>
                                {report.bills?.total_bills || 0}
                            </p>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Total Collections</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                                M {parseFloat(report.collections?.total_collection || 0).toFixed(2)}
                            </p>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Collection Rate</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                                {report.bills?.total_amount > 0 
                                    ? ((report.collections?.total_collection / report.bills.total_amount) * 100).toFixed(1)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MonthlyReport;