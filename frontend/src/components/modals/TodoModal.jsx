import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';

function TodoModal({ rencanaAksi, onClose }) {
    const [todos, setTodos] = useState([]);
    const [newTodoDesc, setNewTodoDesc] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTodos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/rencana-aksi/${rencanaAksi.id}/todos`);
            setTodos(response.data.data);
        } catch (error) {
            console.error("Gagal memuat to-do list:", error);
        } finally {
            setLoading(false);
        }
    }, [rencanaAksi.id]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodoDesc.trim()) return;
        try {
            await apiClient.post(`/rencana-aksi/${rencanaAksi.id}/todos`, { deskripsi: newTodoDesc });
            setNewTodoDesc('');
            fetchTodos();
        } catch (error) {
            alert('Gagal menambahkan to-do.');
        }
    };

    const handleToggleTodo = async (todo) => {
        try {
            await apiClient.put(`/todos/${todo.id}`, { completed: !todo.completed });
            fetchTodos();
        } catch (error) {
            alert('Gagal memperbarui status to-do.');
        }
    };

    const handleDeleteTodo = async (todoId) => {
        if (window.confirm('Yakin ingin menghapus to-do ini?')) {
            try {
                await apiClient.delete(`/todos/${todoId}`);
                fetchTodos();
            } catch (error) {
                alert('Gagal menghapus to-do.');
            }
        }
    };

    const completedCount = todos.filter(t => t.completed).length;
    const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto pt-10">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mb-10">
                <h2 className="text-xl font-bold mb-2">To-Do List</h2>
                <p className="text-sm text-gray-600 mb-4">{rencanaAksi.deskripsi_aksi}</p>

                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full progress-bar-container h-2.5">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                    <input type="text" value={newTodoDesc} onChange={e => setNewTodoDesc(e.target.value)} placeholder="Tambah tugas baru..." className="flex-grow border-gray-300 rounded-md" />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Tambah</button>
                </form>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {loading ? <div className="flex justify-center p-4"><div className="loader w-8 h-8"></div></div> :
                        todos.map(todo => (
                            <div key={todo.id} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                                <input type="checkbox" checked={todo.completed} onChange={() => handleToggleTodo(todo)} className="h-5 w-5 text-indigo-600 border-gray-300 rounded" />
                                <label className={`ml-3 flex-grow text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{todo.deskripsi}</label>
                                <button onClick={() => handleDeleteTodo(todo.id)} className="ml-4 text-red-500 hover:text-red-700 text-xs">Hapus</button>
                            </div>
                        ))
                    }
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Tutup</button>
                </div>
            </div>
        </div>
    );
}

export default TodoModal;
