# Project Memory & To-Do List

## Sesi Integrasi Template Tailwick (24 Oktober 2025)

**Tugas Saat Ini:** Mengintegrasikan template premium React "Tailwick" ke dalam proyek `frontend`.

**Progres:**
1.  **Dependensi & File**: Berhasil menggabungkan `package.json`, menginstal semua dependensi, dan menyalin seluruh struktur file (`/src`, `tailwind.config.js`, `vite.config.js`, dll.) dari template Tailwick ke proyek `frontend`.
2.  **Integrasi Otentikasi**: Berhasil mengintegrasikan kembali `AuthContext`, `apiClient`, `ProtectedRoute`, `PublicRoute`, dan halaman `LoginPage` dari aplikasi lama ke dalam struktur template baru.
3.  **Fungsionalitas Dasar**: Aplikasi berhasil dijalankan, menampilkan halaman login yang benar, dan setelah login berhasil, mengarahkan ke layout utama (Sidebar & Topbar) dari template Tailwick.
4.  **Integrasi Konten**: Halaman Dashboard dari aplikasi lama telah berhasil ditampilkan di dalam layout baru. Menu sidebar dan topbar juga telah disesuaikan dengan menu dan data pengguna aplikasi kita.

**Masalah Saat Ini (Blocking):**
*   **Bug Layout CSS**: Terdapat masalah layout yang persisten di mana konten utama halaman (`<main>`) muncul di bawah sidebar, bukan di sebelahnya. Ini mengindikasikan bahwa aturan CSS fundamental (`display: flex` pada `div.wrapper`) tidak diterapkan dengan benar, meskipun semua file konfigurasi dan struktur komponen tampak sudah benar.

**Tugas Selanjutnya (Setelah PC Restart):**
*   **Investigasi CSS di Browser**: Pengguna akan me-restart PC, lalu membuka Developer Tools di browser untuk **menginspeksi elemen `<div class="wrapper">`**. Tujuannya adalah untuk memverifikasi di panel "Styles" apakah properti `display: flex;` benar-benar diterapkan, dicoret, atau tidak ada sama sekali. Hasil dari investigasi ini akan menjadi langkah kita selanjutnya untuk debugging.

---

## Sesi Implementasi RBAC & Dokumentasi (23 Oktober 2025)

**Tugas yang Telah Selesai:**

1.  **Implementasi Role-Based Access Control (RBAC) Penuh**:
    *   Mengintegrasikan package `spatie/laravel-permission`.
    *   Mendefinisikan 6 peran fungsional (`admin`, `pimpinan`, `manajer`, `staff`, `pengawas`, `operator`) dengan hak akses yang jelas.
    *   Mengganti semua logika otorisasi yang di-hardcode dengan Laravel Policies (`RencanaAksiPolicy`).
    *   Menyesuaikan frontend untuk menyembunyikan/menampilkan UI berdasarkan *permissions* pengguna.
    *   Memperbaiki berbagai bug terkait hak akses dan alur kerja pimpinan.

2.  **Penyempurnaan Data & Alur Kerja**:
    *   Memperbarui `JabatanSeeder` agar sesuai dengan struktur organisasi yang sebenarnya dari file `.sql`.
    *   Memperbaiki `UsersSeeder` untuk menugaskan peran default kepada pengguna.
    *   Menyesuaikan logika pemilihan PIC agar `admin` bisa melihat semua pengguna.

3.  **Perbaikan UI/UX**:
    *   Menyempurnakan skema pewarnaan pada Laporan Matriks agar lebih intuitif dan mudah dibaca.
    *   Memperbaiki kontras warna teks pada laporan.

4.  **Perapian & Dokumentasi Proyek**:
    *   Memindahkan semua file non-aplikasi ke dalam folder `_Dokumentasi` dan mengeluarkannya dari Git.
    *   Menghasilkan dokumentasi API teknis secara otomatis menggunakan Scribe.
    *   Membuat dokumentasi skema database, panduan deployment (Linux & Windows), dan panduan troubleshooting.
    *   Membuat panduan pengguna (user manual) yang komprehensif berdasarkan peran.

**Tugas Selanjutnya (Sesuai Rencana):**

*   **Implementasi Fitur Notifikasi**: Melanjutkan pekerjaan sesuai dengan panduan di `_Dokumentasi/rencana_implementasi_notification.md`.

---
*Catatan Lama di Bawah*

## Sesi Pengerjaan Fitur & Bug Fixing (22 Oktober 2025)

**Tugas yang Telah Selesai:**

1.  **Perbaikan Fitur Ekspor Laporan:**
    *   Memperbaiki error `null given` pada ekspor Excel Laporan Matriks dengan menambahkan null check pada relasi lampiran.
    *   Menyelaraskan logika penentuan bulan antara ekspor Excel dan PDF dengan mengintegrasikan `JadwalService`.
    *   Memperbaiki format dan akurasi nilai progres pada ekspor PDF Laporan Tahunan dan Laporan Matriks.
    *   Menyesuaikan layout progress bar di PDF Laporan Tahunan agar teks selalu di tengah dan mudah dibaca.

2.  **Implementasi Modul Jabatan & Manajemen Pengguna:**
    *   **Backend**: Membuat API endpoints (CRUD), Form Requests, dan API Resources untuk kedua modul.
    *   **Frontend**: Membangun halaman manajemen untuk menampilkan data, serta komponen `Modal` dan `Form` untuk fungsionalitas Tambah/Edit.
    *   Mengganti tombol aksi dengan ikon dan tooltips untuk modernisasi UI.

3.  **Bug Fixing Kritis:**
    *   Mengatasi masalah CORS yang menghalangi komunikasi frontend dan backend.
    *   Memperbaiki masalah otentikasi (`Unauthenticated`) pada modul baru dengan menyelaraskan penggunaan `apiClient`.
    *   Menyelesaikan error `QueryException` saat mengedit Jabatan dengan mengubah input `bidang` menjadi dropdown sesuai skema database (ENUM).
    *   Memperbaiki masalah data jabatan yang tidak tampil sepenuhnya dengan mengembalikan logika pengambilan data menjadi *flat list*.

**Tugas Selanjutnya (Bug yang Belum Terselesaikan):**

*   **Bug pada Jabatan Tree**: Saat memilih PIC di form Rencana Aksi, tree jabatan tidak tampil dengan benar (kemungkinan ada data duplikat atau hierarki salah). Perlu diinvestigasi lebih lanjut pada `RencanaAksiPage.jsx` dan `JabatanSelector.jsx`.
*   **Perbaikan Penugasan Rencana Aksi**: Memastikan fungsionalitas penugasan PIC di Rencana Aksi berjalan lancar setelah bug tree diperbaiki.

---
*Catatan Lama di Bawah*
...