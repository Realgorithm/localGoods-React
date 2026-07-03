import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await api.post('/auth/register', formData);
            setSuccess(response.data.message + ' You will be redirected to login shortly.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <motion.div
            className="hero-section text-center"
            style={{ padding: '5rem 0' }} // Reduced padding
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <div className="hero-aurora"></div>
            <div className="card mx-auto" style={{ maxWidth: '450px' }}>
                <div className="card-body p-4 p-sm-5">
                    <div className="text-center mb-4">
                        <h1 className="h3 fw-bold mb-0">Create Your Account</h1>
                        <p className="text-muted">Join the future of inventory management</p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input className="form-control" type="text" id="name" name="name" onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <input className="form-control" type="email" id="email" name="email" onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password">Password</label>
                            <input className="form-control" type="password" id="password" name="password" onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="shopName">Shop Name</label>
                            <input className="form-control" type="text" id="shopName" name="shopName" onChange={handleChange} required />
                        </div>
                        <div className="d-grid mb-3">
                            <motion.button className="btn btn-primary" type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                Sign Up
                            </motion.button>
                        </div>
                        <p className="text-center text-muted small">
                            Already have an account? <Link to="/login">Log in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default RegisterPage;