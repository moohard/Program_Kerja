import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router-dom';

// Create a separate instance for CSRF cookie requests (without /api prefix)
const csrfClient = apiClient;
// Override baseURL temporarily for CSRF cookie request
const originalBaseURL = csrfClient.defaults.baseURL;
csrfClient.getCSRFCookie = async () => {
    csrfClient.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
    const response = await csrfClient.get('/sanctum/csrf-cookie');
    csrfClient.defaults.baseURL = originalBaseURL;
    return response;
};

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
        // Clear existing cookies first to avoid duplicates
        document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.proker.test';
        document.cookie = 'laravel-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.proker.test';
        
        // First, get a CSRF cookie
        console.log('[Debug] Getting CSRF cookie...');
        await csrfClient.getCSRFCookie();
        
        // Debug: Check cookies
        console.log('[Debug] Cookies after CSRF:', document.cookie);
        
        // Get CSRF token manually for debugging
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            // Handle multiple cookies with same name - take the last one
            if (parts.length >= 2) {
                const lastPart = parts[parts.length - 1];
                return lastPart.split(';').shift();
            }
            return null;
        };
        const csrfToken = getCookie('XSRF-TOKEN');
        console.log('[Debug] CSRF Token:', csrfToken);
        
        // Then, attempt to login (CSRF token akan otomatis ditambahkan oleh interceptor)
        console.log('[Debug] Attempting login...');
        const response = await apiClient.post('/login', { 
            email, 
            password 
        });
        console.log('[Debug] Login response:', response);
        
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
            // Use the api client for logout (CSRF token akan otomatis ditambahkan oleh interceptor)
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