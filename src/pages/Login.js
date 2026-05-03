import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { customerLogin, adminLogin } from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('customer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // const history = useHistory();  // Removed - not used

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            if (userType === 'customer') {
                response = await customerLogin(email, password);
                console.log('Login successful:', response.data);
                
                // Clear any existing data first
                localStorage.clear();
                
                // Save new data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', 'customer');
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('userName', response.data.user.name);
                
                console.log('Saved to localStorage:', {
                    token: localStorage.getItem('token'),
                    role: localStorage.getItem('userRole'),
                    userId: localStorage.getItem('userId')
                });
                
                // Use window.location for hard redirect (bypasses router issues)
                window.location.href = '/customer/dashboard';
                
            } else {
                response = await adminLogin(email, password);
                console.log('Admin login successful:', response.data);
                
                localStorage.clear();
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', response.data.user.role);
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('userName', response.data.user.username);
                
                if (response.data.user.role === 'Branch Manager') {
                    window.location.href = '/branch/dashboard';
                } else {
                    window.location.href = '/admin/dashboard';
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
                <h2 style={{ textAlign: 'center' }}>Login to WASCO</h2>

                <div style={{ display: 'flex', marginBottom: '20px' }}>
                    <button 
                        onClick={() => setUserType('customer')} 
                        style={{ flex: 1, padding: '10px', background: userType === 'customer' ? '#007bff' : '#ccc', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Customer
                    </button>
                    <button 
                        onClick={() => setUserType('admin')} 
                        style={{ flex: 1, padding: '10px', background: userType === 'admin' ? '#007bff' : '#ccc', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input 
                        type={userType === 'customer' ? 'email' : 'text'} 
                        placeholder={userType === 'customer' ? 'Email' : 'Username'} 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                        required 
                    />
                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {userType === 'customer' && (
                    <p style={{ marginTop: '20px', textAlign: 'center' }}>
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;