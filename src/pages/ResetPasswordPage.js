import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        shopName: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                password: formData.password,
                shopName: formData.shopName
            });
            toast.success('Password has been reset successfully. You can now log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password.');
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
                            <h1 className="h3 fw-bold mb-0">Reset Your Password</h1>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="text" className="form-control" id="shopName" name="shopName" placeholder="Your Shop Name" value={formData.shopName} onChange={handleChange} required autoFocus />
                            <label htmlFor="shopName">Shop Name</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" name="password" className="form-control" id="password" placeholder="New Password" value={formData.password} onChange={handleChange} required />
                            <label htmlFor="password">New Password</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="password" name="confirmPassword" className="form-control" id="confirmPassword" placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleChange} required />
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                        </div>
                        <div className="d-grid mb-3">
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default ResetPasswordPage;