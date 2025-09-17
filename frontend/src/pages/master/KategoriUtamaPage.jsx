import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';
import KategoriModal from '../../components/modals/KategoriModal';

function KategoriUtamaPage() {
    const [kategoriList, setKategoriList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/kategori-utama');
            setKategoriList(response.data.data);
        } catch (err) { setError('Gagal memuat data.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (item = null) => { setCurrentItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setCurrentItem(null); };

    const handleSave = async (itemData) => {
        try {
            if (currentItem) await apiClient.put(`/kategori-utama/${currentItem.id}`, itemData);
            else await apiClient.post('/kategori-utama', itemData);
            fetchData(); handleCloseModal();
        } catch (err) { alert('Gagal menyimpan data.'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus item ini?')) {
            try { await apiClient.delete(`/kategori-utama/${id}`); fetchData(); }
            catch (err) { alert('Gagal menghapus data.'); }
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Master: Kategori Utama</h1>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tambah</button>
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
                        <tbody className="divide-y divide-gray-200">
                            {kategoriList.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4">{item.nomor}</td>
                                    <td className="px-6 py-4">{item.nama_kategori}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 ml-4">Hapus</button>
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
