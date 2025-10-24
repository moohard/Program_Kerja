import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { FiPlus, FiTrash2, FiCopy } from 'react-icons/fi';

const CreateTemplateModal = ({ isOpen, onClose, onSave }) => {
    const [namaTemplate, setNamaTemplate] = useState('');
    const [tahunReferensi, setTahunReferensi] = useState('');
    const [existingYears, setExistingYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            apiClient.get('/templates/source-years')
                .then(response => {
                    const years = response.data.map(item => item.tahun);
                    setExistingYears(years);
                    if (years.length > 0) {
                        setTahunReferensi(years[0]);
                    }
                });
            setNamaTemplate('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiClient.post('/templates', {
                nama_template: namaTemplate,
                tahun_referensi: tahunReferensi,
            });
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat template.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Buat Template Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nama_template" className="block text-sm font-medium text-gray-700">Nama Template</label>
                        <input type="text" id="nama_template" value={namaTemplate} onChange={(e) => setNamaTemplate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="tahun_referensi" className="block text-sm font-medium text-gray-700">Jadikan Program Kerja Tahun Ini Sebagai Referensi</label>
                        <select id="tahun_referensi" value={tahunReferensi} onChange={(e) => setTahunReferensi(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Pilih Tahun</option>
                            {existingYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Batal</button>
                        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-indigo-300">
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ApplyTemplateModal = ({ isOpen, onClose, onApply, template }) => {
    const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            setTargetYear(new Date().getFullYear() + 1);
        }
    }, [isOpen]);

    const handleApply = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.post(`/templates/${template.id}/apply`, { target_year: targetYear });
            onApply(response.data.message);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menerapkan template.');
        } finally {
            setLoading(false);
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Terapkan Template</h2>
                <p className="text-sm text-gray-600 mb-4">Anda akan menerapkan template <span className="font-semibold">{template.nama_template}</span> (dari tahun {template.tahun_referensi}) untuk membuat program kerja baru.</p>
                <div>
                    <label htmlFor="target_year" className="block text-sm font-medium text-gray-700">Untuk Tahun Program Kerja</label>
                    <input type="number" id="target_year" value={targetYear} onChange={(e) => setTargetYear(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Batal</button>
                    <button onClick={handleApply} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-green-300">
                        {loading ? 'Menerapkan...' : 'Terapkan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TemplateManagementPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isApplyModalOpen, setApplyModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/templates');
            setTemplates(response.data);
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus template ini?')) {
            try {
                await apiClient.delete(`/templates/${id}`);
                fetchTemplates();
            } catch (error) {
                alert('Gagal menghapus template.');
            }
        }
    };

    const handleOpenApplyModal = (template) => {
        setSelectedTemplate(template);
        setApplyModalOpen(true);
    };

    const handleApplySuccess = (message) => {
        alert(message); // Menampilkan pesan sukses dari backend
        // Anda bisa menambahkan logika refresh data lain jika perlu
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold">Manajemen Template</h1>
                <button onClick={() => setCreateModalOpen(true)} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 self-start md:self-auto">
                    <FiPlus className="mr-2" /> Buat Template Baru
                </button>
            </div>

            {loading ? <div className="flex justify-center py-10"><div className="loader"></div></div> :
                <div className="space-y-4">
                    {templates.map(template => (
                        <div key={template.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                            <div>
                                <h3 className="font-semibold">{template.nama_template}</h3>
                                <p className="text-sm text-gray-500">Sumber dari Program Kerja Tahun {template.tahun_referensi}</p>
                            </div>
                            <div className="flex items-center space-x-2 self-end md:self-auto">
                                <button onClick={() => handleOpenApplyModal(template)} className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600">
                                    <FiCopy className="mr-1.5" /> Terapkan
                                </button>
                                <button onClick={() => handleDelete(template.id)} className="p-2 rounded-md hover:bg-red-100">
                                    <FiTrash2 className="text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && <p className="text-center text-gray-500 py-4">Belum ada template yang dibuat.</p>}
                </div>
            }

            <CreateTemplateModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSave={fetchTemplates}
            />
            {selectedTemplate && <ApplyTemplateModal
                isOpen={isApplyModalOpen}
                onClose={() => setApplyModalOpen(false)}
                onApply={handleApplySuccess}
                template={selectedTemplate}
            />}
        </div>
    );
};

export default TemplateManagementPage;