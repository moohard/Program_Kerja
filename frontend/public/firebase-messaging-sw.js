importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

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
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

