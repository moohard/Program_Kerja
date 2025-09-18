import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { FiCalendar, FiDownload } from 'react-icons/fi';

const LaporanMatriksPage = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [years, setYears] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Buat daftar tahun dari tahun ini hingga 5 tahun ke belakang
        const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
        setYears(yearOptions);
        fetchReport(currentYear);
    }, []);

    const fetchReport = async (selectedYear) => {
        setLoading(true);
        setError('');
        setData([]);
        try {
            const response = await apiClient.get('/reports/matrix', {
                params: { year: selectedYear }
            });
            setData(response.data);
        } catch (err) {
            setError('Gagal memuat data laporan. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleYearChange = (e) => {
        const newYear = e.target.value;
        setYear(newYear);
        fetchReport(newYear);
    };

    const getStatusBadge = (status) => {
        if (!status) return <td className="border px-2 py-2"></td>;

        let bgColor = '';
        switch (status) {
            case 'completed': bgColor = 'bg-green-200 text-green-800'; break;
            case 'in_progress': bgColor = 'bg-blue-200 text-blue-800'; break;
            case 'delayed': bgColor = 'bg-red-200 text-red-800'; break;
            case 'planned': bgColor = 'bg-yellow-200 text-yellow-800'; break;
            default: bgColor = 'bg-gray-200 text-gray-800';
        }
        return <td className={`border px-2 py-2 text-center text-xs font-semibold ${bgColor}`}>{status.replace('_', ' ')}</td>;
    }

    const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Laporan Matriks Tahunan</h1>

            {/* Filter */}
            <div className="flex items-center space-x-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                    <FiCalendar className="text-gray-500 mr-2" />
                    <select
                        value={year}
                        onChange={handleYearChange}
                        className="p-2 border rounded-md"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <FiDownload className="mr-2" />
                    Cetak / Simpan PDF
                </button>
            </div>

            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {/* Tabel Laporan */}
            {!loading && data.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle w-10">NO</th>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle w-1/6">Kegiatan Utama</th>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle w-1/6">Kegiatan</th>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle w-1/4">Rencana Aksi Kegiatan</th>
                                <th colSpan="12" className="border px-2 py-2 text-center">SCHEDULE TIME</th>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle">TARGET (%)</th>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle">OUTPUT</th>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle">PENANGGUNG JAWAB</th>
                                <th rowSpan="2" className="border px-2 py-2 text-center align-middle">Terlaksana / Belum Terlaksana</th>
                            </tr>
                            <tr>
                                {months.map(m => <th key={m} className="border px-1 py-2 text-center text-xs w-12">{m}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((kategori, katIndex) => (
                                <React.Fragment key={kategori.kategori_id}>
                                    {kategori.kegiatan.map((kegiatan, kegIndex) => (
                                        <React.Fragment key={kegiatan.kegiatan_id}>
                                            {kegiatan.rencana_aksi.map((aksi, aksiIndex) => (
                                                <tr key={aksi.id}>
                                                    {kegIndex === 0 && aksiIndex === 0 && (
                                                        <td rowSpan={kategori.kegiatan.reduce((acc, curr) => acc + curr.rencana_aksi.length, 0)} className="border px-2 py-2 text-center align-top">{kategori.kategori_nomor}</td>
                                                    )}
                                                    {aksiIndex === 0 && (
                                                        <td rowSpan={kegiatan.rencana_aksi.length} className="border px-2 py-2 align-top">{kategori.kategori_nama}</td>
                                                    )}
                                                    {aksiIndex === 0 && (
                                                        <td rowSpan={kegiatan.rencana_aksi.length} className="border px-2 py-2 align-top">{kegiatan.kegiatan_nama}</td>
                                                    )}
                                                    <td className="border px-2 py-2">{aksi.deskripsi}</td>
                                                    {Object.values(aksi.schedule_time).map((status, monthIndex) => getStatusBadge(status, monthIndex))}
                                                    <td className="border px-2 py-2 text-center">{aksi.target}</td>
                                                    <td className="border px-2 py-2">{aksi.output}</td>
                                                    <td className="border px-2 py-2">{aksi.penanggung_jawab}</td>
                                                    <td className="border px-2 py-2">{aksi.terlaksana}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && data.length === 0 && !error && <p>Tidak ada data laporan untuk tahun yang dipilih.</p>}
        </div>
    );
};

export default LaporanMatriksPage;
