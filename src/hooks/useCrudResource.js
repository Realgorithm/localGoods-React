import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

/**
 * Data layer for the "list + inline add/edit form + delete" pages
 * (Categories, Customers, Suppliers). All three had identical fetch/save/
 * delete/reset logic with only the endpoint, labels, and form fields
 * differing — this hook is that shared logic.
 *
 * The backend convention (already used by these endpoints) is: POST with an
 * `id` updates, POST without one creates.
 */
export function useCrudResource(endpoint, { resourceLabel = 'item', pluralLabel, initialForm = { id: '' } } = {}) {
    const plural = pluralLabel || `${resourceLabel}s`;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(endpoint);
            setItems(response.data);
        } catch (err) {
            toast.error(`Failed to fetch ${plural}.`);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleFormSubmit = async (e) => {
        e?.preventDefault?.();
        try {
            const response = await api.post(endpoint, formData);
            toast.success(response.data.message || `${resourceLabel} saved.`);
            resetForm();
            fetchItems();
            return response.data;
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to save ${resourceLabel}.`);
            return null;
        }
    };

    const handleEditClick = (item) => {
        const picked = Object.keys(initialForm).reduce((acc, key) => {
            acc[key] = item[key] ?? '';
            return acc;
        }, {});
        setFormData(picked);
        setIsEditing(true);
    };

    const requestDelete = (id, overrides = {}) => {
        setConfirmAction({
            title: overrides.title || `Confirm ${resourceLabel} Deletion`,
            body: overrides.body || `Are you sure you want to delete this ${resourceLabel}? This action cannot be undone.`,
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id) => {
        try {
            const response = await api.delete(`${endpoint}/${id}`);
            toast.success(response.data.message || `${resourceLabel} deleted.`);
            fetchItems();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to delete ${resourceLabel}.`);
        }
    };

    return {
        items,
        loading,
        formData,
        isEditing,
        confirmAction,
        setConfirmAction,
        setFormData,
        setIsEditing,
        fetchItems,
        handleFormChange,
        resetForm,
        handleFormSubmit,
        handleEditClick,
        requestDelete,
    };
}
