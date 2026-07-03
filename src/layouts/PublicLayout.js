import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const PublicLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Navigation Bar */}
            <nav className={`navbar navbar-expand-lg navbar-${theme === 'light' ? 'light' : 'dark'} bg-body-tertiary fixed-top`}>
                <div className="container">
                    <Link className="navbar-brand" to="/">LocalGoods-Tracker</Link>
                    <div className="d-flex">
                        <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
                        <Link to="/register" className="btn btn-primary me-3">Sign Up</Link>
                        <button className="btn btn-outline-secondary" onClick={toggleTheme} aria-label="Toggle theme">
                            <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                        </button>
                    </div>
                </div>
            </nav>

            <main style={{ paddingTop: '80px', flex: '1 0 auto' }}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="home-footer" style={{ flexShrink: 0 }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4">
                            <h5>LocalGoods-Tracker</h5>
                            <p className="text-muted">Simplifying local business management.</p>
                        </div>
                        <div className="col-lg-4">
                            <h5>Quick Links</h5>
                            <ul className="list-unstyled">
                                <li><a href="/#features" className="text-muted">Features</a></li>
                                <li><a href="/#how-it-works" className="text-muted">How It Works</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-4">
                            <h5>Contact</h5>
                            <p className="text-muted">support@localgoods.com</p>
                        </div>
                    </div>
                    <hr />
                    <p className="text-center text-muted">&copy; {new Date().getFullYear()} LocalGoods-Tracker. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;