# Checkpoint: Perbaikan Bug Progress Bulanan (Inkonsistensi Peran)

**Tujuan:** Memperbaiki bug kritis di mana `monthly_progress` menampilkan data yang salah (seringkali 0%) untuk pengguna "Pelaksana", dan perbaikan sebelumnya kini juga berdampak pada "PIC".

**Analisis Masalah:**
Akar masalah terletak pada logika filter dan otorisasi di `RencanaAksiController.php`. Logika untuk menyaring `RencanaAksi` berdasarkan bulan yang dipilih tidak konsisten antara peran PIC dan Pelaksana, terutama untuk jadwal periodik (triwulanan, semesteran). `JadwalService` sudah benar dalam menentukan *periode laporan*, tetapi `RencanaAksiController` gagal menampilkan `RencanaAksi` yang relevan kepada Pelaksana karena logika otorisasi yang salah.

**File yang Terlibat:**
*   `backend/app/Http/Controllers/Api/RencanaAksiController.php`: Lokasi utama bug dan target perbaikan.
*   `backend/app/Services/JadwalService.php`: Referensi logika bisnis untuk jadwal yang baru saja diperbaiki.
*   `backend/storage/logs/laravel.log`: Digunakan untuk *tracing* dan *debugging* (akan dihapus setelah bug fix dikonfirmasi).

**Langkah Selanjutnya yang Akan Dikerjakan:**
1.  **Menyeragamkan Logika Filter:** Mengubah `RencanaAksiController.php` untuk menggunakan satu alur logika penyaringan data yang sama bagi **semua peran pengguna**.
2.  **Filter di PHP:**
    *   Ambil semua `RencanaAksi` dari database di mana pengguna terlibat (baik sebagai PIC maupun Pelaksana).
    *   Jika ada filter bulan, saring *collection* yang didapat di level PHP menggunakan `JadwalService` untuk menentukan relevansi setiap `RencanaAksi` dengan periode laporan bulan tersebut.
3.  **Lampirkan Progress yang Benar:** Setelah daftar `RencanaAksi` final didapatkan, lampirkan `monthly_progress` yang sesuai.
4.  **Verifikasi & Cleanup:** Pengguna akan menguji kembali sebagai PIC dan Pelaksana. Setelah dikonfirmasi "tidak ada bug lagi", saya akan menghapus semua `Log::info` yang ada.
5.  **Push ke Git:** Melakukan `git add`, `commit`, dan `push` untuk menyimpan progres.
