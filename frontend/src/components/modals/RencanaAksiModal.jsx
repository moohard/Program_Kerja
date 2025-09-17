import React, { useState } from 'react';

function RencanaAksiModal({ item, users, onClose, onSave }) {
    const [formData, setFormData] = useState({
        nomor_aksi: item?.nomor_aksi || '',
        deskripsi_aksi: item?.deskripsi_aksi || '',
        assigned_to: item?.assigned_to || '',
        target_tanggal: item?.target_tanggal || '',
        priority: item?.priority || 'medium',
        jadwal_tipe: item?.jadwal_tipe || 'insidentil',
        catatan: item?.catatan || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto pt-10">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mb-10">
                <h2 className="text-xl font-bold mb-4">{item ? 'Edit' : 'Tambah'} Rencana Aksi</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nomor Aksi</label>
                            <input name="nomor_aksi" value={formData.nomor_aksi} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Target Selesai</label>
                            <input type="date" name="target_tanggal" value={formData.target_tanggal} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Deskripsi Aksi*</label>
                        <textarea name="deskripsi_aksi" value={formData.deskripsi_aksi} onChange={handleChange} required rows="4" className="mt-1 block w-full border-gray-300 rounded-md"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Penanggung Jawab</label>
                            <select name="assigned_to" value={formData.assigned_to} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md">
                                <option value="">-- Tidak Ditugaskan --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Prioritas*</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md">
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tipe Jadwal*</label>
                            <select name="jadwal_tipe" value={formData.jadwal_tipe} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md">
                                <option value="insidentil">Insidentil</option>
                                <option value="periodik">Periodik</option>
                                <option value="rutin">Rutin</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Catatan</label>
                        <textarea name="catatan" value={formData.catatan} onChange={handleChange} rows="2" className="mt-1 block w-full border-gray-300 rounded-md"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RencanaAksiModal;
