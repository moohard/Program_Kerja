import React from 'react';
import { toast } from 'react-toastify';

// Komponen internal untuk toast konfirmasi
const ConfirmationToast = ({ closeToast, onConfirm, message }) => {
    const handleConfirm = () => {
        onConfirm();
        closeToast();
    };

    return (
        <div className="p-2">
            <p className="mb-3 text-sm text-gray-700">{message}</p>
            <div className="flex justify-end gap-2">
                <button
                    onClick={closeToast}
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    Batal
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                    Ya, Hapus
                </button>
            </div>
        </div>
    );
};

/**
 * Menampilkan toast konfirmasi kustom.
 * @param {string} message - Pesan pertanyaan yang akan ditampilkan.
 * @param {function} onConfirm - Callback yang akan dieksekusi jika pengguna mengklik "Ya".
 */
export const showConfirmationToast = (message, onConfirm) => {
    toast(<ConfirmationToast onConfirm={onConfirm} message={message} />, {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        style: {
            width: '350px',
        }
    });
};
