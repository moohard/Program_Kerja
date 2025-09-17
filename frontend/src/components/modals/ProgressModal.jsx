import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';

function ProgressModal({ rencanaAksi, onClose, onProgressUpdate }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [percentage, setPercentage] = useState(rencanaAksi.latest_progress || 0);
    const [keterangan, setKeterangan] = useState('');
    const [attachments, setAttachments] = useState([]); // State untuk file

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/rencana-aksi/${rencanaAksi.id}/progress`);
            setHistory(response.data.data);
        } catch (error) { console.error("Gagal memuat histori progress:", error); }
        finally { setLoading(false); }
    }, [rencanaAksi.id]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 5) {
            alert("Anda hanya bisa mengunggah maksimal 5 file.");
            e.target.value = null; // Reset input file
        } else {
            setAttachments(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('progress_percentage', percentage);
        formData.append('keterangan', keterangan);
        attachments.forEach(file => {
            formData.append('attachments[]', file);
        });

        try {
            // Kirim sebagai multipart/form-data
            await apiClient.post(`/rencana-aksi/${rencanaAksi.id}/progress`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onProgressUpdate();
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal menyimpan progress.';
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto pt-10">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mb-10">
                <h2 className="text-xl font-bold mb-2">Lapor & Lihat Progress</h2>
                <p className="text-sm text-gray-600 mb-6">{rencanaAksi.deskripsi_aksi}</p>

                <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
                    {/* ... (Input Range Progress) ... */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Progress Saat Ini: {percentage}%</label>
                        <input type="range" min="0" max="100" value={percentage} onChange={(e) => setPercentage(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    {/* ... (Textarea Keterangan) ... */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                        <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows="3" className="mt-1 block w-full border-gray-300 rounded-md" placeholder="Contoh: Telah menyelesaikan draf awal..."></textarea>
                    </div>

                    {/* Input File Baru */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Unggah Bukti (Opsional)</label>
                        <input type="file" multiple onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        <p className="text-xs text-gray-500 mt-1">Maks 5 file. Tipe: PDF, DOC, XLS, JPG, PNG. Maks 2MB/file.</p>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Progress'}
                    </button>
                </form>

                <h3 className="text-lg font-semibold mb-4">Histori Laporan</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {loading ? <div className="flex justify-center p-4"><div className="loader w-8 h-8"></div></div> :
                        history.length > 0 ? history.map(item => (
                            <div key={item.id} className="p-3 bg-gray-50 rounded-md border">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-indigo-600">{item.progress_percentage}%</span>
                                    <span className="text-xs text-gray-500">{item.tanggal_monitoring}</span>
                                </div>
                                {item.keterangan && <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.keterangan}</p>}

                                {/* Tampilkan Daftar Lampiran */}
                                {item.attachments && item.attachments.length > 0 && (
                                    <div className="mt-3 border-t pt-2">
                                        <h4 className="text-xs font-semibold text-gray-600">Lampiran:</h4>
                                        <ul className="list-disc list-inside mt-1">
                                            {item.attachments.map(file => (
                                                <li key={file.id} className="text-sm">
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                        {file.file_name} ({file.file_size_kb} KB)
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center">Belum ada laporan progress.</p>
                    }
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default ProgressModal;

