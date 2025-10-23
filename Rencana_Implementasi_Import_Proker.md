# Rencana Implementasi: Impor & Versioning Program Kerja dari Excel

Dokumen ini menguraikan rencana teknis untuk mengimplementasikan fitur impor Program Kerja (Kategori Utama & Kegiatan) dari file Excel, lengkap dengan sistem versioning untuk menangani revisi.

## Tujuan Utama

- Memungkinkan admin untuk mengunggah file Excel berisi struktur Program Kerja (Kategori & Kegiatan) untuk tahun tertentu.
- Menghindari input data manual yang memakan waktu.
- Menyimpan histori perubahan Program Kerja setiap kali ada revisi, tanpa menghapus data lama.
- Memastikan aplikasi selalu menampilkan versi Program Kerja yang paling mutakhir.

---

## Fase 1: Backend - Persiapan Database & Logika Inti

### Langkah 1.1: Migrasi Database

- **Tujuan:** Menambahkan kolom `version` untuk melacak histori perubahan.
- **Tindakan:**
  - Buat file migrasi baru (`php artisan make:migration add_version_to_proker_tables`).
  - Tambahkan kolom `version` (tipe: `integer`, `default: 1`, `unsigned`) ke tabel `kategori_utama` dan `kegiatan`.
  - Jalankan migrasi untuk menerapkan perubahan ke skema database.

### Langkah 1.2: Membuat Fitur "Download Template"

- **Tujuan:** Memberikan pengguna template Excel dengan format yang benar untuk diisi.
- **Tindakan:**
  - Buat **Export Class** baru (misalnya, `ProgramKerjaTemplateExport.php`) menggunakan `maatwebsite/excel`.
  - Kelas ini akan menghasilkan file Excel kosong yang hanya berisi header kolom yang dibutuhkan (contoh: `NOMOR_KATEGORI`, `NAMA_KATEGORI`, `NAMA_KEGIATAN`).
  - Buat **API Endpoint** baru (`GET /api/program-kerja/download-template`) yang memicu unduhan file template ini.

### Langkah 1.3: Membuat Fitur Impor

- **Tujuan:** Memproses file Excel yang diunggah dan menyimpannya sebagai versi baru Program Kerja.
- **Tindakan:**
  - Buat **API Endpoint** baru (`POST /api/program-kerja/{programKerja}/import`) yang menerima unggahan file. Endpoint ini akan dilindungi oleh permission yang sesuai (misalnya, `manage master data`).
  - Buat **Import Class** baru (misalnya, `ProgramKerjaImport.php`) yang berisi logika utama:
    1.  **Menerima `program_kerja_id`** sebagai parameter untuk mengetahui tahun mana yang sedang diimpor.
    2.  **Menentukan Versi Baru:** Sebelum impor, lakukan query ke database untuk mencari `version` tertinggi yang sudah ada untuk `program_kerja_id` tersebut. Versi baru akan menjadi `versi tertinggi + 1`.
    3.  **Membaca Excel:** Proses setiap baris di file Excel.
    4.  **Logika Cerdas:** Untuk setiap baris:
        - Cari `KategoriUtama` berdasarkan nomor/nama. Jika belum ada di **versi baru ini**, buat record baru dengan `version` yang baru.
        - Buat record `Kegiatan` baru di bawah `KategoriUtama` yang sesuai, juga dengan `version` yang baru.
    5.  **Validasi:** Pastikan data di setiap baris valid. Jika ada error, batalkan seluruh proses impor dan kembalikan pesan error yang jelas (misalnya, "Error di baris 10: Nama Kegiatan kosong"). Proses impor harus bersifat *atomic* (semua berhasil atau semua gagal).

---

## Fase 2: Backend - Penyesuaian Query Aplikasi

### Langkah 2.1: Membuat Query Scope

- **Tujuan:** Memastikan seluruh aplikasi hanya menampilkan versi Program Kerja yang paling baru.
- **Tindakan:**
  - Di model `KategoriUtama.php` dan `Kegiatan.php`, buat sebuah **Query Scope** (misalnya, `scopeLatestVersion($query, $programKerjaId)`).
  - Scope ini akan berisi logika query SQL untuk mengambil record di mana `version` adalah yang tertinggi untuk `program_kerja_id` yang diberikan.

### Langkah 2.2: Menerapkan Scope

- **Tujuan:** Mengintegrasikan scope baru ke semua bagian aplikasi yang relevan.
- **Tindakan:**
  - Perbarui semua controller dan query Eloquent yang mengambil data Kategori atau Kegiatan (misalnya, di `RencanaAksiController`, `ReportController`, dll.) untuk menggunakan scope `latestVersion()` yang baru.
  - Ini memastikan bahwa dropdown, laporan, dan halaman lainnya secara otomatis hanya menampilkan data yang paling mutakhir.

---

## Fase 3: Frontend - Antarmuka Pengguna (UI)

### Langkah 3.1: Membuat Komponen Impor

- **Tujuan:** Menyediakan UI yang mudah digunakan untuk proses impor.
- **Tindakan:**
  - Di halaman "Master Data" -> "Kegiatan", tambahkan tombol **"Import Program Kerja"**.
  - Tombol ini akan membuka sebuah **Modal (Pop-up)** yang berisi alur 3 langkah:
    1.  **Pilih Tahun:** Dropdown untuk memilih `ProgramKerja` (tahun) yang akan diimpor.
    2.  **Unduh & Unggah:**
        - Tombol **"Unduh Template"** yang memanggil API dari Langkah 1.2.
        - Input file untuk memilih file Excel yang sudah diisi.
    3.  **Mulai Impor:** Tombol "Impor" yang memanggil API dari Langkah 1.3.

### Langkah 3.2: Menampilkan Feedback

- **Tujuan:** Memberikan umpan balik yang jelas kepada pengguna selama dan setelah proses impor.
- **Tindakan:**
  - Saat tombol "Impor" diklik, tampilkan status loading (`Mengimpor data...`).
  - Jika API mengembalikan sukses, tampilkan pesan sukses (`toast.success`) dan secara otomatis muat ulang data di halaman.
  - Jika API mengembalikan error, tampilkan pesan error yang detail (`toast.error`) agar pengguna tahu apa yang harus diperbaiki di file Excel mereka.
