import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function MainLayout() {
    const auth = useAuth();
    const location = useLocation();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Rencana Aksi', path: '/rencana-aksi' },
        {
            name: 'Master Data',
            children: [
                { name: 'Kategori Utama', path: '/master/kategori-utama' },
                { name: 'Kegiatan', path: '/master/kegiatan' },
            ]
        }
    ];

    return (
        <div className="min-h-screen flex">
            <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
                <div className="p-4 text-2xl font-bold border-b border-gray-700">ProKer</div>
                <nav className="mt-6">
                    {navLinks.map(link => {
                        if (link.children) {
                            return (
                                <div key={link.name}>
                                    <div className="px-4 pt-4 pb-2 text-xs text-gray-400 uppercase tracking-wider">{link.name}</div>
                                    {link.children.map(child => (
                                        <Link key={child.name} to={child.path} className={`block py-2.5 pl-8 pr-4 rounded transition duration-200 hover:bg-gray-700 ${location.pathname === child.path ? 'bg-gray-700' : ''}`}>
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <Link key={link.name} to={link.path} className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 ${location.pathname === link.path ? 'bg-gray-900' : ''}`}>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-end items-center">
                    <span className="text-sm font-medium text-gray-600 mr-4">{auth.user?.name} ({auth.user?.role})</span>
                    <button onClick={auth.logout} className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">Logout</button>
                </header>
                <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
