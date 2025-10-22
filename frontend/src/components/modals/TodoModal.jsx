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
            // Panggil onStateChange untuk update UI instan
            if (onStateChange) onStateChange(todo.id, { status_approval: newStatus, progress_percentage: newStatus === 'approved' ? 100 : 0 });
            if (onApprovalDone) onApprovalDone(); // Tetap fetch di background
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


function TodoModal({ rencanaAksi: initialRencanaAksi, onClose, selectedDate, userList = [] }) {
    // --- HOOKS (SEMUA DI ATAS) ---
    const { user } = useContext(AuthContext);
    const [rencanaAksi, setRencanaAksi] = useState(initialRencanaAksi);
    const [todos, setTodos] = useState([]);
    const [newTodoDesc, setNewTodoDesc] = useState('');
    const [newTodoPelaksanaId, setNewTodoPelaksanaId] = useState('');
    
    // Helper untuk format tanggal YYYY-MM-DD tanpa konversi timezone
    const toYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Inisialisasi state deadline HANYA jika bulan spesifik dipilih
    const [newTodoDeadline, setNewTodoDeadline] = useState(() => {
        if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate)) {
            const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            return toYYYYMMDD(firstDay);
        }
        return ''; // Jika tidak, biarkan kosong
    });

    const [loading, setLoading] = useState(true);
    const [hasMadeChanges, setHasMadeChanges] = useState(false);

    // --- MEMOS ---
    const isPIC = useMemo(() => user && rencanaAksi && user.id === rencanaAksi.assigned_to?.id, [user, rencanaAksi]);
    const progress = useMemo(() => {
        if (!todos || todos.length === 0) return 0;
        const approvedCount = todos.filter(t => t.status_approval === 'approved').length;
        return Math.round((approvedCount / todos.length) * 100);
    }, [todos]);

    // Batasi date picker HANYA jika bulan spesifik dipilih
    const { minDate, maxDate } = useMemo(() => {
        if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate)) {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            return {
                minDate: toYYYYMMDD(firstDay),
                maxDate: toYYYYMMDD(lastDay),
            };
        }
        // Jika tidak, jangan batasi picker sama sekali
        return { minDate: '', maxDate: '' };
    }, [selectedDate]);

    const selectedMonth = useMemo(() => selectedDate ? selectedDate.getMonth() + 1 : null, [selectedDate]);

    // --- EFFECTS (setelah MEMOS) ---
    useEffect(() => {
        setLoading(false);
    }, []);

    const fetchTodos = useCallback(async () => {
        if (!rencanaAksi?.id) return;
        try {
            let url = `/rencana-aksi/${rencanaAksi.id}/todo-items`;
            if (selectedMonth) url += `?month=${selectedMonth}`;
            const response = await apiClient.get(url);
            setTodos(response.data.data);
        } catch (error) {
            console.error("Gagal memuat to-do list:", error);
        } finally {
            // If the main loading was on, turn it off.
            if(loading) setLoading(false);
        }
    }, [rencanaAksi?.id, selectedMonth, loading]);

    useEffect(() => {
        if (rencanaAksi) {
            fetchTodos();
        }
    }, [rencanaAksi, fetchTodos]);

    // --- HANDLERS ---
    const debouncedUpdate = useCallback(debounce(async (todoId, payload) => {
        try {
            const payloadWithMonth = { ...payload, month: selectedMonth };
            await apiClient.put(`/todo-items/${todoId}`, payloadWithMonth);
            // setHasMadeChanges is now called instantly, not here.
        } catch (error) {
            console.error("Gagal update to-do (response dari server):", error.response?.data);
            
            let errorMessage = 'Gagal menyimpan perubahan. Data akan dimuat ulang.';
            if (error.response?.data?.errors) {
                const firstErrorKey = Object.keys(error.response.data.errors)[0];
                errorMessage = error.response.data.errors[firstErrorKey][0];
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            alert(errorMessage);
            fetchTodos();
        }
    }, 1000), [fetchTodos, selectedMonth]);

    const handleAddTodo = useCallback(async (e) => {
        e.preventDefault();
        if (!newTodoDesc.trim() || !rencanaAksi?.id) return;
        try {
            await apiClient.post(`/rencana-aksi/${rencanaAksi.id}/todo-items`, {
                deskripsi: newTodoDesc,
                pelaksana_id: newTodoPelaksanaId || null,
                deadline: newTodoDeadline || null,
                month: selectedMonth || null
            });
            setNewTodoDesc('');
            setNewTodoPelaksanaId('');
            // Reset deadline ke awal bulan setelah submit berhasil
            if (selectedDate) {
                const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                setNewTodoDeadline(firstDay.toISOString().split('T')[0]);
            }

            setHasMadeChanges(true);

            fetchTodos();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal menambahkan to-do.';
            alert(errorMessage);
        }
    }, [newTodoDesc, newTodoPelaksanaId, newTodoDeadline, rencanaAksi?.id, selectedMonth, fetchTodos, selectedDate]);

    const handleUpdatePelaksana = useCallback((todoId, newPelaksanaId) => {
        setTodos(prevTodos => prevTodos.map(t => t.id === todoId ? { ...t, pelaksana_id: newPelaksanaId, pelaksana: userList.find(u => u.id === newPelaksanaId) } : t));
        setHasMadeChanges(true); // Mark changes immediately
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

    const handleTodoStateChange = (todoId, updatedValues) => {
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === todoId ? { ...todo, ...updatedValues } : todo
            )
        );
        setHasMadeChanges(true);
    };

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
                    <div className="flex justify-between mb-1"><span className="text-sm font-medium text-gray-700">Progress</span><span className="text-sm font-medium text-gray-700">{progress}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                </div>

                {isPIC && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-gray-800">Tambah Tugas Baru</h3>
                        </div>
                        <form onSubmit={handleAddTodo} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                                <div className="md:col-span-5">
                                    <label htmlFor="new-todo-desc" className="block text-xs font-medium text-gray-600 mb-1">Deskripsi Tugas</label>
                                    <input id="new-todo-desc" type="text" value={newTodoDesc} onChange={e => setNewTodoDesc(e.target.value)} placeholder="Deskripsi tugas..." className="w-full border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div className="md:col-span-3">
                                    <label htmlFor="new-todo-pelaksana" className="block text-xs font-medium text-gray-600 mb-1">Pelaksana</label>
                                    <select id="new-todo-pelaksana" value={newTodoPelaksanaId} onChange={e => setNewTodoPelaksanaId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                        <option value="">-- Pilih Pelaksana --</option>
                                        {userList.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="new-todo-deadline" className="block text-xs font-medium text-gray-600 mb-1">Deadline</label>
                                    <input 
                                        id="new-todo-deadline"
                                        type="date" 
                                        value={newTodoDeadline} 
                                        onChange={e => setNewTodoDeadline(e.target.value)} 
                                        min={minDate}
                                        max={maxDate}
                                        className="w-full border-gray-300 rounded-md shadow-sm" 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tambah</button>
                            </div>
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
                                            {todo.is_late_upload && (
                                                <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                                    Telat Upload
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
                                            <ApprovalControls todo={todo} onApprovalDone={fetchTodos} onStateChange={handleTodoStateChange} selectedMonth={selectedMonth} />
                                        )}
                                        {todo.status_approval === 'approved' && (
                                            <div className="mt-2 text-xs font-semibold text-green-600">
                                                Disetujui
                                            </div>
                                        )}
                                        {/* --- AKHIR LOGIKA APPROVAL --- */}
                                        
                                    </div>
                                    <div className="ml-4 flex flex-col items-end space-y-2 w-32 flex-shrink-0">
                                        {isPelaksana && <FileUploader todo={todo} onUploadComplete={fetchTodos} selectedMonth={selectedMonth} />}
                                        {isPIC && <button onClick={() => handleDeleteTodo(todo.id)} className="text-red-500 hover:text-red-700 text-xs self-end mt-auto"><FiTrash2 /></button>}
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
