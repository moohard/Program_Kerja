import React, { useState } from 'react';

function KegiatanModal({ item, onClose, onSave }) {
    const [namaKegiatan, setNamaKegiatan] = useState(item ? item.nama_kegiatan : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ nama_kegiatan: namaKegiatan });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{item ? 'Edit' : 'Tambah'} Kegiatan</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Nama Kegiatan</label>
                        <textarea value={namaKegiatan} onChange={e => setNamaKegiatan(e.target.value)} required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default KegiatanModal;
