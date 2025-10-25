import { useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { onMessage } from 'firebase/messaging';

import AuthContext from '@/context/AuthContext';
import { requestForToken, messaging } from '@/firebase-config';
import apiClient from '@/services/apiClient';

const NotificationHandler = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const setupNotifications = async () => {
            console.log('[Debug] Attempting to get notification token...');
            try {
                const token = await requestForToken();
                if (token) {
                    console.log('[Debug] Got token:', token);
                    console.log('[Debug] Sending token to backend...');
                    await apiClient.post('/device-tokens', { token });
                    console.log('[Debug] Token sent to backend successfully.');
                } else {
                    console.warn('[Debug] No notification token received. User may have denied permission.');
                }
            } catch (error) {
                console.error('[Debug] Error getting or sending notification token:', error);
            }
        };

        // Hanya setup notifikasi jika user sudah login
        if (user) {
            setupNotifications();
        }

        // Menangani notifikasi yang masuk saat aplikasi di foreground
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            toast.info(
                <div>
                    <strong>{payload.notification.title}</strong>
                    <br />
                    {payload.notification.body}
                </div>
            );
            
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('new-notification'));
        });

        // Cleanup listener saat komponen di-unmount
        return () => {
            unsubscribe();
        };
    }, [user]); // Efek ini akan berjalan lagi jika user berubah (login/logout)

    return null; // Komponen ini tidak me-render apapun
};

export default NotificationHandler;
