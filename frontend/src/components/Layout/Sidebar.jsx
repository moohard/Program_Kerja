import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFileText, FiBarChart2, FiSettings, FiGitMerge, FiDatabase } from 'react-icons/fi';

const Sidebar = () => {
    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            isActive ? 'bg-indigo-700 text-white' : 'text-gray-200 hover:bg-indigo-500 hover:text-white'
        }`;

    return (
        <div className="w-64 h-screen bg-indigo-600 text-white flex flex-col fixed">
            <div className="px-6 py-4">
                <h1 className="text-2xl font-bold">ProKer</h1>
            </div>
            <nav className="flex-grow px-4 space-y-2">
                <NavLink to="/dashboard" className={navLinkClasses}>
                    <FiGrid className="mr-3" /> Dashboard
                </NavLink>
                <NavLink to="/rencana-aksi" className={navLinkClasses}>
                    <FiFileText className="mr-3" /> Rencana Aksi
                </NavLink>
                <NavLink to="/laporan" className={navLinkClasses}>
                    <FiBarChart2 className="mr-3" /> Laporan
                </NavLink>
                <NavLink to="/templates" className={navLinkClasses}>
                    <FiGitMerge className="mr-3" /> Templates
                </NavLink>

                <div className="pt-4">
                    <h2 className="px-4 text-xs font-semibold text-indigo-200 uppercase tracking-wider">Master Data</h2>
                    <div className="mt-2 space-y-2">
                        <NavLink to="/master/kategori-utama" className={navLinkClasses}>
                            <FiDatabase className="mr-3" /> Kategori Utama
                        </NavLink>
                        <NavLink to="/master/kegiatan" className={navLinkClasses}>
                            <FiDatabase className="mr-3" /> Kegiatan
                        </NavLink>
                    </div>
                </div>
                 <NavLink to="/audit-logs" className={navLinkClasses}>
                    <FiSettings className="mr-3" /> Audit Logs
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
