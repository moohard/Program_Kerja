import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const DashboardFilter = ({ filters, onFilterChange }) => {
    const [programKerjaList, setProgramKerjaList] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [userList, setUserList] = useState([]);

    // Fetch data for filter dropdowns
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [programKerjaRes, usersRes] = await Promise.all([
                    apiClient.get('/program-kerja'),
                    apiClient.get('/users') // Assuming this endpoint exists
                ]);
                setProgramKerjaList(programKerjaRes.data);
                setUserList(usersRes.data.data); // Adjust based on actual user API response structure
            } catch (error) {
                console.error("Failed to fetch filter data:", error);
            }
        };
        fetchFilterData();
    }, []);

    // Fetch categories when program_kerja_id changes
    useEffect(() => {
        if (filters.program_kerja_id) {
            apiClient.get(`/kategori-utama?program_kerja_id=${filters.program_kerja_id}`)
                .then(res => setKategoriList(res.data.data))
                .catch(err => console.error("Failed to fetch categories:", err));
        } else {
            setKategoriList([]);
        }
    }, [filters.program_kerja_id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // When year changes, reset category
        const newFilters = name === 'program_kerja_id' ? { ...filters, [name]: value, kategori_id: '' } : { ...filters, [name]: value };
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filter by Year (Program Kerja) */}
                <select name="program_kerja_id" value={filters.program_kerja_id} onChange={handleInputChange} className="block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">Semua Tahun Program</option>
                    {programKerjaList.map(pk => (
                        <option key={pk.id} value={pk.id}>{pk.tahun}</option>
                    ))}
                </select>

                {/* Filter by Category */}
                <select name="kategori_id" value={filters.kategori_id} onChange={handleInputChange} className="block w-full border-gray-300 rounded-md shadow-sm" disabled={!filters.program_kerja_id}>
                    <option value="">Semua Kategori</option>
                    {kategoriList.map(k => (
                        <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                    ))}
                </select>

                {/* Filter by User */}
                <select name="user_id" value={filters.user_id} onChange={handleInputChange} className="block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">Semua Penanggung Jawab</option>
                    {userList.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>

                {/* Filter by Status */}
                <select name="status" value={filters.status} onChange={handleInputChange} className="block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">Semua Status</option>
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                </select>
            </div>
        </div>
    );
};

export default DashboardFilter;
