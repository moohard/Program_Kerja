import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { FiClipboard, FiCheckSquare, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import StatCard from '../components/dashboard/StatCard';
import CategoryProgressChart from '../components/dashboard/CategoryProgressChart';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import GeminiAssistant from '../components/dashboard/GeminiAssistant';

function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/dashboard-stats');
                setDashboardData(response.data);
            } catch (error) {
                console.error("Gagal memuat data dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="loader"></div></div>;
    }

    if (!dashboardData) {
        return <div className="text-center text-gray-500">Gagal memuat data dashboard.</div>;
    }

    const { summary, progress_by_category, upcoming_deadlines } = dashboardData;
    
    // Hitung total dari semua status di summary
    const total = Object.values(summary).reduce((acc, val) => acc + val, 0);

    return (
        <div className="space-y-6">
            {/* Bagian Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Rencana Aksi" value={total} icon={<FiClipboard size={24}/>} color="blue" />
                <StatCard title="Selesai" value={summary.completed || 0} icon={<FiCheckSquare size={24}/>} color="green" />
                <StatCard title="Dalam Pengerjaan" value={summary.in_progress || 0} icon={<FiLoader size={24}/>} color="yellow" />
                <StatCard title="Terlambat" value={summary.delayed || 0} icon={<FiAlertTriangle size={24}/>} color="red" />
            </div>
            
            {/* Bagian Grafik dan Tenggat Waktu */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CategoryProgressChart data={progress_by_category} />
                </div>
                <div>
                    <UpcomingDeadlines data={upcoming_deadlines} />
                </div>
            </div>

            {/* Asisten AI Gemini */}
            <GeminiAssistant />
        </div>
    );
}

export default DashboardPage;