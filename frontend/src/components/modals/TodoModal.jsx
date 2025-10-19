import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../services/apiClient';
import { FiPaperclip, FiTrash2, FiCheckCircle, FiCircle, FiUploadCloud } from 'react-icons/fi';

// Komponen FileUploader yang diperbarui
const FileUploader = ({ todo, onUploadComplete }) => {
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    // JIKA TO-DO SUDAH SELESAI, JANGAN TAMPILKAN TOMBOL UPLOAD
    if (todo.completed) {
        return null;
    }

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (files.length === 0) return;

        const formData = new FormData();
        for (const file of files) {
            formData.append('attachments[]', file);
        }

        setUploadStatus('uploading');
        setErrorMessage('');
        try {
            await apiClient.post(`/todo-items/${todo.id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadStatus('success');
            setTimeout(() => setUploadStatus('idle'), 2000); // Kembali ke idle setelah 2 detik
            onUploadComplete();
        } catch (error) {
            setUploadStatus('error');
            if (error.response && error.response.data.errors) {
                // Ambil pesan error pertama dari validasi
                const firstError = Object.values(error.response.data.errors)[0][0];
                setErrorMessage(firstError);
            } else {
                setErrorMessage('Gagal mengunggah file.');
            }
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getButtonContent = () => {
        switch (uploadStatus) {
            case 'uploading':
                return 'Mengunggah...';
            case 'success':
                return 'Selesai!';
            case 'error':
                return 'Coba Lagi';
            default:
                return <><FiUploadCloud className="mr-1" /> Eviden</>;
        }
    };

    return (
        <div className="flex flex-col items-end">
            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={uploadStatus === 'uploading'}
            />
            <button
                type="button"
                onClick={() => uploadStatus !== 'uploading' && fileInputRef.current.click()}
                disabled={uploadStatus === 'uploading'}
                className={`text-xs px-2 py-1 rounded flex items-center
                    ${uploadStatus === 'uploading' ? 'bg-gray-400' : 'bg-indigo-500 hover:bg-indigo-600'}
                    ${uploadStatus === 'success' ? 'bg-green-500' : ''}
                    ${uploadStatus === 'error' ? 'bg-red-500' : ''}
                    text-white transition-colors`}
            >
                {getButtonContent()}
            </button>
            {uploadStatus === 'error' && <p className="text-red-500 text-xs mt-1 text-right">{errorMessage}</p>}
        </div>
    );
};


function TodoModal({ rencanaAksi, onClose, selectedMonth }) {
    const [todos, setTodos] = useState([]);
    const [newTodoDesc, setNewTodoDesc] = useState('');
    const [loading, setLoading] = useState(true);
    const [hasMadeChanges, setHasMadeChanges] = useState(false);

    const fetchTodos = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/rencana-aksi/${rencanaAksi.id}/todo-items`;
            if (selectedMonth) {
                url += `?month=${selectedMonth}`;
            }
            const response = await apiClient.get(url);
            setTodos(response.data.data);
        } catch (error) {
            console.error("Gagal memuat to-do list:", error);
        } finally {
            setLoading(false);
        }
    }, [rencanaAksi.id, selectedMonth]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodoDesc.trim()) return;
        try {
            await apiClient.post(`/rencana-aksi/${rencanaAksi.id}/todo-items`, {
                deskripsi: newTodoDesc,
                month: selectedMonth || null
            });
            setNewTodoDesc('');
            setHasMadeChanges(true);
            fetchTodos();
        } catch (error) {
            alert('Gagal menambahkan to-do.');
        }
    };

    const handleToggleTodo = async (todoId, currentStatus) => {
        try {
            setTodos(prevTodos =>
                prevTodos.map(t =>
                    t.id === todoId ? { ...t, completed: !currentStatus } : t
                )
            );
            await apiClient.put(`/todo-items/${todoId}`, {
                completed: !currentStatus,
                month: selectedMonth || null
            });
            setHasMadeChanges(true);
        } catch (error) {
            console.error("Gagal mengubah status to-do:", error);
            alert('Gagal mengubah status to-do. Mengembalikan ke status semula.');
            setTodos(prevTodos =>
                prevTodos.map(t =>
                    t.id === todoId ? { ...t, completed: currentStatus } : t
                )
            );
        }
    };

    const handleDeleteTodo = async (todoId) => {
        if (window.confirm('Yakin ingin menghapus to-do ini?')) {
            try {
                await apiClient.delete(`/todo-items/${todoId}`, {
                    data: { month: selectedMonth || null }
                });
                setHasMadeChanges(true);
                fetchTodos();
            } catch (error) {
                console.error("Gagal menghapus to-do:", error);
                alert('Gagal menghapus to-do.');
            }
        }
    };

    const completedCount = todos.filter(t => t.completed).length;
    const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto pt-10">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl mb-10">
                <h2 className="text-xl font-bold mb-2">To-Do List & Progress</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Jadwal Laporan: {rencanaAksi.jadwal_tipe.charAt(0).toUpperCase() + rencanaAksi.jadwal_tipe.slice(1)}</p>
                <p className="text-sm text-gray-600 mb-4">{rencanaAksi.deskripsi_aksi}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress Otomatis</span>
                        <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Form Tambah To-Do */}
                <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                    <input type="text" value={newTodoDesc} onChange={e => setNewTodoDesc(e.target.value)} placeholder="Tambah tugas baru..." className="flex-grow border-gray-300 rounded-md shadow-sm" />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tambah</button>
                </form>

                {/* Daftar To-Do */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {loading ? <div className="flex justify-center p-4"><div className="loader w-8 h-8"></div></div> :
                        todos.map(todo => (
                            <div key={todo.id} className="p-3 rounded-md border bg-gray-50">
                                <div className="flex items-start">
                                    <div className="mt-1 mr-3 cursor-pointer" onClick={() => handleToggleTodo(todo.id, todo.completed)}>
                                        {todo.completed ? <FiCheckCircle className="text-green-500" size={20} /> : <FiCircle className="text-gray-400" size={20} />}
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{todo.deskripsi}</p>
                                        
                                        <div className="mt-2 space-y-1">
                                            {todo.attachments && todo.attachments.map(file => (
                                                <div key={file.id} className="flex items-center text-xs text-gray-600">
                                                    <FiPaperclip className="mr-1" />
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{file.file_name}</a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex flex-col items-end space-y-2">
                                        <FileUploader todo={todo} onUploadComplete={fetchTodos} />
                                        {!todo.completed && (
                                            <button onClick={() => handleDeleteTodo(todo.id)} className="text-red-500 hover:text-red-700 text-xs">
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={() => onClose(hasMadeChanges)} className="px-4 py-2 bg-gray-200 rounded-md">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default TodoModal;
