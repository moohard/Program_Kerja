import React from 'react';
import GeminiAssistant from '../components/dashboard/GeminiAssistant';

function DashboardPage() {
    return (
        <div>
            <div className="bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Selamat datang! Silakan pilih modul dari menu di samping.</p>
            </div>
            <GeminiAssistant />
        </div>
    );
}

export default DashboardPage;
