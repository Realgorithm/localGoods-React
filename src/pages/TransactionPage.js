import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useReactToPrint } from 'react-to-print';
import Receipt from '../components/Receipt';
import { useAuth } from '../contexts/AuthContext';

const TransactionPage = () => {
    const { saleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sale, setSale] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amountTendered, setAmountTendered] = useState('');
    const [change, setChange] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const componentRef = useRef(null);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/sales/${saleId}`);
                if (response.data && response.data.sale) {
                    setSale(response.data.sale);
                    setItems(response.data.items);
                    setAmountTendered(response.data.sale.total_amount); // Pre-fill with total amount
                } else {
                    throw new Error("Invalid sale data received from server.");
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSale();
    }, [saleId]);

    useEffect(() => {
        if (sale) {
            const tendered = parseFloat(amountTendered) || 0;
            const total = parseFloat(sale.total_amount);
            setChange(tendered - total);
        }
    }, [amountTendered, sale]);

    const handleFinalize = async () => {
        try {
            const response = await api.post(`/sales/${saleId}/complete`, {
                amount_tendered: amountTendered
            });
            setChange(response.data.amount_change);
            setIsCompleted(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to complete transaction.');
        }
    };


    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    if (loading) return <div className="text-center my-4">Loading Transaction...</div>;
    if (error) return <div className="alert alert-danger">Error loading sale details.</div>;
    if (!sale) return null;

    return (
        <>
            {/* The Receipt component must always be in the DOM for the ref to be accessible for printing. */}
            <div style={{ display: 'none' }}><Receipt ref={componentRef} sale={sale} items={items} shopName={user?.shopName} /></div>

            {isCompleted ? (
                <div className="card mx-auto" style={{ maxWidth: '500px' }}>
                    <div className="card-body text-center p-5">
                        <i className="bi bi-check-circle-fill display-1 text-success mb-3"></i>
                        <h2 className="card-title">Transaction Complete!</h2>
                        <p className="lead">Change to be returned: <span className="fw-bold fs-4">₹{parseFloat(change).toFixed(2)}</span></p>
                        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                            <button className="btn btn-primary" onClick={() => navigate('/sales')}>
                                New Sale
                            </button>
                            <button className="btn btn-outline-secondary" onClick={handlePrint}>
                                <i className="bi bi-printer-fill me-2"></i> Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <h1 className="mb-4">Complete Transaction</h1>
                    <div className="card mx-auto" style={{ maxWidth: '500px' }}>
                        <div className="card-header"><h5 className="mb-0">Sale Reference: {sale.ref_no}</h5></div>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-3"><span className="text-muted">Customer:</span><span className="fw-bold">{sale.customer_name || 'N/A'}</span></div>
                            <div className="d-flex justify-content-between mb-4"><span className="text-muted">Date:</span><span className="fw-bold">{new Date(sale.date_created).toLocaleString()}</span></div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0">Total Amount:</h4>
                                <h4 className="mb-0 text-primary fw-bold">₹{parseFloat(sale.total_amount).toFixed(2)}</h4>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="amountTendered" className="form-label fs-5">Amount Tendered</label>
                                <input type="number" className="form-control form-control-lg text-end" id="amountTendered" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} placeholder="0.00" autoFocus />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="mb-0">Change:</h5>
                                <h5 className={`mb-0 fw-bold ${change < 0 ? 'text-danger' : 'text-success'}`}>₹{parseFloat(change).toFixed(2)}</h5>
                            </div>
                            <button className="btn btn-success btn-lg w-100" onClick={handleFinalize}>Finalize Sale</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default TransactionPage;