import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

// Re-reads user on every render — guarantees fresh role after login
const ProtectedRoute = ({ children }) => {
    const userData = authService.getCurrentUser();

    if (!userData) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Sub-component: render admin or fallback based on live role
ProtectedRoute.RoleBased = function RoleBased({ admin, fallback }) {
    const userData = authService.getCurrentUser();
    const role = userData?.user?.role;
    return role === 'Admin' ? admin : fallback;
};

export default ProtectedRoute;
