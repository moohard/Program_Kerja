import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FiHome, FiClipboard, FiSettings, FiFileText, FiChevronDown, FiLogOut, FiGrid } from 'react-icons/fi';

// 1. Mendefinisikan struktur menu sebagai data
const navLinks = [
    { name: 'Dashboard', path: '/', icon: <FiHome className="mr-3" /> },
    { name: 'Rencana Aksi', path: '/rencana-aksi', icon: <FiClipboard className="mr-3" /> },
    { 
        name: 'Laporan', 
        icon: <FiFileText className="mr-3" />,
        children: [
            { name: 'Laporan Bulanan', path: '/laporan' },
            { name: 'Laporan Matriks', path: '/laporan-matriks' }, // <-- Tambahkan link sub-menu
        ]
    },
    {
        name: 'Master Data',
        icon: <FiSettings className="mr-3" />,
        children: [
            { name: 'Kategori Utama', path: '/master/kategori-utama' },
            { name: 'Kegiatan', path: '/master/kegiatan' },
        ]
    }
];

function MainLayout() {
    const { user, logout } = useAuth();
    const [openMenus, setOpenMenus] = useState({ 'Laporan': true }); // <-- Default menu laporan terbuka

    const handleMenuToggle = (menuName) => {
        setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    // Komponen kecil untuk render link (DRY Principle)
    const NavItem = ({ item }) => {
        if (item.children) {
            const isOpen = openMenus[item.name] || false;
            return (
                <div>
                    <button onClick={() => handleMenuToggle(item.name)} className="w-full flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-gray-100">
                        <div className="flex items-center">
                            {item.icon}
                            {item.name}
                        </div>
                        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="pl-6 mt-2 space-y-2">
                            {item.children.map(child => (
                                <NavLink key={child.name} to={child.path} className={({ isActive }) => `block p-2 rounded-md text-sm ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                    {child.name}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink to={item.path} className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {item.icon}
                {item.name}
            </NavLink>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-indigo-600">ProKer App</h1>
                    <p className="text-sm text-gray-500">PA Penajam</p>
                </div>
                {/* 2. Membuat menu secara dinamis dari data */}
                <nav className="mt-6 px-4 space-y-2">
                    {navLinks.map((link) => (
                        <NavItem key={link.name} item={link} />
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-end items-center">
                    <div className="flex items-center">
                        <span className="text-gray-700 mr-4">Selamat datang, <strong>{user?.name || 'Pengguna'}</strong></span>
                        <button onClick={logout} className="flex items-center px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600">
                            <FiLogOut className="mr-2" />
                            Logout
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;

