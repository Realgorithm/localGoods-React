import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: ''
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Simple validation for shop name to prevent invalid database names
        if (name === 'shopName') {
            setFormData({ ...formData, [name]: value.toLowerCase().replace(/[^a-z0-9_]/g, '') });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="hero-section text-center"
            style={{ padding: '5rem 0' }} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <div className="hero-aurora"></div>
            <div className="card auth-form-card mx-auto">
                <div className="card-body p-4 p-sm-5">
                    <form onSubmit={handleSubmit}>
                        <div className="text-center mb-4">
                            <h1 className="h3 fw-bold mb-0">Create Your Shop</h1>
                            <p className="text-muted">Get started in minutes</p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="shopName" name="shopName" placeholder="Your Shop Name" value={formData.shopName} onChange={handleChange} required autoFocus />
                            <label htmlFor="shopName">Shop Name (letters, numbers, _ only)</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="name" name="name" placeholder="Your Full Name" value={formData.name} onChange={handleChange} required />
                            <label htmlFor="name">Your Name</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                            <label htmlFor="email">Email address</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" name="password" className="form-control" id="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                            <label htmlFor="password">Password</label>
                        </div>
                        <div className="d-grid mb-3">
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Register'}</button>
                        </div>
                        <p className="text-center text-muted small">
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default RegisterPage;