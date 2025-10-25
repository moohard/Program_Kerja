import React, { useState, useRef } from 'react';
import apiClient from '@/services/apiClient';
import { FiPaperclip, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const FileUploader = ({ todo, onUploadComplete, selectedMonth }) => {
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [progressDescription, setProgressDescription] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                toast.error('Format file tidak didukung. Gunakan JPG, PNG, PDF, DOC, DOCX, XLS, atau XLSX.');
                return;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Ukuran file terlalu besar. Maksimal 10MB.');
                return;
            }

            setSelectedFile(file);
            setShowUploadForm(true);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !progressDescription.trim()) {
            toast.error('File dan deskripsi progress harus diisi.');
            return;
        }

        setUploading(true);
        
        try {
            const formData = new FormData();
            formData.append('todo_item_id', todo.id);
            formData.append('file', selectedFile);
            formData.append('progress_description', progressDescription);
            formData.append('progress_percentage', 100);
            formData.append('status_approval', 'pending_approval');
            
            if (selectedMonth) {
                formData.append('month', selectedMonth);
            }

            await apiClient.post('/todo-items/upload-evidence', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('File berhasil diupload dan menunggu validasi PIC.');
            setSelectedFile(null);
            setProgressDescription('');
            setShowUploadForm(false);
            
            if (onUploadComplete) {
                onUploadComplete();
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (error.response?.status === 422) {
                toast.error('Data tidak valid. Silakan periksa kembali.');
            } else {
                toast.error('Gagal mengupload file. Silakan coba lagi.');
            }
        } finally {
            setUploading(false);
        }
    };

    const cancelUpload = () => {
        setSelectedFile(null);
        setProgressDescription('');
        setShowUploadForm(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col space-y-2">
            {!showUploadForm ? (
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                        disabled={uploading}
                    >
                        <FiUpload className="mr-1" size={14} />
                        Upload Eviden
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="bg-white p-3 rounded-md border shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-semibold text-gray-800">Upload Eviden</h4>
                        <button
                            onClick={cancelUpload}
                            className="text-gray-500 hover:text-gray-700"
                            disabled={uploading}
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="text-xs text-gray-600">
                            <strong>File:</strong> {selectedFile?.name}
                        </div>
                        
                        <textarea
                            value={progressDescription}
                            onChange={(e) => setProgressDescription(e.target.value)}
                            placeholder="Deskripsi progress atau keterangan file..."
                            className="w-full p-2 border border-gray-300 rounded text-xs"
                            rows="2"
                            disabled={uploading}
                        />
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !progressDescription.trim()}
                                className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {uploading ? 'Uploading...' : 'Submit'}
                            </button>
                            <button
                                onClick={cancelUpload}
                                disabled={uploading}
                                className="px-3 py-2 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;