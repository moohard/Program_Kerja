import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { FiClipboard, FiCheckSquare, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import StatCard from '../components/dashboard/StatCard';
import CategoryProgressChart from '../components/dashboard/CategoryProgressChart';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import RecentActivity from '../components/dashboard/RecentActivity';
import DashboardFilter from '../components/dashboard/DashboardFilter'; // Import filter component


function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        program_kerja_id: '',
        kategori_id: '',
        user_id: '',
        status: '',
    });

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            // Clean up filters by removing empty values
            const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
                if (value) acc[key] = value;
                return acc;
            }, {});

            const params = new URLSearchParams(activeFilters);
            const response = await apiClient.get(`/dashboard-stats?${params.toString()}`);
            setDashboardData(response.data);
        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Destructure data only when it's available
    const { summary, progress_by_category, upcoming_deadlines, recent_activity } = dashboardData || {};
    const total = summary ? Object.values(summary).reduce((acc, val) => acc + val, 0) : 0;

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <DashboardFilter filters={filters} onFilterChange={handleFilterChange} />

            {loading ? (
                <div className="flex justify-center items-center h-64"><div className="loader"></div></div>
            ) : !dashboardData ? (
                <div className="text-center text-gray-500">Gagal memuat data dashboard.</div>
            ) : (
                <>
                    {/* Bagian Statistik Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Rencana Aksi" value={total} icon={<FiClipboard size={24}/>} color="blue" />
                        <StatCard title="Selesai" value={summary.completed || 0} icon={<FiCheckSquare size={24}/>} color="green" />
                        <StatCard title="Dalam Pengerjaan" value={summary.in_progress || 0} icon={<FiLoader size={24}/>} color="yellow" />
                        <StatCard title="Terlambat" value={summary.delayed || 0} icon={<FiAlertTriangle size={24}/>} color="red" />
                    </div>
                    
                    {/* Bagian Utama: Grafik, Tenggat Waktu, dan Aktivitas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <CategoryProgressChart data={progress_by_category} />
                        </div>
                        <div className="space-y-6">
                            <UpcomingDeadlines data={upcoming_deadlines} />
                            <RecentActivity data={recent_activity} />
                        </div>
                    </div>


                </>
            )}
        </div>
    );
}

export default DashboardPage;