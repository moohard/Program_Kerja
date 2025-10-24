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
            const token = await requestForToken();
            if (token) {
                try {
                    await apiClient.post('/device-tokens', { token });
                } catch (error) {
                    console.error('Error sending device token to backend:', error);
                }
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
        });

        // Cleanup listener saat komponen di-unmount
        return () => {
            unsubscribe();
        };
    }, [user]); // Efek ini akan berjalan lagi jika user berubah (login/logout)

    return null; // Komponen ini tidak me-render apapun
};

export default NotificationHandler;
