import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Reusable component for section headers
const SectionHeader = ({ title, subtitle }) => (
    <motion.div
        className="text-center mb-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="display-5 fw-bold">{title}</h2>
        <p className="lead text-muted">{subtitle}</p>
    </motion.div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, text, gradient }) => (
    <motion.div
        className="col"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        <div className="card feature-card h-100 p-3">
            <div className="card-body text-center">
                <div className={`fs-1 mb-4 ${gradient} text-transparent bg-clip-text`}>
                    <i className={`bi ${icon}`}></i>
                </div>
                <h4 className="fw-bold">{title}</h4>
                <p className="text-muted">{text}</p>
            </div>
        </div>
    </motion.div>
);

const HomePage = () => {
    return (
        <motion.div
            className="homepage-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Hero Section */}
            <header className="hero-section text-center">
                <div className="hero-aurora"></div>
                <motion.div
                    className="container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h1 className="display-2 fw-bolder mb-4 text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--primary-glow), var(--secondary-glow))' }}>
                        The Future of Your Local Business
                    </h1>
                    <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '700px' }}>
                        An all-in-one solution to manage inventory, sales, and customers with a futuristic, Gen-Z approved interface.
                    </p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 me-md-2">
                            Get Started for Free <i className="bi bi-arrow-right-short"></i>
                        </Link>
                    </motion.div>
                </motion.div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-5">
                <div className="container px-4 py-5">
                    <SectionHeader title="Everything You Need" subtitle="One platform to run your entire business efficiently." />
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        <FeatureCard icon="bi-graph-up-arrow" title="Track Sales & Profit" text="Get real-time insights into your sales performance and profitability with our intuitive dashboard." gradient="bg-gradient-cyan" />
                        <FeatureCard icon="bi-box-seam" title="Inventory Management" text="Never run out of stock again. Keep a close eye on your inventory levels and receive timely alerts." gradient="bg-gradient-blue" />
                        <FeatureCard icon="bi-people" title="Customer Tracking" text="Manage customer information and track their purchase history to provide better service." gradient="bg-gradient-purple" />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-5">
                <div className="container px-4 py-5">
                    <SectionHeader title="Get Started in Seconds" subtitle="A simple, three-step process to get you up and running." />
                    <div className="row g-4 text-center align-items-center">
                        {/* Step 1 */}
                        <motion.div className="col-md" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <div className="fs-1 mb-3 bg-gradient-purple text-transparent bg-clip-text"><i className="bi bi-person-plus"></i></div>
                            <h4 className="fw-bold">1. Create Account</h4>
                            <p className="text-muted">Sign up for a free account in just a few seconds.</p>
                        </motion.div>
                        {/* Connector */}
                        <motion.div className="col-md-auto d-none d-md-block" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                            <i className="bi bi-chevron-right fs-1 text-muted"></i>
                        </motion.div>
                        {/* Step 2 */}
                        <motion.div className="col-md" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
                            <div className="fs-1 mb-3 bg-gradient-blue text-transparent bg-clip-text"><i className="bi bi-plus-circle"></i></div>
                            <h4 className="fw-bold">2. Add Products</h4>
                            <p className="text-muted">Easily add your products and set their prices and stock levels.</p>
                        </motion.div>
                        {/* Connector */}
                        <motion.div className="col-md-auto d-none d-md-block" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.7 }}>
                            <i className="bi bi-chevron-right fs-1 text-muted"></i>
                        </motion.div>
                        {/* Step 3 */}
                        <motion.div className="col-md" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 }}>
                            <div className="fs-1 mb-3 bg-gradient-green text-transparent bg-clip-text"><i className="bi bi-cash-coin"></i></div>
                            <h4 className="fw-bold">3. Start Selling</h4>
                            <p className="text-muted">Begin tracking your sales and managing your inventory like a pro.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-5">
                <div className="container py-5">
                    <SectionHeader title="Loved by Local Businesses" subtitle="Don't just take our word for it. Here's what our users are saying." />
                    <div className="row">
                        <motion.div className="col-lg-6 mx-auto" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                            <div className="card testimonial-card">
                                <div className="card-body">
                                    <p className="lead fst-italic">"This tool has revolutionized how I manage my small shop. I can finally see my profits clearly and know exactly what to reorder. Highly recommended!"</p>
                                    <p className="fw-bold mt-4 mb-0">- Jane Doe</p>
                                    <p className="text-muted">The Corner Store</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="py-5">
                <div className="container text-center py-5">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                        <h2 className="display-4 fw-bold text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--primary-glow), var(--secondary-glow))' }}>Ready to Take Control?</h2>
                        <p className="lead my-4 text-muted mx-auto" style={{ maxWidth: '600px' }}>Join hundreds of local business owners who trust LocalGoods-Tracker to power their success.</p>
                        <Link to="/register" className="btn btn-primary btn-lg px-5 py-3">
                            Sign Up Now - It's Free!
                        </Link>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
};

export default HomePage;
