import React, { useState } from 'react';
import apiClient from '../services/apiClient';
import { FiCalendar, FiFileText } from 'react-icons/fi';

function LaporanPage() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handleGenerateReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            const response = await apiClient.get('/reports/monthly', {
                params: { year, month }
            });
            setReportData(response.data.data);
        } catch (error) {
            console.error("Gagal membuat laporan:", error);
            alert("Gagal membuat laporan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><FiCalendar className="mr-3" /> Buat Laporan Bulanan</h1>

                {/* Filter Section */}
                <div className="flex flex-wrap items-end gap-4 mb-4">
                    <div>
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">Tahun</label>
                        <select id="year" value={year} onChange={e => setYear(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700">Bulan</label>
                        <select id="month" value={month} onChange={e => setMonth(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                        </select>
                    </div>
                    <button onClick={handleGenerateReport} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center">
                        <FiFileText className="mr-2" />
                        {loading ? 'Membuat...' : 'Buat Laporan'}
                    </button>
                </div>
            </div>

            {/* Report Display Section */}
            {loading && <div className="flex justify-center items-center h-40"><div className="loader"></div></div>}

            {reportData && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {reportData.length > 0 ? (
                        <div className="space-y-8">
                            {reportData.map(kategori => (
                                <div key={kategori.id}>
                                    <h2 className="text-xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4">
                                        {kategori.nomor}. {kategori.nama_kategori}
                                    </h2>
                                    {kategori.kegiatan.map(kg => kg.rencana_aksi.map(ra => (
                                        <div key={ra.id} className="p-4 mb-3 border rounded-lg">
                                            <p className="font-semibold">{ra.deskripsi_aksi}</p>
                                            <div className="flex flex-wrap text-sm text-gray-600 mt-2 gap-x-6 gap-y-1">
                                                <span><strong>Status:</strong> {ra.status}</span>
                                                <span><strong>Target:</strong> {ra.target_tanggal_formatted}</span>
                                                <span><strong>PIC:</strong> {ra.assigned_user?.name || 'N/A'}</span>
                                                <span><strong>Progress:</strong> {ra.latest_progress}%</span>
                                            </div>
                                        </div>
                                    )))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">Tidak ada data rencana aksi yang ditemukan untuk periode yang dipilih.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default LaporanPage;
