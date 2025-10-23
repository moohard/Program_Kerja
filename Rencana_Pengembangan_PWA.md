# Rencana Pengembangan Fitur PWA (Progressive Web App)

Dokumen ini berisi ide dan rencana untuk meningkatkan fungsionalitas PWA yang sudah ada di aplikasi.

## Status Saat Ini

Aplikasi frontend saat ini sudah dikonfigurasi sebagai PWA dasar menggunakan `vite-plugin-pwa`.

Fitur yang sudah aktif:
- **Dapat Diinstal:** Pengguna bisa menambahkan aplikasi ke Home Screen (mobile) atau sebagai aplikasi desktop.
- **Kemampuan Offline Dasar:** "Cangkang" atau UI utama aplikasi dapat dimuat tanpa koneksi internet, menghindari halaman error "No Internet".
- **Push Notifications:** Sistem notifikasi real-time sudah berfungsi.

## Peningkatan di Masa Depan

Berikut adalah beberapa area pengembangan untuk membuat PWA lebih andal dan fungsional:

### 1. Caching Panggilan API

- **Tujuan:** Menyimpan respons dari panggilan API (misalnya, daftar Rencana Aksi, To-Do) di perangkat pengguna.
- **Manfaat:** Saat pengguna membuka aplikasi dalam kondisi offline atau koneksi lambat, aplikasi dapat menampilkan data terakhir yang berhasil dimuat, bukan hanya layar loading atau kosong. Ini secara signifikan meningkatkan pengalaman pengguna.
- **Implementasi:** Mengkonfigurasi Workbox (melalui `vite-plugin-pwa`) untuk membuat strategi caching untuk route API (misalnya, `/api/rencana-aksi`), seperti strategi `StaleWhileRevalidate` atau `CacheFirst`.

### 2. Halaman Offline Kustom

- **Tujuan:** Menampilkan halaman atau komponen yang informatif saat pengguna mencoba mengakses fitur yang memerlukan koneksi internet, tetapi sedang offline.
- **Manfaat:** Memberikan feedback yang jelas kepada pengguna tentang status koneksi mereka, daripada menampilkan error generik dari browser atau aplikasi.
- **Implementasi:** Mendeteksi status online/offline di dalam aplikasi React (misalnya, menggunakan hook `useSyncExternalStore` dengan `navigator.onLine`) dan merender komponen halaman offline secara kondisional.

### 3. Sinkronisasi Latar Belakang (Background Sync)

- **Tujuan:** Mengizinkan pengguna untuk melakukan aksi yang mengubah data (misalnya, membuat atau mengedit To-Do) bahkan saat sedang offline.
- **Manfaat:** Aksi pengguna akan disimpan secara lokal (misalnya di IndexedDB). Saat koneksi internet kembali tersedia, Service Worker akan secara otomatis mengirim data yang tersimpan ke server di latar belakang, memastikan tidak ada data yang hilang.
- **Implementasi:** Menggunakan API `Background Sync` dari browser dan mengintegrasikannya dengan Service Worker untuk mengelola antrian request yang gagal saat offline.
