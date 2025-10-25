import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient';
import KegiatanModal from '@/components/modals/KegiatanModal';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { showConfirmationToast } from '@/components/common/ConfirmationToast';
import { toast } from 'react-toastify';

const KegiatanPage = () => {
    const [kegiatanList, setKegiatanList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [selectedKategori, setSelectedKategori] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch kategori list for the dropdown
        apiClient.get('/kategori-utama')
            .then(response => {
                setKategoriList(response.data.data);
            })
            .catch(() => {
                toast.error('Gagal memuat daftar kategori.');
            });
    }, []);

    const fetchKegiatan = useCallback(async () => {
        if (!selectedKategori) {
            setKegiatanList([]);
            return;
        }
        setLoading(true);
        try {
            const response = await apiClient.get(`/kegiatan?kategori_id=${selectedKategori}`);
            setKegiatanList(response.data.data);
            setError(null);
        } catch (err) {
            setError('Gagal memuat data kegiatan.');
            toast.error('Gagal memuat data kegiatan.');
        } finally {
            setLoading(false);
        }
    }, [selectedKategori]);

    useEffect(() => {
        fetchKegiatan();
    }, [fetchKegiatan]);

    const handleOpenModal = (item = null) => {
        if (!selectedKategori) {
            toast.warn('Silakan pilih kategori utama terlebih dahulu.');
            return;
        }
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSave = async (formData) => {
        const isUpdating = !!currentItem;
        const url = isUpdating ? `/kegiatan/${currentItem.id}` : '/kegiatan';
        const method = isUpdating ? 'put' : 'post';

        // Add the selected kategori_id to the form data
        const dataToSave = { ...formData, kategori_id: selectedKategori };

        try {
            await apiClient[method](url, dataToSave);
            toast.success(`Kegiatan berhasil ${isUpdating ? 'diperbarui' : 'ditambahkan'}.`);
            fetchKegiatan();
            handleCloseModal();
        } catch (error) {
            const message = error.response?.data?.message || `Gagal ${isUpdating ? 'memperbarui' : 'menambahkan'} kegiatan.`;
            toast.error(message);
        }
    };

    const handleDelete = (id) => {
        showConfirmationToast('Yakin ingin menghapus kegiatan ini?', async () => {
            try {
                await apiClient.delete(`/kegiatan/${id}`);
                toast.success('Kegiatan berhasil dihapus.');
                fetchKegiatan();
            } catch (error) {
                toast.error('Gagal menghapus kegiatan.');
            }
        });
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-semibold text-gray-900">Master: Kegiatan</h1>
                <button onClick={() => handleOpenModal()} disabled={!selectedKategori} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 self-start md:self-auto" data-cy="add-kegiatan-button">Tambah Kegiatan</button>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Pilih Kategori Utama</label>
                <select value={selectedKategori} onChange={e => setSelectedKategori(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" data-cy="kategori-select">
                    <option value="">-- Silakan Pilih --</option>
                    {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nomor}. {k.nama_kategori}</option>)}
                </select>
            </div>

            {loading ? <div className="flex justify-center"><div className="loader"></div></div> :
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kegiatan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200" data-cy="kegiatan-table-body">
                            {kegiatanList.map(item => (
                                <tr key={item.id} data-cy={`kegiatan-row-${item.id}`}>
                                    <td className="px-6 py-4 whitespace-pre-wrap">{item.nama_kegiatan}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => handleOpenModal(item)} className="flex items-center text-indigo-600 hover:text-indigo-900" data-cy={`edit-kegiatan-button-${item.id}`}>
                                                <FiEdit size={16} /><span className="hidden md:inline ml-1">Edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="flex items-center text-red-600 hover:text-red-900" data-cy={`delete-kegiatan-button-${item.id}`}>
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
            {isModalOpen && <KegiatanModal item={currentItem} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
}

export default KegiatanPage;
