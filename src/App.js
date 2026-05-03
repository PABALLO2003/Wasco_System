import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BranchReports from './pages/BranchReports';
import About from './pages/About';

function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const navLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/about', label: 'About', icon: 'ℹ️' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav style={styles.nav}>
                <div style={styles.navContainer}>
                    {/* Logo - Left */}
                    <div style={styles.logo}>
                        <span style={styles.logoIcon}>💧</span>
                        <span style={styles.logoText}>WASCO</span>
                        <span style={styles.logoBadge}>Water Billing</span>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div style={styles.desktopNav}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    ...styles.navLink,
                                    ...(isActive(link.path) ? styles.navLinkActive : {})
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <span style={styles.navLinkIcon}>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Login/User Menu */}
                    <div style={styles.rightSection}>
                        {!token ? (
                            <Link
                                to="/login"
                                style={{
                                    ...styles.navLink,
                                    ...styles.navLinkButton,
                                    ...(isActive('/login') ? styles.navLinkActive : {})
                                }}
                            >
                                🔑 Login
                            </Link>
                        ) : (
                            <div style={styles.userMenu}>
                                <button
                                    style={styles.userMenuButton}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    onMouseEnter={() => setDropdownOpen(true)}
                                >
                                    <span style={styles.userAvatar}>👤</span>
                                    <span style={styles.userName}>{userName || 'User'}</span>
                                    <span style={styles.userRole}>{userRole || 'Customer'}</span>
                                    <span style={styles.dropdownArrow}>▼</span>
                                </button>
                                
                                {dropdownOpen && (
                                    <div 
                                        style={styles.dropdownMenu}
                                        onMouseLeave={() => setDropdownOpen(false)}
                                    >
                                        {userRole === 'customer' && (
                                            <Link to="/customer/dashboard" style={styles.dropdownItem}>
                                                📊 My Dashboard
                                            </Link>
                                        )}
                                        {(userRole === 'Super Admin' || userRole === 'Billing Officer') && (
                                            <Link to="/admin/dashboard" style={styles.dropdownItem}>
                                                ⚙️ Admin Dashboard
                                            </Link>
                                        )}
                                        {userRole === 'Branch Manager' && (
                                            <Link to="/branch/dashboard" style={styles.dropdownItem}>
                                                📈 Branch Reports
                                            </Link>
                                        )}
                                        <div style={styles.dropdownDivider}></div>
                                        <button onClick={handleLogout} style={styles.dropdownItemLogout}>
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        style={styles.mobileMenuButton}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span style={{ ...styles.hamburgerLine, transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
                        <span style={{ ...styles.hamburgerLine, opacity: mobileMenuOpen ? 0 : 1 }}></span>
                        <span style={{ ...styles.hamburgerLine, transform: mobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none' }}></span>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div style={styles.mobileNav}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                style={styles.mobileNavLink}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span style={styles.mobileNavIcon}>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                        
                        {!token ? (
                            <Link
                                to="/login"
                                style={styles.mobileNavLink}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span style={styles.mobileNavIcon}>🔑</span>
                                Login
                            </Link>
                        ) : (
                            <>
                                <div style={styles.mobileUserInfo}>
                                    <span style={styles.mobileAvatar}>👤</span>
                                    <div>
                                        <div style={styles.mobileUserName}>{userName || 'User'}</div>
                                        <div style={styles.mobileUserRole}>{userRole || 'Customer'}</div>
                                    </div>
                                </div>
                                {userRole === 'customer' && (
                                    <Link to="/customer/dashboard" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                                        📊 My Dashboard
                                    </Link>
                                )}
                                {(userRole === 'Super Admin' || userRole === 'Billing Officer') && (
                                    <Link to="/admin/dashboard" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                                        ⚙️ Admin Dashboard
                                    </Link>
                                )}
                                {userRole === 'Branch Manager' && (
                                    <Link to="/branch/dashboard" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                                        📈 Branch Reports
                                    </Link>
                                )}
                                <button onClick={handleLogout} style={styles.mobileNavLogout}>
                                    🚪 Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </nav>
            
            <div style={{ height: '70px' }}></div>
        </>
    );
}

const styles = {
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f7f4 100%)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(26, 95, 122, 0.15)',
    },
    navContainer: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px',
        position: 'relative',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        flex: 1,
    },
    logoIcon: {
        fontSize: '28px',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
    },
    logoText: {
        fontSize: '24px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #1a5f7a 0%, #27ae60 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.5px',
    },
    logoBadge: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#27ae60',
        background: '#e8f5e9',
        padding: '2px 8px',
        borderRadius: '20px',
        marginLeft: '4px',
    },
    desktopNav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flex: 2,
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    rightSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '500',
        color: '#2c3e50',
        textDecoration: 'none',
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
    },
    navLinkActive: {
        color: '#1a5f7a',
        background: 'rgba(26, 95, 122, 0.08)',
    },
    navLinkIcon: {
        fontSize: '18px',
    },
    navLinkButton: {
        background: 'linear-gradient(135deg, #1a5f7a 0%, #2980b9 100%)',
        color: 'white',
        padding: '8px 24px',
        borderRadius: '25px',
        boxShadow: '0 2px 8px rgba(26, 95, 122, 0.3)',
    },
    userMenu: {
        position: 'relative',
    },
    userMenuButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        background: 'rgba(26, 95, 122, 0.05)',
        border: '1px solid rgba(26, 95, 122, 0.15)',
        borderRadius: '40px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '14px',
        fontWeight: '500',
    },
    userAvatar: {
        fontSize: '20px',
    },
    userName: {
        color: '#2c3e50',
        maxWidth: '120px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    userRole: {
        fontSize: '11px',
        color: '#27ae60',
        background: '#e8f5e9',
        padding: '2px 8px',
        borderRadius: '20px',
    },
    dropdownArrow: {
        fontSize: '10px',
        color: '#7f8c8d',
        transition: 'transform 0.3s ease',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        minWidth: '220px',
        overflow: 'hidden',
        animation: 'dropdownFadeIn 0.2s ease-out',
        border: '1px solid rgba(0, 0, 0, 0.05)',
    },
    dropdownItem: {
        display: 'block',
        padding: '12px 20px',
        color: '#2c3e50',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ':hover': {
            background: '#f0f7f4',
            transform: 'translateX(4px)',
        },
    },
    dropdownItemLogout: {
        display: 'block',
        width: '100%',
        padding: '12px 20px',
        color: '#e74c3c',
        background: 'none',
        border: 'none',
        fontSize: '14px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            background: '#fef5f5',
            transform: 'translateX(4px)',
        },
    },
    dropdownDivider: {
        height: '1px',
        background: '#ecf0f1',
        margin: '4px 0',
    },
    mobileMenuButton: {
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '30px',
        height: '22px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        '@media (max-width: 768px)': {
            display: 'flex',
        },
    },
    hamburgerLine: {
        width: '100%',
        height: '2px',
        background: '#2c3e50',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
    },
    mobileNav: {
        position: 'absolute',
        top: '70px',
        left: 0,
        right: 0,
        background: 'white',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        animation: 'mobileSlideIn 0.3s ease-out',
    },
    mobileNavLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        fontSize: '16px',
        fontWeight: '500',
        color: '#2c3e50',
        textDecoration: 'none',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
        ':hover': {
            background: '#f0f7f4',
            transform: 'translateX(4px)',
        },
    },
    mobileNavIcon: {
        fontSize: '20px',
    },
    mobileUserInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: '#f0f7f4',
        borderRadius: '12px',
        marginBottom: '8px',
    },
    mobileAvatar: {
        fontSize: '32px',
    },
    mobileUserName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    mobileUserRole: {
        fontSize: '12px',
        color: '#27ae60',
    },
    mobileNavLogout: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        fontSize: '16px',
        fontWeight: '500',
        color: '#e74c3c',
        background: 'none',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        ':hover': {
            background: '#fef5f5',
            transform: 'translateX(4px)',
        },
    },
};

const GlobalStyles = () => (
    <style>{`
        @keyframes dropdownFadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes mobileSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .dropdown-item:hover {
            background: #f0f7f4;
            transform: translateX(4px);
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #1a5f7a, #27ae60);
            transition: width 0.3s ease;
            border-radius: 2px;
        }
        
        .nav-link:hover::after {
            width: 70%;
        }
        
        @media (max-width: 768px) {
            .desktop-nav {
                display: none;
            }
        }
        
        @media (min-width: 769px) {
            .mobile-menu-button {
                display: none;
            }
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
    `}</style>
);

function App() {
    return (
        <Router>
            <GlobalStyles />
            <Navigation />
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/about" component={About} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/customer/dashboard">
                    {localStorage.getItem('token') && localStorage.getItem('userRole') === 'customer' ? 
                        <CustomerDashboard /> : <Redirect to="/login" />}
                </Route>
                <Route path="/admin/dashboard">
                    {localStorage.getItem('token') && (localStorage.getItem('userRole') === 'Super Admin' || localStorage.getItem('userRole') === 'Billing Officer') ? 
                        <AdminDashboard /> : <Redirect to="/login" />}
                </Route>
                <Route path="/branch/dashboard">
                    {localStorage.getItem('token') && localStorage.getItem('userRole') === 'Branch Manager' ? 
                        <BranchReports /> : <Redirect to="/login" />}
                </Route>
            </Switch>
        </Router>
    );
}

export default App;