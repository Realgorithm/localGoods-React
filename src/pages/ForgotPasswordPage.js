import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        shopName: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', formData);
            toast.info(response.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="form-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="hero-aurora"></div>
            <div className="card auth-form-card">
                <div className="card-body p-4 p-sm-5">
                    <form onSubmit={handleSubmit}>
                        <div className="text-center mb-4">
                            <h1 className="h3 fw-bold mb-0">Forgot Password</h1>
                            <p className="text-center text-muted">Enter your shop name and email to receive a password reset link.</p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="shopName" name="shopName" placeholder="Your Shop Name" value={formData.shopName} onChange={handleChange} required autoFocus />
                            <label htmlFor="shopName">Shop Name</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                            <label htmlFor="email">Email address</label>
                        </div>
                        <div className="d-grid mb-3">
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
                        </div>
                        <div className="text-center text-muted small">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default ForgotPasswordPage;