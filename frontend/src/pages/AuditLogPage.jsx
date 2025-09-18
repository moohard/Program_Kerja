import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { FiFilter } from 'react-icons/fi';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user_id: '',
        action: '',
        start_date: '',
        end_date: '',
        page: 1,
    });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiClient.get('/users');
                setUsers(response.data.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(filters).toString();
                const response = await apiClient.get(`/audit-logs?${params}`);
                setLogs(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                });
            } catch (error) {
                console.error("Error fetching audit logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const renderJson = (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            return <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>;
        } catch {
            return <span className="text-gray-500">N/A</span>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h1 className="text-2xl font-bold">Laporan Jejak Audit</h1>

            {/* Filters */}
            <div className="p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-sm font-medium">Pengguna</label>
                    <select name="user_id" value={filters.user_id} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md">
                        <option value="">Semua</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Aksi</label>
                    <select name="action" value={filters.action} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md">
                        <option value="">Semua</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Tanggal Mulai</label>
                    <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md" />
                </div>
                <div>
                    <label className="text-sm font-medium">Tanggal Selesai</label>
                    <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md" />
                </div>
            </div>

            {loading ? <div className="flex justify-center py-10"><div className="loader"></div></div> :
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Tanggal</th>
                                <th className="p-3 text-left">Pengguna</th>
                                <th className="p-3 text-left">Aksi</th>
                                <th className="p-3 text-left">Tabel</th>
                                <th className="p-3 text-left">Data Lama</th>
                                <th className="p-3 text-left">Data Baru</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td className="p-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                    <td className="p-3">{log.user?.name || 'Sistem'}</td>
                                    <td className="p-3">{log.action}</td>
                                    <td className="p-3">{log.table_name} (ID: {log.record_id})</td>
                                    <td className="p-3 w-1/4">{renderJson(log.old_values)}</td>
                                    <td className="p-3 w-1/4">{renderJson(log.new_values)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">Total {pagination.total} data</span>
                <div className="space-x-1">
                    <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Sebelumnya</button>
                    <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="px-3 py-1 border rounded-md disabled:opacity-50">Berikutnya</button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogPage;