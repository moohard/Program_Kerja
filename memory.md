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