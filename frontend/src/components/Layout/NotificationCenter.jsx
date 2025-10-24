import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import apiClient from '../../services/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState({ unread: [], read: [] });
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await apiClient.post('/notifications/mark-as-read', { id: notificationId });
            fetchNotifications(); // Refresh list after marking as read
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const unreadCount = notifications.unread.length;

    return (
        <div className="">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-screen max-w-md sm:w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 text-sm font-semibold text-gray-900 border-b">Notifikasi</div>
                        {loading ? (
                            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                        ) : (
                            <>
                                <div className="font-semibold px-4 py-2 text-xs text-gray-500">BELUM DIBACA</div>
                                {notifications.unread.length > 0 ? (
                                    notifications.unread.map((notif) => (
                                        <div key={notif.id} className="border-b px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <p className="font-bold">{notif.data.title}</p>
                                            <p className="text-gray-600">{notif.data.message}</p>
                                            <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                                                <span>{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}</span>
                                                <button onClick={() => handleMarkAsRead(notif.id)} className="text-blue-500 hover:underline">Tandai dibaca</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500">Tidak ada notifikasi baru.</div>
                                )}
                                <div className="font-semibold px-4 py-2 text-xs text-gray-500 mt-2">SUDAH DIBACA</div>
                                {notifications.read.length > 0 ? (
                                    notifications.read.map((notif) => (
                                        <div key={notif.id} className="px-4 py-2 text-sm text-gray-500">
                                            <p className="font-bold">{notif.data.title}</p>
                                            <p className="text-gray-600">{notif.data.message}</p>
                                            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500">Tidak ada notifikasi yang lebih lama.</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
