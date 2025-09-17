import React, { useState, createContext, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            apiClient.get('/user')
                .then(response => setUser(response.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const response = await apiClient.post('/login', { email, password });
        const { user, token } = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        setToken(token);
    };

    const logout = () => {
        apiClient.post('/logout').finally(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete apiClient.defaults.headers.common['Authorization'];
            setUser(null);
            setToken(null);
        });
    };

    const value = useMemo(() => ({ user, token, login, logout, isAuthenticated: !!token }), [user, token]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="loader"></div></div>;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
