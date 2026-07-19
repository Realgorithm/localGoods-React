import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // In a real deployment you'd send this to an error-tracking service.
        console.error('Unhandled UI error:', error, info);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '2rem',
                        backgroundColor: 'rgb(15, 23, 42)',
                        color: '#e2e8f0',
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <i className="bi bi-exclamation-triangle-fill fs-1 mb-3" style={{ color: '#f97316' }}></i>
                    <h2 className="fw-bold mb-2">Something went wrong</h2>
                    <p className="text-muted mb-4" style={{ maxWidth: '420px' }}>
                        This page hit an unexpected error. Your data is safe — try heading back to the dashboard.
                    </p>
                    <button className="btn btn-primary" onClick={this.handleReload}>
                        Back to Dashboard
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
