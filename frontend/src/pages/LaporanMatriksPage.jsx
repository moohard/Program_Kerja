import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';
import { FiDownload, FiPrinter } from 'react-icons/fi';

const LaporanMatriksPage = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false); // For Excel
    const [pdfExporting, setPdfExporting] = useState(false); // For PDF

    const fetchReport = async () => {
        if (!year) return;
        setLoading(true);
        try {
            const response = await apiClient.get(`/reports/matrix?year=${year}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching matrix report:", error);
            alert('Gagal memuat data laporan. Pastikan backend berjalan dan tidak ada error.');
            setReportData({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [year]);

    const processedData = useMemo(() => {
        if (Object.keys(reportData).length === 0) return [];
        return Object.entries(reportData).map(([kategoriNama, aksiList]) => {
            const kegiatanGrouped = aksiList.reduce((acc, aksi) => {
                const kegiatanId = aksi.kegiatan.nama_kegiatan; // Group by name for simplicity
                if (!acc[kegiatanId]) {
                    acc[kegiatanId] = {
                        kegiatan_nama: aksi.kegiatan.nama_kegiatan,
                        rencana_aksi: []
                    };
                }
                acc[kegiatanId].rencana_aksi.push(aksi);
                return acc;
            }, {});
            return {
                kategori_nama: kategoriNama,
                total_rows: aksiList.length,
                kegiatan_list: Object.values(kegiatanGrouped)
            };
        });
    }, [reportData]);

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const response = await apiClient.get(`/reports/export-matrix?year=${year}&format=excel`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Matriks_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error(`Error exporting to Excel:`, error);
            alert(`Gagal mengekspor laporan ke Excel.`);
        } finally {
            setExporting(false);
        }
    };

    const handleExportPdf = async () => {
        setPdfExporting(true);
        try {
            const response = await apiClient.get(`/reports/export-matrix?year=${year}&format=pdf`);
            if (response.data.download_url) {
                window.open(response.data.download_url, '_blank');
            }
        } catch (error) {
            console.error(`Error exporting to PDF:`, error);
            alert(`Gagal mengekspor laporan ke PDF.`);
        } finally {
            setPdfExporting(false);
        }
    };

    const getProgressColor = (progress) => {
        if (progress === null || progress === undefined) return 'bg-gray-50';
        if (progress == 100) return 'bg-green-200 text-green-800';
        if (progress > 0) return 'bg-yellow-200 text-yellow-800';
        return 'bg-blue-200 text-blue-800';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0 no-print">
                <h1 className="text-2xl font-bold">Laporan Matriks Kinerja</h1>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="p-2 border rounded-md"
                    >
                        {[0, 1, 2, 3, 4].map(i => <option key={currentYear - i} value={currentYear - i}>{currentYear - i}</option>)}
                    </select>
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting || pdfExporting}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        <FiDownload className="mr-2" /> {exporting ? 'Mengekspor...' : 'Ekspor Excel'}
                    </button>
                    <button
                        onClick={handleExportPdf}
                        disabled={pdfExporting || exporting}
                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                        <FiPrinter className="mr-2" /> {pdfExporting ? 'Membuat PDF...' : 'Ekspor PDF'}
                    </button>
                </div>
            </div>

            {loading ? <div className="flex justify-center py-10"><div className="loader"></div></div> :
                <div id="print-area">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <h2 className="text-xl font-semibold text-center mb-4">PROGRAM KERJA TAHUN {year}</h2>
                        <table className="min-w-full bg-white border-collapse border border-gray-400 text-xs">
                            {/* ... existing table code ... */}
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block lg:hidden">
                        <h2 className="text-xl font-semibold text-center mb-4">PROGRAM KERJA TAHUN {year}</h2>
                        <div className="space-y-4">
                            {processedData.flatMap(kategoriData =>
                                kategoriData.kegiatan_list.flatMap(kegiatanData =>
                                    kegiatanData.rencana_aksi.map(item => (
                                        <div key={item.id} className="border rounded-lg p-4 shadow">
                                            <div className="font-bold text-lg mb-2">{item.deskripsi_aksi}</div>
                                            
                                            <div className="text-sm text-gray-600 mb-1"><strong>Kegiatan:</strong> {kegiatanData.kegiatan_nama}</div>
                                            <div className="text-sm text-gray-600 mb-1"><strong>P. Jawab:</strong> {item.assigned_to?.name || '-'}</div>
                                            <div className="text-sm text-gray-600 mb-3"><strong>Status:</strong> {item.status.replace('_', ' ')}</div>

                                            <h4 className="font-semibold mb-2">Progress Bulanan (%)</h4>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"].map((m, i) => {
                                                    const month = i + 1;
                                                    const progress = item.monthly_progress[month] ?? null;
                                                    return (
                                                        <div key={m} className={`p-2 rounded ${getProgressColor(progress)}`}>
                                                            <div className="font-bold text-xs">{m}</div>
                                                            <div className="text-sm">{progress !== null ? `${progress}%` : '-'}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default LaporanMatriksPage;


