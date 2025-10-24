import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import apiClient from '@/services/apiClient';
import { FiPlus, FiEdit, FiTrash2, FiPaperclip, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { showConfirmationToast } from '@/components/common/ConfirmationToast';

const TodoModal = ({ rencanaAksi, selectedDate, jabatanTree, onClose }) => {
// ... (rest of the component)
    const handleDeleteTodo = async (todoId) => {
        showConfirmationToast('Yakin ingin menghapus to-do ini?', async () => {
            try {
                await apiClient.delete(`/todo-items/${todoId}`);
                toast.success('To-do berhasil dihapus.');
                fetchTodos();
            } catch (error) {
                toast.error('Gagal menghapus to-do.');
            }
        });
    };


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
        <div className="fixed inset-0 bg-transparent flex justify-center items-start z-50 overflow-y-auto pt-10">
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
                                        {assignableUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
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
                                                    {assignableUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
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
