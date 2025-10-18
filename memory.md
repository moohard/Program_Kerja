## Checkpoint Kemajuan Proyek

Berikut adalah daftar fitur yang telah diselesaikan:

### Fase 3: Monitoring & Reporting

- [x] **#1: Implementasi "Recent Activity Feed" di Dasbor.**
  - [x] Backend: Endpoint di `DashboardController` telah diperbarui untuk menyajikan data `AuditLog`.
  - [x] Frontend: Komponen `RecentActivity.jsx` telah dibuat dan diintegrasikan ke `DashboardPage.jsx`.

- [x] **#2: Implementasi "Advanced Filtering" di Dasbor.**
  - [x] Backend: `DashboardController` dan `KategoriUtamaController` diperbarui untuk menerima dan memproses parameter filter.
  - [x] Backend: Endpoint baru `/api/program-kerja` dibuat untuk menyuplai data filter tahun.
  - [x] Frontend: Komponen `DashboardFilter.jsx` dibuat untuk menampung UI filter.
  - [x] Frontend: `DashboardPage.jsx` di-refactor untuk mengelola state filter dan memuat ulang data saat filter berubah.

- [x] **#3: Buat fitur spesifik "Laporan Tahunan".**
  - [x] Backend: Endpoint `/api/reports/annual-summary` dan logika di `ReportController` telah dibuat.
  - [x] Frontend: Halaman `AnnualReportPage.jsx` dibuat untuk menampilkan data laporan tahunan.
  - [x] Frontend: Rute dan link navigasi di sidebar telah ditambahkan.
  - [x] Bug Fix: Memperbaiki berbagai masalah pada Laporan Bulanan dan Matriks (rute 404, error render, dan logika filter jadwal).

- [x] **#4: Implementasi Ekspor Laporan Matriks ke PDF via MinIO.**
  - [x] Backend: Menginstal `barryvdh/laravel-dompdf` untuk dukungan PDF.
  - [x] Backend: `ReportController` diperbarui untuk menghasilkan file PDF dari Blade view.
  - [x] Backend: Logika ditambahkan untuk mengunggah PDF yang dihasilkan ke MinIO (disk 's3') dan membuat URL unduhan sementara.
  - [x] Backend: Rute `/api/reports/export-matrix` diperbarui untuk menangani format PDF.
  - [x] Frontend: `LaporanMatriksPage.jsx` dimodifikasi untuk memanggil endpoint ekspor PDF dan menangani URL unduhan yang diterima.
  - [x] Bug Fix: Memperbaiki error 500 karena `Facade/Pdf` tidak ditemukan dengan menginstal paket yang benar.

- [x] **#5: Refactor Modul Program Kerja.**
  - [x] Backend: `ProgramKerjaController` di-refactor untuk menggunakan `StoreProgramKerjaRequest` dan `UpdateProgramKerjaRequest` untuk validasi.
  - [x] Backend: `ProgramKerjaResource` dibuat untuk standarisasi output API.
  - [x] Backend: Menambahkan logika transaksi database untuk memastikan hanya ada satu program kerja yang bisa aktif.
  - [x] Frontend: Penyesuaian kecil pada halaman terkait.

### Fase 5: Testing (Backend)

- [x] **#1: Inisiasi Fase Testing & Perbaikan Environment.**
  - [x] Memperbaiki serangkaian isu pada environment testing (SQLite) yang disebabkan oleh migrasi database yang tidak kompatibel.
  - [x] Memperbaiki dan membuat beberapa Model Factory (`User`, `ProgramKerja`, `RencanaAksi`, dll.) untuk memastikan data tes yang valid.
  - [x] Melakukan refactor pada `KategoriUtamaController` agar konsisten menggunakan API Resource dan memperbaiki logika yang salah.

- [x] **#2: Penambahan Feature Test untuk Core Controllers.**
  - [x] `ReportController`: Menambahkan tes untuk endpoint ringkasan tahunan dan ekspor PDF.
  - [x] `ProgramKerjaController`: Menambahkan tes untuk fungsionalitas CRUD dasar.
  - [x] `KategoriUtamaController`: Menambahkan tes untuk fungsionalitas CRUD dasar.
  - [x] `KegiatanController`: Menambahkan tes untuk fungsionalitas CRUD dasar.
  - [x] `RencanaAksiController`: Menambahkan tes untuk fungsionalitas CRUD dasar.
  - [x] `TodoItemController`: Menambahkan tes untuk fungsionalitas CRUD dasar.
  - [x] `ProgressMonitoringController`: Menambahkan tes awal untuk endpoint list progress.