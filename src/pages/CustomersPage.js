import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';
import SearchCardHeader from '../components/SearchCardHeader';
import BalanceStatusBadge from '../components/BalanceStatusBadge';
import { useCrudResource } from '../hooks/useCrudResource';

const CUSTOMER_INITIAL_FORM = { id: '', name: '', contact: '', address: '' };

const NoCustomersIllustration = () => (
  <div className="text-center p-5">
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 text-muted">
      <path d="M16 14.0002V15.0002C16 16.1048 15.1046 17.0002 14 17.0002H6C4.89543 17.0002 4 16.1048 4 15.0002V10.0002C4 8.89566 4.89543 8.00023 6 8.00023H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14.0002C12 15.1048 11.1046 16.0002 10 16.0002C8.89543 16.0002 8 15.1048 8 14.0002C8 12.8957 8.89543 12.0002 10 12.0002C11.1046 12.0002 12 12.8957 12 14.0002Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 6.00023L17.5 12.0002M20.5 9.00023L14.5 9.00023" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8.00023C11.1046 8.00023 12 7.10479 12 6.00023C12 4.89566 11.1046 4.00023 10 4.00023C8.89543 4.00023 8 4.89566 8 6.00023C8 7.10479 8.89543 8.00023 10 8.00023Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <h5 className="mb-2">No Customers Yet</h5>
    <p className="text-muted">Add your first customer to get started!</p>
  </div>
);

function CustomersPage() {
  const {
    items: customers, loading, formData, isEditing, confirmAction,
    setConfirmAction, handleFormChange, resetForm,
    handleFormSubmit, handleEditClick, requestDelete,
  } = useCrudResource('/customers', { resourceLabel: 'customer', initialForm: CUSTOMER_INITIAL_FORM });

  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <LoadingSpinner />;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <ConfirmModal
        show={!!confirmAction}
        handleClose={() => setConfirmAction(null)}
        title={confirmAction?.title}
        body={confirmAction?.body}
        onConfirm={confirmAction?.onConfirm}
      />
      <h1 className="mb-4">Manage Customers</h1>
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0"><i className={`bi ${isEditing ? 'bi-person-check-fill' : 'bi-person-plus-fill'} me-2`}></i> {isEditing ? 'Edit Customer' : 'Add New Customer'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <input type="hidden" name="id" value={formData.id} />
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Customer Name</label>
                  <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleFormChange} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="contact" className="form-label">Contact</label>
                  <input type="text" className="form-control" id="contact" name="contact" value={formData.contact} onChange={handleFormChange} pattern="\d{10}" required />
                  <div className="invalid-feedback">Please enter a valid 10-digit contact number.</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea className="form-control" id="address" name="address" rows="3" value={formData.address} onChange={handleFormChange} required></textarea>
                </div>
                <div className="d-flex justify-content-center">
                  <button type="submit" className="btn btn-primary me-2">{isEditing ? 'Update' : 'Save'}</button>
                  <button type="button" className="btn btn-danger" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <SearchCardHeader
              icon="bi-list-ul"
              title="Customer List"
              count={filteredCustomers.length}
              searchTerm={searchTerm}
              onSearchChange={e => setSearchTerm(e.target.value)}
              searchPlaceholder="Search customers..."
            />
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Customer</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td>
                            <p className="mb-0 fw-bold">{customer.name}</p>
                            <small className="text-muted d-block">{customer.contact}</small>
                            <small className="text-muted d-block">{customer.address}</small><small>Balance: <span className={`fw-bold ${customer.balance > 0 ? 'text-danger' : 'text-success'}`}>₹{parseFloat(customer.balance).toFixed(2)}</span></small>
                          </td>
                          <td>
                            <BalanceStatusBadge balance={customer.balance} />
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditClick(customer)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => requestDelete(customer.id, { title: 'Confirm Customer Deletion', body: 'Are you sure you want to delete this customer? This action cannot be undone.' })}>Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3"><NoCustomersIllustration /></td>
                      </tr>
                    )}
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

export default CustomersPage;
