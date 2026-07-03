import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    contact: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Point to the new Node.js API endpoint
      const response = await api.get('/customers');

      setCustomers(response.data);
    } catch (err) {
      toast.error("Failed to fetch customers.");
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // POSTing JSON data directly to our new endpoint
      const response = await api.post('/customers', formData);

      if (response.data.status === 1 || response.data.status === 2) {
        toast.success(response.data.message);
        setFormData({ id: '', name: '', contact: '', address: '' }); // Reset form
        setError(null); // Clear any previous errors
        setIsEditing(false);
        fetchCustomers(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Operation failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred while saving the customer.');
      console.error("Error saving customer:", err);
    }
  };

  const handleEditClick = (customer) => {
    setFormData({
      id: customer.id,
      name: customer.name || '',
      contact: customer.contact || '',
      address: customer.address || '',
    });
    setIsEditing(true);
  };

  const handleDeleteClick = async (id) => {
    setConfirmAction({
      title: 'Confirm Customer Deletion',
      body: 'Are you sure you want to delete this customer? This action cannot be undone.',
      onConfirm: () => performDelete(id)
    });
  };

  const performDelete = async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      toast.success(response.data.message);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer.');
      console.error("Error deleting customer:", err);
    }
  };

  if (loading) return <div className="text-center my-4">Loading customers...</div>;
  if (error) return <div className="alert alert-danger">Error: {error.message}</div>;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <button type="button" className="btn btn-danger" onClick={() => { setFormData({ id: '', name: '', contact: '', address: '' }); setIsEditing(false); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-list-ul me-2"></i> Customer List ({filteredCustomers.length})</h5>
              <div className="w-50">
                <input type="text" className="form-control form-control-sm" placeholder="Search customers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
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
                      filteredCustomers.map((customer, index) => (
                        <tr key={customer.id}>
                          <td>
                            <p className="mb-0 fw-bold">{customer.name}</p>
                            <small className="text-muted d-block">{customer.contact}</small>
                            <small className="text-muted d-block">{customer.address}</small><small>Balance: <span className={`fw-bold ${customer.balance > 0 ? 'text-danger' : 'text-success'}`}>₹{parseFloat(customer.balance).toFixed(2)}</span></small>
                          </td>
                          <td>
                            <CustomerStatusBadge balance={customer.balance} />
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEditClick(customer)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(customer.id)}>Delete</button>
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

const CustomerStatusBadge = ({ balance }) => {
  const hasDues = parseFloat(balance) > 0;
  if (hasDues) {
    return <span className="badge bg-warning text-dark">Has Dues</span>;
  }
  return <span className="badge bg-success">Clear</span>;
};

export default CustomersPage;