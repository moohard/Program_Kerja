import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/notifications');
            const data = response.data;
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Gagal memuat notifikasi.');
        } finally {
            setLoading(false);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await apiClient.post('/notifications/mark-as-read');
            setNotifications(prev => 
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
            toast.error('Gagal menandai notifikasi sebagai telah dibaca.');
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllAsRead,
    };
};
