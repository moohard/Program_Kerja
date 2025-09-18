import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiArchive, FiBarChart2, FiLogOut, FiChevronDown, FiChevronUp, FiSettings, FiSliders, FiList } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const MainLayout = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.logout();
        navigate('/login');
    };

    const [openMenus, setOpenMenus] = useState({
        'Master Data': false,
        'Laporan': false
    });

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const NavItem = ({ link }) => {
        const location = useLocation();

        if (link.children) {
            const isOpen = openMenus[link.name] || false;
            const isChildActive = link.children.some(child => location.pathname.startsWith(child.path));

            return (
                <div>
                    <button onClick={() => toggleMenu(link.name)} className={`w-full flex items-center justify-between text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${isChildActive ? 'bg-indigo-700 text-white' : 'text-gray-200 hover:bg-indigo-500'}`}>
                        <div className="flex items-center">
                            <link.icon className="w-5 h-5 mr-3" />
                            <span>{link.name}</span>
                        </div>
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isOpen && (
                        <div className="pl-8 py-2 space-y-2">
                            {link.children.map(child => <NavItem key={child.name} link={child} />)}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                to={link.path}
                className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-700 text-white' : 'text-gray-200 hover:bg-indigo-500'}`
                }
            >
                <link.icon className="w-5 h-5 mr-3" />
                <span>{link.name}</span>
            </NavLink>
        );
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: FiHome },
        { name: 'Rencana Aksi', path: '/rencana-aksi', icon: FiFileText },
        {
            name: 'Laporan',
            icon: FiBarChart2,
            children: [
                { name: 'Laporan Bulanan', path: '/laporan/bulanan', icon: FiFileText },
                { name: 'Laporan Matriks', path: '/laporan/matriks', icon: FiArchive },
            ]
        },
        {
            name: 'Pengaturan',
            icon: FiSettings,
            children: [
                { name: 'Manajemen Template', path: '/templates', icon: FiSliders },
                { name: 'Laporan Audit', path: '/audit-logs', icon: FiList },
                {
                    name: 'Master Data',
                    path: '#', // a placeholder
                    icon: FiArchive,
                    children: [
                        { name: 'Kategori Utama', path: '/master/kategori-utama', icon: FiFileText },
                        { name: 'Kegiatan', path: '/master/kegiatan', icon: FiFileText },
                    ]
                }
            ]
        }
    ];

    // Simple recursive renderer for nested menus in NavItem
    NavItem.Nested = ({ links }) => {
        return links.map(link => <NavItem key={link.name} link={link} />);
    };


    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-indigo-600">
                <div className="flex items-center justify-center h-20 shadow-md">
                    <h1 className="text-2xl font-bold text-white">PROKER APP</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="mt-6 px-4 space-y-2">
                        {navLinks.map(link => <NavItem key={link.name} link={link} />)}
                    </nav>
                </div>
                <div className="p-4 border-t border-indigo-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 rounded-lg text-gray-200 hover:bg-indigo-500"
                    >
                        <FiLogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white border-b">
                    <h2 className="text-xl font-semibold">Selamat Datang, {auth.user?.name || 'Pengguna'}</h2>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

