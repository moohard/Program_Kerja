// Import a specific version of the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker
// (Ganti dengan konfigurasi proyek Firebase Anda)
firebase.initializeApp({
  apiKey: "AIzaSyBuotkuF0oXYPb13pGNSm0bTs8ZWaSjsVw",
  authDomain: "notifikasi-perkara-sipp.firebaseapp.com",
  projectId: "notifikasi-perkara-sipp",
  storageBucket: "notifikasi-perkara-sipp.firebasestorage.app",
  messagingSenderId: "801439386889",
  appId: "1:801439386889:web:cab5701f4b6b0d7e2517d8",
  measurementId: "G-VT01LY8XPH"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();
