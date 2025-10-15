import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const RencanaAksiModal = ({ isOpen, onClose, onSave, currentData, kegiatanId, users }) => {
    const currentYear = new Date().getFullYear();
    const [formData, setFormData] = useState({
        deskripsi_aksi: '',
        assigned_to: '',
        priority: 'medium',
        catatan: '',
        schedule_months: [],
        year: currentYear,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    useEffect(() => {
        // Logika ini dijalankan setiap kali modal akan dibuka
        if (isOpen) {
            if (currentData) {
                // --- MODE EDIT ---
                // Jika ada 'currentData', isi form dengan data yang ada

                // Logika cerdas untuk menangani field 'assigned_to'
                const assignedToId = typeof currentData.assigned_to === 'object' && currentData.assigned_to !== null
                    ? currentData.assigned_to.id
                    : currentData.assigned_to;

                setFormData({
                    deskripsi_aksi: currentData.deskripsi_aksi || '',
                    assigned_to: assignedToId || '',
                    priority: currentData.priority || 'medium',
                    catatan: currentData.catatan || '',
                    schedule_months: currentData.jadwal_config?.months || [],
                    year: currentData.target_tanggal ? new Date(currentData.target_tanggal).getFullYear() : currentYear,
                });
            } else {
                // --- MODE TAMBAH BARU ---
                // Jika tidak ada 'currentData', reset form menjadi kosong
                setFormData({
                    deskripsi_aksi: '',
                    assigned_to: '',
                    priority: 'medium',
                    catatan: '',
                    schedule_months: [],
                    year: currentYear,
                });
            }
            // Selalu reset error setiap kali modal dibuka
            setErrors({});
        }
    }, [isOpen, currentData, currentYear]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMonthChange = (month) => {
        setFormData(prev => {
            const newMonths = prev.schedule_months.includes(month)
                ? prev.schedule_months.filter(m => m !== month)
                : [...prev.schedule_months, month];
            return { ...prev, schedule_months: newMonths };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const dataToSend = { ...formData, kegiatan_id: kegiatanId };
        if (!dataToSend.assigned_to) {
            dataToSend.assigned_to = null;
        }

        try {
            if (currentData) {
                try {
                    await apiClient.put(`/rencana-aksi/${currentData.id}`, dataToSend);

                } catch (error) {
                    console.error('Error details:', error.response?.data);
                }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors.deskripsi_aksi && <p className="text-red-500 text-xs mt-1">{errors.deskripsi_aksi[0]}</p>}
                    </div>

                    {/* Penanggung Jawab */}
                    <div>
                        <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Penanggung Jawab</label>
                        <select
                            id="assigned_to"
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Pilih Pengguna --</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                        {errors.assigned_to && <p className="text-red-500 text-xs mt-1">{errors.assigned_to[0]}</p>}
                    </div>

                    {/* Prioritas */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioritas</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Output / Catatan */}
                    <div>
                        <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Output / Catatan</label>
                        <input
                            type="text"
                            id="catatan"
                            name="catatan"
                            value={formData.catatan}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Jadwal Pelaksanaan */}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Jadwal Pelaksanaan</label>
                        <div className="grid grid-cols-4 gap-2 p-2 border rounded-md">
                            {months.map((name, index) => {
                                const monthNumber = index + 1;
                                return (
                                    <label key={monthNumber} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.schedule_months.includes(monthNumber)}
                                            onChange={() => handleMonthChange(monthNumber)}
                                            className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm">{name}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {errors.schedule_months && <p className="text-red-500 text-xs mt-1">{errors.schedule_months[0]}</p>}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                            Batal
                        </button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RencanaAksiModal;