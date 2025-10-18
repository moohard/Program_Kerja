import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import RencanaAksiModal from '../components/modals/RencanaAksiModal';
import TodoModal from '../components/modals/TodoModal';
import { FiPlus } from 'react-icons/fi';

function RencanaAksiPage() {
    const [kategoriList, setKategoriList] = useState([]);
    const [kegiatanList, setKegiatanList] = useState([]);
    const [rencanaAksiList, setRencanaAksiList] = useState([]);
    const [jabatanTree, setJabatanTree] = useState([]);

    const [selectedKategori, setSelectedKategori] = useState('');
    const [selectedKegiatan, setSelectedKegiatan] = useState('');

    const [loading, setLoading] = useState({ kategori: false, kegiatan: false, rencana: false });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [selectedRencanaAksi, setSelectedRencanaAksi] = useState(null);

    // Fetch Kategori Utama
    useEffect(() => {
        const fetchKategori = async () => {
            setLoading(prev => ({ ...prev, kategori: true }));
            try {
                const response = await apiClient.get('/kategori-utama');
                setKategoriList(response.data.data);
            } catch (error) {
                console.error("Error fetching kategori utama:", error);
            } finally {
                setLoading(prev => ({ ...prev, kategori: false }));
            }
        };
        fetchKategori();
    }, []);

    // Fetch Jabatan Tree
    useEffect(() => {
        const fetchJabatanTree = async () => {
            try {
                const response = await apiClient.get('/jabatan');
                setJabatanTree(response.data.data);
            } catch (error) {
                console.error("Error fetching jabatan tree:", error);
            }
        };
        fetchJabatanTree();
    }, []);

    // Fetch Kegiatan based on selected Kategori
    const fetchKegiatan = useCallback(async (kategoriId) => {
        if (!kategoriId) return;
        setLoading(prev => ({ ...prev, kegiatan: true }));
        setKegiatanList([]);
        setRencanaAksiList([]);
        setSelectedKegiatan('');
        try {
            const response = await apiClient.get(`/kegiatan?kategori_id=${kategoriId}`);
            setKegiatanList(response.data.data);
        } catch (error) {
            console.error("Error fetching kegiatan:", error);
        } finally {
            setLoading(prev => ({ ...prev, kegiatan: false }));
        }
    }, []);

    // Fetch Rencana Aksi based on selected Kegiatan
    const fetchRencanaAksi = useCallback(async () => {
        if (!selectedKegiatan) return;
        setLoading(prev => ({ ...prev, rencana: true }));
        try {
            const response = await apiClient.get(`/rencana-aksi?kegiatan_id=${selectedKegiatan}`);
            console.log(response.data.data);
            setRencanaAksiList(response.data.data);
        } catch (error) {
            console.error("Error fetching rencana aksi:", error);
        } finally {
            setLoading(prev => ({ ...prev, rencana: false }));
        }
    }, [selectedKegiatan]);

    useEffect(() => {
        if (selectedKegiatan) {
            fetchRencanaAksi();
        }
    }, [selectedKegiatan, fetchRencanaAksi]);

    const handleKategoriChange = (e) => {
        const kategoriId = e.target.value;
        setSelectedKategori(kategoriId);
        fetchKegiatan(kategoriId);
    };

    // --- Handlers for RencanaAksiModal ---
    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    // --- Handlers for TodoModal ---
    const handleOpenTodoModal = (item) => {
        setSelectedRencanaAksi(item);
        setIsTodoModalOpen(true);
    };
    const handleCloseTodoModal = () => {
        setIsTodoModalOpen(false);
        setSelectedRencanaAksi(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
            try {
                await apiClient.delete(`/rencana-aksi/${id}`);
                fetchRencanaAksi();
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Gagal menghapus item.');
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Rencana Aksi</h1>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={!selectedKegiatan}
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    data-cy="add-rencana-aksi-button"
                >
                    <FiPlus className="mr-2" />
                    Tambah Rencana Aksi
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">Kategori Utama</label>
                    <select id="kategori" value={selectedKategori} onChange={handleKategoriChange} className="w-full p-2 border rounded-md" data-cy="kategori-select">
                        <option value="">-- Pilih Kategori --</option>
                        {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nomor}. {k.nama_kategori}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700 mb-1">Kegiatan</label>
                    <select id="kegiatan" value={selectedKegiatan} onChange={(e) => setSelectedKegiatan(e.target.value)} disabled={!selectedKategori || loading.kegiatan} className="w-full p-2 border rounded-md" data-cy="kegiatan-select">
                        <option value="">-- Pilih Kegiatan --</option>
                        {kegiatanList.map(k => <option key={k.id} value={k.id}>{k.nama_kegiatan}</option>)}
                    </select>
                </div>
            </div>

            {loading.rencana ? <div className="flex justify-center py-10"><div className="loader"></div></div> :
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penanggung Jawab</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioritas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200" data-cy="rencana-aksi-table-body">
                            {rencanaAksiList.map(item => (
                                <tr key={item.id} data-cy={`rencana-aksi-row-${item.id}`}>
                                    <td className="px-6 py-4 whitespace-normal w-1/3">{item.deskripsi_aksi}</td>
                                    <td className="px-6 py-4">{item.assigned_to?.name || '-'}</td>
                                    <td className="px-6 py-4">{item.priority}</td>
                                    <td className="px-6 py-4">{item.status}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${item.latest_progress?.progress_percentage || 0}%` }}></div>
                                            </div>
                                            {item.latest_progress?.is_late && (
                                                <FiAlertTriangle className="ml-2 text-yellow-500" title="Progress dilaporkan terlambat" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleOpenTodoModal(item)} className="text-gray-600 hover:text-gray-900 mr-4" data-cy={`todo-progress-button-${item.id}`}>To-Do & Progress</button>
                                        <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900" data-cy={`edit-rencana-aksi-button-${item.id}`}>Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 ml-4" data-cy={`delete-rencana-aksi-button-${item.id}`}>Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
            {isModalOpen && <RencanaAksiModal
                isOpen={isModalOpen}
                currentData={currentItem}
                kegiatanId={selectedKegiatan}
                jabatanTree={jabatanTree}
                onClose={handleCloseModal}
                onSave={fetchRencanaAksi}
            />}
            {isTodoModalOpen && <TodoModal rencanaAksi={selectedRencanaAksi} onClose={handleCloseTodoModal} onUpdate={fetchRencanaAksi} />}
        </div>
    );
}

export default RencanaAksiPage;