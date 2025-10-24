import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';

const PublicRoute = ({ children }) => {
    const { token } = useContext(AuthContext);
    return !token ? children : <Navigate to="/" replace />;
};

export default PublicRoute;
