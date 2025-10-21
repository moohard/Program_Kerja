import React from 'react';
import useAuth from '../../hooks/useAuth';
import useFirebaseMessaging from '../../hooks/useFirebaseMessaging'; // Import hook
import { FiLogOut, FiBell, FiMenu } from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { notificationStatus, requestPermissionAndGetToken } = useFirebaseMessaging();

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 mr-4">
                        <FiMenu size={24} />
                    </button>
                    {/* Bisa ditambahkan breadcrumbs atau judul halaman di sini */}
                </div>
                <div className="flex items-center">
                    {notificationStatus !== 'granted' && (
                        <button
                            onClick={() => {
                                if (notificationStatus === 'denied') {
                                    alert('Anda telah memblokir notifikasi. Harap aktifkan secara manual melalui pengaturan browser Anda.');
                                    return;
                                }
                                requestPermissionAndGetToken();
                            }}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 mr-4"
                            title={notificationStatus === 'denied' ? 'Notifikasi diblokir' : 'Aktifkan Notifikasi'}
                        >
                            <FiBell size={20} />
                        </button>
                    )}
                    <span className="text-sm text-gray-600 mr-4">
                        Selamat datang, <span className="font-medium">{user?.name || 'Pengguna'}</span>
                    </span>
                    <button
                        onClick={logout}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Logout"
                    >
                        <FiLogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
