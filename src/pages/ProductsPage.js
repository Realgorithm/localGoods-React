import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

const ProductStatusBadge = ({ stock }) => {
    const stockLevel = parseInt(stock, 10);
    if (stockLevel <= 0) {
        return <span className="badge bg-danger">Out of Stock</span>;
    }
    if (stockLevel <= 10) {
        return <span className="badge bg-warning text-dark">Low Stock</span>;
    }
    return <span className="badge bg-success">In Stock</span>;
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ id: '', name: '', sku: '', description: '', price: '', stock: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (err) {
            toast.error("Failed to fetch products.");
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ id: '', name: '', sku: '', description: '', price: '', stock: '' });
        setIsEditing(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/products', formData);
            toast.success(response.data.message);
            resetForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product.');
        }
    };

    const handleEditClick = (product) => {
        setFormData({
            id: product.id,
            name: product.name || '',
            sku: product.sku || '',
            description: product.description || '',
            price: product.price || '',
            stock: product.stock || '',
        });
        setIsEditing(true);
    };

    const handleDeleteClick = async (id) => {
        setConfirmAction({
            title: 'Confirm Product Deletion',
            body: 'Are you sure you want to delete this product? This action cannot be undone.',
            onConfirm: () => performDelete(id)
        });
    };

    const performDelete = async (id) => {
        try {
            const response = await api.delete(`/products/${id}`);
            toast.success(response.data.message);
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete product.');
        }
    };

    if (loading) return <div className="text-center my-4">Loading products...</div>;
    if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ConfirmModal
                show={!!confirmAction}
                handleClose={() => setConfirmAction(null)}
                title={confirmAction?.title}
                body={confirmAction?.body}
                onConfirm={confirmAction?.onConfirm}
            />
            <h1 className="mb-4">Manage Products</h1>
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0"><i className={`bi ${isEditing ? 'bi-pencil-fill' : 'bi-plus-circle-fill'} me-2`}></i> {isEditing ? 'Edit Product' : 'Add New Product'}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Product Name</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">SKU</label>
                                    <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleFormChange} />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Price (₹)</label>
                                        <input type="number" step="0.01" className="form-control" name="price" value={formData.price} onChange={handleFormChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Stock</label>
                                        <input type="number" className="form-control" name="stock" value={formData.stock} onChange={handleFormChange} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" name="description" rows="2" value={formData.description} onChange={handleFormChange}></textarea>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button type="submit" className="btn btn-primary me-2">{isEditing ? 'Update Product' : 'Save Product'}</button>
                                    {isEditing && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8 mb-4">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="bi bi-list-ul me-2"></i> Product List ({filteredProducts.length})</h5>
                            <div className="w-50">
                                <input type="text" className="form-control form-control-sm" placeholder="Search by name or SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <p className="mb-0 fw-bold">{product.name}</p>
                                                    <small className="text-muted">{product.sku}</small>
                                                </td>
                                                <td>₹{parseFloat(product.price).toFixed(2)}</td>
                                                <td>{product.stock}</td>
                                                <td><ProductStatusBadge stock={product.stock} /></td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(product)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(product.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredProducts.length === 0 && (<tr><td colSpan="5" className="text-center p-4">No products found.</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductsPage;