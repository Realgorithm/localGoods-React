import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const CustomerPaymentsPage = () => {
    const [customers, setCustomers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPageData = async () => {
        try {
            setLoading(true);
            const [custRes, payRes] = await Promise.all([
                api.get('/customers'),
                api.get('/payments/customers'),
            ]);
            // Optimization: Filter customers with a balance before setting state to prevent unnecessary re-renders.
            setCustomers(custRes.data.filter(c => parseFloat(c.balance) > 0));
            setPayments(payRes.data);
        } catch (err) {
            setError(err);
            toast.error('Failed to fetch customer payment data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, []);

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!selectedCustomer || !amountPaid) {
            toast.warn('Please select a customer and enter an amount.');
            return;
        }
        try {
            const response = await api.post('/payments/customers', {
                customer_id: selectedCustomer,
                amount_paid: parseFloat(amountPaid),
            });
            toast.success(response.data.message);
            setSelectedCustomer('');
            setAmountPaid('');
            fetchPageData(); // Refresh data
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment.');
        }
    };

    if (loading) return <div className="text-center my-4">Loading data...</div>;
    if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

    const filteredPayments = payments.filter(p =>
        p.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <h1 className="mb-4">Customer Payments</h1>
            <div className="row">
                <div className="col-lg-5 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0"><i className="bi bi-wallet2 me-2"></i> Record Payment</h5></div>
                        <div className="card-body">
                            <form onSubmit={handleSubmitPayment}>
                                <div className="mb-3">
                                    <label className="form-label">Customer (with balance)</label>
                                    <select className="form-select" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required>
                                        <option value="">-- Select Customer --</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} (Balance: ₹{parseFloat(c.balance).toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Amount Paid (₹)</label>
                                    <input type="number" step="0.01" className="form-control" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">Save Payment</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i> Recent Payments ({filteredPayments.length})</h5>
                            <div className="w-50">
                                <input type="text" className="form-control form-control-sm" placeholder="Search payments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead><tr><th>Customer</th><th>Amount Paid</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {filteredPayments.map(p => (<tr key={p.id}><td >{p.customer_name}</td><td>₹{parseFloat(p.amount_paid).toFixed(2)}</td><td>{new Date(p.date_created).toLocaleString()}</td></tr>))}
                                        {filteredPayments.length === 0 && <tr><td colSpan="3" className="text-center">No recent payments found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerPaymentsPage;