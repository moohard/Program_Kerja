import { initializeApp } from "firebase/app";

// Konfigurasi proyek Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBuotkuF0oXYPb13pGNSm0bTs8ZWaSjsVw",
  authDomain: "notifikasi-perkara-sipp.firebaseapp.com",
  projectId: "notifikasi-perkara-sipp",
  storageBucket: "notifikasi-perkara-sipp.firebasestorage.app",
  messagingSenderId: "801439386889",
  appId: "1:801439386889:web:cab5701f4b6b0d7e2517d8",
  measurementId: "G-VT01LY8XPH"
};

// Inisialisasi dan ekspor Firebase App
export const app = initializeApp(firebaseConfig);