import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const PublicRoute = ({ children }) => {
    const { token } = useAuth();
    return !token ? children : <Navigate to="/dashboard" replace />;
};

export default PublicRoute;
