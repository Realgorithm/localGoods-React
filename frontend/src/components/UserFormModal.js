import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const UserFormModal = ({ show, handleClose, onSave, user }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const isEditing = !!user;
    
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user',
            });
        }
    }, [user, show]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!isEditing && !formData.password) {
            toast.warn('Password is required for new users.');
            return;
        }
        // Pass the form data and the user ID (if editing) to the parent
        onSave(formData, user?.id);
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEditing ? 'Edit User' : 'Add New User'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleFormSubmit} id="user-form">
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleFormChange} required />
                    </div>
                    {!isEditing && (
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleFormChange} required />
                        </div>
                    )}
                    <div className="mb-3">
                        <label htmlFor="role" className="form-label">Role</label>
                        <select className="form-select" id="role" name="role" value={formData.role} onChange={handleFormChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" type="submit" form="user-form">Save</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserFormModal;