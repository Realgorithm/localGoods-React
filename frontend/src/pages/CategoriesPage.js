import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition from '../components/PageTransition';
import ConfirmModal from '../components/ConfirmModal';
import SearchCardHeader from '../components/SearchCardHeader';
import { useCrudResource } from '../hooks/useCrudResource';

function CategoriesPage() {
    const {
        items: categories, loading, formData, isEditing, confirmAction,
        setConfirmAction, handleFormChange, resetForm,
        handleFormSubmit, handleEditClick, requestDelete,
    } = useCrudResource('/categories', { resourceLabel: 'category', pluralLabel: 'categories', initialForm: { id: '', name: '' } });

    const [searchTerm, setSearchTerm] = useState('');

    const handleDeleteClick = (id) => {
        requestDelete(id, {
            title: 'Confirm Category Deletion',
            body: 'Are you sure you want to delete this category? Products in this category will become "Uncategorized".',
        });
    };

    if (loading) return <LoadingSpinner />;

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <SearchCardHeader
                            icon="bi-tags-fill"
                            title="Category List"
                            count={filteredCategories.length}
                            searchTerm={searchTerm}
                            onSearchChange={e => setSearchTerm(e.target.value)}
                            searchPlaceholder="Search categories..."
                        />
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
        </PageTransition>
    );
}

export default CategoriesPage;
