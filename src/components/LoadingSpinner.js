import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ label = 'Loading...' }) => (
    <motion.div
        className="d-flex flex-column align-items-center justify-content-center text-muted my-5 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <div className="spinner-border" role="status" style={{ color: 'var(--primary-glow)' }}>
            <span className="visually-hidden">{label}</span>
        </div>
        <p className="mt-3 mb-0">{label}</p>
    </motion.div>
);

export default LoadingSpinner;
