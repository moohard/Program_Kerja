✅ Fase 1: Setup dan Foundation (SELESAI)
[x] Setup Environment

[x] Implementasi Sistem Auth & Otorisasi

File yang terlibat:

## Backend:

- app/Http/Controllers/Api/AuthController.php
- app/Models/User.php
- routes/api.php

## Frontend:

- src/contexts/AuthContext.jsx
- src/hooks/useAuth.js
- src/pages/Login.jsx

[x] Setup Database & Base API

File yang terlibat:

## Backend:

- Seluruh file Model awal (ProgramKerja, KategoriUtama, Kegiatan, RencanaAksi, TodoItem, ProgressMonitoring, AuditLog, ProgramTemplate, ProgressAttachment, DeviceToken).
- Seluruh file migrasi database awal.

[x] Frontend Foundation & Wireframing

File yang terlibat:

## Frontend:

- src/main.jsx & src/App.jsx (Setup Router)
- src/services/apiClient.js
- src/components/Layout/MainLayout.jsx
- src/components/Layout/ProtectedRoute.jsx & PublicRoute.jsx

✅ Fase 2: Core Modules (SELESAI)
[x] CRUD Operations untuk Program Kerja (Kategori, Kegiatan, Rencana Aksi)

File yang terlibat:

## Backend:

- KategoriUtamaController,
- KegiatanController,
- RencanaAksiController,
- semua Request & Resource terkait.

## Frontend:

- src/pages/master/KategoriUtama.jsx,
- src/pages/master/Kegiatan.jsx,
- src/pages/RencanaAksi.jsx.

[x] User Interface (Forms, Tables, Filters)

File yang terlibat:

## Frontend:

- src/components/modals/
  - KategoriModal.jsx,
  - KegiatanModal.jsx,
  - RencanaAksiModal.jsx.

[x] Modul Penjadwalan Multi-Bulan

File yang terlibat:

## Backend:

- RencanaAksiController (logika jadwal_config),
- Store/UpdateRencanaAksiRequest.

## Frontend:

- src/components/modals/RencanaAksiModal.jsx (UI Checkbox bulan).

[x] CRUD To-Do List Items

File yang terlibat:

## Backend:

- TodoItemController,
- Store/UpdateTodoItemRequest,
- TodoItemResource.

## Frontend:

- src/components/modals/TodoModal.jsx.

[x] Progress Tracking (Bulanan & Upload Bukti)

File yang terlibat:

## Backend:

- ProgressMonitoringController (logika Eloquent),
- StoreProgressMonitoringRequest,
- migrasi add*report_date*....

## Frontend:

- src/components/modals/ProgressModal.jsx.

✅ Fase 3: Monitoring & Reporting (SELESAI)
[x] Overview Dashboard (Statistik & Grafik)

File yang terlibat:

## Backend:

- DashboardController.

## Frontend:

- src/pages/Dashboard.jsx,
- src/components/dashboard/\*.

[x] Reporting System (Laporan Bulanan & Matriks)

File yang terlibat:

## Backend:

- ReportController.

## Frontend:

- src/pages/
  - Laporan.jsx,
  - LaporanMatriks.jsx.

[x] Export Functionality (Excel & Print)

File yang terlibat:

## Backend:

- app/Exports/LaporanMatriksExport.php,
- ReportController (logika ekspor).

## Frontend:

- src/pages/LaporanMatriks.jsx (tombol dan fungsi ekspor).

✅ Fase 4: Advanced Features (SELESAI)
[x] CRUD Program Templates & Apply Logic

File yang terlibat:

## Backend:

- TemplateController,
- ProgramTemplate Model.

## Frontend:

- src/pages/TemplateManagement.jsx.

[x] Activity Logging & Audit Reports

File yang terlibat:

## Backend:

- AuditLogController,
- EventServiceProvider.php (mendaftarkan Observer),
- RencanaAksiObserver (logika dipindahkan ke Controller).

## Frontend: src/pages/AuditLogPage.jsx.

[x] Real-time Notifications (Push ke Flutter & fondasi In-app)

File yang terlibat:

## Backend:

- NotificationController,
- DeviceToken Model,
- RencanaAksiAssignedNotification,
- fcm.php config,
- RencanaAksiController (pemicu notifikasi).

## Flutter: Semua file Flutter yang telah kita perbarui.

[x] Import/Export Data (dari Excel)

Tugas ini akan memungkinkan pengguna mengimpor data Rencana Aksi secara massal dari file Excel, sangat berguna di awal tahun program kerja.

⏳ Fase 5: Deployment & Optimization (SEDANG BERJALAN)
[x] Testing (Unit, Integration, E2E, UAT)

Menulis tes otomatis untuk backend dan frontend untuk memastikan kualitas dan mencegah bug di masa depan.

[x] Performance Optimization (Query, Frontend Bundle)

Menganalisis query database yang lambat, mengoptimalkan ukuran file JavaScript di frontend.

[ ] Security Hardening

Melakukan pemeriksaan keamanan untuk melindungi dari kerentanan umum.
