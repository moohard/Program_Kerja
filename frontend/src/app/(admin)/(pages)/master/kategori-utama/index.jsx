import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient';
import KategoriModal from '@/components/modals/KategoriModal';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { showConfirmationToast } from '@/components/common/ConfirmationToast';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const KategoriUtamaPage = () => {
    const [kategoriList, setKategoriList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchKategori = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/kategori-utama');
            setKategoriList(response.data.data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data. Silakan coba lagi.');
            toast.error('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKategori();
    }, [fetchKategori]);

    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (formData) => {
        const isUpdating = !!currentItem;
        const url = isUpdating ? `/kategori-utama/${currentItem.id}` : '/kategori-utama';
        const method = isUpdating ? 'put' : 'post';

        try {
            await apiClient[method](url, formData);
            toast.success(`Kategori berhasil ${isUpdating ? 'diperbarui' : 'ditambahkan'}.`);
            fetchKategori();
            handleCloseModal();
        } catch (error) {
            const message = error.response?.data?.message || `Gagal ${isUpdating ? 'memperbarui' : 'menambahkan'} kategori.`;
            toast.error(message);
        }
    };

    const handleDelete = (id) => {
        showConfirmationToast('Yakin ingin menghapus item ini?', async () => {
            try {
                await apiClient.delete(`/kategori-utama/${id}`);
                toast.success('Kategori berhasil dihapus.');
                fetchKategori();
            } catch (error) {
                toast.error('Gagal menghapus kategori.');
            }
        });
    };


    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-semibold text-gray-900">Master: Kategori Utama</h1>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 self-start md:self-auto" data-cy="add-kategori-button">Tambah</button>
            </div>
            {loading ? <div className="flex justify-center"><div className="loader"></div></div> : error ? <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div> :
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kategori</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200" data-cy="kategori-table-body">
                            {kategoriList.map(item => (
                                <tr key={item.id} data-cy={`kategori-row-${item.id}`}>
                                    <td className="px-6 py-4">{item.nomor}</td>
                                    <td className="px-6 py-4">{item.nama_kategori}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => handleOpenModal(item)} className="flex items-center text-indigo-600 hover:text-indigo-900" data-cy={`edit-kategori-button-${item.id}`}>
                                                <FiEdit size={16} /><span className="hidden md:inline ml-1">Edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="flex items-center text-red-600 hover:text-red-900" data-cy={`delete-kategori-button-${item.id}`}>
                                                <FiTrash2 size={16} /><span className="hidden md:inline ml-1">Hapus</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
            {isModalOpen && <KategoriModal item={currentItem} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
}

export default KategoriUtamaPage;
