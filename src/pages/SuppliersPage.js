import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import ConfirmModal from '../components/ConfirmModal';
import SearchCardHeader from '../components/SearchCardHeader';
import BalanceStatusBadge from '../components/BalanceStatusBadge';
import { useCrudResource } from '../hooks/useCrudResource';

const SUPPLIER_INITIAL_FORM = { id: '', name: '', contact: '', address: '' };

function SuppliersPage() {
    const {
        items: suppliers, loading, formData, isEditing, confirmAction,
        setConfirmAction, handleFormChange, resetForm,
        handleFormSubmit, handleEditClick, requestDelete,
    } = useCrudResource('/suppliers', { resourceLabel: 'supplier', initialForm: SUPPLIER_INITIAL_FORM });

    const [searchTerm, setSearchTerm] = useState('');

    if (loading) return <LoadingSpinner />;

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.address && supplier.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <PageTransition>
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
                        <SearchCardHeader
                            icon="bi-list-ul"
                            title="Supplier List"
                            count={filteredSuppliers.length}
                            searchTerm={searchTerm}
                            onSearchChange={e => setSearchTerm(e.target.value)}
                            searchPlaceholder="Search suppliers..."
                        />
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
                                                <td><BalanceStatusBadge balance={supplier.balance} dueLabel="Owed Money" clearLabel="All Clear" dueVariant="danger" /></td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(supplier)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => requestDelete(supplier.id, { title: 'Confirm Supplier Deletion', body: 'Are you sure you want to delete this supplier? This action cannot be undone.' })}>Delete</button>
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
        </PageTransition>
    );
}

export default SuppliersPage;
