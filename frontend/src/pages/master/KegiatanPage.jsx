import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';
import KegiatanModal from '../../components/modals/KegiatanModal';

function KegiatanPage() {
    const [kategoriList, setKategoriList] = useState([]);
    const [kegiatanList, setKegiatanList] = useState([]);
    const [selectedKategori, setSelectedKategori] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        apiClient.get('/kategori-utama').then(res => setKategoriList(res.data.data));
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
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    }, [selectedKategori]);

    useEffect(() => {
        fetchKegiatan();
    }, [fetchKegiatan]);

    const handleOpenModal = (item = null) => { setCurrentItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setCurrentItem(null); };
    const handleSave = async (itemData) => {
        try {
            const payload = { ...itemData, kategori_id: selectedKategori };
            if (currentItem) await apiClient.put(`/kegiatan/${currentItem.id}`, payload);
            else await apiClient.post('/kegiatan', payload);
            fetchKegiatan(); handleCloseModal();
        } catch (err) { alert('Gagal menyimpan data kegiatan.'); }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus kegiatan ini?')) {
            try { await apiClient.delete(`/kegiatan/${id}`); fetchKegiatan(); }
            catch (err) { alert('Gagal menghapus data kegiatan.'); }
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Master: Kegiatan</h1>
                <button onClick={() => handleOpenModal()} disabled={!selectedKategori} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">Tambah Kegiatan</button>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Pilih Kategori Utama</label>
                <select value={selectedKategori} onChange={e => setSelectedKategori(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
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
                        <tbody className="divide-y divide-gray-200">
                            {kegiatanList.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-pre-wrap">{item.nama_kegiatan}</td>
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
            {isModalOpen && <KegiatanModal item={currentItem} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
}

export default KegiatanPage;
