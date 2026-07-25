import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Offcanvas } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const NAV_ITEMS = [
    { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { to: '/customers', icon: 'bi-people-fill', label: 'Customers' },
    { to: '/products', icon: 'bi-box-seam-fill', label: 'Products' },
    { to: '/categories', icon: 'bi-tags-fill', label: 'Categories' },
    { to: '/suppliers', icon: 'bi-truck', label: 'Suppliers' },
    { to: '/sales', icon: 'bi-cart-check-fill', label: 'Sales' },
    { to: '/receiving', icon: 'bi-box-arrow-in-down', label: 'Receiving' },
    { to: '/customer-payments', icon: 'bi-wallet-fill', label: 'Customer Payments' },
    { to: '/supplier-payments', icon: 'bi-truck', label: 'Supplier Payments' },
];

const ADMIN_NAV_ITEMS = [
    { to: '/reports', icon: 'bi-file-earmark-bar-graph-fill', label: 'Reports' },
    { to: '/user-management', icon: 'bi-person-gear', label: 'User Management' },
];

// Shared nav content, reused by both the static desktop sidebar and the
// mobile offcanvas drawer so the two never drift out of sync.
const SidebarNav = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="d-flex flex-column h-100">
            <NavLink to="/dashboard" onClick={onNavigate} className="d-flex align-items-center mb-3 text-decoration-none">
                <span className="fs-4 text-white text-truncate">{user?.shopName || 'LocalGoods'}</span>
            </NavLink>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                {NAV_ITEMS.map(item => (
                    <li className="nav-item" key={item.to}>
                        <NavLink to={item.to} onClick={onNavigate} className="nav-link">
                            <i className={`bi ${item.icon} me-2`}></i> {item.label}
                        </NavLink>
                    </li>
                ))}
                {user?.role === 'admin' && ADMIN_NAV_ITEMS.map(item => (
                    <li key={item.to}>
                        <NavLink to={item.to} onClick={onNavigate} className="nav-link">
                            <i className={`bi ${item.icon} me-2`}></i> {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <hr />
            <div className="mt-auto">
                <button className="btn btn-secondary w-100 mb-2" onClick={toggleTheme}>
                    <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'} me-2`}></i>
                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>
                <button className="btn btn-danger w-100" onClick={logout}>Logout</button>
            </div>
        </div>
    );
};

// Static sidebar, visible on large screens and up only.
const Sidebar = () => (
    <motion.div
        className="d-none d-lg-flex flex-column flex-shrink-0 p-3 sidebar-desktop"
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
    >
        <SidebarNav />
    </motion.div>
);

// Slide-in drawer used below the lg breakpoint. Controlled by MainLayout.
export const MobileSidebar = ({ show, onHide }) => (
    <Offcanvas show={show} onHide={onHide} placement="start" className="sidebar-offcanvas d-lg-none">
        <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column pt-0">
            <SidebarNav onNavigate={onHide} />
        </Offcanvas.Body>
    </Offcanvas>
);

export default Sidebar;
