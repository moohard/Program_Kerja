import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { requestPermission } from '../../firebase-config';
import apiClient from '../../services/apiClient';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Fungsi untuk meminta izin notifikasi dan mengirim token ke backend
        const setupNotifications = async () => {
            try {
                const token = await requestPermission();
                if (token) {
                    // Kirim token ke backend
                    await apiClient.post('/store-fcm-token', { token });
                    console.log('FCM Token successfully sent to backend.');
                }
            } catch (error) {
                console.error('Error setting up notifications:', error);
            }
        };

        // Panggil fungsi hanya jika ada user yang login
        if (user) {
            setupNotifications();
        }
    }, [user]);


    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-4 text-xl font-bold border-b border-gray-700">ProKer App</div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/" className="block px-4 py-2 rounded hover:bg-gray-700">Dashboard</Link>
                    <Link to="/rencana-aksi" className="block px-4 py-2 rounded hover:bg-gray-700">Rencana Aksi</Link>
                    <Link to="/laporan" className="block px-4 py-2 rounded hover:bg-gray-700">Laporan</Link>
                    <Link to="/laporan-matriks" className="block px-4 py-2 rounded hover:bg-gray-700">Laporan Matriks</Link>
                    <div className="pt-4 mt-4 border-t border-gray-700">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Master Data</h3>
                        <Link to="/master/kategori-utama" className="block px-4 py-2 rounded hover:bg-gray-700 mt-2">Kategori Utama</Link>
                        <Link to="/master/kegiatan" className="block px-4 py-2 rounded hover:bg-gray-700">Kegiatan</Link>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-700">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
                        <Link to="/templates" className="block px-4 py-2 rounded hover:bg-gray-700 mt-2">Templates</Link>
                        <Link to="/audit-log" className="block px-4 py-2 rounded hover:bg-gray-700">Audit Log</Link>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 flex justify-between items-center">
                    <div>
                        {/* Breadcrumbs or Page Title can go here */}
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, {user.name}</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

