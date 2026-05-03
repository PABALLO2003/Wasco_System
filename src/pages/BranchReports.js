import React, { useState } from 'react';
import DailyReport from '../components/BranchManager/DailyReport';
import MonthlyReport from '../components/BranchManager/MonthlyReport';
import YearlyChart from '../components/BranchManager/YearlyChart';

function BranchReports() {
    const [activeReport, setActiveReport] = useState('daily');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f2f5 0%, #e8ecf1 100%)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1a5f7a 0%, #2980b9 100%)',
                color: 'white',
                padding: '40px 20px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-80px',
                    left: '-80px',
                    width: '250px',
                    height: '250px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '50%'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        margin: '0 0 10px 0',
                        fontSize: '42px',
                        fontWeight: '700',
                        letterSpacing: '-1px'
                    }}>
                        🏢 Branch Manager Dashboard
                    </h1>
                    <p style={{
                        margin: 0,
                        fontSize: '18px',
                        opacity: 0.95
                    }}>
                        View water usage and billing reports for your district
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                maxWidth: '1200px',
                marginTop: '-20px',
                marginBottom: '0',
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '0 20px',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    background: 'white',
                    padding: '8px',
                    borderRadius: '60px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {[
                        { id: 'daily', icon: '📅', label: 'Daily Report', color: '#3498db' },
                        { id: 'monthly', icon: '📊', label: 'Monthly Report', color: '#27ae60' },
                        { id: 'yearly', icon: '📈', label: 'Yearly Analytics', color: '#9b59b6' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveReport(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 28px',
                                borderRadius: '50px',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: activeReport === tab.id ? '600' : '500',
                                background: activeReport === tab.id ? tab.color : 'transparent',
                                color: activeReport === tab.id ? 'white' : '#7f8c8d',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: activeReport === tab.id ? `0 4px 12px ${tab.color}40` : 'none'
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Content */}
            <div style={{
                maxWidth: '1200px',
                marginTop: '40px',
                marginBottom: '0',
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '0 20px 60px 20px'
            }}>
                <div>
                    {activeReport === 'daily' && <DailyReport />}
                    {activeReport === 'monthly' && <MonthlyReport />}
                    {activeReport === 'yearly' && <YearlyChart />}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center',
                padding: '20px',
                borderTop: '1px solid #e0e0e0',
                background: 'white',
                fontSize: '12px',
                color: '#7f8c8d',
                marginTop: '20px'
            }}>
                <p style={{ margin: 0 }}>© 2024 WASCO Water Billing System - Branch Management Portal</p>
            </div>
        </div>
    );
}

export default BranchReports;