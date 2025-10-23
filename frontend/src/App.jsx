import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import PublicRoute from './components/Layout/PublicRoute';
import NotificationHandler from './components/NotificationHandler';

import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';

// Lazy load pages with charts
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnnualReportPage = lazy(() => import('./pages/AnnualReportPage'));

// Statically import other pages
import KategoriUtamaPage from './pages/master/KategoriUtamaPage';
import KegiatanPage from './pages/master/KegiatanPage';
import JabatanPage from './pages/JabatanPage'; // Import JabatanPage
import UserPage from './pages/UserPage'; // Import UserPage
import RencanaAksiPage from './pages/RencanaAksiPage';
import LaporanPage from './pages/LaporanPage';
import LaporanMatriksPage from './pages/LaporanMatriksPage';
import TemplateManagementPage from './pages/TemplateManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <AuthProvider>
                    <NotificationHandler />
                    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
                        <Routes>
                            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/rencana-aksi" element={<RencanaAksiPage />} />
                                <Route path="/laporan" element={<Navigate to="/laporan/bulanan" />} />
                                <Route path="/laporan/bulanan" element={<LaporanPage />} />
                                <Route path="/laporan/matriks" element={<LaporanMatriksPage />} />
                                <Route path="/laporan/tahunan" element={<AnnualReportPage />} />
                                <Route path="/master/kategori-utama" element={<KategoriUtamaPage />} />
                                <Route path="/master/kegiatan" element={<KegiatanPage />} />
                                <Route path="/master/jabatan" element={<JabatanPage />} />
                                <Route path="/master/users" element={<UserPage />} />
                                <Route path="/templates" element={<TemplateManagementPage />} />
                                <Route path="/audit-logs" element={<AuditLogPage />} />
                            </Route>
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
