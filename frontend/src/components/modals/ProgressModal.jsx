import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const ProgressModal = ({ isOpen, onClose, onProgressUpdate, rencanaAksi }) => {
    const currentYear = new Date().getFullYear();
    const [progress, setProgress] = useState('');
    const [catatan, setCatatan] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // [UPDATE] - State baru untuk bulan dan tahun laporan
    const [reportMonth, setReportMonth] = useState('');
    const [reportYear, setReportYear] = useState(currentYear);
    const [availableMonths, setAvailableMonths] = useState([]);

    const allMonths = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    useEffect(() => {
        const months = allMonths.map((name, index) => ({ name, value: index + 1 }));

        if (rencanaAksi && rencanaAksi.bulan_mulai && rencanaAksi.bulan_selesai) {
            console.log(rencanaAksi)
            const filteredMonths = months.filter(month =>
                month.value >= parseInt(rencanaAksi.bulan_mulai, 10) &&
                month.value <= parseInt(rencanaAksi.bulan_selesai, 10)
            );
            setAvailableMonths(filteredMonths);
            if (filteredMonths.length > 0) {
                // Set default ke bulan pertama yang tersedia atau bulan saat ini jika ada dalam rentang
                const currentMonth = new Date().getMonth() + 1;
                const isCurrentMonthAvailable = filteredMonths.some(m => m.value === currentMonth);
                setReportMonth(isCurrentMonthAvailable ? currentMonth : filteredMonths[0].value);
            }
        } else {
            setAvailableMonths(months);
            setReportMonth(new Date().getMonth() + 1);
        }
    }, [rencanaAksi]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (isOpen && rencanaAksi) {
                try {
                    const response = await apiClient.get(`/rencana-aksi/${rencanaAksi.id}/progress`);
                    setHistory(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch progress history", error);
                }
            }
        };
        fetchHistory();
        setProgress('');
        setCatatan('');
        setAttachments([]);
        setErrors({});
        setReportYear(currentYear);
    }, [isOpen, rencanaAksi, currentYear]);

    const handleFileChange = (e) => {
        setAttachments([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formData = new FormData();
        formData.append('progress_percentage', progress);
        formData.append('catatan', catatan);
        // [UPDATE] - Kirim bulan dan tahun laporan ke backend
        formData.append('report_year', reportYear);
        formData.append('report_month', reportMonth);
        attachments.forEach(file => {
            formData.append('attachments[]', file);
        });

        try {
            const response = await apiClient.post(`/rencana-aksi/${rencanaAksi.id}/progress`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onProgressUpdate(response.data.data);
            onClose();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Submit error:", error);
                alert('Terjadi kesalahan saat menyimpan progress.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">Laporan Progress: {rencanaAksi?.deskripsi_aksi}</h2>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 mb-4">
                    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                        {/* [UPDATE] - Form untuk memilih periode laporan */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="report_month" className="block text-sm font-medium text-gray-700">Bulan Laporan</label>
                                <select
                                    id="report_month"
                                    value={reportMonth}
                                    onChange={(e) => setReportMonth(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    {availableMonths.map(month => (
                                        <option key={month.value} value={month.value}>{month.name}</option>
                                    ))}
                                </select>
                                {errors.report_month && <p className="text-red-500 text-xs mt-1">{errors.report_month[0]}</p>}
                            </div>
                            <div>
                                <label htmlFor="report_year" className="block text-sm font-medium text-gray-700">Tahun Laporan</label>
                                <select
                                    id="report_year"
                                    value={reportYear}
                                    onChange={(e) => setReportYear(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    {[0, 1, 2].map(i => <option key={currentYear - i} value={currentYear - i}>{currentYear - i}</option>)}
                                </select>
                                {errors.report_year && <p className="text-red-500 text-xs mt-1">{errors.report_year[0]}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="progress" className="block text-sm font-medium text-gray-700">Progress (%)</label>
                            <input
                                type="number"
                                id="progress"
                                value={progress}
                                onChange={(e) => setProgress(e.target.value)}
                                min="0" max="100"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                            {errors.progress_percentage && <p className="text-red-500 text-xs mt-1">{errors.progress_percentage[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Keterangan</label>
                            <textarea
                                id="catatan"
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                rows="3"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">Upload Bukti (Opsional)</label>
                            <input
                                type="file"
                                id="attachments"
                                multiple
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div className="text-right">
                            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                                {loading ? 'Menyimpan...' : 'Simpan Progress'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Riwayat Progress</h3>
                        <ul className="space-y-3">
                            {history.map(item => (
                                <li key={item.id} className="text-sm border-b pb-2">
                                    {/* [UPDATE] - Tampilkan tanggal laporan */}
                                    <p><strong>{item.progress_percentage}%</strong> dilaporkan untuk <strong>{item.report_date_formatted}</strong></p>
                                    <p className="text-gray-600">{item.catatan}</p>
                                    {item.attachments.length > 0 && (
                                        <ul className="mt-1 list-disc list-inside">
                                            {item.attachments.map(file => (
                                                <li key={file.id}>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                        {file.file_name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex-shrink-0 text-right pt-4 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProgressModal;