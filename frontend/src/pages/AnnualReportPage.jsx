import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import StatCard from '../components/dashboard/StatCard';
import CategoryProgressChart from '../components/dashboard/CategoryProgressChart';
import { FiClipboard, FiCheckSquare, FiLoader, FiAlertTriangle, FiAward, FiDownload } from 'react-icons/fi';

const AnnualReportPage = () => {
    const [programKerjaList, setProgramKerjaList] = useState([]);
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        apiClient.get('/program-kerja').then(response => {
            const programData = response.data.data; // Correctly access the nested data array
            setProgramKerjaList(programData);
            const activeProgram = programData.find(p => p.is_aktif);
            if (activeProgram) {
                setSelectedProgramId(activeProgram.id);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedProgramId) {
            setLoading(true);
            setReportData(null);
            apiClient.get(`/reports/annual-summary?program_kerja_id=${selectedProgramId}`)
                .then(response => {
                    setReportData(response.data);
                })
                .catch(error => {
                    console.error("Failed to fetch annual report:", error);
                    setReportData(null);
                })
                .finally(() => setLoading(false));
        }
    }, [selectedProgramId]);

    const handleExport = () => {
        if (!selectedProgramId) return;

        setIsExporting(true);
        apiClient.post('/reports/export-annual-summary', {
            program_kerja_id: selectedProgramId,
            format: 'pdf',
        })
        .then(response => {
            if (response.data.download_url) {
                window.open(response.data.download_url, '_blank');
            }
        })
        .catch(error => {
            console.error("Failed to export report:", error);
            // You might want to show a notification to the user here
        })
        .finally(() => {
            setIsExporting(false);
        });
    };

    const total = reportData?.summary ? Object.values(reportData.summary).reduce((acc, val) => acc + val, 0) : 0;

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <label htmlFor="program-kerja-select" className="font-semibold">Pilih Tahun Program:</label>
                    <select 
                        id="program-kerja-select"
                        value={selectedProgramId}
                        onChange={e => setSelectedProgramId(e.target.value)}
                        className="block w-full max-w-xs border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="" disabled>Pilih tahun</option>
                        {programKerjaList.map(pk => (
                            <option key={pk.id} value={pk.id}>{pk.tahun}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleExport}
                    disabled={!selectedProgramId || loading || isExporting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isExporting ? <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <FiDownload className="-ml-1 mr-2 h-5 w-5" />}
                    {isExporting ? 'Mengekspor...' : 'Ekspor ke PDF'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><div className="loader"></div></div>
            ) : !reportData ? (
                <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow-sm">Pilih tahun program untuk melihat laporan.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Rencana Aksi" value={total} icon={<FiClipboard size={24}/>} color="blue" />
                        <StatCard title="Selesai" value={reportData.summary.completed || 0} icon={<FiCheckSquare size={24}/>} color="green" />
                        <StatCard title="Dalam Pengerjaan" value={reportData.summary.in_progress || 0} icon={<FiLoader size={24}/>} color="yellow" />
                        <StatCard title="Terlambat" value={reportData.summary.overdue || 0} icon={<FiAlertTriangle size={24}/>} color="red" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <CategoryProgressChart data={reportData.progress_by_category} />
                        </div>
                        <div className="bg-white shadow rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FiAward className="mr-2 text-yellow-500"/>Pencapaian Utama</h3>
                            <ul className="space-y-3">
                                {reportData.highlights && reportData.highlights.length > 0 ? (
                                    reportData.highlights.map(item => (
                                        <li key={item.id} className="text-sm text-gray-700 p-2 bg-green-50 rounded-md">
                                            <span className="font-semibold">{item.kegiatan.nama_kegiatan}:</span> {item.deskripsi_aksi}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Tidak ada pencapaian prioritas tinggi yang tercatat.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnnualReportPage;
