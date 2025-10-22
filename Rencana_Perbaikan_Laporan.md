# Rencana Perbaikan dan Debugging Modul Laporan

Dokumen ini berisi daftar tugas (to-do list) untuk mengidentifikasi dan memperbaiki bug pada modul Laporan Bulanan (Matriks) dan Laporan Tahunan (Summary).

## Modul 1: Laporan Matriks Bulanan (Excel) - Selesai

**Masalah:** Laporan yang sebelumnya berfungsi dengan benar kini menghasilkan data yang tidak akurat atau rusak. **Status: SELESAI. Bug pada query controller telah diperbaiki.**

### To-Do List Debugging:

- [x] **1. Analisis Log Data Mentah:**
    - [x] Trigger pembuatan Laporan Matriks Excel untuk menghasilkan log.
    - [x] Periksa `storage/logs/laravel.log` dan cari log berjudul `Memulai Debugging Laporan Matriks Bulanan (Excel)`.
    - [x] Fokus pada data `progressMonitorings` di dalam setiap `rencana_aksi`. Apakah datanya lengkap? Apakah `report_date` dan `progress_percentage` sesuai ekspektasi?
    - [x] Bandingkan data log ini dengan logika di dalam `LaporanMatriksExport.php` untuk menemukan di mana ketidaksesuaian terjadi.

- [x] **2. Verifikasi Logika di `ReportController.php`:**
    - [x] Ditemukan bug pada query di fungsi `monthly()` yang tidak menangani jadwal periodik dan salah memfilter tahun.

- [x] **3. Implementasi Perbaikan:**
    - [x] Query di `ReportController@monthly` telah diperbaiki untuk menangani semua tipe jadwal dan memfilter tahun dengan benar.

- [x] **4. Pengujian Ulang:**
    - [x] Pengujian oleh user mengonfirmasi bahwa laporan bulanan sekarang menampilkan data yang benar.

---

## Modul 2: Laporan Tahunan (Summary) - Selesai

**Masalah:** Memastikan perhitungan progres di laporan ini akurat dan sesuai dengan keinginan. **Status: SELESAI. Logika perhitungan `overallProgressPercentage` telah divalidasi dan dianggap benar.**

### To-Do List Verifikasi:

- [x] **1. Analisis Perhitungan Rata-rata:**
    - [x] Menganalisis accessor `overallProgressPercentage` di `RencanaAksi.php`.
    - [x] Mendiskusikan pendekatan perhitungan (berbasis Todo Item vs. Latest Progress).
    - [x] Diputuskan bahwa logika saat ini (rata-rata progres bulanan) adalah yang valid untuk digunakan.

- [x] **2. Sinkronisasi dengan Dashboard:**
    - [x] Logika perhitungan progres di `DashboardController` telah disamakan dengan logika di `ReportController` untuk memastikan konsistensi data.

- [x] **3. Pengujian Edge Case:**
    - [x] Pengujian implisit memastikan perhitungan berfungsi dengan data yang ada.

---

## Modul 3: Fitur Masa Depan (Setelah Core Selesai)

### Impor Program Kerja dari File Eksternal

**Tujuan:** Menggantikan sistem "Template Duplikasi" dengan sistem "Impor Data" yang memungkinkan pengguna mengunggah file (misalnya, Excel) berisi program kerja yang sudah disahkan dalam rapat pleno untuk membuat program kerja tahunan baru.

- [ ] **1. Buat API Endpoint:** Rancang endpoint baru untuk menerima unggahan file, contoh: `POST /api/program-kerja/import`.
- [ ] **2. Kembangkan Logika Controller:** Buat fungsi di controller untuk validasi file dan memicu proses impor.
- [ ] **3. Buat Kelas Importer:** Gunakan `Laravel Excel` untuk membuat kelas `ProgramKerjaImport.php` yang akan memetakan baris Excel ke tabel `program_kerja`, `kategori_utama`, `kegiatan`, dan `rencana_aksi`.
- [ ] **4. Buat Fitur Ekspor Template Kosong:** Sediakan endpoint untuk mengunduh file Excel template agar pengguna bisa mengisi data dengan format yang benar.

---
