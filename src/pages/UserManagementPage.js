import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import UserFormModal from '../components/UserFormModal';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for modals
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch users.');
            setError('Failed to fetch users.'); // For conditional rendering
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setConfirmAction(null);
    };

    const handleSaveUser = async (formData, userId) => {
        try {
            if (userId) {
                // Editing existing user
                await api.put(`/users/${userId}`, formData);
                toast.success('User updated successfully!');
            } else {
                // Adding new user
                await api.post('/users', formData);
                toast.success('User created successfully!');
            }
            handleCloseModal();
            fetchUsers(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save user.');
        }
    };

    const handleDeleteUser = async (userId) => {
        setConfirmAction({
            title: 'Confirm Deletion',
            body: 'Are you sure you want to delete this user? This action cannot be undone.',
            onConfirm: () => performDelete(userId)
        });
    };

    const performDelete = async (userId) => {
        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deleted successfully.');
            fetchUsers(); // Refresh the list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    if (loading) return <div className="text-center my-5">Loading users...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <>
            <UserFormModal
                show={showModal}
                handleClose={handleCloseModal}
                onSave={handleSaveUser}
                user={editingUser}
            />
            <ConfirmModal
                show={!!confirmAction}
                handleClose={() => setConfirmAction(null)}
                title={confirmAction?.title}
                body={confirmAction?.body}
                onConfirm={confirmAction?.onConfirm}
            />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>User Management</h1>
                    <button className="btn btn-primary" onClick={handleOpenAddModal}>
                        <i className="bi bi-plus-circle-fill me-2"></i> Add New User
                    </button>
                </div>
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td><span className={`badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>{user.role}</span></td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenEditModal(user)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default UserManagementPage;