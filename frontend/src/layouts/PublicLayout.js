import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Navbar, Container } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';

const PublicLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Navigation Bar */}
            <Navbar
                expand="lg"
                fixed="top"
                bg="body-tertiary"
                variant={theme === 'light' ? 'light' : 'dark'}
            >
                <Container>
                    <Navbar.Brand as={Link} to="/">LocalGoods-Tracker</Navbar.Brand>
                    <Navbar.Toggle aria-controls="public-navbar-nav" />
                    <Navbar.Collapse id="public-navbar-nav">
                        <div className="d-flex flex-column flex-lg-row gap-2 ms-lg-auto mt-3 mt-lg-0 align-items-stretch align-items-lg-center">
                            <Link to="/login" className="btn btn-outline-primary">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                            <button className="btn btn-outline-secondary" onClick={toggleTheme} aria-label="Toggle theme">
                                <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                            </button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main style={{ paddingTop: '80px', flex: '1 0 auto' }}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="home-footer" style={{ flexShrink: 0 }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 mb-4 mb-lg-0">
                            <h5>LocalGoods-Tracker</h5>
                            <p className="text-muted">Simplifying local business management.</p>
                        </div>
                        <div className="col-lg-4 mb-4 mb-lg-0">
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
                    <p className="text-center text-muted mb-1">&copy; {new Date().getFullYear()} LocalGoods-Tracker. All Rights Reserved.</p>
                    <p className="text-center text-muted small mb-0">
                        Built by{' '}
                            <a href="https://github.com/Realgorithm" target="_blank" rel="noopener noreferrer" className="text-muted">
                                    Tabish Hussain
                                        </a>
                                        </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
