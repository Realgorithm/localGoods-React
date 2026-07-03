import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
        }
    };

    return (
        <motion.div
            className="hero-section text-center"
            style={{ padding: '5rem 0' }} // Reduced padding for login/register
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <div className="hero-aurora"></div>
            <div className="card mx-auto" style={{ maxWidth: '450px' }}>
                <div className="card-body p-4 p-sm-5">
                    <div className="text-center mb-4">
                        <h1 className="h3 fw-bold mb-0">Welcome Back!</h1>
                        <p className="text-muted">Login to continue</p>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <input className="form-control" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password">Password</label>
                            <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="text-center mt-3">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                        <div className="d-grid mb-3">
                            <motion.button className="btn btn-primary" type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                Login
                            </motion.button>
                        </div>
                        <p className="text-center text-muted small">
                            Don't have an account? <Link to="/register">Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
            </motion.div>
    );
};

export default LoginPage;