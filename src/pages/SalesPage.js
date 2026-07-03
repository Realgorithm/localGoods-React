import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import AddCustomerModal from '../components/AddCustomerModal';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';

const SalesPage = () => {
    // Data from backend
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State for new sale
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchCustomers = async () => {
        const customersRes = await api.get('/customers');
        setCustomers(customersRes.data);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [salesRes, productsRes] = await Promise.all([
                    api.get('/sales'),
                    api.get('/products'),
                ]);
                setSales(salesRes.data);
                setProducts(productsRes.data);
                await fetchCustomers();
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
            updateCartQuantity(productToAdd.id, existingCartItem.quantity + 1);
        } else {
            setCart([...cart, { product_id: productToAdd.id, name: productToAdd.name, price: productToAdd.price, quantity: 1 }]);
        }
        setSelectedProduct('');
    };

    const updateCartQuantity = (productId, newQuantity) => {
        const quantity = Math.max(1, parseInt(newQuantity) || 1);
        setCart(cart.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
        ));
    };

    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const calculateActualAmount = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const calculateTotalAmount = () => {
        const actualAmount = parseFloat(calculateActualAmount());
        const discountAmount = parseFloat(discount) || 0;
        return (actualAmount - discountAmount).toFixed(2);
    }

    const handleSubmitSale = async () => {
        if (!selectedCustomer || cart.length === 0) {
            toast.warn('Please select a customer and add products to the cart.');
            return;
        }
        try {
            const saleData = {
                customer_id: selectedCustomer,
                items: cart.map(({ product_id, quantity, price }) => ({ product_id, quantity, price })),
                actual_amount: calculateActualAmount(),
                total_amount: calculateTotalAmount(),
            };
            const response = await api.post('/sales', saleData);
            if (response.data.saleId) {
                navigate(`/transaction/${response.data.saleId}`);
            } else {
                toast.error('Something went wrong while creating the sale.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create sale.');
        }
    };

    const handleDeleteSale = async (saleId) => {
        setConfirmAction({
            title: 'Confirm Sale Deletion',
            body: 'Are you sure you want to delete this sale? This will restore product stock.',
            onConfirm: () => performDelete(saleId)
        });
    };

    const performDelete = async (saleId) => {
        try {
            const response = await api.delete(`/sales/${saleId}`);
            toast.success(response.data.message);
            // Refresh sales list
            const salesRes = await api.get('/sales');
            setSales(salesRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete sale.');
        } finally {
            setConfirmAction(null);
        }
    };

    const handleCustomerAdded = async (newCustomerId) => {
        await fetchCustomers(); // Refresh the customer list
        setSelectedCustomer(newCustomerId); // Select the newly added customer
    };

    if (loading) return <div className="text-center my-4">Loading sales data...</div>;
    if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

    const filteredSales = sales.filter(sale =>
        sale.ref_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <ConfirmModal
                show={!!confirmAction}
                handleClose={() => setConfirmAction(null)}
                title={confirmAction?.title}
                body={confirmAction?.body}
                onConfirm={confirmAction?.onConfirm}
            />
            <AddCustomerModal show={showAddCustomerModal} handleClose={() => setShowAddCustomerModal(false)} onCustomerAdded={handleCustomerAdded} />
            <h1 className="mb-4">Record & View Sales</h1>
            <div className="row">
                <div className="col-lg-5 mb-4">
                    <div className="card h-100">
                        <div className="card-header"><h5 className="mb-0"><i className="bi bi-cart-plus-fill me-2"></i> New Sale</h5></div>
                        <div className="card-body d-flex flex-column">
                            <div className="mb-3"><label className="form-label">Customer</label><div className="input-group"><select className="form-select" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required><option value="">-- Select Customer --</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="btn btn-outline-secondary" type="button" onClick={() => setShowAddCustomerModal(true)}><i className="bi bi-plus-lg"></i></button></div></div>
                            <div className="mb-3"><label className="form-label">Add Product</label><div className="input-group"><select className="form-select" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}><option value="">-- Select Product --</option>{products.map(p => <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} (₹{p.price}) - Stock: {p.stock}</option>)}</select><button className="btn btn-outline-secondary" type="button" onClick={handleAddProductToCart}>Add</button></div></div>
                            <div className="mb-3 flex-grow-1"><ul className="list-group">{cart.map(item => (
                                <li key={item.product_id} className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>{item.name}</span>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveFromCart(item.product_id)}>&times;</button>
                                    </div>
                                    <div className="d-flex justify-content-between mt-2"><small>Qty: <input type="number" value={item.quantity} onChange={(e) => updateCartQuantity(item.product_id, e.target.value)} className="form-control form-control-sm" style={{ width: '70px' }} /></small><small>@ ₹{item.price}</small></div>
                                </li>
                            ))}{cart.length === 0 && <li className="list-group-item text-muted">Cart is empty</li>}</ul></div>
                            <div className="mt-auto">
                                <div className="mb-3"><label className="form-label">Discount (₹)</label><input type="number" className="form-control" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center mb-2"><p className="mb-0 text-muted">Subtotal:</p><p className="mb-0 text-muted">₹{calculateActualAmount()}</p></div>
                                <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Total:</h5><h5 className="mb-0">₹{calculateTotalAmount()}</h5></div>
                                <button className="btn btn-primary w-100" onClick={handleSubmitSale} disabled={cart.length === 0 || !selectedCustomer}>Proceed to Transaction</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7 mb-4">
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i> Sales History ({filteredSales.length})</h5>
                            <div className="w-50">
                                <input type="text" className="form-control form-control-sm" placeholder="Search by Ref # or Customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead><tr><th>Ref #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {filteredSales.map(sale => (<tr key={sale.id}><td>{sale.ref_no}</td><td>{sale.customer_name}</td><td>₹{parseFloat(sale.total_amount).toFixed(2)}</td><td><StatusBadge status={sale.status} /></td><td>{new Date(sale.date_created).toLocaleDateString()}</td><td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteSale(sale.id)}>Delete</button></td></tr>))}{filteredSales.length === 0 && <tr><td colSpan="6" className="text-center">No sales found.</td></tr>}
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

export default SalesPage;