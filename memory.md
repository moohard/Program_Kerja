## Checkpoint Kemajuan Proyek

Berikut adalah daftar fitur yang telah diselesaikan:

### Fase 3: Monitoring & Reporting

- [x] **#1: Implementasi "Recent Activity Feed" di Dasbor.**
- [x] **#2: Implementasi "Advanced Filtering" di Dasbor.**
- [x] **#3: Buat fitur spesifik "Laporan Tahunan".**
- [x] **#4: Implementasi Ekspor Laporan Matriks ke PDF via MinIO.**
- [x] **#5: Refactor Modul Program Kerja.**

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
  - [x] `ProgressMonitoringController`: Menambahkan tes untuk fungsionalitas `index` dan `store`.
  - [x] `DashboardController`: Menambahkan tes untuk memverifikasi agregasi data.

- [x] **#3: Penambahan Unit Test.**
  - [x] `JadwalService`: Menambahkan unit tes murni untuk memverifikasi logika kalkulasi tanggal.

---

### Fase 5: Testing (Frontend E2E)

- [x] **#1: Setup Cypress & Tes Alur Utama.**
  - [x] Instalasi dan konfigurasi Cypress, termasuk penyesuaian `baseUrl` ke HTTPS.
  - [x] Membuat perintah `cy.login()` kustom untuk login terprogram yang efisien dengan mengatur `localStorage`.
  - [x] Menambahkan atribut `data-cy` pada komponen React untuk selector tes yang stabil.
  - [x] Berhasil membuat dan menjalankan tes E2E untuk **alur login**.
  - [x] Berhasil membuat dan menjalankan tes E2E untuk **navigasi pasca-login**.

---

### **NEXT STEP**

- [ ] Melanjutkan fase testing (backend atau frontend) atau beralih ke fase **Optimasi**.