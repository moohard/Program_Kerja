# Project Development Rules

## Instructions for Gemini

Setiap kali Anda memberikan contoh kode atau solusi, harap patuhi aturan berikut secara ketat:

1.  **Backend (Laravel 12.x)**:
    * **Acuan**: [Laravel Docs 12.x](https://laravel.com/docs/12.x).
    * **Arsitektur**: Gunakan *Thin Controllers*. Pindahkan *business logic* ke *Service Classes* atau *Actions*.
    * **Validasi**: Selalu gunakan *Form Requests* (`php artisan make:request StorePostRequest`).
    * **Kode**: Ikuti standar PSR-12, gunakan *type-hinting*, dan *return types*.
    * **Eloquent**: Gunakan *Query Scopes* untuk *query* yang dapat digunakan kembali dan definisikan relasi dengan jelas.

2.  **Frontend (React 18 & 19)**:
    * **Acuan**: [React Docs](https://react.dev/learn).
    * **Style**: Gunakan *Functional Components* dengan *Hooks*. Hindari *Class Components*.
    * **Fitur Baru (React 19)**: Manfaatkan React Compiler untuk optimasi otomatis dan gunakan fitur seperti *Actions* untuk menyederhanakan *data handling* dan *state management*.
    * **Struktur**: Pecah komponen menjadi file-file kecil yang spesifik (`Single Responsibility`).
    * **State Management**: Utamakan *Hooks* bawaan (`useState`, `useContext`). Untuk *global state*, gunakan Zustand.
    * **Clean Code**: Hindari logika kompleks di dalam JSX. Gunakan `key` yang unik dan stabil untuk *list rendering*.

3.  **Styling (Tailwind CSS 4)**:
    * **Acuan**: [Tailwind Docs] (https://tailwindcss.com/docs/installation/using-vite)
    * **Konfigurasi**: Definisikan semua *design tokens* (warna, spasi, font) di `tailwind.config.js`. Hindari nilai *hardcoded* seperti `w-[123px]`.
    * **Konsistensi**: Gunakan Prettier dengan plugin Tailwind CSS untuk mengurutkan *classes* secara otomatis.
    * **Abstraksi**: Gunakan `@apply` seminimal mungkin, hanya untuk komponen yang benar-benar berulang seperti tombol (`.btn`).

4.  **Coding Instructions**
    * Set temperature ke 0.1 untuk semua generation code Laravel/React
    * Prioritaskan syntax PSR-12 dan React hooks
    * Hindari kreativitas; fokus pada functional code

5.  **Project Reference Documents**
    * Jadikan dokumen berikut sebagai acuan utama dalam pengembangan:
        * `@Rancangan/Rencana_implementasi_updated.md` (Untuk status dan daftar fitur)
        * `@Rancangan/Flowchart_aplikasi.md` (Untuk alur kerja aplikasi)
        * `@Rancangan/Desain_arsitektur.md` (Untuk arsitektur teknis)

6.  **Aturan Migrasi**: Jangan meminta konfirmasi untuk menjalankan `migrate:fresh` atau `migrate:fresh --seed`. Asumsikan selalu aman untuk dijalankan karena proyek berada dalam tahap pengembangan.

7.  **Prinsip Modifikasi**: Saat memperbaiki atau mengubah kode, prioritaskan penggunaan *tool* `replace` untuk mengubah bagian yang spesifik saja. Hindari menulis ulang seluruh file (`write_file`) kecuali jika Anda sedang melakukan perombakan besar (refactoring) atau membuat file baru. Ini untuk menjaga perubahan tetap minimal dan fokus.

8.  **Eager Loading**: Selalu gunakan *eager loading* (`with([...])`) pada setiap *query* Eloquent untuk mencegah masalah N+1 dan memastikan performa yang optimal.

Tujuan utama adalah **clean code**, **maintainability**, dan **konsistensi**.
