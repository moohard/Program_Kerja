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
import LaporanPage from './pages/LaporanPage';
import LaporanMatriksPage from './pages/LaporanMatriksPage';
import TemplateManagementPage from './pages/TemplateManagementPage';
import AuditLogPage from './pages/AuditLogPage';


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/rencana-aksi" element={<RencanaAksiPage />} />
                        <Route path="/laporan" element={<Navigate to="/laporan/bulanan" />} />
                        <Route path="/laporan/bulanan" element={<LaporanPage />} />
                        <Route path="/laporan/matriks" element={<LaporanMatriksPage />} />
                        <Route path="/master/kategori-utama" element={<KategoriUtamaPage />} />
                        <Route path="/master/kegiatan" element={<KegiatanPage />} />
                        <Route path="/templates" element={<TemplateManagementPage />} />
                        <Route path="/audit-logs" element={<AuditLogPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
