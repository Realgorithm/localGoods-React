import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.div className="d-flex flex-column flex-shrink-0 p-3" style={{ width: '280px', minHeight: '100vh' }} initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
            <NavLink to="/dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
                <span className="fs-4 text-white">{user?.shopName || 'LocalGoods'}</span>
            </NavLink>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <NavLink to="/dashboard" className="nav-link" aria-current="page">
                        <i className="bi bi-grid-1x2-fill me-2"></i> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/customers" className="nav-link">
                        <i className="bi bi-people-fill me-2"></i> Customers
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/products" className="nav-link">
                        <i className="bi bi-box-seam-fill me-2"></i> Products
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/categories" className="nav-link">
                        <i className="bi bi-tags-fill me-2"></i> Categories
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/suppliers" className="nav-link">
                        <i className="bi bi-truck me-2"></i> Suppliers
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/sales" className="nav-link">
                        <i className="bi bi-cart-check-fill me-2"></i> Sales
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/receiving" className="nav-link">
                        <i className="bi bi-box-arrow-in-down me-2"></i> Receiving
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/customer-payments" className="nav-link">
                        <i className="bi bi-wallet-fill me-2"></i> Customer Payments
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/supplier-payments" className="nav-link">
                        <i className="bi bi-truck me-2"></i> Supplier Payments
                    </NavLink>
                </li>
                {user?.role === 'admin' && (
                    <li>
                        <NavLink to="/reports" className="nav-link"><i className="bi bi-file-earmark-bar-graph-fill me-2"></i> Reports</NavLink>
                    </li>
                )}
                {user?.role === 'admin' && (
                    <li>
                        <NavLink to="/user-management" className="nav-link"><i className="bi bi-person-gear me-2"></i> User Management</NavLink>
                    </li>
                )}
            </ul>
            <hr />
            <div className="mt-auto">
                <button className="btn btn-secondary w-100 mb-2" onClick={toggleTheme}>
                    <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'} me-2`}></i>
                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>
                <button className="btn btn-danger w-100" onClick={logout}>Logout</button>
            </div>
        </motion.div>
    );
};

export default Sidebar;