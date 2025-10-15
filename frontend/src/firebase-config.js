import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Ganti dengan konfigurasi proyek Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBuotkuF0oXYPb13pGNSm0bTs8ZWaSjsVw",
  authDomain: "notifikasi-perkara-sipp.firebaseapp.com",
  projectId: "notifikasi-perkara-sipp",
  storageBucket: "notifikasi-perkara-sipp.firebasestorage.app",
  messagingSenderId: "801439386889",
  appId: "1:801439386889:web:cab5701f4b6b0d7e2517d8",
  measurementId: "G-VT01LY8XPH"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Fungsi untuk meminta izin notifikasi dan mendapatkan token
export const requestPermission = async () => {
    console.log('Requesting permission...');
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        console.log('Notification permission granted.');

        // Dapatkan token. Ganti 'YOUR_VAPID_KEY' dengan VAPID key Anda dari Firebase Console
        // Project Settings -> Cloud Messaging -> Web Push certificates -> Key pair
        const currentToken = await getToken(messaging, { vapidKey: 'BJfTym6tD9v3Q8-xht-yJwxWtzUmppJoDKeM6mH9JasJRR70hXJMwOqbpXEH6SAA0NPHZQvNemQB-3JGyjhii5o' });

        if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Kirim token ini ke backend Anda untuk disimpan
            return currentToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
        }
    } else {
        console.log('Unable to get permission to notify.');
        return null;
    }
};

// Listener untuk pesan yang masuk saat aplikasi sedang dibuka
onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // Di sini Anda bisa menampilkan notifikasi kustom di dalam aplikasi
    // Misalnya menggunakan library 'react-toastify' atau sejenisnya
    alert(`Notifikasi Baru:\n${payload.notification.title}\n${payload.notification.body}`);
});

export { messaging };
