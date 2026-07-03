import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ id: '', name: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            toast.error("Failed to fetch categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ id: '', name: '' });
        setIsEditing(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/categories', formData);
            toast.success(response.data.message);
            resetForm();
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save category.');
        }
    };

    const handleEditClick = (category) => {
        setFormData({ id: category.id, name: category.name || '' });
        setIsEditing(true);
    };

    const handleDeleteClick = (id) => {
        setConfirmAction({
            title: 'Confirm Category Deletion',
            body: 'Are you sure you want to delete this category? Products in this category will become "Uncategorized".',
            onConfirm: () => performDelete(id)
        });
    };

    const performDelete = async (id) => {
        try {
            const response = await api.delete(`/categories/${id}`);
            toast.success(response.data.message);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete category.');
        }
    };

    if (loading) return <div className="text-center my-4">Loading categories...</div>;

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="mb-4">Manage Product Categories</h1>
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0"><i className={`bi ${isEditing ? 'bi-pencil-fill' : 'bi-plus-circle-fill'} me-2`}></i> {isEditing ? 'Edit Category' : 'Add New Category'}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Category Name</label>
                                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleFormChange} required />
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button type="submit" className="btn btn-primary me-2">{isEditing ? 'Update Category' : 'Save Category'}</button>
                                    {isEditing && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-lg-8 mb-4">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0"><i className="bi bi-tags-fill me-2"></i> Category List ({filteredCategories.length})</h5>
                            <div className="w-50">
                                <input type="text" className="form-control form-control-sm" placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead><tr><th>Name</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredCategories.map(category => (
                                            <tr key={category.id}>
                                                <td>{category.name}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(category)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(category.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCategories.length === 0 && (<tr><td colSpan="2" className="text-center p-4">No categories found.</td></tr>)}
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

export default CategoriesPage;