import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

const JabatanForm = ({ onSave, onCancel, jabatan, jabatanList }) => {
    const [formData, setFormData] = useState({
        nama_jabatan: '',
        bidang: '',
        parent_id: '',
        role: '', // Add role to form data
    });
    const [roles, setRoles] = useState([]); // State to store available roles
    const [errors, setErrors] = useState({});

    // Fetch available roles from the backend
    useEffect(() => {
        apiClient.get('/roles')
            .then(response => {
                setRoles(response.data);
            })
            .catch(error => {
                console.error("Error fetching roles:", error);
                // Optionally handle error, e.g., show a toast notification
            });
    }, []);

    // Effect to populate form when editing an existing 'jabatan'
    useEffect(() => {
        if (jabatan) {
            setFormData({
                nama_jabatan: jabatan.nama_jabatan || '',
                bidang: jabatan.bidang || '',
                parent_id: jabatan.parent_id || '',
                role: jabatan.role || '', // Set role from existing data
            });
        }
    }, [jabatan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.nama_jabatan) newErrors.nama_jabatan = 'Nama Jabatan tidak boleh kosong.';
        if (!formData.role) newErrors.role = 'Role tidak boleh kosong.'; // Add validation for role
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(formData);
    };

    // Filter out the current jabatan from the list of potential parents
    const parentOptions = jabatanList.filter(j => j.id !== jabatan?.id);

    return (
        <form onSubmit={handleSubmit}>
            {/* Nama Jabatan Input */}
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

            {/* Role Dropdown */}
            <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">Pilih Role</option>
                    {roles.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>

            {/* Bidang Dropdown */}
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

            {/* Parent (Atasan) Dropdown */}
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

            {/* Action Buttons */}
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