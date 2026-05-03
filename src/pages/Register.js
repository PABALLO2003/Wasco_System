import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { registerCustomer } from '../services/api';

function Register() {
    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', address: '', district: 'Maseru', password: '', confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const districts = ['Maseru', 'Leribe', 'Berea', 'Mafeteng', "Mohale's Hoek", 'Quthing', "Qacha's Nek", 'Thaba-Tseka', 'Mokhotlong', 'Botha-Bothe'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword, ...data } = formData;
            await registerCustomer(data);
            alert('Registration successful! Please login.');
            history.push('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
                <h2 style={{ textAlign: 'center' }}>Customer Registration</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                    <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                    <select name="district" value={formData.district} onChange={handleChange} required>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center' }}>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
}

export default Register;