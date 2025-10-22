# Project Memory & To-Do List

## Sesi Debugging Dashboard (22 Oktober 2025) - Ditunda

**Konteks:**
- Pengguna meminta filter dashboard diubah dari model "berantai" menjadi model "pilih tipe tampilan" (Per Kategori, Per Kegiatan, Per Rencana Aksi).
- Fitur ini sudah diimplementasikan di backend (`DashboardController`) dan frontend (`DashboardFilter`, `DashboardPage`).

**Bug Terakhir yang Belum Terselesaikan:**
- **Masalah:** Saat menampilkan chart "Per Kategori" dan "Per Kegiatan", hasil perhitungan progres rata-ratanya sama persis (`3.57%`), padahal seharusnya berbeda (`4.17%` untuk kegiatan).
- **Analisis:** Ditemukan bahwa query di backend mengambil 7 `RencanaAksi` sebagai dasar perhitungan, padahal seharusnya hanya 6 yang relevan untuk konteks tersebut.
- **Upaya Terakhir:** Melakukan refactor besar pada `DashboardController` untuk memusatkan logika filter dalam satu fungsi `applyCommonFilters`. Namun, upaya ini **belum berhasil** memperbaiki bug.

**Tugas Selanjutnya (Saat Dilanjutkan):**
1.  **Re-investigasi Query:** Fokus pada `DashboardController` dan `applyCommonFilters`. Cari tahu mengapa satu `RencanaAksi` yang tidak relevan masih ikut terhitung dalam agregasi.
2.  **Tambahkan Log Detail:** Jika perlu, tambahkan kembali log untuk mencetak ID dari setiap `RencanaAksi` yang masuk ke dalam kalkulasi `avg()` untuk `getProgressByCategory` dan `getProgressByKegiatan` untuk diinspeksi.
3.  **Perbaiki Query:** Setelah anomali ditemukan, perbaiki logika query agar hanya menghitung item yang benar-benar relevan.
