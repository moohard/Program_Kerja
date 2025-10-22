import React, { useState, useEffect } from 'react';

const JabatanForm = ({ onSave, onCancel, jabatan, jabatanList }) => {
    const [formData, setFormData] = useState({
        nama_jabatan: '',
        bidang: '',
        parent_id: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (jabatan) {
            setFormData({
                nama_jabatan: jabatan.nama_jabatan || '',
                bidang: jabatan.bidang || '',
                parent_id: jabatan.parent_id || '',
            });
        }
    }, [jabatan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple validation
        const newErrors = {};
        if (!formData.nama_jabatan) newErrors.nama_jabatan = 'Nama Jabatan tidak boleh kosong.';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(formData);
    };

    // Filter out the current jabatan from the list of potential parents to prevent self-assignment
    const parentOptions = jabatanList.filter(j => j.id !== jabatan?.id);

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="nama_jabatan" className="block text-sm font-medium text-gray-700">Nama Jabatan</label>
                <input
                    type="text"
                    name="nama_jabatan"
                    id="nama_jabatan"
                    value={formData.nama_jabatan}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.nama_jabatan && <p className="text-red-500 text-xs mt-1">{errors.nama_jabatan}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="bidang" className="block text-sm font-medium text-gray-700">Bidang</label>
                <select
                    name="bidang"
                    id="bidang"
                    value={formData.bidang}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">Pilih Bidang</option>
                    <option value="pimpinan">Pimpinan</option>
                    <option value="kesekretariatan">Kesekretariatan</option>
                    <option value="kepaniteraan">Kepaniteraan</option>
                    <option value="teknis">Teknis</option>
                    <option value="hakim">Hakim</option>
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">Atasan Langsung (Opsional)</label>
                <select
                    name="parent_id"
                    id="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">Tidak Ada Atasan</option>
                    {parentOptions.map(j => (
                        <option key={j.id} value={j.id}>{j.nama_jabatan}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                    Batal
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Simpan
                </button>
            </div>
        </form>
    );
};

export default JabatanForm;
