import React, { useState } from 'react';
import { getYearlyReport } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function YearlyChart() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadReport = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getYearlyReport(selectedYear);
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
                    📈 Yearly Analytics
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="number" 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)} 
                        style={{
                            padding: '10px 15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px',
                            width: '120px'
                        }}
                    />
                    <button 
                        onClick={loadReport} 
                        disabled={loading}
                        style={{
                            background: '#9b59b6',
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
                        background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '30px',
                        color: 'white'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Yearly Overview</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
                            {report.year}
                        </p>
                    </div>

                    {report.monthly_usage && report.monthly_usage.length > 0 ? (
                        <>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#2c3e50' }}>Monthly Water Usage (m³)</h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={report.monthly_usage}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="reading_month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total_usage" fill="#3498db" name="Water Usage (m³)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No data available for {selectedYear}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default YearlyChart;