// Import the Firebase app and messaging modules from a local path
importScripts('/firebase-sdk/firebase-app.js');
importScripts('/firebase-sdk/firebase-messaging.js');

// Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBuotkuF0oXYPb13pGNSm0bTs8ZWaSjsVw",
  authDomain: "notifikasi-perkara-sipp.firebaseapp.com",
  projectId: "notifikasi-perkara-sipp",
  storageBucket: "notifikasi-perkara-sipp.firebasestorage.app",
  messagingSenderId: "801439386889",
  appId: "1:801439386889:web:cab5701f4b6b0d7e2517d8",
  measurementId: "G-VT01LY8XPH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the messaging service
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Or your app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// This line is crucial for VitePWA
importScripts('/sw.js');