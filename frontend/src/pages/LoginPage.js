import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        shopName: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password, formData.shopName);
            toast.success('Logged in successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
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
            <div className="card auth-form-card">
                <div className="card-body p-4 p-sm-5">
                    <form onSubmit={handleSubmit}>
                        <div className="text-center mb-4">
                            <h1 className="h3 fw-bold mb-0">Welcome Back!</h1>
                            <p className="text-muted">Login to your shop to continue</p>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="shopName" name="shopName" placeholder="Shop Name" value={formData.shopName} onChange={handleChange} required autoFocus />
                            <label htmlFor="shopName">Shop Name</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="email" className="form-control" id="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                            <label htmlFor="email">Email Address</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" className="form-control" id="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                            <label htmlFor="password">Password</label>
                        </div>
                        <div className="text-center mt-3">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                        <div className="d-grid mb-3">
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                        <hr className="my-4" />
                        <p className="text-center text-muted small">
                            Don't have an account? <Link to="/register">Create a Shop</Link>
                        </p>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default LoginPage;