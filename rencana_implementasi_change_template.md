# Rencana Implementasi & Refactoring Frontend dengan Template Tailwick

Dokumen ini berisi rencana kerja dan checklist untuk mengintegrasikan template premium "Tailwick" ke dalam frontend aplikasi, menggantikan tampilan yang ada saat ini.

---

## 🎯 Tujuan Utama
- Mengadopsi sistem desain dan komponen dari template Tailwick.
- Meningkatkan kualitas visual (UI) dan pengalaman pengguna (UX) aplikasi.
- Menstandardisasi komponen antarmuka di seluruh aplikasi.

---

## 📋 Fase 1: Analisis & Persiapan

- [x] **Analisis Awal**
  - [x] Konfirmasi bahwa template menggunakan framework React (bukan HTML statis).
  - [x] Konfirmasi bahwa template menggunakan Vite sebagai build tool.

- [ ] **Manajemen Dependensi**
  - [ ] Dapatkan isi file `package.json` dari template Tailwick.
  - [ ] Analisis dan identifikasi semua dependensi baru yang dibutuhkan.
  - [ ] Install semua dependensi baru ke dalam `package.json` proyek frontend kita.

---

## 🏗️ Fase 2: Integrasi Layout Utama (Kerangka Aplikasi)

Tujuan fase ini adalah mengganti "kulit luar" aplikasi (Sidebar, Header, Latar Belakang) tanpa mengubah fungsionalitas di dalamnya.

- [ ] **Dapatkan Kode Sumber Layout**
  - [ ] Minta kode untuk komponen layout utama dari template (contoh: `MainLayout.jsx`, `Sidebar.jsx`, `Header.jsx`, `Footer.jsx`).

- [ ] **Implementasi Layout Baru**
  - [ ] Buat struktur folder `src/layouts` di proyek kita.
  - [ ] Implementasikan komponen `MainLayout.jsx`, `Sidebar.jsx`, dan `Header.jsx` baru menggunakan kode dari template.
  - [ ] Modifikasi file `App.jsx` untuk menggunakan `MainLayout` sebagai pembungkus utama aplikasi.

- [ ] **Penyesuaian Navigasi**
  - [ ] Sesuaikan item menu dan link di dalam komponen `Sidebar.jsx` agar cocok dengan rute (halaman) yang ada di aplikasi kita.
  - [ ] Pastikan navigasi antar halaman berfungsi seperti semula.

---

## 🎨 Fase 3: Refactoring Komponen & Halaman (Iteratif)

Proses ini akan dilakukan secara bertahap, komponen per komponen, untuk memastikan transisi yang mulus dan terkontrol.

- [ ] **3.1. Komponen Umum (Dasar)**
  - [ ] Ganti semua komponen `<button>` standar dengan komponen Tombol dari Tailwick.
  - [ ] Ganti semua elemen form (`<input>`, `<select>`, `<textarea>`) dengan komponen Form dari Tailwick.
  - [ ] Ganti semua komponen Card/Panel yang digunakan untuk membungkus konten.

- [ ] **3.2. Komponen Kompleks**
  - [ ] Ganti implementasi `Modal.jsx` kita dengan komponen Modal dari Tailwick, sesuaikan props `isOpen` dan `onClose`.
  - [ ] Ganti implementasi Tabel di semua halaman (terutama `RencanaAksiPage`, `LaporanMatriksPage`, `ManajemenPengguna`, `ManajemenJabatan`) dengan komponen Tabel dari Tailwick.

- [ ] **3.3. Refactoring Halaman Spesifik**
  - [ ] Tinjau dan sesuaikan layout setiap halaman satu per satu agar konsisten dengan sistem grid dan spacing dari Tailwick.
  - [ ] Pastikan semua fungsionalitas di setiap halaman tetap berjalan normal setelah komponennya diganti.

---

## 🧹 Fase 4: Finalisasi & Pembersihan

- [ ] **Tinjauan Konsistensi**
  - [ ] Tinjau ulang seluruh antarmuka aplikasi untuk memastikan semua bagian sudah menggunakan komponen Tailwick dan terlihat konsisten.

- [ ] **Pembersihan Kode**
  - [ ] Hapus file CSS lama yang tidak lagi digunakan (contoh: `index.css` jika sudah tidak relevan).
  - [ ] Hapus komponen-komponen UI lama dari folder `src/components` yang sudah digantikan sepenuhnya.

- [ ] **Pengujian Akhir**
  - [ ] Lakukan pengujian fungsionalitas menyeluruh (end-to-end) di semua halaman untuk memastikan tidak ada kerusakan (regresi) akibat perubahan tampilan.
