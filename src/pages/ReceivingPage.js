import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const ReceivingPage = () => {
    const [records, setRecords] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [cart, setCart] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [recRes, prodRes, supRes] = await Promise.all([
                    api.get('/receiving'),
                    api.get('/products'),
                    api.get('/suppliers'),
                ]);
                setRecords(recRes.data);
                setProducts(prodRes.data);
                setSuppliers(supRes.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddProductToCart = () => {
        if (!selectedProduct) return;
        const productToAdd = products.find(p => p.id === parseInt(selectedProduct));
        if (!productToAdd) return;

        const existingCartItem = cart.find(item => item.product_id === productToAdd.id);
        if (existingCartItem) {
            // If item is already in cart, just increment quantity
            updateCartItem(productToAdd.id, 'quantity', existingCartItem.quantity + 1);
        } else {
            setCart([...cart, { product_id: productToAdd.id, name: productToAdd.name, cost_price: parseFloat(productToAdd.cost_price) || 0, quantity: 1 }]);
        }
        setSelectedProduct('');
    };

    const updateCartItem = (productId, field, value) => {
        const numericValue = parseFloat(value) || 0;
        setCart(cart.map(item =>
            item.product_id === productId ? { ...item, [field]: numericValue } : item
        ));
    };

    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.cost_price * item.quantity), 0).toFixed(2);
    };

    const handleSubmitPurchase = async () => {
        if (!selectedSupplier || cart.length === 0) {
            toast.warn('Please select a supplier and add products.');
            return;
        }
        try {
            const purchaseData = {
                supplier_id: selectedSupplier,
                items: cart.map(({ product_id, quantity, cost_price }) => ({ product_id, quantity, cost_price })),
                total_amount: calculateTotal(),
                amount_paid: parseFloat(amountPaid) || 0,
            };
            const response = await api.post('/receiving', purchaseData);
            toast.success(response.data.message);
            setCart([]);
            setSelectedSupplier('');
            setAmountPaid('');
            const recRes = await api.get('/receiving');
            setRecords(recRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record purchase.');
        }
    };

    if (loading) return <div className="text-center my-4">Loading data...</div>;
    if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

    const filteredRecords = records.filter(rec =>
        rec.ref_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <h1 className="mb-4">Record Purchases</h1>
            <div className="row">
                <div className="col-lg-5 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0"><i className="bi bi-box-arrow-in-down-left me-2"></i> New Purchase Order</h5></div>
                        <div className="card-body d-flex flex-column">
                            <div className="mb-3"><label className="form-label">Supplier</label><select className="form-select" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} required><option value="">-- Select Supplier --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                            <div className="mb-3"><label className="form-label">Add Product</label><div className="input-group"><select className="form-select" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}><option value="">-- Select Product --</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><button className="btn btn-outline-secondary" type="button" onClick={handleAddProductToCart}>Add</button></div></div>
                            <div className="mb-3 flex-grow-1"><ul className="list-group">{cart.map(item => (
                                <li key={item.product_id} className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>{item.name}</span>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveFromCart(item.product_id)}>&times;</button>
                                    </div>
                                    <div className="d-flex justify-content-between mt-2">
                                        <small>Qty: <input type="number" value={item.quantity} onChange={(e) => updateCartItem(item.product_id, 'quantity', e.target.value)} className="form-control form-control-sm" style={{ width: '70px' }} /></small>
                                        <small>Cost: <input type="number" step="0.01" value={item.cost_price} onChange={(e) => updateCartItem(item.product_id, 'cost_price', e.target.value)} className="form-control form-control-sm" style={{ width: '90px' }} /></small>
                                    </div>
                                </li>
                            ))}{cart.length === 0 && <li className="list-group-item text-muted">Cart is empty</li>}</ul></div>
                            <div className="mt-auto">
                                <hr />
                                <div className="mb-3"><label className="form-label">Amount Paid (₹)</label><input type="number" className="form-control" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" /></div>
                                <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Total Cost:</h5><h5 className="mb-0">₹{calculateTotal()}</h5></div>
                                <button className="btn btn-primary w-100" onClick={handleSubmitPurchase} disabled={cart.length === 0 || !selectedSupplier}>Record Purchase</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i> Purchase History ({filteredRecords.length})</h5>
                            <div className="w-50">
                                <input type="text" className="form-control form-control-sm" placeholder="Search by Ref # or Supplier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead><tr><th>Ref #</th><th>Supplier</th><th>Total Cost</th><th>Status</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {filteredRecords.map(rec => (<tr key={rec.id}><td>{rec.ref_no}</td><td>{rec.supplier_name}</td><td>₹{parseFloat(rec.total_amount).toFixed(2)}</td><td><StatusBadge status={rec.status} /></td><td>{new Date(rec.date_created).toLocaleDateString()}</td></tr>))}{filteredRecords.length === 0 && <tr><td colSpan="5" className="text-center">No purchases found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const StatusBadge = ({ status }) => {
    switch (status) {
        case 1:
            return <span className="badge bg-success">Paid</span>;
        case 2:
            return <span className="badge bg-warning text-dark">Partial</span>;
        case 3:
            return <span className="badge bg-danger">Unpaid</span>;
        default:
            return <span className="badge bg-secondary">Unknown</span>;
    }
};

export default ReceivingPage;