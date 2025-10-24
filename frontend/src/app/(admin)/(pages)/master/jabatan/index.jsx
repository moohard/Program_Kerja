import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';
import Modal from '@/components/common/Modal';
import JabatanForm from '@/components/Jabatan/JabatanForm';
import { FiEdit, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { showConfirmationToast } from '@/components/common/ConfirmationToast';

const JabatanPage = () => {
    const [jabatanList, setJabatanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJabatan, setSelectedJabatan] = useState(null);

    const fetchJabatan = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/jabatan');
            setJabatanList(response.data.data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data jabatan.');
            toast.error('Gagal memuat data jabatan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJabatan();
    }, []);

    const handleCreate = () => {
        setSelectedJabatan(null);
        setIsModalOpen(true);
    };

    const handleEdit = (jabatan) => {
        setSelectedJabatan(jabatan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJabatan(null);
    };

    const handleSave = async (formData) => {
        try {
            if (selectedJabatan) {
                await apiClient.put(`/jabatan/${selectedJabatan.id}`, formData);
                toast.success('Jabatan berhasil diperbarui.');
            } else {
                await apiClient.post('/jabatan', formData);
                toast.success('Jabatan berhasil ditambahkan.');
            }
            fetchJabatan();
            handleCloseModal();
        } catch (err) {
            const message = err.response?.data?.message || 'Gagal menyimpan data.';
            toast.error(message);
        }
    };

    const handleDelete = async (id) => {
        showConfirmationToast('Apakah Anda yakin ingin menghapus jabatan ini?', async () => {
            try {
                await apiClient.delete(`/jabatan/${id}`);
                toast.success('Jabatan berhasil dihapus.');
                fetchJabatan();
            } catch (err) {
                const message = err.response?.data?.message || 'Gagal menghapus jabatan.';
                toast.error(message);
            }
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-xl">Loading...</div></div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manajemen Jabatan</h1>
            <div className="mb-4">
                <button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Tambah Jabatan
                </button>
            </div>
            
            <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                <table className="min-w-full w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Jabatan</th>
                            <th className="py-3 px-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {jabatanList.map(jabatan => (
                            <tr key={jabatan.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">
                                    <div className="flex flex-col">
                                        <span className="font-bold whitespace-normal">{jabatan.nama_jabatan}</span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            Bidang: {jabatan.bidang || '-'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Atasan: {jabatan.parent?.nama_jabatan || '-'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
                                        <button className="hs-dropdown-toggle">
                                            <FiMoreVertical size={20} />
                                        </button>
                                        <div className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden z-10 mt-2 min-w-[10rem] bg-white shadow-md rounded-lg p-2">
                                            <button onClick={() => handleEdit(jabatan)} className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100">
                                                <FiEdit /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(jabatan.id)} className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-gray-100">
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedJabatan ? 'Edit Jabatan' : 'Tambah Jabatan'}>
                <JabatanForm
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                    jabatan={selectedJabatan}
                    jabatanList={jabatanList}
                />
            </Modal>
        </div>
    );
};

export default JabatanPage;
