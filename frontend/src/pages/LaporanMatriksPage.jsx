import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../services/apiClient';
import { FiDownload, FiPrinter } from 'react-icons/fi';

const LaporanMatriksPage = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [reportData, setReportData] = useState({});
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

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
        console.table(Object.keys(reportData).map(key => ({
            Kategori: key,
            'Jumlah Aksi': reportData[key].length
        })));
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

    const handlePrint = () => {
        window.print();
    };

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const response = await apiClient.get(`/reports/export-matrix?year=${year}&format=${format}`, {
                responseType: 'blob', // Penting untuk menerima file
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'excel' ? 'xlsx' : 'zip';
            link.setAttribute('download', `Laporan_Matriks_${year}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error(`Error exporting to ${format}:`, error);
            alert(`Gagal mengekspor laporan ke ${format}.`);
        } finally {
            setExporting(false);
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
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-area, #print-area * {
                            visibility: visible;
                        }
                        #print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none;
                        }
                        table {
                            -webkit-print-color-adjust: exact;
                            color-adjust: exact;
                        }
                    }
                `}
            </style>

            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-2xl font-bold">Laporan Matriks Kinerja</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="p-2 border rounded-md"
                    >
                        {[0, 1, 2, 3, 4].map(i => <option key={currentYear - i} value={currentYear - i}>{currentYear - i}</option>)}
                    </select>
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={exporting}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
                    >
                        <FiDownload className="mr-2" /> {exporting ? 'Mengekspor...' : 'Ekspor Excel'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                        <FiPrinter className="mr-2" /> Cetak / Simpan PDF
                    </button>
                </div>
            </div>

            {loading ? <div className="flex justify-center py-10"><div className="loader"></div></div> :
                <div id="print-area" className="overflow-x-auto">
                    <h2 className="text-xl font-semibold text-center mb-4">PROGRAM KERJA TAHUN {year}</h2>
                    <table className="min-w-full bg-white border-collapse border border-gray-400 text-xs">
                        <thead className="bg-gray-100 font-bold">
                            <tr className="text-center">
                                <th rowSpan="2" className="border p-2">NO</th>
                                <th rowSpan="2" className="border p-2">Kegiatan Utama</th>
                                <th rowSpan="2" className="border p-2">Kegiatan</th>
                                <th rowSpan="2" className="border p-2">Rencana Aksi</th>
                                <th colSpan="12" className="border p-2">PROGRESS BULANAN (%)</th>
                                <th rowSpan="2" className="border p-2">OUTPUT</th>
                                <th rowSpan="2" className="border p-2">P. JAWAB</th>
                                <th rowSpan="2" className="border p-2">STATUS AKHIR</th>
                            </tr>
                            <tr className="text-center">
                                {["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"].map(m => (
                                    <th key={m} className="border p-1 w-12">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.flatMap((kategoriData, katIndex) =>
                                kategoriData.kegiatan_list.flatMap((kegiatanData, kegIndex) =>
                                    kegiatanData.rencana_aksi.map((item, itemIndex) => (
                                        <tr key={item.id}>
                                            {kegIndex === 0 && itemIndex === 0 && <td rowSpan={kategoriData.total_rows} className="border p-2 text-center align-top">{katIndex + 1}</td>}
                                            {kegIndex === 0 && itemIndex === 0 && <td rowSpan={kategoriData.total_rows} className="border p-2 align-top">{kategoriData.kategori_nama}</td>}
                                            {itemIndex === 0 && <td rowSpan={kegiatanData.rencana_aksi.length} className="border p-2 align-top">{kegiatanData.kegiatan_nama}</td>}

                                            <td className="border p-2">{item.deskripsi_aksi}</td>

                                            {/* [UPDATE] - Logika baru untuk menampilkan progress bulanan */}
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const month = i + 1;
                                                const progress = item.monthly_progress[month] ?? null;
                                                return (
                                                    <td key={month} className={`border p-2 text-center font-semibold ${getProgressColor(progress)}`}>
                                                        {progress !== null ? `${progress}%` : '-'}
                                                    </td>
                                                );
                                            })}

                                            <td className="border p-2">{item.catatan}</td>
                                            <td className="border p-2">{item.assigned_to?.name || '-'}</td>
                                            <td className="border p-2 text-center">{item.status.replace('_', ' ')}</td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    );
};

export default LaporanMatriksPage;

