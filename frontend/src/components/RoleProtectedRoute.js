import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // This should theoretically be caught by the parent ProtectedRoute, but it's good practice.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if the user's role is in the list of allowed roles
    const isAllowed = allowedRoles?.includes(user.role);

    // If allowed, render the child routes. Otherwise, navigate to an unauthorized page.
    return isAllowed ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default RoleProtectedRoute;