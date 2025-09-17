import React, { useState } from 'react';
import axios from 'axios';
import { GEMINI_API_URL } from '../../services/apiClient';

function GeminiAssistant() {
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [prompt, setPrompt] = useState('');
    const [description, setDescription] = useState('');
    const [todoPrompt, setTodoPrompt] = useState('');
    const [todoList, setTodoList] = useState('');
    const [loading, setLoading] = useState({ description: false, todo: false });

    const handleKeyChange = (e) => {
        const newKey = e.target.value;
        setApiKey(newKey);
        localStorage.setItem('gemini_api_key', newKey);
    }

    const callGemini = async (systemPrompt, userQuery) => {
        if (!apiKey) {
            alert("Silakan masukkan Gemini API Key Anda.");
            return null;
        }
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };
        try {
            const response = await axios.post(`${GEMINI_API_URL}${apiKey}`, payload, { headers: { 'Content-Type': 'application/json' } });
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini API Error:", error.response?.data || error.message);
            alert("Terjadi kesalahan saat memanggil Gemini API. Cek konsol untuk detail.");
            return null;
        }
    };

    const generateDescription = async () => {
        setLoading(prev => ({ ...prev, description: true }));
        const systemPrompt = "Anda adalah asisten ahli administrasi di sebuah instansi pemerintah Indonesia. Buatkan sebuah deskripsi yang formal, jelas, dan profesional untuk sebuah rencana aksi. Gunakan bahasa Indonesia yang baku.";
        const userQuery = `Buatkan deskripsi untuk rencana aksi dengan judul: "${prompt}"`;
        const result = await callGemini(systemPrompt, userQuery);
        if (result) setDescription(result);
        setLoading(prev => ({ ...prev, description: false }));
    };

    const generateTodoList = async () => {
        setLoading(prev => ({ ...prev, todo: true }));
        const systemPrompt = "Anda adalah seorang manajer proyek yang efisien. Pecah deskripsi rencana aksi berikut menjadi beberapa langkah kerja (to-do list) yang konkret dan dapat ditindaklanjuti. Format hasilnya sebagai daftar bernomor.";
        const userQuery = `Pecah deskripsi ini menjadi to-do list: "${todoPrompt}"`;
        const result = await callGemini(systemPrompt, userQuery);
        if (result) setTodoList(result);
        setLoading(prev => ({ ...prev, todo: false }));
    };

    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800">✨ Buat Draf Deskripsi Rencana Aksi</h3>
                <div className="my-4">
                    <label className="text-sm font-medium text-gray-700">Gemini API Key</label>
                    <input type="password" value={apiKey} onChange={handleKeyChange} placeholder="Masukkan API Key Anda" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="my-4">
                    <label className="text-sm font-medium text-gray-700">Judul Rencana Aksi</label>
                    <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Contoh: Membuat Laporan Triwulan" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <button onClick={generateDescription} disabled={loading.description || !apiKey} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center">
                    {loading.description && <span className="gemini-loader mr-2"></span>}
                    Buat Deskripsi
                </button>
                {description && <textarea readOnly value={description} rows="5" className="mt-4 w-full p-2 border border-gray-200 rounded-md bg-gray-50"></textarea>}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800">✨ Buat To-Do List Otomatis</h3>
                <div className="my-4">
                    <label className="text-sm font-medium text-gray-700">Deskripsi Rencana Aksi</label>
                    <textarea value={todoPrompt} onChange={e => setTodoPrompt(e.target.value)} rows="6" placeholder="Salin deskripsi dari sebelah, atau tulis deskripsi Anda sendiri di sini." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                </div>
                <button onClick={generateTodoList} disabled={loading.todo || !apiKey} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center">
                    {loading.todo && <span className="gemini-loader mr-2"></span>}
                    Buat To-Do List
                </button>
                {todoList && <textarea readOnly value={todoList} rows="5" className="mt-4 w-full p-2 border border-gray-200 rounded-md bg-gray-50"></textarea>}
            </div>
        </div>
    );
}

export default GeminiAssistant;
