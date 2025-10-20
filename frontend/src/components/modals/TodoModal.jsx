import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import apiClient from '../../services/apiClient';
import { FiPaperclip, FiTrash2, FiUploadCloud, FiGitCommit, FiCheckCircle, FiCircle, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { debounce } from 'lodash';
import AuthContext from '../../contexts/AuthContext';

// Komponen ApprovalControls (BARU)
const ApprovalControls = ({ todo, onApprovalDone, onStateChange, selectedMonth }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleApproval = async (newStatus) => {
        setIsLoading(true);
        try {
            await apiClient.put(`/todo-items/${todo.id}`, {
                status_approval: newStatus,
                month: selectedMonth
            });
            if (onStateChange) onStateChange(); // <-- Memberi tahu modal ada perubahan
            if (onApprovalDone) onApprovalDone();
        } catch (error) {
            console.error(`Gagal mengubah status approval ke ${newStatus}:`, error);
            alert('Gagal menyimpan perubahan status.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-2 flex items-center space-x-2">
            <button 
                onClick={() => handleApproval('approved')} 
                disabled={isLoading}
                className="flex items-center text-xs text-green-600 bg-green-100 hover:bg-green-200 px-2 py-1 rounded-md disabled:opacity-50"
            >
                <FiThumbsUp className="mr-1" />
                Setujui
            </button>
            <button 
                onClick={() => handleApproval('pending_upload')} 
                disabled={isLoading}
                className="flex items-center text-xs text-yellow-600 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded-md disabled:opacity-50"
            >
                <FiThumbsDown className="mr-1" />
                Tolak/Revisi
            </button>
        </div>
    );
};

// Komponen FileUploader (diasumsikan tidak berubah dan berfungsi)
const FileUploader = ({ todo, onUploadComplete, selectedMonth }) => {
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (todo.status_approval === 'approved' || todo.status_approval === 'pending_approval') {
        return null; // Jangan tampilkan uploader jika sudah selesai atau sedang divalidasi
    }

    const handleFileSelect = () => fileInputRef.current.click();

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('attachment', file);
        formData.append('month', selectedMonth);

        setUploadStatus('uploading');
        setErrorMessage('');
        try {
            await apiClient.post(`/todo-items/${todo.id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadStatus('success');
            if (onUploadComplete) onUploadComplete();
        } catch (error) {
            setUploadStatus('error');
            setErrorMessage(error.response?.data?.message || 'Upload gagal.');
            console.error("Upload error:", error);
        } finally {
            // Reset input file untuk memungkinkan upload file yang sama lagi
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    return (
        <div className="text-xs">
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
            <button onClick={handleFileSelect} disabled={uploadStatus === 'uploading'} className="flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50">
                <FiUploadCloud className="mr-1" />
                {uploadStatus === 'uploading' ? 'Mengunggah...' : 'Upload Eviden'}
            </button>
            {errorMessage && <p className="text-red-500 mt-1">{errorMessage}</p>}
        </div>
    );
};


function TodoModal({ rencanaAksiId, onClose, selectedMonth, userList = [] }) {
    // --- HOOKS (SEMUA DI ATAS) ---
    const { user } = useContext(AuthContext);
    const [rencanaAksi, setRencanaAksi] = useState(null);
    const [todos, setTodos] = useState([]);
    const [newTodoDesc, setNewTodoDesc] = useState('');
    const [newTodoPelaksanaId, setNewTodoPelaksanaId] = useState('');
    const [newTodoBobot, setNewTodoBobot] = useState(100);
    const [loading, setLoading] = useState(true);
    const [hasMadeChanges, setHasMadeChanges] = useState(false);

    // --- MEMOS ---
    const isPIC = useMemo(() => user && rencanaAksi && user.id === rencanaAksi.assigned_to?.id, [user, rencanaAksi]);
    const progress = useMemo(() => {
        if (!todos || todos.length === 0) return 0;
        const totalBobot = todos.reduce((sum, todo) => sum + todo.bobot, 0);
        if (totalBobot === 0) return 0;
        const weightedProgressSum = todos.reduce((sum, todo) => sum + (todo.progress_percentage / 100) * todo.bobot, 0);
        return Math.round((weightedProgressSum / totalBobot) * 100);
    }, [todos]);

    const totalBobotTerpakai = useMemo(() => {
        return todos.reduce((sum, todo) => sum + todo.bobot, 0);
    }, [todos]);

    const sisaBobot = useMemo(() => Math.max(0, 100 - totalBobotTerpakai), [totalBobotTerpakai]);

    // --- EFFECTS (setelah MEMOS) ---
    useEffect(() => {
        const fetchRencanaAksiDetails = async () => {
            if (!rencanaAksiId) return;
            try {
                setLoading(true);
                const response = await apiClient.get(`/rencana-aksi/${rencanaAksiId}`);
                setRencanaAksi(response.data.data);
            } catch (error) {
                console.error("Gagal memuat detail Rencana Aksi:", error);
                onClose();
            }
        };
        fetchRencanaAksiDetails();
    }, [rencanaAksiId, onClose]);

    const fetchTodos = useCallback(async () => {
        if (!rencanaAksiId) return;
        try {
            let url = `/rencana-aksi/${rencanaAksiId}/todo-items`;
            if (selectedMonth) url += `?month=${selectedMonth}`;
            const response = await apiClient.get(url);
            setTodos(response.data.data);
        } catch (error) {
            console.error("Gagal memuat to-do list:", error);
        } finally {
            setLoading(false);
        }
    }, [rencanaAksiId, selectedMonth]);

    useEffect(() => {
        if (rencanaAksi) {
            fetchTodos();
        }
    }, [rencanaAksi, fetchTodos]);

    // Secara otomatis set default bobot baru ke sisa bobot yang tersedia
    useEffect(() => {
        setNewTodoBobot(sisaBobot);
    }, [sisaBobot]);

    // --- HANDLERS ---
    const debouncedUpdate = useCallback(debounce(async (todoId, payload) => {
        try {
            // Pastikan 'month' selalu dikirim saat ada update
            const payloadWithMonth = { ...payload, month: selectedMonth };
            await apiClient.put(`/todo-items/${todoId}`, payloadWithMonth);
            setHasMadeChanges(true);
        } catch (error) {
            console.error("Gagal update to-do (response dari server):", error.response?.data);
            
            let errorMessage = 'Gagal menyimpan perubahan. Data akan dimuat ulang.'; // Default
            if (error.response?.data?.errors) {
                // Ambil pesan error pertama dari list error
                const firstErrorKey = Object.keys(error.response.data.errors)[0];
                errorMessage = error.response.data.errors[firstErrorKey][0];
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            alert(errorMessage);
            fetchTodos(); // Muat ulang data untuk mengembalikan perubahan di UI
        }
    }, 1000), [fetchTodos, selectedMonth]);

    const handleAddTodo = useCallback(async (e) => {
        e.preventDefault();
        if (!newTodoDesc.trim() || !rencanaAksiId) return;
        try {
            await apiClient.post(`/rencana-aksi/${rencanaAksiId}/todo-items`, {
                deskripsi: newTodoDesc,
                pelaksana_id: newTodoPelaksanaId || null,
                bobot: newTodoBobot,
                month: selectedMonth || null
            });
            setNewTodoDesc('');
            setNewTodoPelaksanaId('');
            setNewTodoBobot(100);
            setHasMadeChanges(true);
            fetchTodos();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal menambahkan to-do.';
            alert(errorMessage);
        }
    }, [newTodoDesc, newTodoPelaksanaId, newTodoBobot, rencanaAksiId, selectedMonth, fetchTodos]);

    const handleUpdateBobot = useCallback((todoId, value) => {
        const bobot = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
        setTodos(prevTodos => prevTodos.map(t => t.id === todoId ? { ...t, bobot } : t));
        // Kirim 'month' bersama dengan 'bobot' untuk memenuhi validasi
        debouncedUpdate(todoId, { bobot, month: selectedMonth });
    }, [debouncedUpdate, selectedMonth]);

    const handleUpdatePelaksana = useCallback((todoId, newPelaksanaId) => {
        setTodos(prevTodos => prevTodos.map(t => t.id === todoId ? { ...t, pelaksana_id: newPelaksanaId, pelaksana: userList.find(u => u.id === newPelaksanaId) } : t));
        debouncedUpdate(todoId, { pelaksana_id: newPelaksanaId || null });
    }, [debouncedUpdate, userList]);

    const handleDeleteTodo = useCallback(async (todoId) => {
        if (window.confirm('Yakin ingin menghapus to-do ini?')) {
            try {
                await apiClient.delete(`/todo-items/${todoId}`, { data: { month: selectedMonth || null } });
                setHasMadeChanges(true);
                fetchTodos();
            } catch (error) {
                alert('Gagal menghapus to-do.');
            }
        }
    }, [fetchTodos, selectedMonth]);

    // --- KONDISIONAL RETURN (SETELAH SEMUA HOOKS) ---
    if (loading || !rencanaAksi) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl"><div className="flex justify-center items-center p-8"><div className="loader w-12 h-12"></div></div></div>
            </div>
        );
    }

    // --- RENDER UTAMA ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto pt-10">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl mb-10">
                <h2 className="text-xl font-bold mb-2">To-Do List & Progress</h2>
                <p className="text-sm text-gray-600 mb-4">{rencanaAksi.deskripsi_aksi}</p>

                <div className="mb-4">
                    <div className="flex justify-between mb-1"><span className="text-sm font-medium text-gray-700">Progress Otomatis (Tertimbang)</span><span className="text-sm font-medium text-gray-700">{progress}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                </div>

                {isPIC && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-gray-800">Tambah Tugas Baru</h3>
                            <span className={`text-sm font-semibold ${totalBobotTerpakai > 100 ? 'text-red-600' : 'text-gray-600'}`}>
                                Total Bobot: {totalBobotTerpakai}% / 100%
                            </span>
                        </div>
                        <form onSubmit={handleAddTodo} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                            <input type="text" value={newTodoDesc} onChange={e => setNewTodoDesc(e.target.value)} placeholder="Deskripsi tugas..." className="md:col-span-3 border-gray-300 rounded-md shadow-sm" />
                            <select value={newTodoPelaksanaId} onChange={e => setNewTodoPelaksanaId(e.target.value)} className="border-gray-300 rounded-md shadow-sm">
                                <option value="">-- Pilih Pelaksana --</option>
                                {userList.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                            <input type="number" value={newTodoBobot} onChange={e => setNewTodoBobot(parseInt(e.target.value, 10))} min="0" max={sisaBobot} placeholder="Bobot" className="border-gray-300 rounded-md shadow-sm" />
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tambah</button>
                        </form>
                    </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {todos.map(todo => {
                        const isPelaksana = user && user.id === todo.pelaksana_id;
                        return (
                            <div key={todo.id} className="p-3 rounded-md border bg-gray-50">
                                <div className="flex items-start">
                                    <div className="mt-1 mr-3">
                                        {todo.progress_percentage === 100 ? <FiCheckCircle className="text-green-500" size={20} /> : <FiCircle className="text-gray-400" size={20} />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center">
                                            <p className={`text-sm ${todo.progress_percentage === 100 ? 'line-through text-gray-500' : 'text-gray-900'}`}>{todo.deskripsi}</p>
                                            {todo.deadline && (
                                                <span className="ml-2 text-xs font-medium bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">
                                                    {new Date(todo.deadline).toLocaleString('id-ID', { month: 'long' })}
                                                </span>
                                            )}
                                        </div>
                                        {/* Label Status Approval untuk Pelaksana */}
                                        {isPelaksana && todo.status_approval === 'not_started' && (
                                            <div className="mt-2">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    Baru
                                                </span>
                                            </div>
                                        )}
                                        {isPelaksana && todo.status_approval === 'pending_upload' && (
                                            <div className="mt-2">
                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    Eviden Ditolak, Perlu Revisi
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            Pelaksana:
                                            {isPIC ? (
                                                <select value={todo.pelaksana_id || ''} onChange={(e) => handleUpdatePelaksana(todo.id, parseInt(e.target.value, 10) || null)} className="ml-1 border-none bg-gray-50 text-xs p-0 focus:ring-0">
                                                    <option value="">Belum Ditugaskan</option>
                                                    {userList.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                                </select>
                                            ) : (
                                                <span className="ml-1 font-semibold">{todo.pelaksana?.name || 'Belum Ditugaskan'}</span>
                                            )}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {todo.attachments?.map(file => (
                                                <div key={file.id} className="flex items-center text-xs text-gray-600"><FiPaperclip className="mr-1" /><a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{file.file_name}</a></div>
                                            ))}
                                        </div>

                                        {/* --- LOGIKA APPROVAL BARU --- */}
                                        {todo.status_approval === 'pending_approval' && (
                                            <div className="mt-2 text-xs font-semibold text-blue-600">
                                                Menunggu Validasi PIC
                                            </div>
                                        )}
                                        {isPIC && todo.status_approval === 'pending_approval' && (
                                            <ApprovalControls todo={todo} onApprovalDone={fetchTodos} onStateChange={() => setHasMadeChanges(true)} selectedMonth={selectedMonth} />
                                        )}
                                        {todo.status_approval === 'approved' && (
                                            <div className="mt-2 text-xs font-semibold text-green-600">
                                                Disetujui
                                            </div>
                                        )}
                                        {/* --- AKHIR LOGIKA APPROVAL --- */}
                                        
                                    </div>
                                    <div className="ml-4 flex flex-col items-end space-y-2" style={{ minWidth: '150px' }}>
                                        {isPIC ? (
                                            <div className="relative flex items-center">
                                                <FiGitCommit className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                                <input type="number" value={todo.bobot} onChange={(e) => handleUpdateBobot(todo.id, e.target.value)} min="0" max="100" className="w-20 pl-6 pr-1 py-1 text-xs border-gray-300 rounded-md" />
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500">Bobot: {todo.bobot}</div>
                                        )}
                                        {isPelaksana && <FileUploader todo={todo} onUploadComplete={fetchTodos} selectedMonth={selectedMonth} />}
                                        {isPIC && <button onClick={() => handleDeleteTodo(todo.id)} className="text-red-500 hover:text-red-700 text-xs self-end"><FiTrash2 /></button>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={() => onClose(hasMadeChanges)} className="px-4 py-2 bg-gray-200 rounded-md">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default TodoModal;
