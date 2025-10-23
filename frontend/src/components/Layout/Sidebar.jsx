import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFileText, FiBarChart2, FiSettings, FiGitMerge, FiDatabase, FiUsers, FiKey, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth'; // Import useAuth

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth(); // Get the user object

    // Helper function to check for a permission
    const can = (permissionName) => {
        return user?.permissions?.includes(permissionName) ?? false;
    };

    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isActive ? 'bg-indigo-700 text-white' : 'text-gray-200 hover:bg-indigo-500 hover:text-white'
        }`;

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <div
                className={`w-64 h-screen bg-indigo-600 text-white flex flex-col fixed z-30 transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 transition-transform duration-300 ease-in-out`}
            >
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">ProKer</h1>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white">
                        <FiX size={24} />
                    </button>
                </div>
                <nav className="flex-grow px-4 space-y-2">
                    <NavLink to="/dashboard" className={navLinkClasses}>
                        <FiGrid className="mr-3" /> Dashboard
                    </NavLink>
                    <NavLink to="/rencana-aksi" className={navLinkClasses}>
                        <FiFileText className="mr-3" /> Rencana Aksi
                    </NavLink>
                    <div className="pt-2">
                        <h2 className="px-4 text-xs font-semibold text-indigo-200 uppercase tracking-wider">Laporan</h2>
                        <div className="mt-2 space-y-2">
                            <NavLink to="/laporan/bulanan" className={navLinkClasses}>
                                <FiBarChart2 className="mr-3" /> Bulanan
                            </NavLink>
                            <NavLink to="/laporan/matriks" className={navLinkClasses}>
                                <FiBarChart2 className="mr-3" /> Matriks
                            </NavLink>
                            <NavLink to="/laporan/tahunan" className={navLinkClasses}>
                                <FiBarChart2 className="mr-3" /> Tahunan
                            </NavLink>
                        </div>
                    </div>
                    <NavLink to="/templates" className={navLinkClasses}>
                        <FiGitMerge className="mr-3" /> Templates
                    </NavLink>

                    <div className="pt-4">
                        <h2 className="px-4 text-xs font-semibold text-indigo-200 uppercase tracking-wider">Master Data</h2>
                        <div className="mt-2 space-y-2">
                            <NavLink to="/master/kategori-utama" className={navLinkClasses} data-cy="nav-kategori-utama">
                                <FiDatabase className="mr-3" /> Kategori Utama
                            </NavLink>
                            <NavLink to="/master/kegiatan" className={navLinkClasses}>
                                <FiDatabase className="mr-3" /> Kegiatan
                            </NavLink>
                            <NavLink to="/master/jabatan" className={navLinkClasses}>
                                <FiDatabase className="mr-3" /> Jabatan
                            </NavLink>
                            <NavLink to="/master/users" className={navLinkClasses}>
                                <FiUsers className="mr-3" /> Manajemen Pengguna
                            </NavLink>
                            {can('manage roles and permissions') && (
                                <NavLink to="/manajemen-role" className={navLinkClasses}>
                                    <FiKey className="mr-3" /> Manajemen Role
                                </NavLink>
                            )}
                        </div>
                    </div>
                    <NavLink to="/audit-logs" className={navLinkClasses}>
                        <FiSettings className="mr-3" /> Audit Logs
                    </NavLink>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
