import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';
import Modal from '@/components/common/Modal';
import UserForm from '@/components/User/UserForm';
import { FiEdit, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { showConfirmationToast } from '@/components/common/ConfirmationToast';

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
            let message = '';
            if (selectedUser) {
                await apiClient.put(`/users/${selectedUser.id}`, payload);
                message = 'Pengguna berhasil diperbarui.';
            } else {
                await apiClient.post('/users', payload);
                message = 'Pengguna berhasil ditambahkan.';
            }
            handleCloseModal(); // 1. Close the modal immediately
            console.log('Attempting to show toast with message:', message); // DEBUG LOG
            toast.success(message); // 2. Then, show the success toast
            fetchData(); // 3. Refresh the data in the background
        } catch (err) {
            const message = err.response?.data?.message || 'Gagal menyimpan data.';
            toast.error(message);
        }
    };

    const handleDelete = async (id) => {
        showConfirmationToast('Apakah Anda yakin ingin menghapus pengguna ini?', async () => {
            try {
                await apiClient.delete(`/users/${id}`);
                toast.success('Pengguna berhasil dihapus.');
                fetchData();
            } catch (err) {
                const message = err.response?.data?.message || 'Gagal menghapus pengguna.';
                toast.error(message);
            }
        });
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
            
            <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                <table className="min-w-full w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Pengguna</th>
                            <th className="py-3 px-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {userList.map(user => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">
                                    <div className="flex flex-col">
                                        <span className="font-bold whitespace-normal">{user.name}</span>
                                        <span className="text-xs text-gray-500 mt-1">{user.email}</span>
                                        <span className="text-xs text-gray-500">{user.jabatan?.nama_jabatan || '-'}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
                                        <button className="hs-dropdown-toggle">
                                            <FiMoreVertical size={20} />
                                        </button>
                                        <div className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden z-10 mt-2 min-w-[10rem] bg-white shadow-md rounded-lg p-2">
                                            <button onClick={() => handleEdit(user)} className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100">
                                                <FiEdit /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100">
                                                <FiTrash2 /> Hapus
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna'}>
                {isModalOpen && (
                    <UserForm
                        onSave={handleSave}
                        onCancel={handleCloseModal}
                        user={selectedUser}
                        jabatanList={jabatanList}
                    />
                )}
            </Modal>
        </div>
    );
};

export default UserPage;
