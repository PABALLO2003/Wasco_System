import React, { useState } from 'react';
import { getDailyReport } from '../../services/api';

function DailyReport() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadReport = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getDailyReport(selectedDate);
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
                    📅 Daily Report
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
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
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                    >
                        {loading ? '⏳ Loading...' : '🔍 Generate Report'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    background: '#f8d7da',
                    color: '#721c24',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {report && (
                <div style={{
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💧</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Total Water Usage</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
                                {report.water_usage?.total_usage || 0} m³
                            </p>
                        </div>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Total Readings</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
                                {report.water_usage?.total_readings || 0}
                            </p>
                        </div>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Total Collections</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>
                                M {parseFloat(report.collections?.total_collection || 0).toFixed(2)}
                            </p>
                        </div>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Total Payments</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#9b59b6' }}>
                                {report.collections?.total_payments || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DailyReport;