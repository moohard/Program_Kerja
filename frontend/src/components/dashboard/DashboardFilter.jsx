import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';

function DashboardFilter({ filters, onFilterChange }) {
    const [programKerjaOptions, setProgramKerjaOptions] = useState([]);
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [kegiatanOptions, setKegiatanOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [statusOptions] = useState([
        { id: 'planned', name: 'planned' },
        { id: 'in_progress', name: 'in_progress' },
        { id: 'completed', name: 'completed' },
        { id: 'delayed', name: 'delayed' },
    ]);
    const [displayTypeOptions] = useState([
        { id: 'kategori', name: 'Per Kategori Utama' },
        { id: 'kegiatan', name: 'Per Kegiatan' },
        { id: 'rencana_aksi', name: 'Per Rencana Aksi' },
    ]);

    const handleFilterChange = useCallback((name, value) => {
        const newFilters = { ...filters, [name]: value };

        if (name === 'program_kerja_id') {
            newFilters.kategori_id = '';
            newFilters.kegiatan_id = '';
        }
        if (name === 'kategori_id') {
            newFilters.kegiatan_id = '';
        }
        if (name === 'display_type') {
            // Reset contextual filters when display type changes
            if (value === 'kategori') {
                newFilters.kategori_id = '';
                newFilters.kegiatan_id = '';
            }
            if (value === 'kegiatan') {
                newFilters.kegiatan_id = '';
            }
        }
        onFilterChange(newFilters);
    }, [filters, onFilterChange]);

    useEffect(() => {
        const fetchInitialOptions = async () => {
            try {
                const [programRes, userRes] = await Promise.all([
                    apiClient.get('/program-kerja'),
                    apiClient.get('/users')
                ]);
                const programData = programRes.data.data || [];
                setProgramKerjaOptions(programData);
                setUserOptions(userRes.data.data || []);
                
                if (!filters.program_kerja_id && programData.length > 0) {
                    const activeProgram = programData.find(p => p.is_aktif) || programData[0];
                    handleFilterChange('program_kerja_id', activeProgram.id);
                }
            } catch (error) {
                console.error("Failed to fetch initial filter options:", error);
            }
        };
        fetchInitialOptions();
    }, []);

    useEffect(() => {
        const fetchDependentOptions = async () => {
            if (filters.program_kerja_id) {
                try {
                    const response = await apiClient.get(`/program-kerja/${filters.program_kerja_id}/filter-options`);
                    setKategoriOptions(response.data.kategori_utama || []);
                } catch (error) {
                    console.error("Failed to fetch kategori/kegiatan options:", error);
                    setKategoriOptions([]);
                }
            } else {
                setKategoriOptions([]);
            }
        };
        fetchDependentOptions();
    }, [filters.program_kerja_id]);

    useEffect(() => {
        if (filters.kategori_id) {
            const selectedKategori = kategoriOptions.find(k => k.id === parseInt(filters.kategori_id));
            setKegiatanOptions(selectedKategori ? selectedKategori.kegiatan : []);
        } else {
            setKegiatanOptions([]);
        }
    }, [filters.kategori_id, kategoriOptions]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Program Kerja */}
                <select name="program_kerja_id" value={filters.program_kerja_id} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="form-select">
                    <option value="">Pilih Program Kerja</option>
                    {programKerjaOptions.map(pk => <option key={pk.id} value={pk.id}>{pk.tahun}</option>)}
                </select>

                {/* Tipe Tampilan */}
                <select name="display_type" value={filters.display_type} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="form-select">
                    {displayTypeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                </select>

                {/* Kategori Utama (Contextual) */}
                {['kegiatan', 'rencana_aksi'].includes(filters.display_type) && (
                    <select name="kategori_id" value={filters.kategori_id} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="form-select" disabled={!filters.program_kerja_id}>
                        <option value="">Semua Kategori</option>
                        {kategoriOptions.map(kat => <option key={kat.id} value={kat.id}>{kat.nomor}. {kat.nama_kategori}</option>)}
                    </select>
                )}

                {/* Kegiatan (Contextual) */}
                {filters.display_type === 'rencana_aksi' && (
                    <select name="kegiatan_id" value={filters.kegiatan_id} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="form-select" disabled={!filters.kategori_id}>
                        <option value="">Semua Kegiatan</option>
                        {kegiatanOptions.map(keg => <option key={keg.id} value={keg.id}>{keg.nama_kegiatan}</option>)}
                    </select>
                )}

                {/* User */}
                <select name="user_id" value={filters.user_id} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="form-select">
                    <option value="">Semua P. Jawab</option>
                    {userOptions.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>

                {/* Status */}
                <select name="status" value={filters.status} onChange={(e) => handleFilterChange(e.target.name, e.target.value)} className="form-select">
                    <option value="">Semua Status</option>
                    {statusOptions.map(status => <option key={status.id} value={status.id}>{status.name}</option>)}
                </select>
            </div>
        </div>
    );
}

export default DashboardFilter;