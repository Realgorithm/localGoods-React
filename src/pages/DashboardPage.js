import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const StatCard = ({ title, value, icon, gradient }) => (
    <motion.div className="col-md-4 mb-4" variants={cardVariants}>
        <div className="card h-100">
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title text-muted mb-1">{title}</h5>
                    <span className={`fs-2 ${gradient} text-transparent bg-clip-text`}>
                        <i className={`bi ${icon}`}></i>
                    </span>
                </div>
                <p className="card-text fs-2 fw-bold mt-auto">{value}</p>
            </div>
        </div>
    </motion.div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalSales: 0, totalCustomers: 0, productsInStock: 0, totalProfit: 0, totalCredit: 0, totalSupplierCredit: 0 });
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, lowStockRes] = await Promise.all([
                    api.get('/stats/summary'),
                    api.get('/products/low-stock')
                ]);
                setStats(statsRes.data);
                setLowStockItems(lowStockRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="mb-1 display-5 fw-bold">{user?.shopName}</h1>
            <p className="lead text-muted mb-5">Welcome, {user?.name}! Here's a glance at your shop's performance.</p>
            {loading ? <p>Loading stats...</p> : (
                <motion.div className="row" variants={containerVariants} initial="hidden" animate="visible">
                    <StatCard title="Total Sales" value={`₹${parseFloat(stats.totalSales).toFixed(2)}`} icon="bi-cash-coin" gradient="bg-gradient-green" />
                    <StatCard title="Total Profit" value={`₹${parseFloat(stats.totalProfit).toFixed(2)}`} icon="bi-graph-up-arrow" gradient="bg-gradient-cyan" />
                    <StatCard title="Products in Stock" value={stats.productsInStock} icon="bi-box-seam" gradient="bg-gradient-blue" />
                    <StatCard title="Total Customers" value={stats.totalCustomers} icon="bi-people" gradient="bg-gradient-purple" />
                    <StatCard title="Customer Credit" value={`₹${parseFloat(stats.totalCredit).toFixed(2)}`} icon="bi-credit-card-2-front" gradient="bg-gradient-pink" />
                    <StatCard title="Owed to Suppliers" value={`₹${parseFloat(stats.totalSupplierCredit).toFixed(2)}`} icon="bi-truck" gradient="bg-gradient-orange" />
                </motion.div>
            )}

            {lowStockItems.length > 0 && (
                <motion.div className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <h3 className="mb-3">Low Stock Alerts</h3>
                    <div className="card">
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                {lowStockItems.map(item => (
                                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {item.name}
                                        <span className="badge bg-danger rounded-pill">{item.stock} left</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default DashboardPage;