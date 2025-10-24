import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';
import Modal from '@/components/common/Modal';
import UserForm from '@/components/User/UserForm';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const UserPage = () => {
    const [userList, setUserList] = useState([]);
    const [jabatanList, setJabatanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, jabatanRes] = await Promise.all([
                apiClient.get('/users'),
                apiClient.get('/jabatan')
            ]);
            setUserList(usersRes.data.data);
            setJabatanList(jabatanRes.data.data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data.');
            toast.error('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSave = async (formData) => {
        // Remove empty password fields before sending
        const payload = { ...formData };
        if (!payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        try {
            if (selectedUser) {
                await apiClient.put(`/users/${selectedUser.id}`, payload);
                toast.success('Pengguna berhasil diperbarui.');
            } else {
                await apiClient.post('/users', payload);
                toast.success('Pengguna berhasil ditambahkan.');
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            const message = err.response?.data?.message || 'Gagal menyimpan data.';
            toast.error(message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            try {
                await apiClient.delete(`/users/${id}`);
                toast.success('Pengguna berhasil dihapus.');
                fetchData();
            } catch (err) {
                const message = err.response?.data?.message || 'Gagal menghapus pengguna.';
                toast.error(message);
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-xl">Loading...</div></div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manajemen Pengguna</h1>
            <div className="mb-4">
                <button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Tambah Pengguna
                </button>
            </div>
            
            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-max w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Nama</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Jabatan</th>
                            <th className="py-3 px-6 text-center">Aksi</th>
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
                                        <button onClick={() => handleEdit(user)} title="Edit Pengguna" className="w-8 h-8 flex items-center justify-center rounded bg-yellow-500 text-white mr-2 hover:bg-yellow-600">
                                            <FiEdit />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} title="Hapus Pengguna" className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white hover:bg-red-600">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna'}>
                <UserForm
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                    user={selectedUser}
                    jabatanList={jabatanList}
                />
            </Modal>
        </div>
    );
};

export default UserPage;
