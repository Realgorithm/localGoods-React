import React, { useState } from 'react';
import api from '../api';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AddCustomerModal = ({ show, handleClose, onCustomerAdded }) => {
    const [formData, setFormData] = useState({ name: '', contact: '', address: '' });

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetAndClose = () => {
        setFormData({ name: '', contact: '', address: '' }); // Reset form
        handleClose();
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/customers', formData);
            if (response.data.status === 1) {
                toast.success(response.data.message);
                onCustomerAdded(response.data.newId); // Pass the new ID back
                resetAndClose();
            } else {
                toast.error(response.data.message || 'Operation failed.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <Modal show={show} onHide={resetAndClose} centered>
            <Modal.Header closeButton>
                <Modal.Title><i className="bi bi-person-plus-fill me-2"></i> Add New Customer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleFormSubmit} id="add-customer-form">
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Customer Name</label>
                        <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="contact" className="form-label">Contact</label>
                        <input type="text" className="form-control" id="contact" name="contact" value={formData.contact} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address</label>
                        <textarea className="form-control" id="address" name="address" rows="3" value={formData.address} onChange={handleFormChange} required></textarea>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
                <Button variant="primary" type="submit" form="add-customer-form">Save Customer</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddCustomerModal;