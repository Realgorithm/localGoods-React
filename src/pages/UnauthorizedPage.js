import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UnauthorizedPage = () => {
    return (
        <motion.div
            className="text-center d-flex flex-column justify-content-center align-items-center"
            style={{ height: '70vh' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="display-1 fw-bold text-danger">403</h1>
            <h2 className="mb-4">Access Denied</h2>
            <p className="lead text-muted mb-4">You do not have permission to view this page.</p>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </motion.div>
    );
};

export default UnauthorizedPage;