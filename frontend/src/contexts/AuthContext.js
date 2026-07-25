import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, []);

    const login = async (email, password, shopName) => {
        const response = await api.post('/auth/login', { email, password, shopName });
        setUser(response.data.user);
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        navigate('/login');
    };

    const value = { user, login, logout, loading, isAuthenticated: !!user };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};