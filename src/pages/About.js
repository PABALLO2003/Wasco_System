import React from "react";

function About() {
  return (
    <div className="about-container">
      <style>
        {`
          .about-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            background: linear-gradient(135deg, #dff9fb, #ffffff);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          .about-card {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            padding: 2.5rem;
            max-width: 1000px;
            width: 100%;
            animation: fadeIn 1s ease-in-out;
          }
          h1 {
            font-size: 2.5rem;
            color: #0077b6;
            text-align: center;
            margin-bottom: 1rem;
          }
          h2 {
            color: #023e8a;
            margin-top: 1.5rem;
            margin-bottom: 0.8rem;
            border-left: 4px solid #0077b6;
            padding-left: 15px;
          }
          p {
            color: #333;
            line-height: 1.7;
            margin-bottom: 1rem;
          }
          ul {
            list-style: none;
            padding-left: 0;
          }
          ul li {
            background: #f1f9ff;
            margin: 0.5rem 0;
            padding: 0.7rem 1rem;
            border-radius: 8px;
            transition: transform 0.2s ease, background 0.2s ease;
          }
          ul li:hover {
            background: #caf0f8;
            transform: translateX(6px);
          }
          .water-warning {
            background: #fff3cd;
            border-left: 6px solid #ffb703;
            padding: 1.2rem;
            margin-top: 2rem;
            border-radius: 10px;
            font-weight: bold;
            color: #8c2f00;
            display: flex;
            align-items: center;
            font-size: 1.1rem;
          }
          .water-warning span {
            font-size: 2rem;
            margin-right: 0.8rem;
          }
          .quote {
            font-style: italic;
            text-align: center;
            margin: 2rem 0;
            padding: 1rem;
            background: #e8f4f8;
            border-radius: 12px;
            color: #0077b6;
            font-size: 1.2rem;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .badge {
            display: inline-block;
            background: #0077b6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            margin-right: 8px;
          }
          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
          }
          .feature-card {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.2s;
          }
          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .feature-icon {
            font-size: 2rem;
            display: block;
            margin-bottom: 0.5rem;
          }
        `}
      </style>

      <div className="about-card">
        <h1>💧 WASCO Online Water Billing System</h1>
        <p>
          Water is not just a utility  it is life itself. The WASCO Online Water Billing System
          is designed to transform how Lesotho manages its most precious resource. By merging
          cutting-edge technology with a vision for sustainability, this platform empowers
          communities to monitor, conserve, and value every drop.
        </p>

        <div className="quote">
          “A nation that saves water secures its future.”
        </div>

        <h2>🌍 Project Overview</h2>
        <p>
          This system is more than a billing tool. It is a distributed, intelligent web application
          that integrates heterogeneous databases to manage customer records, billing rates,
          consumption data, and payment history. It automates bill notifications, supports secure
          online payments, and provides advanced analytics for managers. Most importantly, it
          encourages responsible water usage by making consumption visible and actionable.
        </p>

        <h2>🎯 Objectives</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <strong>Automate Billing</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Based on consumption tiers</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔒</span>
            <strong>Secure Accounts</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Payment history tracking</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🗄️</span>
            <strong>Distributed Data</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>MySQL + PostgreSQL</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📈</span>
            <strong>Analytics</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Embedded SQL queries</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💳</span>
            <strong>Secure Payments</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>API integration</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👥</span>
            <strong>Tailored GUIs</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>For customers, admins, managers</p>
          </div>
        </div>

        <h2>⚙️ Technologies</h2>
        <ul>
          <li><span className="badge">Frontend</span> <strong>React.js</strong> for dynamic, responsive interfaces</li>
          <li><span className="badge">Backend</span> <strong>Node.js + Express</strong> for scalable API services</li>
          <li><span className="badge">Databases</span> <strong>MySQL</strong> (customer & payment data) and <strong>PostgreSQL</strong> (billing & usage data)</li>
          <li><span className="badge">Integration</span> Secure APIs for payment processing and data exchange</li>
        </ul>

        <h2>📊 Expected Outcomes</h2>
        <p>
          Customers gain convenient access to their accounts, administrators manage billing rates
          with ease, and branch managers receive actionable insights on daily to yearly water usage.
          The system reduces errors, improves revenue collection, and enhances service delivery
          across all districts while promoting a culture of conservation.
        </p>

        <h2>✨ Future Enhancements</h2>
        <p>
          Planned improvements include mobile app integration, predictive analytics for water demand,
          and expanded dashboards for sustainability reporting. These features will ensure WASCO
          continues to evolve alongside the needs of the community.
        </p>

        <div className="water-warning">
          <span>🚰</span> Every drop matters. Don't let water flow away without purpose  saving water is saving life.
        </div>
      </div>
    </div>
  );
}

export default About;