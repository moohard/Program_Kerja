import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';
import Modal from '@/components/common/Modal';
import JabatanForm from '@/components/Jabatan/JabatanForm';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const JabatanPage = () => {
    const [jabatanList, setJabatanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJabatan, setSelectedJabatan] = useState(null);

    const fetchJabatan = async () => {
        try {
            setLoading(true);
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
                // Update
                await apiClient.put(`/jabatan/${selectedJabatan.id}`, formData);
                toast.success('Jabatan berhasil diperbarui.');
            } else {
                // Create
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
        if (window.confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) {
            try {
                await apiClient.delete(`/jabatan/${id}`);
                toast.success('Jabatan berhasil dihapus.');
                fetchJabatan();
            } catch (err) {
                const message = err.response?.data?.message || 'Gagal menghapus jabatan.';
                toast.error(message);
            }
        }
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
            
            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-max w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Nama Jabatan</th>
                            <th className="py-3 px-6 text-left">Bidang</th>
                            <th className="py-3 px-6 text-left">Atasan Langsung</th>
                            <th className="py-3 px-6 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {jabatanList.map(jabatan => (
                            <tr key={jabatan.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{jabatan.nama_jabatan}</td>
                                <td className="py-3 px-6 text-left">{jabatan.bidang || '-'}</td>
                                <td className="py-3 px-6 text-left">{jabatan.parent?.nama_jabatan || '-'}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => handleEdit(jabatan)} title="Edit Jabatan" className="w-8 h-8 flex items-center justify-center rounded bg-yellow-500 text-white mr-2 hover:bg-yellow-600">
                                            <FiEdit />
                                        </button>
                                        <button onClick={() => handleDelete(jabatan.id)} title="Hapus Jabatan" className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white hover:bg-red-600">
                                            <FiTrash2 />
                                        </button>
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
