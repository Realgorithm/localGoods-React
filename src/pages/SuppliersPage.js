import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

const SupplierStatusBadge = ({ balance }) => {
    const hasDues = parseFloat(balance) > 0;
    if (hasDues) {
        return <span className="badge bg-danger">Owed Money</span>;
    }
    return <span className="badge bg-success">All Clear</span>;
};

function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ id: '', name: '', contact: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (err) {
            toast.error("Failed to fetch suppliers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ id: '', name: '', contact: '', address: '' });
        setIsEditing(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/suppliers', formData);
            toast.success(response.data.message);
            resetForm();
            fetchSuppliers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save supplier.');
        }
    };

    const handleEditClick = (supplier) => {
        setFormData({
            id: supplier.id,
            name: supplier.name || '',
            contact: supplier.contact || '',
            address: supplier.address || '',
        });
        setIsEditing(true);
    };

    const handleDeleteClick = (id) => {
        setConfirmAction({
            title: 'Confirm Supplier Deletion',
            body: 'Are you sure you want to delete this supplier? This action cannot be undone.',
            onConfirm: () => performDelete(id)
        });
    };

    const performDelete = async (id) => {
        try {
            const response = await api.delete(`/suppliers/${id}`);
            toast.success(response.data.message);
            fetchSuppliers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete supplier.');
        }
    };

    if (loading) return <div className="text-center my-4">Loading suppliers...</div>;

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.address && supplier.address.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <h1 className="mb-4">Manage Suppliers</h1>
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0"><i className={`bi ${isEditing ? 'bi-pencil-fill' : 'bi-plus-circle-fill'} me-2`}></i> {isEditing ? 'Edit Supplier' : 'Add New Supplier'}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Supplier Name</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contact</label>
                                    <input type="text" className="form-control" name="contact" value={formData.contact} onChange={handleFormChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Address</label>
                                    <textarea className="form-control" name="address" rows="2" value={formData.address} onChange={handleFormChange}></textarea>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button type="submit" className="btn btn-primary me-2">{isEditing ? 'Update Supplier' : 'Save Supplier'}</button>
                                    {isEditing && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8 mb-4">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="bi bi-list-ul me-2"></i> Supplier List ({filteredSuppliers.length})</h5>
                            <div className="w-50">
                                <input type="text" className="form-control form-control-sm" placeholder="Search suppliers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Supplier</th>
                                            <th>Balance Owed</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSuppliers.map(supplier => (
                                            <tr key={supplier.id}>
                                                <td>
                                                    <p className="mb-0 fw-bold">{supplier.name}</p>
                                                    <small className="text-muted d-block">{supplier.contact}</small>
                                                    <small className="text-muted">{supplier.address}</small>
                                                </td>
                                                <td>
                                                    <span className={`fw-bold ${supplier.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                                        ₹{parseFloat(supplier.balance).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td><SupplierStatusBadge balance={supplier.balance} /></td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(supplier)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(supplier.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredSuppliers.length === 0 && (<tr><td colSpan="4" className="text-center p-4">No suppliers found.</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default SuppliersPage;