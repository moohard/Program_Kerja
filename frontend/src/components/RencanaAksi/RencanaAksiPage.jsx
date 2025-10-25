import React, { useState, useEffect, useCallback, useContext } from 'react';
import AuthContext from '@/context/AuthContext';
import apiClient from '@/services/apiClient';
import RencanaAksiModal from '@/components/modals/RencanaAksiModal';
import TodoModal from '@/components/modals/TodoModal';
import { FiPlus, FiAlertTriangle, FiList, FiEdit, FiTrash2 } from 'react-icons/fi';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'react-toastify';
import { showConfirmationToast } from '@/components/common/ConfirmationToast';

function RencanaAksiPage() {
    const { can } = usePermissions();
    const [kategoriList, setKategoriList] = useState([]);
    const [kegiatanList, setKegiatanList] = useState([]);
    const [rencanaAksiList, setRencanaAksiList] = useState([]);
    const [jabatanTree, setJabatanTree] = useState([]);

    const [selectedKategori, setSelectedKategori] = useState('');
    const [selectedKegiatan, setSelectedKegiatan] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const [loading, setLoading] = useState({ kategori: false, kegiatan: false, rencana: false });
    const [currentItem, setCurrentItem] = useState(null);

    const [selectedRencanaAksi, setSelectedRencanaAksi] = useState(null);
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(prev => ({ ...prev, kategori: true }));
            try {
                const [kategoriRes, jabatanRes] = await Promise.all([
                    apiClient.get('/kategori-utama'),
                    apiClient.get('/jabatan/assignable-tree')
                ]);
                setKategoriList(kategoriRes.data.data);
                setJabatanTree(jabatanRes.data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(prev => ({ ...prev, kategori: false }));
            }
        };
        fetchInitialData();
    }, []);

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

    const fetchRencanaAksi = useCallback(async () => {
        if (!selectedKegiatan) return;
        setLoading(prev => ({ ...prev, rencana: true }));
        try {
            let url = `/rencana-aksi?kegiatan_id=${selectedKegiatan}`;
            if (selectedDate) {
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

    useEffect(() => {
        if (!loading.rencana && window.HSStaticMethods) {
            window.HSStaticMethods.autoInit();
        }
    }, [rencanaAksiList, loading.rencana]);

    const handleKategoriChange = (e) => {
        const kategoriId = e.target.value;
        setSelectedKategori(kategoriId);
        fetchKegiatan(kategoriId);
    };

    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
    };

    const handleOpenTodoModal = (item) => {
        setSelectedRencanaAksi(item);
    };

    const handleRencanaAksiSelect = (item) => {
        setSelectedRencanaAksi(item);
    };

    const handleCloseTodoModal = (shouldRefetch = false) => {
        setSelectedRencanaAksi(null); // Close the modal
        if (shouldRefetch) {
            fetchRencanaAksi();
        }
    };

    const handleDelete = async (id) => {
        showConfirmationToast('Apakah Anda yakin ingin menghapus item ini?', async () => {
            try {
                await apiClient.delete(`/rencana-aksi/${id}`);
                fetchRencanaAksi();
                toast.success('Rencana aksi berhasil dihapus.');
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Gagal menghapus item.');
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold">Rencana Aksi</h1>
                {can('create rencana aksi') && (
                    <button
                        type="button"
                        onClick={() => handleOpenModal(null)}
                        disabled={!selectedKegiatan}
                        className="btn bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        data-hs-overlay="#rencana-aksi-modal"
                    >
                        <FiPlus className="mr-2" />
                        Tambah Rencana Aksi
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">Kategori Utama</label>
                    <select id="kategori" value={selectedKategori} onChange={handleKategoriChange} className="form-select w-full" data-cy="kategori-select">
                        <option value="">-- Pilih Kategori --</option>
                        {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nomor}. {k.nama_kategori}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700 mb-1">Kegiatan</label>
                    <select id="kegiatan" value={selectedKegiatan} onChange={(e) => setSelectedKegiatan(e.target.value)} disabled={!selectedKategori || loading.kegiatan} className="form-select w-full" data-cy="kegiatan-select">
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
                        className="form-select w-full"
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
                                                <button type="button" onClick={() => handleOpenModal(item)} className="flex items-center text-indigo-600 hover:text-indigo-900" data-cy={`edit-rencana-aksi-button-${item.id}`} data-hs-overlay="#rencana-aksi-modal">
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
                                    <button type="button" onClick={() => handleOpenModal(item)} className="flex items-center text-indigo-600 hover:text-indigo-900 text-sm" data-cy={`edit-rencana-aksi-button-${item.id}`} data-hs-overlay="#rencana-aksi-modal">
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
            <RencanaAksiModal
                key={currentItem ? currentItem.id : 'new-item'}
                currentData={currentItem}
                kegiatanId={selectedKegiatan}
                jabatanTree={jabatanTree}
                onSaveSuccess={fetchRencanaAksi}
            />
            {selectedRencanaAksi && <TodoModal 
                modalId="todo-modal"
                rencanaAksi={selectedRencanaAksi} 
                selectedDate={selectedDate}
                jabatanTree={jabatanTree}
                onClose={handleCloseTodoModal} 
            />}
        </div>
    );
}


export default RencanaAksiPage;