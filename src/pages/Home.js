import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const [hoveredCard, setHoveredCard] = useState(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const featureCards = [
        {
            id: 1,
            icon: '📄',
            title: 'View & Manage Bills',
            description: 'Access your monthly water bills, view detailed breakdowns, and manage payment history with ease.',
            color: '#3498db',
            details: ['Monthly bill summaries', 'Payment history', 'Bill predictions']
        },
        {
            id: 2,
            icon: '💳',
            title: 'Secure Online Payments',
            description: 'Pay your water bills safely and quickly through our secure payment gateway.',
            color: '#27ae60',
            details: ['Multiple payment methods', 'Instant confirmation', 'Receipt generation']
        },
        {
            id: 3,
            icon: '🚰',
            title: 'Report Leakages',
            description: 'Quickly report water leaks and issues in your area for immediate assistance.',
            color: '#e74c3c',
            details: ['Quick reporting', 'Technician assignment', 'Status tracking']
        },
        {
            id: 4,
            icon: '📊',
            title: 'Usage Analytics',
            description: 'Track your water consumption patterns and optimize usage for cost savings.',
            color: '#9b59b6',
            details: ['Usage trends', 'Monthly comparisons', 'Savings tips']
        }
    ];

    const stats = [
        { number: '10K+', label: 'Active Users', icon: '👥' },
        { number: '100K+', label: 'Successful Payments', icon: '✅' },
        { number: '24/7', label: 'Customer Support', icon: '🎧' },
        { number: '99.9%', label: 'Uptime', icon: '⚡' }
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const setCanvasSize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        class WaterParticle {
            constructor(x, y, speedX, speedY, size, opacity) {
                this.x = x;
                this.y = y;
                this.speedX = speedX;
                this.speedY = speedY;
                this.size = size;
                this.opacity = opacity;
                this.life = 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.speedY += 0.2;
                this.life -= 0.008;
                this.opacity = this.life * 0.6;
                return this.life > 0 && this.y < canvas.height + 100;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(52, 152, 219, ${this.opacity})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
                ctx.fill();
            }
        }

        let particles = [];

        const animate = () => {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const tapX = canvas.width * 0.7;
            const tapY = canvas.height * 0.35;
            
            const spawnCount = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < spawnCount; i++) {
                const angle = (Math.random() - 0.5) * 0.8;
                const speedX = (Math.random() - 0.5) * 1.5 + angle;
                const speedY = Math.random() * 4 + 5;
                const size = Math.random() * 5 + 2;
                const opacity = Math.random() * 0.6 + 0.3;
                particles.push(new WaterParticle(tapX, tapY, speedX, speedY, size, opacity));
            }

            particles = particles.filter(p => p.update());
            particles.forEach(p => p.draw(ctx));

            if (particles.some(p => p.y > canvas.height - 50)) {
                ctx.beginPath();
                ctx.ellipse(canvas.width * 0.7, canvas.height - 30, 80, 20, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(52, 152, 219, 0.15)';
                ctx.fill();
                
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.arc(canvas.width * 0.7 + (Math.random() - 0.5) * 60, canvas.height - 35 + Math.random() * 20, Math.random() * 3 + 1, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(52, 152, 219, ${Math.random() * 0.3})`;
                    ctx.fill();
                }
            }

            if (particles.length > 400) {
                particles = particles.slice(-350);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', setCanvasSize);
        };
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif" }}>
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes waterRipple {
                    0% { transform: scale(0.8); opacity: 0.7; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                @keyframes tapGlow {
                    0%, 100% { filter: drop-shadow(0 0 2px rgba(52,152,219,0.5)); }
                    50% { filter: drop-shadow(0 0 8px rgba(52,152,219,0.8)); }
                }
                .hero-title {
                    animation: fadeInDown 0.8s ease-out;
                }
                .hero-subtitle {
                    animation: fadeInDown 0.8s ease-out 0.2s both;
                }
                .hero-buttons {
                    animation: fadeInUp 0.8s ease-out 0.4s both;
                }
                .feature-card {
                    animation: fadeInUp 0.6s ease-out;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .feature-card:hover {
                    transform: translateY(-12px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }
                .btn-primary-custom {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .btn-primary-custom::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.2);
                    transition: left 0.3s ease;
                }
                .btn-primary-custom:hover::before {
                    left: 100%;
                }
                .btn-primary-custom:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                }
                .info-box {
                    animation: slideInLeft 0.8s ease-out;
                }
                .tap-icon {
                    animation: tapGlow 1.5s ease-in-out infinite;
                }
                .water-drop {
                    animation: waterRipple 1s ease-out infinite;
                }
            `}</style>

            <div style={{
                background: 'linear-gradient(135deg, #1a5f7a 0%, #2980b9 50%, #0d3b66 100%)',
                color: 'white',
                padding: '60px 40px 80px',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '500px'
            }}>
                <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60px' }} preserveAspectRatio="none" viewBox="0 0 1440 120">
                    <path fill="#f8f9fc" fillOpacity="1" d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,69.3C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                </svg>

                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-100px',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '60px',
                    left: '-80px',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '50%'
                }}></div>

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div className="hero-title" style={{
                            fontSize: '48px',
                            fontWeight: '700',
                            marginBottom: '20px',
                            letterSpacing: '-1px'
                        }}>
                            🌊 WASCO Water Billing System
                        </div>

                        <div className="hero-subtitle" style={{
                            fontSize: '20px',
                            marginBottom: '30px',
                            opacity: 0.95,
                            lineHeight: '1.6',
                            fontWeight: '300'
                        }}>
                            Effortless water utility management. View bills, make payments, and track usage in under 60 seconds
                        </div>

                        <div className="hero-buttons" style={{
                            display: 'flex',
                            gap: '15px',
                            flexWrap: 'wrap'
                        }}>
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <button className="btn-primary-custom" style={{
                                    background: 'white',
                                    color: '#1a5f7a',
                                    border: 'none',
                                    padding: '14px 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                }}>
                                    🔑 Login to Account
                                </button>
                            </Link>
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <button className="btn-primary-custom" style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    color: 'white',
                                    border: '2px solid white',
                                    padding: '12px 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    📝 Create New Account
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div style={{
                        flex: 1,
                        minWidth: '280px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        marginTop: '20px'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '280px',
                            height: '320px'
                        }}>
                            <canvas
                                ref={canvasRef}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '260px',
                                    height: '280px',
                                    pointerEvents: 'none'
                                }}
                            />
                            
                            <svg width="280" height="320" viewBox="0 0 280 320" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <rect x="180" y="30" width="40" height="80" rx="8" fill="#bdc3c7" stroke="#95a5a6" strokeWidth="2"/>
                                <rect x="185" y="35" width="30" height="70" rx="4" fill="#d5dbdb"/>
                                <rect x="120" y="60" width="100" height="20" rx="4" fill="#7f8c8d" stroke="#6c7a7a" strokeWidth="1.5"/>
                                <rect x="140" y="80" width="30" height="60" rx="4" fill="#7f8c8d" stroke="#6c7a7a" strokeWidth="1.5"/>
                                <circle cx="155" cy="90" r="22" fill="#e74c3c" stroke="#c0392b" strokeWidth="2" className="tap-icon"/>
                                <circle cx="155" cy="90" r="14" fill="#ec7063"/>
                                <circle cx="155" cy="90" r="6" fill="#c0392b"/>
                                <path d="M 155 140 Q 155 170 180 170 Q 200 170 200 150" stroke="#7f8c8d" strokeWidth="12" fill="none" strokeLinecap="round"/>
                                <path d="M 155 140 Q 155 170 180 170 Q 200 170 200 150" stroke="#95a5a6" strokeWidth="8" fill="none" strokeLinecap="round"/>
                                <ellipse cx="200" cy="150" rx="8" ry="4" fill="#34495e"/>
                                <ellipse cx="200" cy="158" rx="4" ry="6" fill="#3498db" opacity="0.8" className="water-drop">
                                    <animate attributeName="cy" values="158;180;158" dur="1s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite"/>
                                </ellipse>
                                <ellipse cx="200" cy="290" rx="35" ry="8" fill="#3498db" opacity="0.3">
                                    <animate attributeName="rx" values="30;45;30" dur="1.5s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" values="0.3;0.15;0.3" dur="1.5s" repeatCount="indefinite"/>
                                </ellipse>
                                <ellipse cx="190" cy="285" rx="15" ry="5" fill="#5dade2" opacity="0.4">
                                    <animate attributeName="rx" values="12;20;12" dur="1.2s" repeatCount="indefinite"/>
                                </ellipse>
                                <ellipse cx="215" cy="288" rx="12" ry="4" fill="#3498db" opacity="0.35">
                                    <animate attributeName="rx" values="10;18;10" dur="1.3s" repeatCount="indefinite"/>
                                </ellipse>
                            </svg>

                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '200px',
                                height: '60px',
                                pointerEvents: 'none'
                            }}>
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            left: `${45 + Math.random() * 50}%`,
                                            bottom: `${Math.random() * 40}px`,
                                            width: `${Math.random() * 6 + 2}px`,
                                            height: `${Math.random() * 8 + 3}px`,
                                            backgroundColor: '#3498db',
                                            borderRadius: '50%',
                                            opacity: 0.5,
                                            animation: `waterRipple ${1 + Math.random()}s ease-in-out infinite`,
                                            animationDelay: `${Math.random() * 2}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '-40px auto 60px',
                padding: '0 20px',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {stats.map((stat, idx) => (
                        <div key={idx} className="info-box" style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e0e0e0',
                            animationDelay: `${idx * 0.1}s`
                        }}>
                            <div style={{ fontSize: '36px', marginBottom: '10px' }}>{stat.icon}</div>
                            <div style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#1a5f7a',
                                marginBottom: '8px'
                            }}>
                                {stat.number}
                            </div>
                            <div style={{ fontSize: '14px', color: '#7f8c8d', fontWeight: '500' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '60px 20px'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '60px'
                }}>
                    <h2 style={{
                        fontSize: '42px',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '15px'
                    }}>
                        Powerful Features
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: '#7f8c8d',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Everything you need to manage your water billing efficiently and conveniently
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '30px'
                }}>
                    {featureCards.map((card, idx) => (
                        <div
                            key={card.id}
                            className="feature-card"
                            onMouseEnter={() => setHoveredCard(card.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '40px 30px',
                                border: `2px solid ${card.color}20`,
                                cursor: 'pointer',
                                animationDelay: `${idx * 0.1}s`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                width: '100px',
                                height: '100px',
                                background: card.color,
                                opacity: hoveredCard === card.id ? 0.08 : 0.04,
                                borderRadius: '50%',
                                transition: 'all 0.3s ease'
                            }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    fontSize: '50px',
                                    marginBottom: '20px',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    {card.icon}
                                </div>

                                <h3 style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    marginBottom: '15px'
                                }}>
                                    {card.title}
                                </h3>

                                <p style={{
                                    fontSize: '15px',
                                    color: '#7f8c8d',
                                    lineHeight: '1.6',
                                    marginBottom: '20px'
                                }}>
                                    {card.description}
                                </p>

                                {hoveredCard === card.id && (
                                    <div style={{
                                        paddingTop: '20px',
                                        borderTop: `2px solid ${card.color}30`,
                                        animation: 'fadeInUp 0.3s ease-out'
                                    }}>
                                        <p style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: card.color,
                                            marginBottom: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            Key Features
                                        </p>
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0
                                        }}>
                                            {card.details.map((detail, idx) => (
                                                <li key={idx} style={{
                                                    fontSize: '13px',
                                                    color: '#2c3e50',
                                                    marginBottom: '8px',
                                                    paddingLeft: '20px',
                                                    position: 'relative'
                                                }}>
                                                    <span style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        color: card.color,
                                                        fontWeight: '700'
                                                    }}>✓</span>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{
                background: '#f0f4f8',
                padding: '80px 40px',
                marginTop: '60px'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '60px'
                    }}>
                        <h2 style={{
                            fontSize: '42px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '15px'
                        }}>
                            How It Works
                        </h2>
                        <p style={{
                            fontSize: '18px',
                            color: '#7f8c8d',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            Get started in just 3 simple steps
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '40px'
                    }}>
                        {[
                            {
                                number: '1',
                                title: 'Sign Up or Login',
                                description: 'Create a new account or log in with your existing credentials to access your dashboard.'
                            },
                            {
                                number: '2',
                                title: 'View Your Bills',
                                description: 'See your current and past bills with detailed breakdowns of your water usage and charges.'
                            },
                            {
                                number: '3',
                                title: 'Pay & Track',
                                description: 'Make secure payments and track your consumption patterns to optimize your water usage.'
                            }
                        ].map((step, idx) => (
                            <div key={idx} style={{
                                textAlign: 'center',
                                animation: 'fadeInUp 0.6s ease-out',
                                animationDelay: `${idx * 0.15}s`,
                                animationFillMode: 'both'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #1a5f7a 0%, #2980b9 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    margin: '0 auto 20px',
                                    boxShadow: '0 8px 20px rgba(26, 95, 122, 0.3)'
                                }}>
                                    {step.number}
                                </div>
                                <h3 style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    marginBottom: '12px'
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{
                                    fontSize: '15px',
                                    color: '#7f8c8d',
                                    lineHeight: '1.6'
                                }}>
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                background: 'linear-gradient(135deg, #2980b9 0%, #1a5f7a 100%)',
                color: 'white',
                padding: '80px 40px',
                textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    marginBottom: '20px'
                }}>
                    Ready to Get Started?
                </h2>
                <p style={{
                    fontSize: '18px',
                    marginBottom: '40px',
                    opacity: 0.95,
                    maxWidth: '600px',
                    margin: '0 auto 40px'
                }}>
                    Join thousands of users managing their water bills efficiently with WASCO
                </p>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary-custom" style={{
                            background: 'white',
                            color: '#1a5f7a',
                            border: 'none',
                            padding: '16px 40px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                        }}>
                            Start Free Today
                        </button>
                    </Link>
                    <Link to="/about" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary-custom" style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            border: '2px solid white',
                            padding: '14px 40px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Learn More
                        </button>
                    </Link>
                </div>
            </div>

            <div style={{
                background: '#2c3e50',
                color: 'white',
                padding: '40px',
                textAlign: 'center',
                fontSize: '14px'
            }}>
                <p style={{ margin: '0 0 10px 0' }}>
                    © 2024 WASCO Water Billing System. All rights reserved.
                </p>
                <p style={{ margin: 0, opacity: 0.8 }}>
                    Serving Lesotho with reliable water management solutions
                </p>
            </div>
        </div>
    );
}

export default Home;