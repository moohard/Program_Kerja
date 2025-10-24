import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true); // State untuk loading awal
    const navigate = useNavigate();

    useEffect(() => {
        // Coba ambil data user jika ada token saat aplikasi pertama kali dimuat
        const fetchUserOnLoad = async () => {
            if (token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await apiClient.get('/user');
                    setUser(response.data);
                } catch (error) {
                    // Token tidak valid, hapus dari localStorage
                    console.error("Auth token is invalid", error);
                    localStorage.removeItem('authToken');
                    setToken(null);
                    apiClient.defaults.headers.common['Authorization'] = null;
                }
            }
            setLoading(false); // Selesai loading
        };

        fetchUserOnLoad();
    }, [token]); // Hanya jalankan saat token berubah

    const login = async (email, password) => {
        const response = await apiClient.post('/login', { email, password });
        const { token, user } = response.data;

        // Simpan token di localStorage
        localStorage.setItem('authToken', token);
        setToken(token);
        setUser(user);

        // Set header Authorization untuk semua request selanjutnya
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = async () => {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error("Logout failed, but clearing session locally.", error);
        } finally {
            // Hapus semua data sesi dari state dan localStorage
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            delete apiClient.defaults.headers.common['Authorization'];
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;