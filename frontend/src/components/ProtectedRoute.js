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

// Sub-component: render admin, owner, or fallback based on live role
ProtectedRoute.RoleBased = function RoleBased({ admin, owner, fallback }) {
    const userData = authService.getCurrentUser();
    const role = userData?.user?.role;
    if (role === 'Admin') return admin;
    if (role === 'BoardingOwner') return owner || fallback;
    return fallback;
};

export default ProtectedRoute;
