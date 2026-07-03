import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const SupplierPaymentsPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPageData = async () => {
        try {
            setLoading(true);
            const [supRes, payRes] = await Promise.all([
                api.get('/suppliers'),
                api.get('/payments/suppliers'),
            ]);
            // Only show suppliers with a balance
            setSuppliers(supRes.data.filter(s => parseFloat(s.balance) > 0));
            setPayments(payRes.data);
        } catch (err) {
            setError(err);
            toast.error('Failed to fetch supplier payment data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, []);

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!selectedSupplier || !amountPaid) {
            toast.warn('Please select a supplier and enter an amount.');
            return;
        }
        try {
            const response = await api.post('/payments/suppliers', {
                supplier_id: selectedSupplier,
                amount_paid: parseFloat(amountPaid),
            });
            toast.success(response.data.message);
            setSelectedSupplier('');
            setAmountPaid('');
            fetchPageData(); // Refresh data
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment.');
        }
    };

    if (loading) return <div className="text-center my-4">Loading data...</div>;
    if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

    const filteredPayments = payments.filter(p =>
        p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <h1 className="mb-4">Supplier Payments</h1>
            <div className="row">
                <div className="col-lg-5 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0"><i className="bi bi-truck me-2"></i> Pay Supplier</h5></div>
                        <div className="card-body">
                            <form onSubmit={handleSubmitPayment}>
                                <div className="mb-3">
                                    <label className="form-label">Supplier (with dues)</label>
                                    <select className="form-select" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} required>
                                        <option value="">-- Select Supplier --</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} (Dues: ₹{parseFloat(s.balance).toFixed(2)})
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
                                    <thead><tr><th>Supplier</th><th>Amount Paid</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {filteredPayments.map(p => (<tr key={p.id}><td>{p.supplier_name}</td><td>₹{parseFloat(p.amount_paid).toFixed(2)}</td><td>{new Date(p.date_created).toLocaleString()}</td></tr>))}
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


export default SupplierPaymentsPage;