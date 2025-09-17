import React, { useState } from 'react';

function KategoriModal({ item, onClose, onSave }) {
    const [nomor, setNomor] = useState(item ? item.nomor : '');
    const [namaKategori, setNamaKategori] = useState(item ? item.nama_kategori : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ nomor, nama_kategori: namaKategori });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{item ? 'Edit' : 'Tambah'} Kategori</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nomor</label>
                        <input type="number" value={nomor} onChange={e => setNomor(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                        <input type="text" value={namaKategori} onChange={e => setNamaKategori(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
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

export default KategoriModal;
