import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app as firebaseApp } from '../firebase-config';
import apiClient from '../services/apiClient';
import useAuth from './useAuth';

const useFirebaseMessaging = () => {
    // [FIX] Check for Notification API support first to prevent crashes on iOS Safari.
    const isSupported = 'Notification' in window;

    const { user } = useAuth();
    const [notificationStatus, setNotificationStatus] = useState(isSupported ? Notification.permission : 'unsupported');
    const [messaging, setMessaging] = useState(null);

    useEffect(() => {
        if (isSupported) {
            setMessaging(getMessaging(firebaseApp));
        }
    }, [isSupported]);

    const requestPermissionAndGetToken = useCallback(async () => {
        if (!isSupported || !messaging || !user) return;

        try {
            console.log('Requesting permission...');
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);

            if (permission === 'granted') {
                console.log('Notification permission granted.');

                const serviceWorkerRegistration = await navigator.serviceWorker.ready;
                const currentToken = await getToken(messaging, {
                    vapidKey: 'BJfTym6tD9v3Q8-xht-yJwxWtzUmppJoDKem6mH9JasJRR70hXJMwOqbpXEH6SAA0NPHZQvNemQB-3JGyjhii5o',
                    serviceWorkerRegistration,
                });

                if (currentToken) {
                    console.log('FCM Token:', currentToken);
                    await apiClient.post('/notifications/device-token', { token: currentToken });
                    console.log('Token sent to backend successfully.');
                } else {
                    console.log('No registration token available.');
                }
            } else {
                console.log('Unable to get permission to notify.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token. ', err);
        }
    }, [isSupported, messaging, user]);

    useEffect(() => {
        if (isSupported && messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: payload.notification.icon,
                });
            });
            return () => unsubscribe();
        }
    }, [isSupported, messaging]);

    return { notificationStatus, requestPermissionAndGetToken };
};

export default useFirebaseMessaging;