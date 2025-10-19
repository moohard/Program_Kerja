import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import JabatanSelector from '../form/JabatanSelector';

const RencanaAksiModal = ({ isOpen, onClose, onSave, currentData, kegiatanId, jabatanTree }) => {
    const [formData, setFormData] = useState({
        deskripsi_aksi: '',
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

    useEffect(() => {
        if (isOpen) {
            if (currentData) {
                const assignedToId = typeof currentData.assigned_to === 'object' && currentData.assigned_to !== null
                    ? currentData.assigned_to.id
                    : currentData.assigned_to;

                setFormData({
                    deskripsi_aksi: currentData.deskripsi_aksi || '',
                    assigned_to: assignedToId || '',
                    priority: currentData.priority || 'medium',
                    catatan: currentData.catatan || '',
                    jadwal_tipe: currentData.jadwal_tipe || 'insidentil',
                    jadwal_config: {
                        months: currentData.jadwal_config?.months || [],
                        periode: currentData.jadwal_config?.periode || '',
                        hari: currentData.jadwal_config?.hari || [],
                    },
                });
            } else {
                setFormData({
                    deskripsi_aksi: '',
                    assigned_to: '',
                    priority: 'medium',
                    catatan: '',
                    jadwal_tipe: 'insidentil',
                    jadwal_config: { months: [], periode: '', hari: [] },
                });
            }
            setErrors({});
        }
    }, [isOpen, currentData]);

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
            assigned_to: formData.assigned_to || null,
        };

        try {
            if (currentData) {
                await apiClient.put(`/rencana-aksi/${currentData.id}`, dataToSend);
            } else {
                await apiClient.post('/rencana-aksi', dataToSend);
            }
            onSave();
            onClose();
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" data-cy="rencana-aksi-modal">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{currentData ? 'Edit' : 'Tambah'} Rencana Aksi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Deskripsi */}
                    <div>
                        <label htmlFor="deskripsi_aksi" className="block text-sm font-medium text-gray-700">Deskripsi Rencana Aksi</label>
                        <textarea
                            id="deskripsi_aksi"
                            name="deskripsi_aksi"
                            value={formData.deskripsi_aksi}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            data-cy="deskripsi-input"
                        />
                        {errors.deskripsi_aksi && <p className="text-red-500 text-xs mt-1">{errors.deskripsi_aksi[0]}</p>}
                    </div>

                    {/* ... form fields ... */}
                    <JabatanSelector
                        jabatanTree={jabatanTree}
                        selectedUser={formData.assigned_to}
                        onChange={handleChange}
                        data-cy="jabatan-selector"
                    />

                    {/* Prioritas */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioritas</label>
                        <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="low">Rendah</option>
                            <option value="medium">Sedang</option>
                            <option value="high">Tinggi</option>
                        </select>
                        {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority[0]}</p>}
                    </div>

                    {/* Tipe Jadwal */}
                    <div>
                        <label htmlFor="jadwal_tipe" className="block text-sm font-medium text-gray-700">Tipe Jadwal</label>
                        <select id="jadwal_tipe" name="jadwal_tipe" value={formData.jadwal_tipe} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" data-cy="jadwal-tipe-select">
                            <option value="insidentil">Insidentil (Tidak Wajib)</option>
                            <option value="bulanan">Bulanan (Wajib Lapor)</option>
                            <option value="periodik">Periodik (Otomatis)</option>
                            <option value="rutin">Rutin (Mingguan - Diabaikan di Laporan)</option>
                        </select>
                        {errors.jadwal_tipe && <p className="text-red-500 text-xs mt-1">{errors.jadwal_tipe[0]}</p>}
                    </div>

                    {/* Konfigurasi Jadwal */}
                    <div data-cy="jadwal-config-insidentil">
                        <label className="block text-sm font-medium text-gray-700">Konfigurasi Jadwal</label>
                        {renderJadwalInputs()}
                        {errors.jadwal_config && <p className="text-red-500 text-xs mt-1">{errors.jadwal_config[0]}</p>}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300" data-cy="cancel-button">Batal</button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300" data-cy="save-rencana-aksi-button">
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RencanaAksiModal;
