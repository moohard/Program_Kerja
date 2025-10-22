import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const UserPage = () => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/users');
            setUserList(response.data.data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data pengguna.');
            toast.error('Gagal memuat data pengguna.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => { console.log('Open create modal'); };
    const handleEdit = (user) => { console.log('Open edit modal for:', user); };
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            try {
                await apiClient.delete(`/users/${id}`);
                toast.success('Pengguna berhasil dihapus.');
                fetchUsers(); // Refresh list
            } catch (err) {
                const message = err.response?.data?.message || 'Gagal menghapus pengguna.';
                toast.error(message);
            }
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manajemen Pengguna</h1>
            <div className="mb-4">
                <button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Tambah Pengguna
                </button>
            </div>
            {/* Placeholder for table */}
            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-max w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Nama</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Jabatan</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {userList.map(user => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{user.name}</td>
                                <td className="py-3 px-6 text-left">{user.email}</td>
                                <td className="py-3 px-6 text-left">{user.jabatan?.nama_jabatan || '-'}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => handleEdit(user)} className="w-8 h-8 rounded bg-yellow-500 text-white mr-2">E</button>
                                        <button onClick={() => handleDelete(user.id)} className="w-8 h-8 rounded bg-red-500 text-white">H</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserPage;
