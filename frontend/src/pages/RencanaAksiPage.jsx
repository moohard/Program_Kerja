import React, { useState, useEffect, useCallback, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import RencanaAksiModal from '../components/modals/RencanaAksiModal';
import TodoModal from '../components/modals/TodoModal';
import { FiPlus, FiAlertTriangle, FiList, FiEdit, FiTrash2 } from 'react-icons/fi';

function RencanaAksiPage() {
    const [kategoriList, setKategoriList] = useState([]);
    const [kegiatanList, setKegiatanList] = useState([]);
    const [rencanaAksiList, setRencanaAksiList] = useState([]);
    const [jabatanTree, setJabatanTree] = useState([]);

    const [selectedKategori, setSelectedKategori] = useState('');
    const [selectedKegiatan, setSelectedKegiatan] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const [loading, setLoading] = useState({ kategori: false, kegiatan: false, rencana: false });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [selectedRencanaAksi, setSelectedRencanaAksi] = useState(null);
    const { user: currentUser } = useContext(AuthContext);

    // Fetch Kategori Utama, Jabatan Tree & Users
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(prev => ({ ...prev, kategori: true }));
            try {
                const [kategoriRes, jabatanRes] = await Promise.all([
                    apiClient.get('/kategori-utama'),
                    apiClient.get('/jabatan/assignable-tree')
                ]);
                setKategoriList(kategoriRes.data.data);
                setJabatanTree(jabatanRes.data); // The new endpoint returns the tree directly
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(prev => ({ ...prev, kategori: false }));
            }
        };
        fetchInitialData();
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

    // Fetch Rencana Aksi based on selected Kegiatan and Month
    const fetchRencanaAksi = useCallback(async () => {
        if (!selectedKegiatan) return;
        setLoading(prev => ({ ...prev, rencana: true }));
        try {
            let url = `/rencana-aksi?kegiatan_id=${selectedKegiatan}`;
            if (selectedDate) {
                // getMonth() is 0-indexed, so add 1 for the API
                url += `&month=${selectedDate.getMonth() + 1}`;
            }
            const response = await apiClient.get(url);
            setRencanaAksiList(response.data.data);
        } catch (error) {
            console.error("Error fetching rencana aksi:", error);
        } finally {
            setLoading(prev => ({ ...prev, rencana: false }));
        }
    }, [selectedKegiatan, selectedDate]);

    useEffect(() => {
        if (selectedKegiatan) {
            fetchRencanaAksi();
        }
    }, [selectedKegiatan, selectedDate, fetchRencanaAksi]);

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
        setSelectedRencanaAksi(item); // Simpan seluruh objek
        setIsTodoModalOpen(true);
    };
    const handleCloseTodoModal = (shouldRefetch = false) => {
        setIsTodoModalOpen(false);
        setSelectedRencanaAksi(null);
        if (shouldRefetch) {
            fetchRencanaAksi();
        }
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                    <select 
                        id="month" 
                        value={selectedDate ? selectedDate.getMonth() : ''} 
                        onChange={(e) => {
                            const month = e.target.value;
                            setSelectedDate(month ? new Date(new Date().getFullYear(), month, 1) : null);
                        }} 
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">-- Semua Bulan --</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading.rencana ? <div className="flex justify-center py-10"><div className="loader"></div></div> :
                <>
                    {/* Desktop Table View */}
                    <div className="overflow-x-auto hidden md:block">
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
                                        <td className="px-6 py-4">{item.monthly_status || item.status}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-green-500 h-2.5 rounded-full"
                                                        style={{ width: `${(selectedDate ? item.monthly_progress?.progress_percentage : item.overall_progress) || 0}%` }}>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {`${(selectedDate ? item.monthly_progress?.progress_percentage : item.overall_progress) || 0}%`}
                                                </span>
                                                {(selectedDate ? item.monthly_progress?.is_late : item.latest_progress?.is_late) ? (
                                                    <FiAlertTriangle className="ml-2 text-yellow-500" title="Progress dilaporkan terlambat" />
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleOpenTodoModal(item)} className="flex items-center text-gray-600 hover:text-gray-900" data-cy={`todo-progress-button-${item.id}`}>
                                                    <FiList size={18} /><span className="hidden md:inline ml-2">To-Do & Progress</span>
                                                </button>
                                                <button onClick={() => handleOpenModal(item)} className="flex items-center text-indigo-600 hover:text-indigo-900" data-cy={`edit-rencana-aksi-button-${item.id}`}>
                                                    <FiEdit size={18} /><span className="hidden md:inline ml-2">Edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="flex items-center text-red-600 hover:text-red-900" data-cy={`delete-rencana-aksi-button-${item.id}`}>
                                                    <FiTrash2 size={18} /><span className="hidden md:inline ml-2">Hapus</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="space-y-4 md:hidden">
                        {rencanaAksiList.map(item => (
                            <div key={item.id} className="border rounded-lg p-4 shadow-sm space-y-3">
                                <p className="font-semibold">{item.deskripsi_aksi}</p>
                                
                                <div className="text-sm">
                                    <strong>P. Jawab:</strong> {item.assigned_to?.name || '-'}
                                </div>
                                <div className="text-sm">
                                    <strong>Prioritas:</strong> {item.priority}
                                </div>
                                <div className="text-sm">
                                    <strong>Status:</strong> {item.monthly_status || item.status}
                                </div>

                                <div>
                                    <span className="text-sm font-medium">Progress:</span>
                                    <div className="flex items-center mt-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-green-500 h-2.5 rounded-full"
                                                style={{ width: `${(selectedDate ? item.monthly_progress?.progress_percentage : item.overall_progress) || 0}%` }}>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {`${(selectedDate ? item.monthly_progress?.progress_percentage : item.overall_progress) || 0}%`}
                                        </span>
                                        {(selectedDate ? item.monthly_progress?.is_late : item.latest_progress?.is_late) ? (
                                            <FiAlertTriangle className="ml-2 text-yellow-500" title="Progress dilaporkan terlambat" />
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-4 border-t pt-3 mt-3">
                                    <button onClick={() => handleOpenTodoModal(item)} className="flex items-center text-gray-600 hover:text-gray-900 text-sm" data-cy={`todo-progress-button-${item.id}`}>
                                        <FiList size={16} className="mr-1" /> To-Do
                                    </button>
                                    <button onClick={() => handleOpenModal(item)} className="flex items-center text-indigo-600 hover:text-indigo-900 text-sm" data-cy={`edit-rencana-aksi-button-${item.id}`}>
                                        <FiEdit size={16} className="mr-1" /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="flex items-center text-red-600 hover:text-red-900 text-sm" data-cy={`delete-rencana-aksi-button-${item.id}`}>
                                        <FiTrash2 size={16} className="mr-1" /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            }
            {isModalOpen && <RencanaAksiModal
                key={currentItem ? currentItem.id : 'new'}
                isOpen={isModalOpen}
                currentData={currentItem}
                kegiatanId={selectedKegiatan}
                jabatanTree={jabatanTree} // Use the direct tree
                onClose={handleCloseModal}
                onSave={fetchRencanaAksi}
            />}
            {isTodoModalOpen && <TodoModal 
                rencanaAksi={selectedRencanaAksi} 
                selectedDate={selectedDate}
                jabatanTree={jabatanTree}
                onClose={handleCloseTodoModal} 
            />}
        </div>
    );
}


export default RencanaAksiPage;