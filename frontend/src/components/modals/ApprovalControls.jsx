import React, { useState } from 'react';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';
import { FiCheck, FiX } from 'react-icons/fi';

const ApprovalControls = ({ todo, onApprovalDone, onStateChange, selectedMonth }) => {
    const [rejectionNote, setRejectionNote] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = async () => {
        try {
            onStateChange(todo.id, { status_approval: 'approved', progress_percentage: 100 });
            await apiClient.put(`/todo-items/${todo.id}`, {
                status_approval: 'approved',
                month: selectedMonth,
                notify: true
            });
            toast.success('To-do disetujui.');
            onApprovalDone();
        } catch (error) {
            toast.error('Gagal menyetujui to-do.');
            onStateChange(todo.id, { status_approval: 'pending_approval', progress_percentage: todo.progress_percentage });
        }
    };

    const handleReject = async () => {
        if (!rejectionNote) {
            toast.warn('Silakan isi catatan penolakan.');
            return;
        }
        try {
            onStateChange(todo.id, { status_approval: 'pending_upload', rejection_note: rejectionNote });
            await apiClient.put(`/todo-items/${todo.id}`, {
                status_approval: 'pending_upload',
                rejection_note: rejectionNote,
                month: selectedMonth,
                notify: true
            });
            toast.success('To-do ditolak dan dikembalikan ke pelaksana.');
            onApprovalDone();
        } catch (error) {
            toast.error('Gagal menolak to-do.');
            onStateChange(todo.id, { status_approval: 'pending_approval', rejection_note: null });
        } finally {
            setIsRejecting(false);
        }
    };

    if (isRejecting) {
        return (
            <div className="mt-2 p-2 border border-gray-200 rounded-md bg-gray-50">
                <textarea
                    className="w-full border-gray-300 rounded-md shadow-sm text-xs"
                    rows="2"
                    placeholder="Berikan alasan penolakan..."
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                />
                <div className="flex justify-end space-x-2 mt-2">
                    <button onClick={() => setIsRejecting(false)} className="px-2 py-1 bg-gray-200 text-xs rounded-md">Batal</button>
                    <button onClick={handleReject} className="px-2 py-1 bg-red-500 text-white text-xs rounded-md">Kirim Penolakan</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 mt-2">
            <button onClick={handleApprove} className="flex items-center px-2 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600">
                <FiCheck className="mr-1" /> Setujui
            </button>
            <button onClick={() => setIsRejecting(true)} className="flex items-center px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600">
                <FiX className="mr-1" /> Tolak
            </button>
        </div>
    );
};

export default ApprovalControls;
