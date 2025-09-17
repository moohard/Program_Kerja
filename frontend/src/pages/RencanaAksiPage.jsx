import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import RencanaAksiModal from '../components/modals/RencanaAksiModal';
import TodoModal from '../components/modals/TodoModal';
import ProgressModal from '../components/modals/ProgressModal';


function RencanaAksiPage() {
    const [kategoriList, setKategoriList] = useState([]);
    const [kegiatanList, setKegiatanList] = useState([]);
    const [rencanaAksiList, setRencanaAksiList] = useState([]);
    const [userList, setUserList] = useState([]);

    const [selectedKategori, setSelectedKategori] = useState('');
    const [selectedKegiatan, setSelectedKegiatan] = useState('');

    const [loading, setLoading] = useState({ kegiatan: false, rencana: false });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [selectedRencanaAksi, setSelectedRencanaAksi] = useState(null);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);


    useEffect(() => {
        apiClient.get('/kategori-utama').then(res => setKategoriList(res.data.data));
        apiClient.get('/users').then(res => setUserList(res.data.data));
    }, []);

    const handleKategoriChange = (e) => {
        const kategoriId = e.target.value;
        setSelectedKategori(kategoriId);
        setSelectedKegiatan('');
        setRencanaAksiList([]);
        if (kategoriId) {
            setLoading(prev => ({ ...prev, kegiatan: true }));
            apiClient.get(`/kegiatan?kategori_id=${kategoriId}`).then(res => {
                setKegiatanList(res.data.data);
            }).finally(() => setLoading(prev => ({ ...prev, kegiatan: false })));
        } else {
            setKegiatanList([]);
        }
    };

    const fetchRencanaAksi = useCallback(async () => {
        if (!selectedKegiatan) {
            setRencanaAksiList([]);
            return;
        }
        setLoading(prev => ({ ...prev, rencana: true }));
        try {
            const response = await apiClient.get(`/rencana-aksi?kegiatan_id=${selectedKegiatan}`);
            setRencanaAksiList(response.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(prev => ({ ...prev, rencana: false })); }
    }, [selectedKegiatan]);

    useEffect(() => {
        fetchRencanaAksi();
    }, [fetchRencanaAksi]);

    const handleOpenModal = (item = null) => { setCurrentItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setCurrentItem(null); };
    const handleOpenProgressModal = (item) => {
        setSelectedRencanaAksi(item);
        setIsProgressModalOpen(true);
    };
    const handleCloseProgressModal = () => {
        setIsProgressModalOpen(false);
        setSelectedRencanaAksi(null);
    };
    const handleSave = async (itemData) => {
        try {
            const payload = { ...itemData, kegiatan_id: selectedKegiatan };
            if (currentItem) await apiClient.put(`/rencana-aksi/${currentItem.id}`, payload);
            else await apiClient.post('/rencana-aksi', payload);
            fetchRencanaAksi(); handleCloseModal();
        } catch (err) { alert('Gagal menyimpan Rencana Aksi.'); }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus Rencana Aksi ini?')) {
            try { await apiClient.delete(`/rencana-aksi/${id}`); fetchRencanaAksi(); }
            catch (err) { alert('Gagal menghapus Rencana Aksi.'); }
        }
    };

    const handleOpenTodoModal = (item) => {
        setSelectedRencanaAksi(item);
        setIsTodoModalOpen(true);
    };
    const handleCloseTodoModal = () => {
        setIsTodoModalOpen(false);
        setSelectedRencanaAksi(null);
    };

    const statusColors = {
        planned: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        delayed: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Rencana Aksi</h1>
                <button onClick={() => handleOpenModal()} disabled={!selectedKegiatan} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">Tambah Rencana Aksi</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Filter Kategori Utama</label>
                    <select value={selectedKategori} onChange={handleKategoriChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
                        <option value="">-- Pilih Kategori --</option>
                        {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nomor}. {k.nama_kategori}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Filter Kegiatan</label>
                    <select value={selectedKegiatan} onChange={e => setSelectedKegiatan(e.target.value)} disabled={loading.kegiatan} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
                        <option value="">-- Pilih Kegiatan --</option>
                        {kegiatanList.map(k => <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>)}
                    </select>
                </div>
            </div>

            {loading.rencana ? <div className="flex justify-center"><div className="loader"></div></div> :
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Aksi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penanggung Jawab</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rencanaAksiList.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4">{item.nomor_aksi}</td>
                                    <td className="px-6 py-4 whitespace-pre-wrap max-w-sm">{item.deskripsi_aksi}</td>
                                    <td className="px-6 py-4">{item.assigned_user?.name || '-'}</td>
                                    <td className="px-6 py-4">{item.target_tanggal}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status]}`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="progress-bar-container w-full h-2.5">
                                            <div className="progress-bar" style={{ width: `${item.latest_progress}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleOpenProgressModal(item)} className="text-green-600 hover:text-green-900 mr-4">Progress</button>
                                        <button onClick={() => handleOpenTodoModal(item)} className="text-gray-600 hover:text-gray-900 mr-4">To-Do</button>
                                        <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 ml-4">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
            {isModalOpen && <RencanaAksiModal item={currentItem} users={userList} onClose={handleCloseModal} onSave={handleSave} />}
            {isTodoModalOpen && <TodoModal rencanaAksi={selectedRencanaAksi} onClose={handleCloseTodoModal} />}
            {isProgressModalOpen && <ProgressModal rencanaAksi={selectedRencanaAksi} onClose={handleCloseProgressModal} onProgressUpdate={fetchRencanaAksi} />}
        </div>
    );
}
export default RencanaAksiPage;
