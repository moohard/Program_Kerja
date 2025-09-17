import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import PublicRoute from './components/Layout/PublicRoute';

import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KategoriUtamaPage from './pages/master/KategoriUtamaPage';
import KegiatanPage from './pages/master/KegiatanPage';
import RencanaAksiPage from './pages/RencanaAksiPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/rencana-aksi" element={<RencanaAksiPage />} />
                        <Route path="/master/kategori-utama" element={<KategoriUtamaPage />} />
                        <Route path="/master/kegiatan" element={<KegiatanPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
