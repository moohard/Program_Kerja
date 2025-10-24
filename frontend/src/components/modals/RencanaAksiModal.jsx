import React, { useState, useEffect, useContext } from 'react';
import apiClient from '@/services/apiClient';
import JabatanSelector from '../form/JabatanSelector';
import AuthContext from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { LuX } from 'react-icons/lu';

const RencanaAksiModal = ({ currentData, kegiatanId, jabatanTree, onSaveSuccess }) => {
    const { user: currentUser } = useContext(AuthContext);
    const { can } = usePermissions();

    const [formData, setFormData] = useState({
        deskripsi_aksi: '',
        target_tanggal: '',
        assigned_to: '',
        priority: 'medium',
        catatan: '',
        jadwal_tipe: 'insidentil',
        jadwal_config: {
            months: [],
            periode: '',
            hari: [],
        },
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const getPeriodeValue = (config) => {
        const periode = config?.periode || config?.interval;
        if (periode === 'monthly' || periode === 'quarterly') return 'triwulanan';
        if (periode === 'biannual') return 'semesteran';
        return periode;
    }

    useEffect(() => {
        if (currentData) {
            const assignedToId = typeof currentData.assigned_to === 'object' && currentData.assigned_to !== null
                ? currentData.assigned_to.id
                : currentData.assigned_to;

            setFormData({
                deskripsi_aksi: currentData.deskripsi_aksi || '',
                target_tanggal: currentData.target_tanggal ? currentData.target_tanggal.split('T')[0] : '',
                assigned_to: assignedToId || '',
                priority: currentData.priority || 'medium',
                catatan: currentData.catatan || '',
                jadwal_tipe: currentData.jadwal_tipe || 'insidentil',
                jadwal_config: {
                    months: currentData.jadwal_config?.months || [],
                    periode: getPeriodeValue(currentData.jadwal_config) || '',
                    hari: currentData.jadwal_config?.hari || [],
                },
            });
        } else {
            setFormData({
                deskripsi_aksi: '',
                target_tanggal: '',
                assigned_to: '',
                priority: 'medium',
                catatan: '',
                jadwal_tipe: 'insidentil',
                jadwal_config: { months: [], periode: '', hari: [] },
            });
        }
        setErrors({});
    }, [currentData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            jadwal_config: { ...prev.jadwal_config, [name]: value }
        }));
    };

    const handleMonthChange = (month) => {
        setFormData(prev => {
            const newMonths = prev.jadwal_config.months.includes(month)
                ? prev.jadwal_config.months.filter(m => m !== month)
                : [...prev.jadwal_config.months, month];
            return { ...prev, jadwal_config: { ...prev.jadwal_config, months: newMonths } };
        });
    };

    const handleDayChange = (day) => {
        setFormData(prev => {
            const newDays = prev.jadwal_config.hari.includes(day)
                ? prev.jadwal_config.hari.filter(d => d !== day)
                : [...prev.jadwal_config.hari, day];
            return { ...prev, jadwal_config: { ...prev.jadwal_config, hari: newDays } };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const { jadwal_tipe, jadwal_config, ...rest } = formData;
        let relevantConfig = {};
        if (jadwal_tipe === 'insidentil' || jadwal_tipe === 'bulanan') {
            relevantConfig = { months: jadwal_config.months };
        } else if (jadwal_tipe === 'periodik') {
            relevantConfig = { periode: jadwal_config.periode };
        } else if (jadwal_tipe === 'rutin') {
            relevantConfig = { hari: jadwal_config.hari };
        }

        const dataToSend = {
            ...rest,
            jadwal_tipe,
            jadwal_config: relevantConfig,
            kegiatan_id: kegiatanId,
            assigned_to: can('assign rencana aksi') ? (formData.assigned_to || null) : currentUser.id,
        };

        try {
            if (currentData) {
                await apiClient.put(`/rencana-aksi/${currentData.id}`, dataToSend);
            } else {
                await apiClient.post('/rencana-aksi', dataToSend);
            }
            onSaveSuccess();
            const closeButton = document.querySelector('#rencana-aksi-modal-close-btn');
            if (closeButton) closeButton.click();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Submit error:", error);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderJadwalInputs = () => {
        switch (formData.jadwal_tipe) {
            case 'insidentil':
            case 'bulanan':
                return (
                    <div className="grid grid-cols-4 gap-2 p-2 border rounded-md">
                        {months.map((name, index) => {
                            const monthNumber = index + 1;
                            return (
                                <label key={monthNumber} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.jadwal_config.months.includes(monthNumber)}
                                        onChange={() => handleMonthChange(monthNumber)}
                                        className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm">{name}</span>
                                </label>
                            );
                        })}
                    </div>
                );
            case 'periodik':
                return (
                    <select
                        name="periode"
                        value={formData.jadwal_config.periode}
                        onChange={handleConfigChange}
                        className="form-input"
                    >
                        <option value="">-- Pilih Periode --</option>
                        <option value="triwulanan">Triwulanan</option>
                        <option value="semesteran">Semesteran</option>
                    </select>
                );
            case 'rutin':
                return (
                    <div className="grid grid-cols-4 gap-2 p-2 border rounded-md">
                        {days.map((name, index) => (
                            <label key={index} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.jadwal_config.hari.includes(index)}
                                    onChange={() => handleDayChange(index)}
                                    className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm">{name}</span>
                            </label>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div id="rencana-aksi-modal" className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none">
            <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-2xl sm:w-full m-3 sm:mx-auto">
                <div className="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                    <div className="flex justify-between items-center py-3 px-4 border-b">
                        <h3 className="font-bold text-gray-800">
                            {currentData ? 'Edit' : 'Tambah'} Rencana Aksi
                        </h3>
                        <button id="rencana-aksi-modal-close-btn" type="button" className="flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none" data-hs-overlay="#rencana-aksi-modal">
                            <span className="sr-only">Close</span>
                            <LuX className="flex-shrink-0 size-4" />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[70vh]">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="deskripsi_aksi" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Rencana Aksi</label>
                                <textarea
                                    id="deskripsi_aksi"
                                    name="deskripsi_aksi"
                                    value={formData.deskripsi_aksi}
                                    onChange={handleChange}
                                    rows="3"
                                    className="form-textarea"
                                    data-cy="deskripsi-input"
                                />
                                {errors.deskripsi_aksi && <p className="text-red-500 text-xs mt-1">{errors.deskripsi_aksi[0]}</p>}
                            </div>

                            <div>
                                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">Penanggung Jawab</label>
                                {can('assign rencana aksi') ? (
                                    <JabatanSelector
                                        jabatanTree={jabatanTree}
                                        selectedUser={formData.assigned_to}
                                        onChange={handleChange}
                                        data-cy="jabatan-selector"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={currentUser.name}
                                        readOnly
                                        className="form-input bg-gray-100"
                                    />
                                )}
                                {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to[0]}</p>}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="target_tanggal" className="block text-sm font-medium text-gray-700 mb-1">Target Tanggal</label>
                                    <input
                                        type="date"
                                        id="target_tanggal"
                                        name="target_tanggal"
                                        value={formData.target_tanggal}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                    {errors.target_tanggal && <p className="text-red-500 text-xs mt-1">{errors.target_tanggal[0]}</p>}
                                </div>
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                                    <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="form-select">
                                        <option value="low">Rendah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="high">Tinggi</option>
                                    </select>
                                    {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority[0]}</p>}
                                </div>
                            </div>
                            

                            <div>
                                <label htmlFor="jadwal_tipe" className="block text-sm font-medium text-gray-700 mb-1">Tipe Jadwal</label>
                                <select id="jadwal_tipe" name="jadwal_tipe" value={formData.jadwal_tipe} onChange={handleChange} className="form-select" data-cy="jadwal-tipe-select">
                                    <option value="insidentil">Insidentil (Tidak Wajib)</option>
                                    <option value="bulanan">Bulanan (Wajib Lapor)</option>
                                    <option value="periodik">Periodik (Otomatis)</option>
                                    <option value="rutin">Rutin (Mingguan - Diabaikan di Laporan)</option>
                                </select>
                                {errors.jadwal_tipe && <p className="text-red-500 text-xs mt-1">{errors.jadwal_tipe[0]}</p>}
                            </div>

                            <div data-cy="jadwal-config-insidentil">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konfigurasi Jadwal</label>
                                {renderJadwalInputs()}
                                {errors.jadwal_config && <p className="text-red-500 text-xs mt-1">{errors.jadwal_config[0]}</p>}
                            </div>
                            <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t">
                                <button type="button" className="btn bg-gray-100 text-gray-800 hover:bg-gray-200" data-hs-overlay="#rencana-aksi-modal">
                                    Batal
                                </button>
                                <button type="submit" disabled={loading} className="btn bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300">
                                    {loading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RencanaAksiModal;