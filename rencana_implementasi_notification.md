# Rencana Implementasi Fitur Notifikasi

Dokumen ini menguraikan langkah-langkah yang diperlukan untuk mengaktifkan dan memperluas fungsionalitas notifikasi real-time di aplikasi.

---

## ✅ Fase 1: Backend - Aktivasi & Perluasan

- [ ] **Konfigurasi Firebase**:
  - [ ] Pastikan file `backend/.env` sudah terisi dengan kredensial Firebase (`FIREBASE_CREDENTIALS`).
  - [ ] Verifikasi konfigurasi di `config/firebase.php`.

- [ ] **Aktifkan Notifikasi Penugasan**:
  - [ ] Di `RencanaAksiController`, pada metode `store` dan `update`, panggil notifikasi `RencanaAksiAssigned` setelah Rencana Aksi berhasil dibuat atau diubah PIC-nya.

- [ ] **Buat Notifikasi Baru untuk To-Do**:
  - [ ] Buat notifikasi `TodoItemAssigned` (`php artisan make:notification TodoItemAssigned`).
  - [ ] Panggil notifikasi ini dari `TodoItemController` saat `pelaksana_id` diisi atau diubah.
  - [ ] Buat notifikasi `TodoItemStatusUpdated` (untuk `approved` atau `rejected`).
  - [ ] Panggil notifikasi ini dari `TodoItemController` saat PIC melakukan validasi.

- [ ] **Aktifkan Notifikasi Pengingat Deadline**:
  - [ ] Buka file `backend/app/Console/Kernel.php`.
  - [ ] Daftarkan perintah `SendDeadlineReminders` untuk berjalan setiap hari (`daily()`).
  - [ ] Pastikan server menjalankan Laravel Scheduler melalui cron job.

---

## 🟡 Fase 2: Frontend - Penerimaan & Tampilan

- [ ] **Setup Firebase Messaging**:
  - [ ] Buat file `frontend/public/firebase-messaging-sw.js` untuk menangani notifikasi di background.
  - [ ] Di `frontend/src/firebase-config.js`, buat fungsi untuk meminta izin notifikasi dari pengguna.
  - [ ] Buat fungsi untuk mengambil token FCM pengguna.

- [ ] **Manajemen Token**:
  - [ ] Buat endpoint API baru di backend untuk menyimpan token FCM pengguna (`POST /api/device-tokens`).
  - [ ] Saat pengguna memberikan izin, kirim token FCM ke backend dan simpan.

- [ ] **Implementasi UI Notifikasi**:
  - [ ] Buat komponen `NotificationToast.jsx` yang akan muncul di pojok layar saat notifikasi real-time diterima.
  - [ ] Buat komponen `NotificationCenter.jsx` (ikon lonceng di header).
  - [ ] Buat endpoint API baru di backend untuk mengambil daftar notifikasi milik pengguna (`GET /api/notifications`).
  - [ ] Tampilkan daftar notifikasi di `NotificationCenter` dan beri tanda sudah/belum dibaca.

---

## 🧪 Fase 3: Finalisasi & Testing

- [ ] **Testing End-to-End**:
  - [ ] Uji kasus: Manajer menugaskan Rencana Aksi, PIC menerima notifikasi.
  - [ ] Uji kasus: PIC menugaskan To-Do, Pelaksana menerima notifikasi.
  - [ ] Uji kasus: Pelaksana mengunggah eviden, PIC menerima notifikasi.
  - [ ] Uji kasus: PIC menyetujui/menolak To-Do, Pelaksana menerima notifikasi.
  - [ ] Uji kasus: Notifikasi pengingat deadline diterima dengan benar.
