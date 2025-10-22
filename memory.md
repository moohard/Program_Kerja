# Project Memory & To-Do List

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
